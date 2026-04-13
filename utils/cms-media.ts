const PLACEHOLDER = '/placeholder-waxtu.svg'

export type ResolveMediaOptions = {
  /** Pour Open Graph / JSON-LD : forcer une URL absolue si `siteBase` est défini. */
  absolute?: boolean
}

/**
 * Résolution d’URL média sans composable Nuxt.
 * Les chemins racine (`/uploads/...`) restent relatifs par défaut : le navigateur les charge
 * sur l’hôte courant (évite les images cassées si `NUXT_PUBLIC_SITE_URL` ≠ l’URL ouverte en dev).
 */
export function resolveMediaUrl(
  path: string | undefined | null,
  siteBase: string,
  opts?: ResolveMediaOptions,
): string {
  if (path == null) return ''
  const p = String(path).trim()
  if (!p) return ''
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p

  const base = siteBase.replace(/\/$/, '')

  if (p.startsWith('/')) {
    if (opts?.absolute && base) return `${base}${p}`
    return p
  }

  if (base) return `${base}/${p.replace(/^\//, '')}`
  return p
}

export function resolveCmsImageUrl(
  path: string | undefined | null,
  siteBase: string,
  opts?: ResolveMediaOptions,
): string {
  const u = resolveMediaUrl(path, siteBase, opts)
  return u || PLACEHOLDER
}
