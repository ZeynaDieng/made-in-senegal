<script setup lang="ts">
import type { CmsProduct, CmsPromotions } from '../../types/cms'
import {
  productOnPromotion,
  productPromoPercentOff,
  productPromoSavingsFcfa,
  siteWidePromoPercentForDisplay,
  sitePromoSavingOnUnitPrice,
} from '../../utils/product-promo'

const props = defineProps<{
  product: CmsProduct
  /** Promo globale (code panier) : badge en plus de la promo article éventuelle. */
  sitePromotions?: CmsPromotions | null
}>()

const formatPrice = useFormatPrice()

const showProduct = computed(() => productOnPromotion(props.product))
const pct = computed(() => productPromoPercentOff(props.product))
const savingsFcfa = computed(() => productPromoSavingsFcfa(props.product))

const globalPct = computed(() => siteWidePromoPercentForDisplay(props.sitePromotions ?? null))
const globalSavingOnUnit = computed(() => sitePromoSavingOnUnitPrice(props.product, props.sitePromotions ?? null))

const globalTitle = computed(() => {
  const p = props.sitePromotions
  const min = p?.minAmount
  if (typeof min === 'number' && min > 0) {
    return `Remise panier : jusqu’à ${globalSavingOnUnit.value != null ? formatPrice(globalSavingOnUnit.value) : ''} sur cette pièce seule ; montant minimum d’achat au checkout.`
  }
  return `Remise panier sur le total ; sur cette pièce seule : jusqu’à ${globalSavingOnUnit.value != null ? formatPrice(globalSavingOnUnit.value) : ''}.`
})
</script>

<template>
  <div
    v-if="showProduct && pct != null && savingsFcfa != null"
    class="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[min(11rem,calc(100%-4rem))] flex-col gap-0.5 rounded-wax bg-gold px-2 py-1.5 text-center shadow-md"
  >
    <span class="text-[10px] font-bold uppercase leading-tight tracking-wider text-white">
      −{{ pct }}&nbsp;%
    </span>
    <span class="text-[9px] font-semibold leading-tight text-white/95">
      {{ formatPrice(savingsFcfa) }}
    </span>
  </div>
  <div
    v-if="globalPct != null && globalSavingOnUnit != null"
    class="pointer-events-none absolute right-3 top-3 z-10 flex max-w-[min(11rem,calc(100%-4rem))] flex-col gap-0.5 rounded-wax border border-gold/90 bg-ink/90 px-2 py-1.5 text-center shadow-md backdrop-blur-sm"
    :title="globalTitle"
  >
    <span class="text-[9px] font-bold uppercase leading-tight tracking-wider text-gold">
      Panier −{{ globalPct }}&nbsp;%
    </span>
    <span class="text-[9px] font-semibold leading-tight text-paper/95">
      max {{ formatPrice(globalSavingOnUnit) }}
    </span>
  </div>
</template>
