import type { CmsProduct, CmsPromotions, WaxtuCms } from '../../types/cms'

export type OrderLine = { id: number; qty: number }

/** Fusionne les lignes portant le même id (somme des quantités). */
export function mergeOrderLines(items: OrderLine[]): OrderLine[] {
  const map = new Map<number, number>()
  for (const { id, qty } of items) {
    if (!Number.isFinite(id) || !Number.isFinite(qty)) continue
    map.set(id, (map.get(id) ?? 0) + qty)
  }
  return [...map.entries()].map(([id, qty]) => ({ id, qty }))
}

export function productsMap(cms: WaxtuCms) {
  return new Map(cms.products.map((p) => [p.id, p]))
}

export function computeSubtotal(items: OrderLine[], productsById: Map<number, CmsProduct>) {
  let subtotal = 0
  for (const line of items) {
    const p = productsById.get(line.id)
    if (!p) throw new Error(`Produit ${line.id} introuvable`)
    subtotal += p.price * line.qty
  }
  return subtotal
}

export function computeDiscount(promo: CmsPromotions, subtotal: number) {
  if (!promo.active) return 0
  const min = promo.minAmount ?? 0
  if (subtotal < min) return 0
  return Math.round(subtotal * (promo.percentOff / 100))
}

export function computeTotals(cms: WaxtuCms, items: OrderLine[]) {
  const productsById = productsMap(cms)
  const subtotal = computeSubtotal(items, productsById)
  const discount = computeDiscount(cms.promotions, subtotal)
  const total = Math.max(0, subtotal - discount)
  return { subtotal, discount, total, productsById }
}

export function validateOrderLines(
  cms: WaxtuCms,
  items: OrderLine[],
): { ok: true } | { ok: false; message: string } {
  const map = productsMap(cms)
  for (const line of items) {
    if (!Number.isFinite(line.qty) || line.qty < 1 || !Number.isInteger(line.qty)) {
      return { ok: false, message: 'Quantité invalide (entier ≥ 1 requis)' }
    }
    const p = map.get(line.id)
    if (!p) return { ok: false, message: `Produit ${line.id} inconnu` }
    if (!p.forSale) return { ok: false, message: `${p.name} n'est pas en vente` }
    if (line.qty > p.stock) return { ok: false, message: `Stock insuffisant pour ${p.name}` }
  }
  return { ok: true }
}
