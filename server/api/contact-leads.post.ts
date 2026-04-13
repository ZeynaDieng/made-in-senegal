import { createError, readBody, type H3Event } from 'h3'
import { randomUUID } from 'node:crypto'
import type { WaxtuContactLead } from '../../types/contact-lead'
import { appendContactLead } from '../utils/contact-leads-store'
import { sendContactLeadNotification } from '../utils/mail'
import { contactRateLimitHit } from '../utils/contact-rate-limit'

function clientIp(event: H3Event) {
  const xf = String(event.node?.req?.headers?.['x-forwarded-for'] ?? '').split(',')[0]?.trim()
  if (xf) return xf
  return event.node?.req?.socket?.remoteAddress ?? 'unknown'
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const ip = clientIp(event)
  if (contactRateLimitHit(ip, 5, 15 * 60 * 1000)) {
    throw createError({ statusCode: 429, statusMessage: 'Trop de demandes. Réessayez plus tard.' })
  }

  const body = await readBody<{
    firstName?: string
    lastName?: string
    email?: string
    message?: string
  }>(event)

  const firstName = String(body?.firstName ?? '').trim().slice(0, 80)
  const lastName = String(body?.lastName ?? '').trim().slice(0, 80)
  const email = String(body?.email ?? '').trim().slice(0, 200).toLowerCase()
  const message = String(body?.message ?? '').trim().slice(0, 8000)

  if (!firstName || !lastName) {
    throw createError({ statusCode: 400, statusMessage: 'Prénom et nom sont requis.' })
  }
  if (!EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Adresse email invalide.' })
  }
  if (message.length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'Message trop court (minimum 10 caractères).' })
  }

  const lead: WaxtuContactLead = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    firstName,
    lastName,
    email,
    message,
  }
  await appendContactLead(lead)
  try {
    await sendContactLeadNotification(lead)
  }
  catch (e) {
    console.error('[waxtu][contact-leads] envoi email notification', lead.id, e)
  }
  return { ok: true }
})
