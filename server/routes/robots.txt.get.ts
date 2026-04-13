export default defineEventHandler((event) => {
  const base = String(useRuntimeConfig(event).public.siteUrl || 'http://localhost:3000').replace(/\/$/, '')
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`
})
