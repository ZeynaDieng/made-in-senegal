import { deleteCookie, getCookie, setCookie, type H3Event } from 'h3'

export const CUSTOMER_TOKEN_COOKIE = 'waxtu-customer-token'

const maxAge = 30 * 24 * 60 * 60

export function setCustomerTokenCookie(event: H3Event, token: string) {
  setCookie(event, CUSTOMER_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
}

export function clearCustomerTokenCookie(event: H3Event) {
  deleteCookie(event, CUSTOMER_TOKEN_COOKIE, { path: '/' })
}

export function readCustomerTokenFromEvent(event: H3Event): string {
  return String(getCookie(event, CUSTOMER_TOKEN_COOKIE) ?? '').trim()
}
