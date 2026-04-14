<script setup lang="ts">
import type { CmsProduct } from '../../types/cms'
import { productOnPromotion, productPromoPercentOff } from '../../utils/product-promo'

const props = withDefaults(
  defineProps<{
    product: CmsProduct
    /** Grille boutique / panier : aligné à droite, typo plus petite. */
    compact?: boolean
  }>(),
  { compact: false },
)

const formatPrice = useFormatPrice()

const promo = computed(() => productOnPromotion(props.product))
const pct = computed(() => productPromoPercentOff(props.product))
const compare = computed(() => (promo.value && props.product.compareAtPrice ? props.product.compareAtPrice : null))
</script>

<template>
  <div
    class="flex flex-col gap-1"
    :class="compact ? 'items-end text-right' : 'items-start'"
  >
    <span
      v-if="pct != null"
      class="inline-flex w-fit rounded-pill bg-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold dark:bg-gold/15"
    >
      −{{ pct }}&nbsp;%
    </span>
    <div
      class="flex flex-wrap items-baseline gap-2"
      :class="compact ? 'justify-end' : ''"
    >
      <span
        v-if="compare != null"
        class="text-muted line-through decoration-ink/25 dark:decoration-white/25"
        :class="compact ? 'text-sm' : 'text-lg md:text-xl'"
      >
        {{ formatPrice(compare) }}
      </span>
      <span
        class="font-light text-gold"
        :class="compact ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl'"
      >
        {{ formatPrice(product.price) }}
      </span>
    </div>
  </div>
</template>
