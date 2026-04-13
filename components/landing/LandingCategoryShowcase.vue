<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import type { CmsCategoryShowcaseSection, CmsCategoryShowcaseTile } from '../../types/cms'

const props = defineProps<{
  section: CmsCategoryShowcaseSection
}>()

const cmsImg = useCmsImg()
const multiTiles = computed(() => (props.section.tiles?.length ?? 0) > 1)

function tileHref(tile: CmsCategoryShowcaseTile) {
  const h = tile.href?.trim()
  if (h) return h
  const genre = tile.genre?.trim()
  const query = new URLSearchParams()
  const cat = tile.categoryId?.trim()
  if (cat) query.set('cat', cat)
  if (genre) query.set('genre', genre)
  const suffix = query.toString()
  return suffix ? `/shop?${suffix}` : '/shop'
}
</script>

<template>
  <section class="border-y border-ink/10 bg-cream py-12 text-ink dark:border-white/10 dark:bg-ink dark:text-paper md:py-24">
    <div class="mx-auto max-w-6xl px-5 md:px-8">
      <div class="mb-7 max-w-2xl sm:mb-10 md:mb-14">
        <p v-if="section.eyebrow" class="mb-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-gold sm:mb-2 sm:text-xs sm:tracking-[0.35em]">
          {{ section.eyebrow }}
        </p>
        <h2 class="font-serif text-2xl leading-tight sm:text-3xl md:text-5xl lg:text-6xl">
          {{ section.title }}
        </h2>
        <p v-if="section.subtitle" class="mt-3 text-sm font-light text-muted sm:mt-4 sm:text-base md:text-lg">
          {{ section.subtitle }}
        </p>
      </div>

      <div
        v-if="multiTiles"
        class="-mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 lg:gap-8"
        role="list"
        aria-label="Catégories"
      >
        <NuxtLink
          v-for="(tile, i) in section.tiles"
          :key="`${tile.title}-${i}`"
          role="listitem"
          :to="tileHref(tile)"
          class="group relative aspect-[3/2] w-[min(72vw,16.5rem)] shrink-0 snap-start overflow-hidden rounded-xl bg-ink shadow-[0_8px_28px_rgba(10,10,10,0.14)] sm:aspect-[4/5] sm:w-auto sm:min-w-0 sm:rounded-none sm:shadow-lift lg:aspect-[3/5]"
        >
          <img
            :src="cmsImg(tile.image)"
            :alt="tile.title"
            class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          >
          <div
            class="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent opacity-90 transition group-hover:opacity-95"
          />
          <div class="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3 text-white sm:gap-2 sm:p-6 lg:p-8">
            <span class="text-[9px] font-bold uppercase tracking-[0.3em] text-gold sm:text-[10px] sm:tracking-[0.35em]">Découvrir</span>
            <h3 class="font-serif text-lg leading-tight sm:text-2xl lg:text-3xl">
              {{ tile.title }}
            </h3>
            <p class="line-clamp-2 text-xs font-light text-white/80 sm:text-sm sm:line-clamp-none">
              {{ tile.subtitle }}
            </p>
            <span
              class="mt-1 inline-flex w-fit items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.24em] text-gold transition group-hover:gap-3 sm:mt-2 sm:gap-2 sm:text-[10px] sm:tracking-[0.28em]"
            >
              Voir
              <ArrowUpRight class="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            </span>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-8">
        <NuxtLink
          v-for="(tile, i) in section.tiles"
          :key="`${tile.title}-${i}`"
          :to="tileHref(tile)"
          class="group relative aspect-video overflow-hidden rounded-xl bg-ink shadow-[0_8px_28px_rgba(10,10,10,0.12)] sm:aspect-[4/5] sm:rounded-none sm:shadow-lift lg:aspect-[3/5]"
        >
          <img
            :src="cmsImg(tile.image)"
            :alt="tile.title"
            class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          >
          <div
            class="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent opacity-90 transition group-hover:opacity-95"
          />
          <div class="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3 text-white sm:gap-2 sm:p-6 lg:p-8">
            <span class="text-[9px] font-bold uppercase tracking-[0.3em] text-gold sm:text-[10px] sm:tracking-[0.35em]">Découvrir</span>
            <h3 class="font-serif text-lg leading-tight sm:text-2xl lg:text-3xl">
              {{ tile.title }}
            </h3>
            <p class="line-clamp-2 text-xs font-light text-white/80 sm:text-sm sm:line-clamp-none">
              {{ tile.subtitle }}
            </p>
            <span
              class="mt-1 inline-flex w-fit items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.24em] text-gold transition group-hover:gap-3 sm:mt-2 sm:gap-2 sm:text-[10px] sm:tracking-[0.28em]"
            >
              Voir
              <ArrowUpRight class="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
