import { createError, readBody } from 'h3'
import { timingSafeEqual } from 'node:crypto'
import { signAdminJwt } from '../../utils/admin-jwt'

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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ email?: string; password?: string }>(event).catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email : ''
  const password = typeof body.password === 'string' ? body.password : ''

  const cfgEmail = (config.adminEmail || '').trim().toLowerCase()
  const cfgPassword = config.adminPassword || ''

  if (!cfgEmail || !cfgPassword) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Admin email/password not configured (NUXT_ADMIN_EMAIL, NUXT_ADMIN_PASSWORD)',
    })
  }

  const secret = (config.adminSessionSecret || config.adminToken || '').trim()
  if (!secret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Set NUXT_ADMIN_SESSION_SECRET (or NUXT_ADMIN_TOKEN) to sign sessions',
    })
  }

  const emailOk = timingSafeStringEqual(normalizeEmail(email), cfgEmail)
  const passOk = timingSafeStringEqual(password, cfgPassword)
  if (!emailOk || !passOk) {
    throw createError({ statusCode: 401, statusMessage: 'Identifiants invalides' })
  }

  return { token: signAdminJwt(secret) }
})
