import { createHmac, timingSafeEqual } from 'node:crypto'

const JWT_SUB = 'waxtu-admin'
const TTL_SEC = 7 * 24 * 60 * 60

export function signAdminJwt(secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const exp = Math.floor(Date.now() / 1000) + TTL_SEC
  const payload = Buffer.from(JSON.stringify({ sub: JWT_SUB, exp })).toString('base64url')
  const sig = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url')
  return `${header}.${payload}.${sig}`
}

export function verifyAdminJwt(token: string, secret: string): boolean {
  if (!secret || !token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [h, p, s] = parts
  const expected = createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url')
  if (s.length !== expected.length) return false
  try {
    if (!timingSafeEqual(Buffer.from(s), Buffer.from(expected))) return false
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8')) as { exp?: number; sub?: string }
    if (payload.sub !== JWT_SUB) return false
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return false
    return true
  }
  catch {
    return false
  }
}
