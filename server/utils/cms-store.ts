import { createError } from 'h3'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type {
  CmsCategory,
  CmsCategoryShowcaseSection,
  CmsContactCopy,
  CmsHeritagePage,
  CmsLegalPage,
  CmsLookbookImage,
  CmsLookbookPage,
  CmsProduct,
  CmsSite,
  CmsParallaxVideoSection,
  CmsTrustStripSection,
  CmsVideoSpotlightSection,
  LandingSection,
  WaxtuCms,
} from '../../types/cms'
import { uniqueCategoryId } from '../../utils/category-slug'
import { defaultCms } from './default-cms'
import { getSharedNeonClient } from './neon-client-cache'

const WAXTU_CMS_META_KEY = 'waxtu_cms'

function isMissingWaxtuMetaTableError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e)
  return /does not exist|relation .+ waxtu_meta/i.test(msg)
}

function isCmsFilesystemReadonlyError(e: unknown): boolean {
  const code = (e as NodeJS.ErrnoException)?.code
  return code === 'EROFS' || code === 'EACCES' || code === 'EPERM'
}

async function readCmsFromNeon(): Promise<WaxtuCms | null> {
  const sql = getSharedNeonClient()
  if (!sql) return null
  try {
    const rows = await sql`
      SELECT value FROM waxtu_meta WHERE key = ${WAXTU_CMS_META_KEY} LIMIT 1
    `
    if (!rows?.length) return normalizeCms(structuredClone(defaultCms))
    const raw = (rows[0] as { value?: unknown }).value
    if (raw == null) return normalizeCms(structuredClone(defaultCms))
    const parsed: WaxtuCms =
      typeof raw === 'string' ? (JSON.parse(raw) as WaxtuCms) : (raw as WaxtuCms)
    return normalizeCms(parsed)
  }
  catch (e) {
    if (isMissingWaxtuMetaTableError(e)) return null
    console.error('[waxtu] readCms neon', e)
    return null
  }
}

function mergeCategories(patch: CmsCategory[] | undefined): CmsCategory[] {
  const base = structuredClone(defaultCms.categories)
  if (!Array.isArray(patch) || patch.length === 0) return base
  const out: CmsCategory[] = []
  for (const c of patch) {
    const name = String(c.name ?? '').trim()
    if (!name) continue
    let id = String(c.id ?? '').trim()
    if (!id) id = uniqueCategoryId(name, [...out, ...base])
    else if (out.some((x) => x.id === id)) id = uniqueCategoryId(name, [...out, ...base])
    out.push({ id, name })
  }
  return out.length ? out : base
}

/** Anciens catalogues : catégories déduites des libellés produits absents de la liste. */
function augmentCategoriesForLegacyProducts(categories: CmsCategory[], products: CmsProduct[]): CmsCategory[] {
  const out = [...categories]
  const names = new Set(out.map((c) => c.name))
  for (const p of products) {
    const raw = p as CmsProduct & { categoryId?: string }
    const idOk = raw.categoryId && out.some((c) => c.id === raw.categoryId)
    if (idOk) continue
    const legacyName = String(raw.category ?? '').trim()
    if (!legacyName || names.has(legacyName)) continue
    const id = uniqueCategoryId(legacyName, out)
    out.push({ id, name: legacyName })
    names.add(legacyName)
  }
  return out
}

function trimOrFallback(v: unknown, fallback: string): string {
  if (typeof v === 'string' && v.trim()) return v.trim()
  return fallback
}

