import { defaultPublicSiteUrlFromEnv } from '../../utils/public-site-url-default'

/**
 * En production, refuse de démarrer si la configuration minimale e-commerce / admin est absente.
 */
export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV !== 'production') return

  const config = useRuntimeConfig()
  const issues: string[] = []

  const configured = String(config.public?.siteUrl || '').trim()
  const site = configured.startsWith('https://') ? configured : defaultPublicSiteUrlFromEnv()
  if (!site.startsWith('https://')) {
    issues.push(
      'NUXT_PUBLIC_SITE_URL doit être une URL HTTPS en production (ou déployer sur Vercel avec VERCEL_URL / VERCEL_PROJECT_PRODUCTION_URL)',
    )
  }

  if (!String(config.paytechApiKey || '').trim() || !String(config.paytechApiSecret || '').trim()) {
    issues.push('NUXT_PAYTECH_API_KEY et NUXT_PAYTECH_API_SECRET sont requis en production')
  }

  const secret = String(config.adminSessionSecret || '').trim()
  const legacy = String(config.adminToken || '').trim()
  if (secret.length < 32 && legacy.length < 16) {
    issues.push('Configurer NUXT_ADMIN_SESSION_SECRET (min. 32 caractères) ou NUXT_ADMIN_TOKEN (min. 16 caractères)')
  }

  if (!String(config.adminEmail || '').trim() || !String(config.adminPassword || '').trim()) {
    issues.push('NUXT_ADMIN_EMAIL et NUXT_ADMIN_PASSWORD sont requis en production')
  }

  if (issues.length) {
    const msg = `[waxtu] Configuration production invalide:\n- ${issues.join('\n- ')}`
    console.error(msg)
    throw new Error(msg)
  }
})
