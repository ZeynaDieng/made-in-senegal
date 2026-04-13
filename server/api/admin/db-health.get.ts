import { requireAdmin } from '../../utils/admin-auth'
import { getNeonSql } from '../../utils/neon-sql'

/** Vérifie la connexion Neon / Postgres (admin uniquement). */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  requireAdmin(event, {
    adminToken: config.adminToken,
    adminSessionSecret: config.adminSessionSecret,
  })

  const sql = getNeonSql(event)
  if (!sql) {
    return {
      ok: true,
      neon: 'disabled',
      hint: 'Définir NUXT_DATABASE_URL ou DATABASE_URL (ex. chaîne Neon) pour activer Postgres.',
    }
  }

  const rows = await sql`SELECT 1 AS ok`
  const ok = rows[0]?.ok === 1
  return { ok, neon: ok ? 'connected' : 'unexpected_response' }
})
