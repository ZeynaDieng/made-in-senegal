/** URL Postgres (Neon / Vercel). Pas de préfixe Nuxt : lecture directe `process.env` pour les utilitaires sans `H3Event`. */
export function neonConnectionUrlFromEnv(): string {
  return String(
    process.env.NUXT_DATABASE_URL ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.STORAGE_URL ||
      '',
  ).trim()
}
