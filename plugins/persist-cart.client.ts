import { useCartStore, type CartLine } from '../stores/cart'

/**
 * Restaurer le panier après l’hydratation pour éviter les mismatches SSR/client
 * (badge compteur, tiroir panier) quand localStorage contient des lignes.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const cart = useCartStore()

  nuxtApp.hook('app:mounted', () => {
    try {
      const raw = localStorage.getItem('waxtu-cart')
      if (raw) {
        const parsed = JSON.parse(raw) as { lines?: CartLine[] }
        if (parsed.lines?.length) cart.$patch({ lines: parsed.lines })
      }
    }
    catch {
      /* ignore */
    }
  })

  watch(
    () => cart.lines,
    (lines) => {
      localStorage.setItem('waxtu-cart', JSON.stringify({ lines }))
    },
    { deep: true },
  )
})
