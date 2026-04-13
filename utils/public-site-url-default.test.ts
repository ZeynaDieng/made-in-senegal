import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultPublicSiteUrlFromEnv } from './public-site-url-default'

describe('defaultPublicSiteUrlFromEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('respecte NUXT_PUBLIC_SITE_URL en https', () => {
    vi.stubEnv('NUXT_PUBLIC_SITE_URL', 'https://waxtu.example')
    vi.stubEnv('VERCEL_URL', 'ignore.vercel.app')
    expect(defaultPublicSiteUrlFromEnv()).toBe('https://waxtu.example')
  })

  it('utilise VERCEL_PROJECT_PRODUCTION_URL si pas d’URL https explicite', () => {
    vi.stubEnv('NUXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'made-in-senegal.vercel.app')
    expect(defaultPublicSiteUrlFromEnv()).toBe('https://made-in-senegal.vercel.app')
  })

  it('utilise VERCEL_URL en secours', () => {
    vi.stubEnv('NUXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '')
    vi.stubEnv('VERCEL_URL', 'preview-abc.vercel.app')
    expect(defaultPublicSiteUrlFromEnv()).toBe('https://preview-abc.vercel.app')
  })

  it('retire un protocole déjà présent sur VERCEL_URL', () => {
    vi.stubEnv('NUXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('VERCEL_URL', 'https://host.vercel.app')
    expect(defaultPublicSiteUrlFromEnv()).toBe('https://host.vercel.app')
  })
})
