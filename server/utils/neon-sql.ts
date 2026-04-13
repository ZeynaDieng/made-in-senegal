import { neon } from '@neondatabase/serverless'
import type { H3Event } from 'h3'
import { neonConnectionUrlFromEnv } from './neon-connection-url'

export type NeonSql = ReturnType<typeof neon>

/**
 * Client SQL Neon (HTTP). Retourne `null` si aucune URL n’est configurée.
 */
export function getNeonSql(event: H3Event): NeonSql | null {
  const config = useRuntimeConfig(event)
  const url = String(config.databaseUrl || neonConnectionUrlFromEnv()).trim()
  if (!url) return null
  return neon(url)
}
