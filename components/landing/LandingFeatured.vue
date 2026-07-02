<script setup lang="ts">
import { ShoppingBag } from 'lucide-vue-next'
import type { CmsFeaturedProductsSection, CmsProduct, CmsPromotions } from '../../types/cms'

const props = defineProps<{
  section: CmsFeaturedProductsSection
  products: CmsProduct[]
  sitePromotions?: CmsPromotions | null
}>()

const cart = useCartStore()
const cmsImg = useCmsImg()

const featured = computed(() =>
  props.section.productIds
    .map((id) => props.products.find((p) => p.id === id))
    .filter(Boolean) as CmsProduct[],
)

function genreLabel(v: string) {
  if (v === 'homme') return 'Homme'
  if (v === 'femme') return 'Femme'
  return 'Unisexe'
}
</script>

<template>
  <section class="bg-night py-12 text-paper md:py-24">
    <div class="mx-auto max-w-6xl px-5 md:px-8">
      <div class="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:gap-6 md:mb-16 md:flex-row md:items-end">
        <div>
          <h2 class="mb-2 font-serif text-2xl text-paper sm:mb-3 sm:text-3xl md:text-5xl lg:text-6xl">
            {{ section.title }}
          </h2>
          <p class="text-xs font-light text-muted sm:text-sm md:text-base">
            {{ section.subtitle }}
          </p>
        </div>
        <NuxtLink
          class="inline-flex min-h-[44px] items-center border-b-2 border-gold pb-2 pt-1 text-xs font-bold uppercase tracking-[0.35em] text-paper transition hover:text-gold"
          :to="section.browseHref"
        >
          {{ section.browseLabel }}
        </NuxtLink>
      </div>
      <div
        class="-mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 lg:gap-10 xl:gap-16"
        role="list"
        aria-label="Produits mis en avant"
      >
        <article
          v-for="(product, idx) in featured"
          :key="product.id"
          role="listitem"
          class="group w-[min(72vw,16.25rem)] shrink-0 snap-start motion-reduce:opacity-100 animate-reveal-up opacity-0 rounded-xl border border-white/10 bg-ink p-2 shadow-[0_6px_22px_rgba(0,0,0,0.3)] sm:w-auto sm:min-w-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
          :style="{ animationDelay: `${idx * 140}ms` }"
        >
          <div
            class="relative mb-2 aspect-square cursor-pointer overflow-hidden rounded-lg sm:mb-6 sm:aspect-[3/4] sm:rounded-none"
            @click="navigateTo(`/shop/${product.id}`)"
          >
            <ProductPromoBadge :product="product" :site-promotions="sitePromotions" />
            <img
              :src="cmsImg(product.images[0])"
              :alt="product.name"
              class="h-full w-full object-cover transition duration-1000 group-hover:scale-110"
            >
            <div
              class="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10"
            />
            <div class="absolute right-2 top-2 opacity-100 transition-opacity duration-500 sm:right-4 sm:top-4 sm:opacity-0 sm:group-hover:opacity-100">
              <button
                type="button"
                class="rounded-pill bg-night p-2 text-paper shadow-lift transition hover:bg-gold hover:text-white sm:p-3"
                aria-label="Ajouter au panier"
                @click.stop="cart.add(product)"
              >
                <ShoppingBag class="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
          <h4 class="mb-1 line-clamp-2 font-serif text-base leading-snug text-paper transition group-hover:italic sm:mb-2 sm:text-xl sm:leading-normal sm:line-clamp-none md:text-2xl">
            {{ product.name }}
          </h4>
          <div class="mb-1.5 flex flex-wrap gap-1.5 sm:mb-2 sm:gap-2">
            <NuxtLink
              :to="`/shop?cat=${encodeURIComponent(product.categoryId)}`"
              class="rounded-pill border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted"
            >
              {{ product.category }}
            </NuxtLink>
            <NuxtLink
              :to="`/shop?genre=${encodeURIComponent(product.genre)}`"
              class="rounded-pill px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
              :class="product.genre === 'homme'
                ? 'bg-sky-500/20 text-sky-200'
                : product.genre === 'femme'
                  ? 'bg-rose-500/20 text-rose-200'
                  : 'bg-emerald-500/20 text-emerald-200'"
            >
              {{ genreLabel(product.genre) }}
            </NuxtLink>
          </div>
          <ProductPriceTag :product="product" compact />
        </article>
      </div>
    </div>
  </section>
</template>
