<script setup lang="ts">
import type { LandingSection, WaxtuCms } from '../../types/cms'
import LandingCategoryShowcase from './LandingCategoryShowcase.vue'
import LandingFeatured from './LandingFeatured.vue'
import LandingHero from './LandingHero.vue'
import LandingStory from './LandingStory.vue'
import LandingTrustStrip from './LandingTrustStrip.vue'
import LandingParallaxVideo from './LandingParallaxVideo.vue'
import LandingVideoSpotlight from './LandingVideoSpotlight.vue'

const props = defineProps<{
  cms: WaxtuCms
}>()

const sections = computed(() =>
  [...(props.cms.sections ?? [])]
    /** Anciens JSON sans `enabled` : traiter comme actif (≠ false). */
    .filter((s) => s.enabled !== false)
    .sort((a, b) => a.order - b.order),
)
const cmsImg = useCmsImg()
const newestProducts = computed(() =>
  [...(props.cms.products ?? [])]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 4),
)
const firstHeroIndex = computed(() => sections.value.findIndex((s) => s.type === 'hero'))
const firstTrustIndex = computed(() => sections.value.findIndex((s) => s.type === 'trust_strip'))
const newArrivalsInsertIndex = computed(() => {
  const placement = props.cms.site?.storefront?.newArrivalsPlacement ?? 'after_hero'
  if (placement === 'hidden') return -1
  if (placement === 'after_trust' && firstTrustIndex.value !== -1) return firstTrustIndex.value
  return firstHeroIndex.value
})

function sectionComponent(section: LandingSection) {
  if (section.type === 'hero') return LandingHero
  if (section.type === 'story') return LandingStory
  if (section.type === 'trust_strip') return LandingTrustStrip
  if (section.type === 'category_showcase') return LandingCategoryShowcase
  if (section.type === 'video_spotlight') return LandingVideoSpotlight
  if (section.type === 'parallax_video') return LandingParallaxVideo
  return LandingFeatured
}

function sectionProps(section: LandingSection) {
  if (section.type === 'featured_products')
    return { section, products: props.cms.products, sitePromotions: props.cms.promotions }
  return { section }
}
</script>

<template>
  <div>
    <template v-for="(section, idx) in sections" :key="section.id">
      <component :is="sectionComponent(section)" v-bind="sectionProps(section)" />
      <section
        v-if="idx === newArrivalsInsertIndex && newestProducts.length"
        class="bg-paper py-8 dark:bg-night sm:py-10 md:py-20"
      >
        <div class="mx-auto max-w-6xl px-5 md:px-8">
          <div class="mb-5 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.28em] text-gold sm:text-xs sm:tracking-[0.3em]">
                Boutique
              </p>
              <h3 class="font-serif text-xl text-ink dark:text-paper sm:text-2xl md:text-3xl lg:text-4xl">
                Nouveautés
              </h3>
            </div>
            <NuxtLink
              to="/shop?new=1&sort=newest"
              class="inline-flex min-h-[44px] shrink-0 items-center border-b border-ink/25 pb-2 text-xs font-bold uppercase tracking-[0.24em] text-ink transition hover:border-gold hover:text-gold dark:border-white/25 dark:text-paper sm:pb-1"
            >
              Voir tout
            </NuxtLink>
          </div>
          <div
            class="-mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
            role="list"
            aria-label="Nouveautés"
          >
            <article
              v-for="p in newestProducts"
              :key="p.id"
              role="listitem"
              class="group w-[min(72vw,16.25rem)] shrink-0 snap-start rounded-xl border border-ink/10 bg-paper p-2 shadow-[0_6px_22px_rgba(10,10,10,0.07)] dark:border-white/10 dark:bg-night dark:shadow-[0_6px_22px_rgba(0,0,0,0.3)] sm:w-auto sm:min-w-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
            >
              <button type="button" class="w-full text-left" @click="navigateTo(`/shop/${p.id}`)">
                <div class="mb-2 aspect-square overflow-hidden rounded-lg sm:mb-4 sm:rounded-none">
                  <img
                    :src="cmsImg(p.images[0])"
                    :alt="p.name"
                    class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  >
                </div>
                <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-gold sm:text-[10px] sm:tracking-[0.22em]">
                  Nouveau
                </p>
                <h4 class="mt-0.5 line-clamp-2 font-serif text-base leading-snug text-ink dark:text-paper sm:mt-1 sm:text-xl sm:leading-normal sm:line-clamp-none">
                  {{ p.name }}
                </h4>
                <p class="mt-0.5 text-[9px] uppercase tracking-[0.22em] text-muted sm:mt-1 sm:text-[10px] sm:tracking-[0.26em]">
                  {{ p.category }}
                </p>
                <div class="mt-1.5 sm:mt-2">
                  <ProductPriceTag :product="p" compact :site-promotions="props.cms.promotions" />
                </div>
              </button>
            </article>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
