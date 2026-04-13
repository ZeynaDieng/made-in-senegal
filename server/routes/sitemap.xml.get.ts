import { readCms } from '../utils/cms-store'

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default defineEventHandler(async (event) => {
  const base = String(useRuntimeConfig(event).public.siteUrl || 'http://localhost:3000').replace(/\/$/, '')
  const cms = await readCms()
  const urls = new Set<string>([
    `${base}/`,
    `${base}/shop`,
    `${base}/lookbook`,
    `${base}/heritage`,
    `${base}/contact`,
    `${base}/mentions-legales`,
    `${base}/cgv`,
    `${base}/politique-confidentialite`,
  ])
  for (const p of cms.products) {
    urls.add(`${base}/shop/${p.id}`)
  }
  const body = [...urls]
    .map((loc) => `  <url><loc>${esc(loc)}</loc></url>`)
    .join('\n')
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`
})
