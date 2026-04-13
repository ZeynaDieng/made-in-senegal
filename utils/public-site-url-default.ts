/**
 * Valeur par défaut de l’URL publique du site (runtimeConfig.public.siteUrl / NUXT_PUBLIC_SITE_URL).
 * Sur Vercel, `NUXT_PUBLIC_SITE_URL` peut être omis : on s’appuie sur les hôtes fournis par la plateforme.
 */
export function defaultPublicSiteUrlFromEnv(): string {
  const explicit = String(
    typeof process !== 'undefined' && process.env ? process.env.NUXT_PUBLIC_SITE_URL || '' : '',
  ).trim()
  if (explicit.startsWith('https://')) return explicit

  const prodHost = String(process.env.VERCEL_PROJECT_PRODUCTION_URL || '')
    .replace(/^https?:\/\//, '')
    .trim()
  if (prodHost) return `https://${prodHost}`

  const vercelHost = String(process.env.VERCEL_URL || '')
    .replace(/^https?:\/\//, '')
    .trim()
  if (vercelHost) return `https://${vercelHost}`

  if (explicit) return explicit
  return 'http://localhost:3000'
}
