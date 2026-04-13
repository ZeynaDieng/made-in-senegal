import { clearCustomerTokenCookie } from '../../utils/customer-session-cookie'

export default defineEventHandler((event) => {
  clearCustomerTokenCookie(event)
  return { ok: true }
})
