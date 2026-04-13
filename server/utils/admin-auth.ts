import { createError, getHeader } from 'h3'
import type { H3Event } from 'h3'
import { timingSafeEqual } from 'node:crypto'
import { verifyAdminJwt } from './admin-jwt'

export type AdminAuthConfig = {
  adminToken?: string
  adminSessionSecret?: string
}

function timingSafeStringEqual(a: string, b: string): boolean {
  try {
    const x = Buffer.from(a, 'utf8')
    const y = Buffer.from(b, 'utf8')
    if (x.length !== y.length) return false
    return timingSafeEqual(x, y)
  }
  catch {
    return false
  }
}

/**
 * Autorise soit un JWT émis par POST /api/auth/admin-login,
 * soit l’ancien jeton statique `adminToken` (Authorization Bearer).
 */
export function requireAdmin(event: H3Event, opts: AdminAuthConfig) {
  const header =
    getHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '')?.trim()
    ?? getHeader(event, 'x-admin-token')?.trim()
    ?? ''
  if (!header) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const secret = (opts.adminSessionSecret || opts.adminToken || '').trim()
  if (secret && verifyAdminJwt(header, secret)) return

  const legacy = (opts.adminToken || '').trim()
  if (legacy && timingSafeStringEqual(header, legacy)) return

  throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
}
