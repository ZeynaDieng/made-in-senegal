import { appendFile, mkdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { setResponseStatus } from 'h3'
import type { WaxtuOrderLine, WaxtuStoredOrder } from '../../../types/orders'
import { computeTotals, mergeOrderLines, validateOrderLines, type OrderLine } from '../../utils/commerce'
import { readCms, writeCms } from '../../utils/cms-store'
import { addLoyaltyPointsByEmail } from '../../utils/customers-store'
import { sendOrderPaidNotification } from '../../utils/mail'
import { appendPaidOrder, findOrderByRef } from '../../utils/orders-store'
import {
  parsePaytechCustomField,
  resolvedPaytechPaymentAmount,
  verifyPaytechIpnAuthenticity,
} from '../../utils/paytech-ipn-verify'

const processedRefsPath = () => join(process.cwd(), '.data', 'paytech-ipn-refs.log')

async function wasRefProcessed(ref: string) {
  if (!ref) return false
  try {
    const txt = await readFile(processedRefsPath(), 'utf8')
    return txt.split('\n').some((line) => line.trim() === ref)
  }
  catch {
    return false
  }
}

async function markRefProcessed(ref: string) {
  if (!ref) return
  const path = processedRefsPath()
  await mkdir(dirname(path), { recursive: true })
  await appendFile(path, `${ref}\n`, 'utf8')
}

function parsePayload(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>
  return {}
}

/**
 * Indique si l’IPN PayTech correspond à un paiement réussi.
 * @see https://docs.intech.sn/doc_paytech.php
 */
function isSuccessfulPayment(payload: Record<string, unknown>): boolean {
  const typeEvent = String(payload.type_event ?? payload.typeEvent ?? '').toLowerCase()
  if (typeEvent === 'sale_complete' || typeEvent === 'sale.complete') return true
  const status = String(payload.status ?? payload.payment_status ?? payload.state ?? '').toLowerCase()
  if (status === 'completed' || status === 'success' || status === 'approved') return true
  return false
}

export default defineEventHandler(async (event) => {
  let raw: unknown
  try {
    raw = await readBody(event)
  }
  catch {
    const text = await readRawBody(event, 'utf8').catch(() => '')
    if (text) {
      const params = new URLSearchParams(text)
      raw = Object.fromEntries(params.entries())
    }
  }

  const payload = parsePayload(raw)
  console.info('[waxtu][paytech][ipn]', payload)

  if (!isSuccessfulPayment(payload)) {
    return { ok: true, ignored: true }
  }

  const config = useRuntimeConfig()
  const skipVerify =
    config.paytechIpnSkipVerify === true
    || String(config.paytechIpnSkipVerify).toLowerCase() === 'true'

  if (!skipVerify) {
    const auth = verifyPaytechIpnAuthenticity(
      payload,
      String(config.paytechApiKey || ''),
      String(config.paytechApiSecret || ''),
    )
    if (!auth.ok) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[waxtu][paytech][ipn] IPN non authentifié:', auth.reason)
        setResponseStatus(event, 403)
        return { ok: false, reason: 'forbidden' }
      }
      console.warn('[waxtu][paytech][ipn] IPN non authentifié (hors prod, poursuite tolérée):', auth.reason)
    }
  }
  else {
    console.warn('[waxtu][paytech][ipn] paytechIpnSkipVerify actif — ne pas utiliser en production')
  }

  let items: OrderLine[] = []
  let refCommand = String(payload.ref_command ?? payload.refCommand ?? '')
  const cf = String(payload.custom_field ?? payload.customField ?? '')
  const parsed = parsePaytechCustomField(cf)
  if (!parsed?.items?.length) {
    return { ok: true, ignored: true, reason: 'custom_field' }
  }
  items = mergeOrderLines(parsed.items)
  if (parsed.refCommand) refCommand = refCommand || String(parsed.refCommand)

  if (!items.length) return { ok: true, ignored: true, reason: 'no_items' }

  if (await findOrderByRef(refCommand)) {
    return { ok: true, duplicate: true }
  }

  if (await wasRefProcessed(refCommand)) {
    return { ok: true, duplicate: true }
  }

  const cms = await readCms()
  const validation = validateOrderLines(cms, items)
  if (!validation.ok) {
    console.error('[waxtu][paytech][ipn] validation stock', validation.message)
    return { ok: true, warning: validation.message }
  }

  const { subtotal, discount, total, productsById } = computeTotals(cms, items)
  const paytechAmount = resolvedPaytechPaymentAmount(payload)
  if (paytechAmount != null && Math.abs(paytechAmount - total) > 2) {
    console.error('[waxtu][paytech][ipn] montant IPN ≠ total recalculé', { paytechAmount, total, refCommand })
    return { ok: true, ignored: true, reason: 'amount_mismatch' }
  }

  const clientPhone = String(payload.client_phone ?? payload.clientPhone ?? '').trim()
  const customer = {
    email: parsed.customer?.email?.trim() || undefined,
    phone: (parsed.customer?.phone?.trim() || clientPhone || undefined),
    name: parsed.customer?.name?.trim() || undefined,
  }
  const hasCustomer = !!(customer.email || customer.phone || customer.name)

  const lines: WaxtuOrderLine[] = items.map((line) => {
    const p = productsById.get(line.id)!
    return {
      productId: line.id,
      name: p.name,
      qty: line.qty,
      unitPrice: p.price,
      lineSubtotal: p.price * line.qty,
    }
  })

  const order: WaxtuStoredOrder = {
    version: 1,
    ref: refCommand,
    status: 'paid',
    currency: 'XOF',
    paidAt: new Date().toISOString(),
    subtotal,
    discount,
    total,
    lines,
    ...(hasCustomer ? { customer } : {}),
    paytechMeta: {
      paymentMethod: String(payload.payment_method ?? payload.paymentMethod ?? '') || undefined,
      token: String(payload.token ?? '') || undefined,
      typeEvent: String(payload.type_event ?? payload.typeEvent ?? '') || undefined,
    },
  }

  const next = structuredClone(cms)
  const byId = new Map(next.products.map((p) => [p.id, p]))
  for (const line of items) {
    const p = byId.get(line.id)
    if (!p) continue
    p.stock = Math.max(0, p.stock - line.qty)
  }
  await writeCms(next)
  let orderSaved = false
  try {
    orderSaved = await appendPaidOrder(order)
  }
  catch (e) {
    console.error('[waxtu][paytech][ipn] échec enregistrement commande', refCommand, e)
  }
  await markRefProcessed(refCommand)

  if (orderSaved) {
    try {
      await sendOrderPaidNotification(order)
    }
    catch (e) {
      console.error('[waxtu][paytech][ipn] envoi email notification', refCommand, e)
    }
    const email = customer.email?.trim().toLowerCase()
    if (email) {
      try {
        const points = Math.max(0, Math.floor(total / 1000))
        await addLoyaltyPointsByEmail(email, points)
      }
      catch (e) {
        console.error('[waxtu][paytech][ipn] fidélité', refCommand, e)
      }
    }
  }

  return { ok: true, decremented: true, orderRef: refCommand }
})
