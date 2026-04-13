import { describe, expect, it } from 'vitest'
import type { WaxtuCms } from '../../types/cms'
import { defaultCategories } from '../../data/default-categories'
import { defaultSite } from '../../data/default-site'
import { computeDiscount, computeTotals, mergeOrderLines, validateOrderLines } from './commerce'

const miniCms = (): WaxtuCms => ({
  version: 1,
  global: { brand: 'W', tagline: 't' },
  site: defaultSite,
  categories: defaultCategories,
  promotions: {
    active: true,
    title: 'P',
    code: 'WAX10',
    percentOff: 10,
    minAmount: 0,
  },
  paytech: {
    env: 'test',
    successPath: '/ok',
    cancelPath: '/ko',
    ipnPath: '/ipn',
    isMobileFlow: false,
  },
  sections: [],
  products: [
    {
      id: 1,
      name: 'A',
      createdAt: '2026-01-01T00:00:00.000Z',
      categoryId: 'autres',
      category: 'Autres',
      genre: 'unisexe',
      price: 1000,
      forSale: true,
      stock: 5,
      tagline: '',
      images: [],
      description: '',
      story: '',
      details: [],
      reviews: [],
    },
  ],
})

describe('mergeOrderLines', () => {
  it('fusionne les quantités par id', () => {
    expect(mergeOrderLines([{ id: 1, qty: 1 }, { id: 1, qty: 2 }])).toEqual([{ id: 1, qty: 3 }])
  })
})

describe('computeTotals', () => {
  it('applique la remise promo', () => {
    const cms = miniCms()
    const { subtotal, discount, total } = computeTotals(cms, [{ id: 1, qty: 2 }])
    expect(subtotal).toBe(2000)
    expect(discount).toBe(200)
    expect(total).toBe(1800)
  })
})

describe('computeDiscount', () => {
  it('retourne 0 si promo inactive', () => {
    const cms = miniCms()
    cms.promotions.active = false
    expect(computeDiscount(cms.promotions, 10000)).toBe(0)
  })
})

describe('validateOrderLines', () => {
  it('refuse si stock insuffisant', () => {
    const cms = miniCms()
    const r = validateOrderLines(cms, [{ id: 1, qty: 99 }])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/stock/i)
  })

  it('accepte une ligne valide', () => {
    const cms = miniCms()
    expect(validateOrderLines(cms, [{ id: 1, qty: 2 }])).toEqual({ ok: true })
  })
})
