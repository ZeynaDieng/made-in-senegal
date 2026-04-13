import { describe, expect, it } from 'vitest'
import type { CmsProduct } from '../../types/cms'
import { defaultCategories } from '../../data/default-categories'
import { productOnPromotion } from '../../utils/product-promo'
import { normalizeProduct } from './cms-store'

const cats = defaultCategories

function minimalProduct(over: Partial<CmsProduct> & Pick<CmsProduct, 'id' | 'price'>): CmsProduct {
  return {
    id: over.id,
    name: 'Test',
    createdAt: '2026-01-01T00:00:00.000Z',
    categoryId: 'maroquinerie',
    category: 'Maroquinerie',
    genre: 'unisexe',
    price: over.price,
    forSale: true,
    stock: 5,
    tagline: '',
    images: [],
    description: '',
    story: '',
    details: [],
    reviews: [],
    ...over,
  }
}

describe('normalizeProduct + promo', () => {
  it('accepte prix / compareAt en chaînes (JSON ou formulaires)', () => {
    const p = normalizeProduct(
      minimalProduct({
        id: 2,
        price: '45000' as unknown as number,
        compareAtPrice: '55000' as unknown as number,
      }),
      cats,
    )
    expect(p.price).toBe(45000)
    expect(p.compareAtPrice).toBe(55000)
    expect(productOnPromotion(p)).toBe(true)
  })

  it('retire compareAt si ≤ prix de vente', () => {
    const p = normalizeProduct(
      minimalProduct({
        id: 9,
        price: 50000,
        compareAtPrice: 50000,
      }),
      cats,
    )
    expect(p.compareAtPrice).toBeUndefined()
    expect(productOnPromotion(p)).toBe(false)
  })
})
