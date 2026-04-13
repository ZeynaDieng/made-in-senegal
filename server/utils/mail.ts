import type { WaxtuStoredOrder } from '../../types/orders'

/** Appel Resend (fetch global — pas de node:undici : indisponible selon le preset Nitro). */
async function postResendEmails(apiKey: string, body: Record<string, unknown>): Promise<Response> {
  try {
    return await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }
  catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const code = (e as { cause?: { code?: string }; code?: string }).code
      ?? (e as { cause?: { code?: string } }).cause?.code
    if (
      code === 'UND_ERR_CONNECT_TIMEOUT'
      || msg.includes('Connect Timeout')
      || msg.includes('fetch failed')
    ) {
      throw new Error(
        'Connexion à api.resend.com impossible (timeout ou réseau). Vérifiez internet, pare-feu, antivirus ou VPN ; testez aussi depuis un navigateur : https://api.resend.com',
      )
    }
    throw e
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function orderLinesHtml(order: WaxtuStoredOrder): string {
  return order.lines
    .map(
      (l) =>
        `<tr><td>${escapeHtml(l.name)}</td><td>${l.qty}</td><td>${l.unitPrice} XOF</td><td>${l.lineSubtotal} XOF</td></tr>`,
    )
    .join('')
}

/**
 * Notifie la boutique (et optionnellement le client) après paiement confirmé.
 * Utilise l’API Resend si `NUXT_RESEND_API_KEY` est défini.
 */
export async function sendOrderPaidNotification(order: WaxtuStoredOrder): Promise<void> {
  const config = useRuntimeConfig()
  const apiKey = String(config.resendApiKey || '').trim()
  const from = String(config.mailFrom || '').trim()
  const toShop = String(config.mailToShop || '').trim()
  if (!apiKey || !from || !toShop) {
    console.info('[waxtu][mail] notification commande ignorée (config Resend absente : NUXT_RESEND_API_KEY, NUXT_MAIL_FROM, NUXT_MAIL_TO_SHOP)')
    return
  }

  const subject = `[WAXTU] Paiement reçu — ${order.ref}`
  const total = `${order.total} ${order.currency}`
  const customerEmail = order.customer?.email?.trim() ?? ''
  const html = `
  <h1>Nouvelle commande payée</h1>
  <p><strong>Référence :</strong> ${escapeHtml(order.ref)}</p>
  <p><strong>Total :</strong> ${escapeHtml(total)}</p>
  ${customerEmail ? `<p><strong>Client :</strong> ${escapeHtml(customerEmail)}</p>` : ''}
  <table border="1" cellpadding="6" cellspacing="0">
    <thead><tr><th>Produit</th><th>Qté</th><th>PU</th><th>Sous-total</th></tr></thead>
    <tbody>${orderLinesHtml(order)}</tbody>
  </table>
  `.trim()

  const to: string[] = [toShop]
  if (customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    to.push(customerEmail)
  }

  const res = await postResendEmails(apiKey, {
    from,
    to,
    subject,
    html,
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Resend HTTP ${res.status}: ${txt.slice(0, 400)}`)
  }
}

const EMAIL_RE_CONTACT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Notifie la boutique qu’une demande de contact a été enregistrée (même config Resend que les commandes).
 * Ne lance pas si la config est incomplète ; ne bloque pas le formulaire en cas d’échec réseau (géré par l’appelant).
 */
export async function sendContactLeadNotification(lead: {
  firstName: string
  lastName: string
  email: string
  message: string
}): Promise<void> {
  const config = useRuntimeConfig()
  const apiKey = String(config.resendApiKey || '').trim()
  const from = String(config.mailFrom || '').trim()
  const toShop = String(config.mailToShop || '').trim()
  if (!apiKey || !from || !toShop) {
    console.info('[waxtu][mail] notification contact ignorée (Resend incomplet : NUXT_RESEND_API_KEY, NUXT_MAIL_FROM, NUXT_MAIL_TO_SHOP)')
    return
  }

  const subject = `[WAXTU] Contact — ${lead.firstName} ${lead.lastName}`.slice(0, 990)
  const html = `
<p><strong>Nom :</strong> ${escapeHtml(lead.firstName)} ${escapeHtml(lead.lastName)}</p>
<p><strong>Email :</strong> ${escapeHtml(lead.email)}</p>
<p><strong>Message :</strong></p>
<pre style="white-space:pre-wrap;font-family:ui-sans-serif,system-ui,sans-serif;font-size:14px;margin:0;padding:12px;border:1px solid #e5e5e5;border-radius:8px;background:#fafafa">${escapeHtml(lead.message)}</pre>
<p style="font-size:12px;color:#666">Répondre depuis votre client mail : l’adresse du visiteur est en <em>Reply-To</em> si votre messagerie la prend en charge.</p>
`.trim()

  const payload: Record<string, unknown> = {
    from,
    to: [toShop],
    subject,
    html,
  }
  if (EMAIL_RE_CONTACT.test(lead.email)) payload.reply_to = lead.email

  const res = await postResendEmails(apiKey, payload)
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Resend HTTP ${res.status}: ${txt.slice(0, 400)}`)
  }
}

/**
 * Email minimal vers la boutique pour vérifier Resend (dashboard admin).
 */
export async function sendMailPingToShop(): Promise<void> {
  const config = useRuntimeConfig()
  const apiKey = String(config.resendApiKey || '').trim()
  const from = String(config.mailFrom || '').trim()
  const toShop = String(config.mailToShop || '').trim()
  if (!apiKey || !from || !toShop) {
    throw new Error(
      'Configuration incomplète : NUXT_RESEND_API_KEY, NUXT_MAIL_FROM et NUXT_MAIL_TO_SHOP sont requis.',
    )
  }

  const res = await postResendEmails(apiKey, {
    from,
    to: [toShop],
    subject: '[WAXTU] Test de configuration email',
    html: '<p>Si vous recevez ce message, l’envoi via Resend fonctionne.</p>',
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Resend HTTP ${res.status}: ${txt.slice(0, 400)}`)
  }
}
