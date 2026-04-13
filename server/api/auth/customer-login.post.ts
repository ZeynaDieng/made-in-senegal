import { createError, readBody } from 'h3'
import { signCustomerJwt } from '../../utils/customer-jwt'
import { setCustomerTokenCookie } from '../../utils/customer-session-cookie'
import { findCustomerByEmail } from '../../utils/customers-store'
import { verifyPassword } from '../../utils/password'

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

  const customer = await findCustomerByEmail(email)
  if (!customer || !(await verifyPassword(password, customer.passwordHash))) {
    throw createError({ statusCode: 401, statusMessage: 'Email ou mot de passe incorrect' })
  }

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
