import { describe, expect, it } from 'vitest'
import type { CmsProduct } from '../types/cms'
import {
  productOnPromotion,
  productPromoPercentOff,
  productPromoSavingsFcfa,
  sitePromoSavingOnUnitPrice,
  siteWidePromoPercentForDisplay,
} from './product-promo'

const base = (): CmsProduct => ({
  id: 1,
  name: 'X',
  createdAt: '2026-01-01T00:00:00.000Z',
  categoryId: 'a',
  category: 'A',
  genre: 'unisexe',
  price: 1000,
  forSale: true,
  stock: 1,
  tagline: '',
  images: [],
  description: '',
  story: '',
  details: [],
  reviews: [],
})

describe('productOnPromotion', () => {
  it('false sans compareAtPrice', () => {
    expect(productOnPromotion(base())).toBe(false)
  })

  it('false si compareAt ≤ price', () => {
    const p = base()
    p.compareAtPrice = 1000
    expect(productOnPromotion(p)).toBe(false)
    p.compareAtPrice = 500
    expect(productOnPromotion(p)).toBe(false)
  })

  it('true si compareAt > price', () => {
    const p = base()
    p.compareAtPrice = 2000
    expect(productOnPromotion(p)).toBe(true)
  })
})

describe('productPromoPercentOff', () => {
  it('calcule le pourcentage', () => {
    const p = base()
    p.price = 45000
    p.compareAtPrice = 55000
    expect(productPromoPercentOff(p)).toBe(18)
  })
})

describe('siteWidePromoPercentForDisplay', () => {
  it('undefined si promo inactive', () => {
    expect(siteWidePromoPercentForDisplay({ active: false, title: '', code: '', percentOff: 10 })).toBeUndefined()
  })

  it('retourne le pourcentage si actif', () => {
    expect(siteWidePromoPercentForDisplay({ active: true, title: '', code: 'X', percentOff: 10 })).toBe(10)
  })

  it('ignore percentOff ≤ 0', () => {
    expect(siteWidePromoPercentForDisplay({ active: true, title: '', code: 'X', percentOff: 0 })).toBeUndefined()
  })
})

describe('productPromoSavingsFcfa', () => {
  it('retourne la différence catalogue − vente', () => {
    const p = base()
    p.price = 45000
    p.compareAtPrice = 55000
    expect(productPromoSavingsFcfa(p)).toBe(10000)
  })
})

describe('sitePromoSavingOnUnitPrice', () => {
  it('estime la remise sur le prix unitaire', () => {
    const p = base()
    p.price = 100000
    const promo = { active: true, title: '', code: 'X', percentOff: 10 }
    expect(sitePromoSavingOnUnitPrice(p, promo)).toBe(10000)
  })
})
