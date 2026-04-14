<script setup lang="ts">
import type { CmsProduct, CmsPromotions } from '../../types/cms'
import {
  productOnPromotion,
  productPromoPercentOff,
  siteWidePromoPercentForDisplay,
} from '../../utils/product-promo'

const props = defineProps<{
  product: CmsProduct
  /** Promo globale (code panier) : badge en plus de la promo article éventuelle. */
  sitePromotions?: CmsPromotions | null
}>()

const showProduct = computed(() => productOnPromotion(props.product))
const pct = computed(() => productPromoPercentOff(props.product))

const globalPct = computed(() => siteWidePromoPercentForDisplay(props.sitePromotions ?? null))
</script>

<template>
  <div
    v-if="showProduct && pct != null"
    class="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[min(9rem,calc(100%-4rem))] items-center justify-center rounded-wax bg-gold px-2 py-1 text-center shadow-md"
  >
    <span class="text-[10px] font-bold uppercase leading-tight tracking-wider text-white">
      −{{ pct }}&nbsp;%
    </span>
  </div>
  <div
    v-if="globalPct != null"
    class="pointer-events-none absolute right-3 top-3 z-10 flex max-w-[min(9rem,calc(100%-4rem))] items-center justify-center rounded-wax border border-gold/90 bg-ink/90 px-2 py-1 text-center shadow-md backdrop-blur-sm"
    title="Remise panier appliquée au checkout"
  >
    <span class="text-[9px] font-bold uppercase leading-tight tracking-wider text-gold">
      Panier −{{ globalPct }}&nbsp;%
    </span>
  </div>
</template>
