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

/**
 * Origine publique **HTTPS** pour construire l’URL d’IPN PayTech, évaluée **au runtime** sur le serveur.
 * `nuxt.config` peut avoir figé `public.siteUrl` à localhost au build ; sur Vercel, `VERCEL_*` est disponible à l’exécution.
 * Ordre : `paytechIpnPublicUrl` → `siteUrl` si déjà https → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL`.
 */
export function runtimeHttpsOriginForPaytechIpn(
  paytechIpnPublicUrl: string,
  configuredPublicSiteUrl: string,
): string | null {
  const override = String(paytechIpnPublicUrl || '').trim().replace(/\/$/, '')
  if (/^https:\/\//i.test(override)) return override

  const site = String(configuredPublicSiteUrl || '').trim().replace(/\/$/, '')
  if (/^https:\/\//i.test(site)) return site

  const prodHost = String(
    typeof process !== 'undefined' && process.env ? process.env.VERCEL_PROJECT_PRODUCTION_URL || '' : '',
  )
    .replace(/^https?:\/\//i, '')
    .trim()
  if (prodHost) return `https://${prodHost}`

  const vercelHost = String(
    typeof process !== 'undefined' && process.env ? process.env.VERCEL_URL || '' : '',
  )
    .replace(/^https?:\/\//i, '')
    .trim()
  if (vercelHost) return `https://${vercelHost}`

  return null
}
