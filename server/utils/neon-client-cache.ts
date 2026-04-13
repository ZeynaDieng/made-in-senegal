import { neon } from '@neondatabase/serverless'
import { neonConnectionUrlFromEnv } from './neon-connection-url'

export type NeonSqlClient = ReturnType<typeof neon>

let cached: NeonSqlClient | null | undefined

/** Une seule instance par process (contact, CMS, santé DB). */
export function getSharedNeonClient(): NeonSqlClient | null {
  if (cached !== undefined) return cached
  const u = neonConnectionUrlFromEnv()
  cached = u ? neon(u) : null
  return cached
}
