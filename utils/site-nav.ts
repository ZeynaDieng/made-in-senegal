import { defaultSite } from '../data/default-site'
import type { WaxtuCms } from '../types/cms'

export type SiteNavLink = { to: string; label: string }

/** Liens menu / footer vitrine (ordre et chemins figés, libellés depuis le CMS). */
export function siteNavLinks(cms: WaxtuCms | null | undefined): SiteNavLink[] {
  const n = cms?.site?.nav ?? defaultSite.nav
  return [
    { to: '/', label: n.home || defaultSite.nav.home },
    { to: '/shop', label: n.shop || defaultSite.nav.shop },
    { to: '/lookbook', label: n.lookbook || defaultSite.nav.lookbook },
    { to: '/heritage', label: n.heritage || defaultSite.nav.heritage },
    { to: '/contact', label: n.contact || defaultSite.nav.contact },
  ]
}