function mergeContact(patch: Partial<CmsSite> | undefined, baseSite: CmsSite): CmsContactCopy {
  const b = baseSite.contact
  const p = patch?.contact
  return {
    pageTitle: trimOrFallback(p?.pageTitle, b.pageTitle),
    heading: trimOrFallback(p?.heading, b.heading),
    quote: typeof p?.quote === 'string' ? p.quote : b.quote,
    address: trimOrFallback(p?.address, b.address),
    phone: trimOrFallback(p?.phone, b.phone),
    email: trimOrFallback(p?.email, b.email),
    instagramUrl: trimOrFallback(p?.instagramUrl, b.instagramUrl),
    facebookUrl: trimOrFallback(p?.facebookUrl, b.facebookUrl),
    formFirstName: trimOrFallback(p?.formFirstName, b.formFirstName),
    formLastName: trimOrFallback(p?.formLastName, b.formLastName),
    formEmail: trimOrFallback(p?.formEmail, b.formEmail),
    formMessage: trimOrFallback(p?.formMessage, b.formMessage),
    submitLabel: trimOrFallback(p?.submitLabel, b.submitLabel),
  }
}

function mergeLegal(base: CmsLegalPage, patch?: Partial<CmsLegalPage>): CmsLegalPage {
  const paragraphs =
    Array.isArray(patch?.paragraphs) && patch!.paragraphs!.length
      ? patch!.paragraphs!.filter((x): x is string => typeof x === 'string')
      : base.paragraphs
  return {
    title: typeof patch?.title === 'string' && patch.title.trim() ? patch.title : base.title,
    paragraphs,
  }
}

function mergeLookbookImages(patchLb: Partial<CmsLookbookPage> | undefined, baseLb: CmsLookbookPage): CmsLookbookImage[] {
  const base = baseLb.images
  const p = patchLb?.images
  const out: CmsLookbookImage[] = []
  for (let i = 0; i < 4; i++) {
    const raw = Array.isArray(p) ? p[i] : undefined
    const b = base[i]
    const src = String(raw?.src ?? b?.src ?? '').trim()
    const alt = String(raw?.alt ?? b?.alt ?? `Look ${i + 1}`).trim()
    out.push({
      src: src || String(b?.src ?? ''),
      alt: alt || `Look ${i + 1}`,
    })
  }
  return out
}

function mergeLookbookPage(sitePatch: Partial<CmsSite> | undefined, baseSite: CmsSite): CmsLookbookPage {
  const baseLb = baseSite.lookbook
  const patchLb = sitePatch?.lookbook
  return {
    pageTitle:
      typeof patchLb?.pageTitle === 'string' && patchLb.pageTitle.trim()
        ? patchLb.pageTitle.trim()
        : baseLb.pageTitle,
    heading:
      typeof patchLb?.heading === 'string' && patchLb.heading.trim()
        ? patchLb.heading.trim()
        : baseLb.heading,
    images: mergeLookbookImages(patchLb, baseLb),
  }
}

function mergeHeritagePage(sitePatch: Partial<CmsSite> | undefined, baseSite: CmsSite): CmsHeritagePage {
  return {
    ...baseSite.heritage,
    ...(sitePatch?.heritage ?? {}),
  }
}

function pickNavLabel(v: unknown, fallback: string): string {
  if (typeof v === 'string' && v.trim()) return v.trim()
  return fallback
}

function mergeNav(patch: Partial<CmsSite> | undefined, base: CmsSite['nav']): CmsSite['nav'] {
  const p = patch?.nav
  return {
    home: pickNavLabel(p?.home, base.home),
    shop: pickNavLabel(p?.shop, base.shop),
    lookbook: pickNavLabel(p?.lookbook, base.lookbook),
    heritage: pickNavLabel(p?.heritage, base.heritage),
    contact: pickNavLabel(p?.contact, base.contact),
  }
}

export function mergeSite(patch: Partial<CmsSite> | undefined): CmsSite {
  const base = defaultCms.site
  if (!patch) return structuredClone(base)
  return {
    nav: mergeNav(patch, base.nav),
    checkout: { ...base.checkout, ...patch.checkout },
    redirect: { ...base.redirect, ...patch.redirect },
    success: { ...base.success, ...patch.success },
    contact: mergeContact(patch, base),
    legal: {
      cgv: mergeLegal(base.legal.cgv, patch.legal?.cgv),
      mentions: mergeLegal(base.legal.mentions, patch.legal?.mentions),
      privacy: mergeLegal(base.legal.privacy, patch.legal?.privacy),
    },
    productPage: { ...base.productPage, ...patch.productPage },
    storefront: { ...base.storefront, ...patch.storefront },
    account: { ...base.account, ...patch.account },
    lookbook: mergeLookbookPage(patch, base),
    heritage: mergeHeritagePage(patch, base),
  }
}

