<script setup lang="ts">
import type { CmsProduct, CmsPromotions } from '../../types/cms'
import {
  productOnPromotion,
  productPromoPercentOff,
  productPromoSavingsFcfa,
  sitePromoSavingOnUnitPrice,
} from '../../utils/product-promo'

const props = withDefaults(
  defineProps<{
    product: CmsProduct
    /** Grille boutique / panier : aligné à droite, typo plus petite. */
    compact?: boolean
    /** Pour afficher le montant estimé de la remise panier sur cette pièce. */
    sitePromotions?: CmsPromotions | null
  }>(),
  { compact: false },
)

const formatPrice = useFormatPrice()

const promo = computed(() => productOnPromotion(props.product))
const pct = computed(() => productPromoPercentOff(props.product))
const compare = computed(() => (promo.value && props.product.compareAtPrice ? props.product.compareAtPrice : null))
const savingsFcfa = computed(() => productPromoSavingsFcfa(props.product))
const siteSavingOnUnit = computed(() => sitePromoSavingOnUnitPrice(props.product, props.sitePromotions ?? null))
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
    <p
      v-if="savingsFcfa != null && !compact"
      class="max-w-[18rem] text-pretty text-xs leading-snug text-ink/85 dark:text-paper/85"
    >
      <span class="font-semibold text-gold">Économie sur ce produit :</span>
      {{ formatPrice(savingsFcfa) }}
      <span v-if="pct != null" class="text-muted"> ({{ pct }}&nbsp;% par rapport au prix d’origine)</span>
    </p>
    <p
      v-else-if="savingsFcfa != null"
      class="max-w-[14rem] text-pretty text-right text-[10px] leading-snug text-gold"
    >
      Économie {{ formatPrice(savingsFcfa) }}<span v-if="pct != null" class="text-muted"> · −{{ pct }}&nbsp;%</span>
    </p>
    <p
      v-if="siteSavingOnUnit != null && !compact"
      class="max-w-[18rem] text-pretty text-[11px] leading-snug text-muted"
    >
      <span class="font-semibold text-ink dark:text-paper">Promo panier (code actif) :</span>
      jusqu’à {{ formatPrice(siteSavingOnUnit) }} de moins sur cette pièce si elle est seule au panier au prix affiché
      <span v-if="sitePromotions?.minAmount" class="mt-0.5 block text-[10px] italic">
        Le total réel dépend du panier et du montant minimum d’achat.
      </span>
    </p>
    <p
      v-else-if="siteSavingOnUnit != null"
      class="max-w-[14rem] text-pretty text-right text-[10px] leading-snug text-muted"
    >
      Panier : max {{ formatPrice(siteSavingOnUnit) }}
      <span v-if="sitePromotions?.minAmount" class="block text-[9px] italic">selon conditions</span>
    </p>
  </div>
</template>
