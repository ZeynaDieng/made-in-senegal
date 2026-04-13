import type { WaxtuCms } from '../../types/cms'

/** Catalogue visible et achetable sur la vitrine. */
export function filterSellableProducts(cms: WaxtuCms): WaxtuCms {
  return {
    ...cms,
    products: cms.products.filter((p) => p.forSale && p.stock > 0),
  }
}