const filePath = () => join(process.cwd(), '.data', 'waxtu-cms.json')

async function ensureDir(path: string) {
  await mkdir(dirname(path), { recursive: true })
}

/** Entiers issus du JSON ou de champs HTML (souvent typés `string`). */
function coerceFiniteInt(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value)
  if (typeof value === 'string') {
    const t = value.trim().replace(/\s/g, '')
    if (!t) return undefined
    const n = Number(t)
    if (Number.isFinite(n)) return Math.trunc(n)
  }
  return undefined
}

/** Rétrocompatibilité : forSale/stock + categoryId / ancien champ category (texte). */
function defaultTrustStripSection(): CmsTrustStripSection {
  const seed = defaultCms.sections.find((s): s is CmsTrustStripSection => s.type === 'trust_strip')
  if (!seed) throw new Error('defaultCms.sections must include a trust_strip block')
  return structuredClone(seed)
}

/** Anciens fichiers `.data/waxtu-cms.json` sans bandeau confiance : on l’insère avant les produits mis en avant. */
function ensureTrustStrip(sections: LandingSection[]): LandingSection[] {
  const out = structuredClone(sections) as LandingSection[]

  for (const s of out) {
    if (s.type === 'trust_strip' && (!Array.isArray(s.items) || s.items.length === 0)) {
      const seed = defaultTrustStripSection()
      s.items = seed.items
      if (!String(s.eyebrow ?? '').trim() && seed.eyebrow) s.eyebrow = seed.eyebrow
      if (!String(s.title ?? '').trim() && seed.title) s.title = seed.title
    }
  }

  if (out.some((s) => s.type === 'trust_strip')) return out

  const trust = defaultTrustStripSection()
  const featIdx = out.findIndex((s) => s.type === 'featured_products')
  if (featIdx === -1) {
    const maxOrder = out.reduce((m, s) => Math.max(m, s.order), -1)
    trust.order = maxOrder + 1
    out.push(trust)
    return out
  }

  const insertAt = out[featIdx].order
  trust.order = insertAt
  for (const s of out) {
    if (s.order >= insertAt) s.order += 1
  }
  out.push(trust)
  out.sort((a, b) => a.order - b.order)
  return out
}

function defaultCategoryShowcaseSection(): CmsCategoryShowcaseSection {
  const seed = defaultCms.sections.find((s): s is CmsCategoryShowcaseSection => s.type === 'category_showcase')
  if (!seed) throw new Error('defaultCms.sections must include a category_showcase block')
  return structuredClone(seed)
}

/** Anciens JSON sans vitrine catégories : insertion avant la première grille produits. */
function ensureCategoryShowcase(sections: LandingSection[]): LandingSection[] {
  const out = structuredClone(sections) as LandingSection[]
  if (out.some((s) => s.type === 'category_showcase')) return out

  const add = defaultCategoryShowcaseSection()
  const featIdx = out.findIndex((s) => s.type === 'featured_products')
  if (featIdx === -1) {
    const maxOrder = out.reduce((m, s) => Math.max(m, s.order), -1)
    add.order = maxOrder + 1
    out.push(add)
    return out
  }
  const insertAt = out[featIdx].order
  add.order = insertAt
  for (const s of out) {
    if (s.order >= insertAt) s.order += 1
  }
  out.push(add)
  out.sort((a, b) => a.order - b.order)
  return out
}

function defaultVideoSpotlightSection(): CmsVideoSpotlightSection {
  const seed = defaultCms.sections.find((s): s is CmsVideoSpotlightSection => s.type === 'video_spotlight')
  if (!seed) throw new Error('defaultCms.sections must include a video_spotlight block')
  return structuredClone(seed)
}

