import { neon } from '@neondatabase/serverless'
import type { H3Event } from 'h3'

export type NeonSql = ReturnType<typeof neon>

/**
 * Client SQL Neon (HTTP). Retourne `null` si aucune URL n’est configurée.
 * Ordre : `NUXT_DATABASE_URL` → `DATABASE_URL` → `POSTGRES_URL` (templates Vercel) → `STORAGE_URL`.
 */
export function getNeonSql(event: H3Event): NeonSql | null {
  const config = useRuntimeConfig(event)
  const url = String(
    config.databaseUrl ||
      process.env.NUXT_DATABASE_URL ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.STORAGE_URL ||
      '',
  ).trim()
  if (!url) return null
  return neon(url)
}
