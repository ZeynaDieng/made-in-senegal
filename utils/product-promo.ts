import type { CmsProduct, CmsPromotions } from '../types/cms'

/** Promo produit : prix d’origine affiché barré, montant facturé = `price`. */
export function productOnPromotion(p: CmsProduct): boolean {
  const c = p.compareAtPrice
  return typeof c === 'number' && Number.isFinite(c) && c > p.price && p.price >= 0
}

/** Pourcentage d’économie (arrondi), ou null si pas en promo. */
export function productPromoPercentOff(p: CmsProduct): number | null {
  if (!productOnPromotion(p) || !p.compareAtPrice) return null
  return Math.max(1, Math.round((1 - p.price / p.compareAtPrice) * 100))
}

/** Pourcentage promo globale CMS (panier), pour badges vitrine — `undefined` si inactive. */
export function siteWidePromoPercentForDisplay(promo: CmsPromotions | null | undefined): number | undefined {
  if (!promo?.active) return undefined
  const n = promo.percentOff
  if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) return undefined
  return Math.min(90, Math.round(n))
}

/** Montant économisé sur le prix catalogue (promo article uniquement). */
export function productPromoSavingsFcfa(p: CmsProduct): number | null {
  if (!productOnPromotion(p) || p.compareAtPrice == null) return null
  return Math.max(0, Math.round(p.compareAtPrice - p.price))
}

/**
 * Estimation de la remise panier **sur le prix affiché de cette pièce** (un seul article au prix actuel).
 * La remise réelle dépend du total panier et du minimum d’achat éventuel.
 */
export function sitePromoSavingOnUnitPrice(p: CmsProduct, promo: CmsPromotions | null | undefined): number | null {
  const pct = siteWidePromoPercentForDisplay(promo)
  if (pct == null) return null
  const saving = Math.round(p.price * (pct / 100))
  return saving > 0 ? saving : null
}