/** Anciens JSON sans bloc vidéo : insertion juste après la section « story » si possible. */
function ensureVideoSpotlight(sections: LandingSection[]): LandingSection[] {
  const out = structuredClone(sections) as LandingSection[]
  if (out.some((s) => s.type === 'video_spotlight')) return out

  const add = defaultVideoSpotlightSection()
  const storyIdx = out.findIndex((s) => s.type === 'story')
  if (storyIdx !== -1) {
    const insertAt = out[storyIdx].order + 1
    add.order = insertAt
    for (const s of out) {
      if (s.order >= insertAt) s.order += 1
    }
    out.push(add)
    out.sort((a, b) => a.order - b.order)
    return out
  }

  const featIdx = out.findIndex((s) => s.type === 'featured_products')
  if (featIdx === -1) {
    const maxOrder = out.reduce((m, s) => Math.max(m, s.order), -1)
    add.order = maxOrder + 1
    out.push(add)
    return out
  }
  const insertAt = out[featIdx].order
  add.order = insertAt
  for (const s of out) {
    if (s.order >= insertAt) s.order += 1
  }
  out.push(add)
  out.sort((a, b) => a.order - b.order)
  return out
}

function defaultParallaxVideoSections(): CmsParallaxVideoSection[] {
  return defaultCms.sections
    .filter((s): s is CmsParallaxVideoSection => s.type === 'parallax_video')
    .map((s) => structuredClone(s))
}

/** Anciens JSON sans bandeaux parallaxe : on ajoute les trois blocs livrés par défaut en fin de page. */
function ensureParallaxVideos(sections: LandingSection[]): LandingSection[] {
  const out = structuredClone(sections) as LandingSection[]
  if (out.some((s) => s.type === 'parallax_video')) return out

  const blocks = defaultParallaxVideoSections()
  if (!blocks.length) return out

  const maxOrder = out.reduce((m, s) => Math.max(m, s.order), -1)
  blocks.forEach((b, i) => {
    b.order = maxOrder + 1 + i
  })
  out.push(...blocks)
  out.sort((a, b) => a.order - b.order)
  return out
}

export function normalizeProduct(p: CmsProduct, categories: CmsCategory[]): CmsProduct {
  const stockOk = typeof p.stock === 'number' && !Number.isNaN(p.stock)
  const raw = p as CmsProduct & { categoryId?: string }
  const { compareAtPrice: rawCompare, ...pRest } = p as CmsProduct & { compareAtPrice?: unknown }
  let categoryId = typeof raw.categoryId === 'string' && raw.categoryId.trim() ? raw.categoryId.trim() : ''
  const legacyName = String(raw.category ?? '').trim()
  if (!categoryId || !categories.some((c) => c.id === categoryId)) {
    const byName = legacyName ? categories.find((c) => c.name === legacyName) : undefined
    categoryId = byName?.id ?? categories[0]?.id ?? 'autres'
  }
  const catLabel = categories.find((c) => c.id === categoryId)?.name ?? (legacyName || '—')
  const priceParsed = coerceFiniteInt(p.price)
  const price = priceParsed !== undefined ? Math.max(0, Math.round(priceParsed)) : 0
  const rawGenre = String((p as CmsProduct & { genre?: string }).genre ?? '').trim().toLowerCase()
  const genre = rawGenre === 'homme' || rawGenre === 'femme' ? rawGenre : 'unisexe'
  const rawCreatedAt = String((p as CmsProduct & { createdAt?: string }).createdAt ?? '').trim()
  const createdAtTs = Date.parse(rawCreatedAt)
  const createdAt = Number.isFinite(createdAtTs)
    ? new Date(createdAtTs).toISOString()
    : new Date(Date.UTC(2024, 0, 1) + Math.max(0, p.id) * 1000).toISOString()
  let compareAtPrice: number | undefined
  const cParsed = coerceFiniteInt(rawCompare)
  if (cParsed !== undefined) {
    const c = Math.round(cParsed)
    if (c > price) compareAtPrice = c
  }
  return {
    ...pRest,
    price,
    categoryId,
    category: catLabel,
    createdAt,
    genre,
    forSale: p.forSale !== false,
    stock: stockOk ? Math.max(0, Math.floor(p.stock)) : 10,
    ...(compareAtPrice !== undefined ? { compareAtPrice } : {}),
  }
}

