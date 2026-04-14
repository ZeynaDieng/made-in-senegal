import { computeTotals, mergeOrderLines, validateOrderLines, type OrderLine } from '../../utils/commerce'
import { verifyCustomerJwt } from '../../utils/customer-jwt'
import { readCustomerTokenFromEvent } from '../../utils/customer-session-cookie'
import { findCustomerById } from '../../utils/customers-store'
import { readCms } from '../../utils/cms-store'
import { requestPaytechPayment } from '../../utils/paytech-client'

let warnedIpnMissingHttps = false

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.paytechApiKey || !config.paytechApiSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'PayTech keys missing. Configure NUXT_PAYTECH_API_KEY and NUXT_PAYTECH_API_SECRET.',
    })
  }

  const body = await readBody<{
    items?: OrderLine[]
    refCommand?: string
    commandName?: string
    /** Ignoré : le total est toujours recalculé côté serveur. */
    amount?: number
    customer?: { email?: string; phone?: string; name?: string }
  }>(event)

  if (!body?.refCommand?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'refCommand est requis' })
  }
  if (!body.items?.length) {
    throw createError({ statusCode: 400, statusMessage: 'items[] est requis' })
  }
  const email = body.customer?.email?.trim().toLowerCase() ?? ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Une adresse email valide est requise pour la commande' })
  }

  let customerUserId: string | undefined
  const custSecret = String(config.customerSessionSecret || '').trim()
  const cookieTok = readCustomerTokenFromEvent(event)
  if (custSecret && cookieTok) {
    const v = verifyCustomerJwt(cookieTok, custSecret)
    if (v && v.email === email) {
      const c = await findCustomerById(v.customerId)
      if (c && c.email === email) customerUserId = c.id
    }
  }

  const items = mergeOrderLines(body.items)
  const cms = await readCms()

  const validation = validateOrderLines(cms, items)
  if (!validation.ok) {
    throw createError({ statusCode: 400, statusMessage: validation.message })
  }

  const { total } = computeTotals(cms, items)
  if (total <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Montant total invalide' })
  }

  const commandName =
    body.commandName?.trim() ||
    items
      .map((line) => {
        const p = cms.products.find((x) => x.id === line.id)
        return p ? `${p.name} x${line.qty}` : `#${line.id} x${line.qty}`
      })
      .join(', ')

  const customField = JSON.stringify({
    items,
    refCommand: body.refCommand,
    customer: {
      email,
      phone: body.customer?.phone?.trim() || undefined,
      name: body.customer?.name?.trim() || undefined,
    },
    ...(customerUserId ? { customerUserId } : {}),
  })

  const siteUrl = config.public.siteUrl.replace(/\/$/, '')
  const pay = cms.paytech

  const successUrl = pay.isMobileFlow
    ? 'https://paytech.sn/mobile/success'
    : `${siteUrl}${pay.successPath}`
  const cancelUrl = pay.isMobileFlow ? 'https://paytech.sn/mobile/cancel' : `${siteUrl}${pay.cancelPath}`

  const ipnBaseOverride = String(config.paytechIpnPublicUrl || '').trim().replace(/\/$/, '')
  const ipnBase =
    /^https:\/\//i.test(ipnBaseOverride)
      ? ipnBaseOverride
      : siteUrl
  const ipnCandidate = `${ipnBase}${pay.ipnPath}`
  const ipnUrl = /^https:\/\//i.test(ipnCandidate) ? ipnCandidate : undefined
  if (!ipnUrl && !warnedIpnMissingHttps) {
    warnedIpnMissingHttps = true
    console.warn(
      '[waxtu][paytech] IPN non envoyé (HTTPS requis). Options : '
        + 'NUXT_PUBLIC_SITE_URL en https, ou NUXT_PAYTECH_IPN_PUBLIC_URL=https://… (tunnel ngrok/cloudflared vers ce serveur).',
    )
  }

  try {
    const payment = await requestPaytechPayment(
      {
        itemName: commandName.slice(0, 120) || 'Commande WAXTU',
        itemPrice: total,
        commandName: commandName.slice(0, 200) || 'Commande WAXTU',
        refCommand: body.refCommand.trim(),
        currency: 'XOF',
        env: pay.env,
        successUrl,
        cancelUrl,
        ipnUrl,
        customField,
        isMobile: pay.isMobileFlow,
      },
      config.paytechApiKey,
      config.paytechApiSecret,
    )

    return payment
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'PayTech error'
    throw createError({ statusCode: 502, statusMessage: message })
  }
})
