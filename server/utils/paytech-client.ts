import { createError } from 'h3'
import { ofetch } from 'ofetch'

const PAYMENT_URL = 'https://paytech.sn/api/payment/request-payment'
const CHECKOUT_BASE = 'https://paytech.sn/payment/checkout/'

/** Réponse PayTech : souvent `redirect_url` / `redirectUrl` plutôt que `token` seul (doc officielle). */
function resolvePaytechSession(response: Record<string, unknown>): { token: string; redirectUrl: string } | null {
  const redirectRaw =
    (typeof response.redirect_url === 'string' && response.redirect_url.trim())
    || (typeof response.redirectUrl === 'string' && response.redirectUrl.trim())
    || ''
  if (redirectRaw) {
    const match = redirectRaw.match(/\/payment\/checkout\/([^/?#]+)/i)
    if (match?.[1]) {
      return { token: match[1], redirectUrl: redirectRaw }
    }
  }
  const tok = typeof response.token === 'string' ? response.token.trim() : ''
  if (tok) {
    return { token: tok, redirectUrl: `${CHECKOUT_BASE}${tok}` }
  }
  return null
}

export type PaytechInitInput = {
  itemName: string
  itemPrice: number
  commandName: string
  refCommand: string
  currency: string
  env: 'test' | 'prod'
  successUrl: string
  cancelUrl: string
  /** Si absent ou non HTTPS, non envoyé à PayTech (leur doc : IPN en HTTPS uniquement). */
  ipnUrl?: string
  customField?: string
  isMobile: boolean
}

function paytechFailureMessage(response: Record<string, unknown>, fallback: string): string {
  return (
    (typeof response.message === 'string' && response.message.trim())
    || (Array.isArray(response.error) ? response.error.join(', ') : (response.error as string))
    || (response.errors && typeof response.errors === 'object'
      ? JSON.stringify(response.errors)
      : null)
    || fallback
  ).trim()
}

function parsePaytechJsonBody(raw: string): Record<string, unknown> {
  const t = raw.trim()
  if (!t) return {}
  try {
    const v = JSON.parse(t) as unknown
    return v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
  }
  catch {
    return {}
  }
}

/** PayTech considère souvent `success === 1` ou `true` comme OK (doc + collection Postman). */
function paytechIndicatesSuccess(response: Record<string, unknown>): boolean {
  const s = response.success
  return s === 1 || s === true || s === '1'
}

export async function requestPaytechPayment(input: PaytechInitInput, apiKey: string, apiSecret: string) {
  const payload: Record<string, string | number> = {
    item_name: input.itemName,
    item_price: Math.round(input.itemPrice),
    command_name: input.commandName,
    ref_command: input.refCommand,
    env: input.env,
    currency: input.currency.toUpperCase(),
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    custom_field: input.customField ?? '{}',
  }

  const ipn = input.ipnUrl?.trim()
  if (ipn?.toLowerCase().startsWith('https://')) {
    payload.ipn_url = ipn
  }

  const res = await ofetch.raw(PAYMENT_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      API_KEY: apiKey,
      API_SECRET: apiSecret,
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
    },
  })

  const rawText = await res.text()
  const response = parsePaytechJsonBody(rawText)

  if (!res.ok) {
    const message = paytechFailureMessage(response, `PayTech request-payment HTTP ${res.status}`)
    console.error('[waxtu][paytech] request-payment HTTP erreur', res.status, rawText.slice(0, 500))
    throw createError({ statusCode: 502, statusMessage: message })
  }

  if (Object.keys(response).length === 0 && rawText.trim()) {
    console.error('[waxtu][paytech] corps non-JSON', rawText.slice(0, 500))
    throw createError({
      statusCode: 502,
      message: `Réponse PayTech non JSON (début du corps : ${rawText.slice(0, 120).replace(/\s+/g, ' ')})`,
    })
  }

  if (Object.keys(response).length === 0) {
    console.error('[waxtu][paytech] corps vide', res.status)
    throw createError({
      statusCode: 502,
      statusMessage: 'PayTech a renvoyé un corps vide (vérifiez les clés API et l’environnement test/prod).',
    })
  }

  if (response.success !== undefined && !paytechIndicatesSuccess(response)) {
    const message = paytechFailureMessage(response, 'PayTech a refusé la demande de paiement.')
    console.error('[waxtu][paytech] success≠1', response)
    throw createError({ statusCode: 502, statusMessage: message })
  }

  const session = resolvePaytechSession(response)
  if (!session) {
    const keys = Object.keys(response).join(', ')
    const message = paytechFailureMessage(
      response,
      keys ? `Réponse sans token ni redirect_url (champs : ${keys})` : 'Réponse inattendue',
    )
    console.error('[waxtu][paytech] réponse sans session', keys || '(aucun champ)', rawText.slice(0, 400))
    throw createError({ statusCode: 502, statusMessage: message })
  }

  return session
}