export function normalizeCms(cms: WaxtuCms): WaxtuCms {
  let categories = mergeCategories(cms.categories)
  categories = augmentCategoriesForLegacyProducts(categories, cms.products ?? [])
  const rawSections = Array.isArray(cms.sections) ? cms.sections : defaultCms.sections
  const sections =
    rawSections.length === 0
      ? []
      : ensureParallaxVideos(
          ensureVideoSpotlight(ensureCategoryShowcase(ensureTrustStrip(rawSections))),
        )
  return {
    ...cms,
    categories,
    site: mergeSite(cms.site),
    products: (cms.products ?? []).map((p) => normalizeProduct(p, categories)),
    sections,
  }
}

export async function readCms(): Promise<WaxtuCms> {
  const fromNeon = await readCmsFromNeon()
  if (fromNeon) return fromNeon

  const path = filePath()
  try {
    const raw = await readFile(path, 'utf-8')
    return normalizeCms(JSON.parse(raw) as WaxtuCms)
  }
  catch {
    return normalizeCms(structuredClone(defaultCms))
  }
}

export async function writeCms(payload: WaxtuCms) {
  const sql = getSharedNeonClient()
  if (sql) {
    const normalized = normalizeCms(payload)
    const json = JSON.stringify(normalized)
    try {
      await sql`
        INSERT INTO waxtu_meta (key, value, updated_at)
        VALUES (${WAXTU_CMS_META_KEY}, ${json}::jsonb, now())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      `
      return
    }
    catch (e) {
      console.error('[waxtu] writeCms neon', e)
      if (isMissingWaxtuMetaTableError(e)) {
        throw createError({
          statusCode: 503,
          statusMessage:
            'Table waxtu_meta absente : exécutez server/db/sql/000_neon_vercel_bootstrap.sql (ou 001_waxtu_meta.sql) dans Neon.',
        })
      }
      throw createError({ statusCode: 500, statusMessage: 'Enregistrement CMS impossible.' })
    }
  }

  const path = filePath()
  try {
    await ensureDir(path)
    await writeFile(path, JSON.stringify(normalizeCms(payload), null, 2), 'utf-8')
  }
  catch (e) {
    console.error('[waxtu] writeCms file', e)
    if (isCmsFilesystemReadonlyError(e) || process.env.VERCEL) {
      throw createError({
        statusCode: 503,
        statusMessage:
          'Impossible d’écrire le CMS sur le disque. Connectez Neon (DATABASE_URL) et exécutez server/db/sql/000_neon_vercel_bootstrap.sql.',
      })
    }
    throw createError({ statusCode: 500, statusMessage: 'Enregistrement CMS impossible.' })
  }
}

export function mergeWithDefaults(payload: WaxtuCms): WaxtuCms {
  return normalizeCms({
    ...defaultCms,
    ...payload,
    global: { ...defaultCms.global, ...payload.global },
    promotions: { ...defaultCms.promotions, ...payload.promotions },
    paytech: { ...defaultCms.paytech, ...payload.paytech },
    categories: mergeCategories(payload.categories),
    sections: ensureParallaxVideos(
      ensureVideoSpotlight(
        ensureCategoryShowcase(
          ensureTrustStrip(
            payload.sections?.length ? payload.sections : structuredClone(defaultCms.sections),
          ),
        ),
      ),
    ),
    products: payload.products?.length ? payload.products : defaultCms.products,
    site: mergeSite(payload.site),
  })
}
