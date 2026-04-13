import { createError, readBody } from 'h3'
import { randomUUID } from 'node:crypto'
import type { WaxtuCustomer } from '../../../types/customer'
import { signCustomerJwt } from '../../utils/customer-jwt'
import { setCustomerTokenCookie } from '../../utils/customer-session-cookie'
import { findCustomerByEmail, upsertCustomer } from '../../utils/customers-store'
import { hashPassword } from '../../utils/password'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = String(config.customerSessionSecret || '').trim()
  if (!secret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Espace client non configuré (NUXT_CUSTOMER_SESSION_SECRET)',
    })
  }

  const body = await readBody<{ email?: string; password?: string }>(event).catch(() => ({} as { email?: string; password?: string }))
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')

  if (!EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Email invalide' })
  }
  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Mot de passe : minimum 8 caractères' })
  }

  if (await findCustomerByEmail(email)) {
    throw createError({ statusCode: 409, statusMessage: 'Un compte existe déjà avec cet email' })
  }

  const customer: WaxtuCustomer = {
    id: randomUUID(),
    email,
    passwordHash: await hashPassword(password),
    favoriteProductIds: [],
    loyaltyPoints: 0,
    createdAt: new Date().toISOString(),
  }
  await upsertCustomer(customer)

  const token = signCustomerJwt(secret, customer.id, customer.email)
  setCustomerTokenCookie(event, token)

  return {
    ok: true,
    customer: {
      id: customer.id,
      email: customer.email,
      favoriteProductIds: customer.favoriteProductIds,
      loyaltyPoints: customer.loyaltyPoints,
    },
  }
})
