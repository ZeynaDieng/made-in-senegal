import { defineStore } from 'pinia'
import type { CmsProduct, WaxtuCms } from '../types/cms'

export type CartLine = {
  id: number
  qty: number
  product: CmsProduct
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    lines: [] as CartLine[],
    isOpen: false,
    notification: null as string | null,
  }),
  getters: {
    count: (state) => state.lines.reduce((sum, line) => sum + line.qty, 0),
    subtotal: (state) => state.lines.reduce((sum, line) => sum + line.product.price * line.qty, 0),
  },
  actions: {
    open() {
      this.isOpen = true
    },
    close() {
      this.isOpen = false
    },
    notify(message: string) {
      this.notification = message
      window.setTimeout(() => {
        this.notification = null
      }, 3200)
    },
    add(product: CmsProduct) {
      if (!product.forSale || product.stock <= 0) {
        this.notify('Produit indisponible')
        return
      }
      const existing = this.lines.find((line) => line.id === product.id)
      const currentQty = existing?.qty ?? 0
      if (currentQty + 1 > product.stock) {
        this.notify('Stock maximum atteint')
        return
      }
      if (existing) {
        existing.qty += 1
        existing.product = { ...product }
      }
      else {
        this.lines.push({ id: product.id, qty: 1, product: { ...product } })
      }
      this.notify('Article ajouté à votre écrin')
      this.open()
    },
    increment(id: number) {
      const line = this.lines.find((l) => l.id === id)
      if (!line) return
      if (line.qty >= line.product.stock) {
        this.notify('Stock maximum atteint')
        return
      }
      line.qty += 1
    },
    decrement(id: number) {
      const line = this.lines.find((l) => l.id === id)
      if (!line) return
      line.qty -= 1
      if (line.qty <= 0) this.remove(id)
    },
    remove(id: number) {
      this.lines = this.lines.filter((line) => line.id !== id)
    },
    clear() {
      this.lines = []
    },
    /** Recale le panier sur le catalogue public (prix, stock, dispo). */
    syncWithCatalog(cms: WaxtuCms | null) {
      if (!cms?.products?.length) return
      const next: CartLine[] = []
      for (const line of this.lines) {
        const p = cms.products.find((x) => x.id === line.id)
        if (!p || !p.forSale || p.stock <= 0) {
          this.notify(`${line.product.name} n'est plus disponible`)
          continue
        }
        const qty = Math.min(line.qty, p.stock)
        if (qty > 0) next.push({ id: line.id, qty, product: { ...p } })
      }
      this.lines = next
    },
  },
})
