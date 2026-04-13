import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { WaxtuOrderCustomer } from '../../types/orders'

/**
 * Montant « final » tel que PayTech l’utilise dans l’IPN (promos PayTech incluses).
 */
export function resolvedPaytechPaymentAmount(payload: Record<string, unknown>): number | null {
  const pick = (v: unknown) => {
    const x = Number(v)
    return Number.isFinite(x) ? Math.round(x) : null
  }
  return (
    pick(payload.final_item_price_xof)
    ?? pick(payload.final_item_price)
    ?? pick(payload.item_price_xof)
    ?? pick(payload.item_price)
    ?? pick(payload.amount)
    ?? pick(payload.amount_paid)
    ?? pick(payload.amountPaid)
  )
}

/**
 * @deprecated Utiliser `resolvedPaytechPaymentAmount` pour l’alignement avec le HMAC PayTech.
 */
export function declaredTotalFromPaytechPayload(payload: Record<string, unknown>): number | null {
  return resolvedPaytechPaymentAmount(payload)
}

function hexTimingSafeEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(String(a).trim(), 'hex')
    const bb = Buffer.from(String(b).trim(), 'hex')
    if (ba.length !== bb.length) return false
    return timingSafeEqual(ba, bb)
  }
  catch {
    return false
  }
}

/**
 * Vérifie l’authenticité de l’IPN selon la doc PayTech (HMAC-SHA256 recommandé, sinon SHA256 des clés).
 * @see https://docs.intech.sn/doc_paytech.php — section « Notifications de paiement (IPN) »
 */
export function verifyPaytechIpnAuthenticity(
  payload: Record<string, unknown>,
  apiKey: string,
  apiSecret: string,
): { ok: true } | { ok: false; reason: string } {
  const key = (apiKey || '').trim()
  const secret = (apiSecret || '').trim()
  if (!key || !secret) {
    return { ok: false, reason: 'missing_api_credentials' }
  }

  const hmacReceived = String(payload.hmac_compute ?? payload.hmacCompute ?? '').trim()
  if (hmacReceived) {
    const ref = String(payload.ref_command ?? payload.refCommand ?? '')
    const amount = resolvedPaytechPaymentAmount(payload)
    if (amount == null) {
      return { ok: false, reason: 'missing_amount_for_hmac' }
    }
    const message = `${amount}|${ref}|${key}`
    const expected = createHmac('sha256', secret).update(message).digest('hex')
    if (!hexTimingSafeEqual(expected, hmacReceived)) {
      return { ok: false, reason: 'hmac_mismatch' }
    }
    return { ok: true }
  }

  const recvKey = String(payload.api_key_sha256 ?? payload.apiKeySha256 ?? '').trim().toLowerCase()
  const recvSec = String(payload.api_secret_sha256 ?? payload.apiSecretSha256 ?? '').trim().toLowerCase()
  if (recvKey && recvSec) {
    const expKey = createHash('sha256').update(key).digest('hex').toLowerCase()
    const expSec = createHash('sha256').update(secret).digest('hex').toLowerCase()
    if (expKey !== recvKey || expSec !== recvSec) {
      return { ok: false, reason: 'sha256_credentials_mismatch' }
    }
    return { ok: true }
  }

  return { ok: false, reason: 'no_hmac_or_sha256_fields' }
}

/**
 * PayTech peut envoyer `custom_field` en JSON brut ou encodé en Base64 (doc officielle).
 */
export type PaytechCustomFieldParsed = {
  items?: { id: number; qty: number }[]
  refCommand?: string
  customer?: WaxtuOrderCustomer
  /** Compte client (JWT vérifié à l’init) — fidélité. */
  customerUserId?: string
}

export function parsePaytechCustomField(raw: string): PaytechCustomFieldParsed | null {
  const trimmed = (raw || '').trim()
  if (!trimmed) return null
  try {
    return JSON.parse(trimmed) as PaytechCustomFieldParsed
  }
  catch {
    try {
      const decoded = Buffer.from(trimmed, 'base64').toString('utf8')
      return JSON.parse(decoded) as PaytechCustomFieldParsed
    }
    catch {
      return null
    }
  }
}
