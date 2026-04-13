import { createHmac, timingSafeEqual } from 'node:crypto'

const JWT_SUB = 'waxtu-customer'
const TTL_SEC = 30 * 24 * 60 * 60

export type CustomerJwtPayload = {
  sub: typeof JWT_SUB
  cid: string
  em: string
  exp: number
}

export function signCustomerJwt(secret: string, customerId: string, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const exp = Math.floor(Date.now() / 1000) + TTL_SEC
  const payload = Buffer.from(
    JSON.stringify({ sub: JWT_SUB, cid: customerId, em: email, exp } satisfies CustomerJwtPayload),
  ).toString('base64url')
  const sig = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url')
  return `${header}.${payload}.${sig}`
}

export function verifyCustomerJwt(token: string, secret: string): { customerId: string; email: string } | null {
  if (!secret || !token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [h, p, s] = parts
  if (!h || !p || !s) return null
  const expected = createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url')
  if (s.length !== expected.length) return null
  try {
    if (!timingSafeEqual(Buffer.from(s), Buffer.from(expected))) return null
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8')) as CustomerJwtPayload
    if (payload.sub !== JWT_SUB) return null
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null
    if (!payload.cid || !payload.em) return null
    return { customerId: payload.cid, email: String(payload.em).toLowerCase() }
  }
  catch {
    return null
  }
}
