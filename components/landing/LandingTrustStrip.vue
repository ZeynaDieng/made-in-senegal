<script setup lang="ts">
import { CreditCard, Headphones, Package, ShieldCheck, Truck } from 'lucide-vue-next'
import type { CmsTrustStripSection, TrustStripIcon } from '../../types/cms'

defineProps<{
  section: CmsTrustStripSection
}>()

const iconMap: Record<TrustStripIcon, typeof Truck> = {
  truck: Truck,
  shield: ShieldCheck,
  credit: CreditCard,
  support: Headphones,
  package: Package,
}

function iconFor(key: TrustStripIcon) {
  return iconMap[key] ?? Truck
}

/** Carte engagement (marquee tous écrans). */
const cardClass =
  'flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-ink/10 bg-surface/90 px-3 py-2.5 text-center shadow-sm dark:border-white/10 dark:bg-ink/70 md:gap-2 md:rounded-wax md:px-5 md:py-4 md:shadow-none'
</script>

<template>
  <section
    class="border-y border-ink/10 bg-paper py-7 text-ink dark:border-white/10 dark:bg-night dark:text-paper md:py-12"
    aria-label="Nos engagements"
  >
    <div v-if="section.eyebrow || section.title" class="mx-auto max-w-6xl px-4 pb-4 text-center sm:px-5 md:px-8 md:pb-6">
      <p v-if="section.eyebrow" class="text-[10px] font-bold uppercase tracking-[0.28em] text-gold sm:text-xs sm:tracking-[0.35em]">
        {{ section.eyebrow }}
      </p>
      <h2 v-if="section.title" class="mt-1.5 font-serif text-xl sm:mt-2 sm:text-2xl md:text-3xl">
        {{ section.title }}
      </h2>
    </div>

    <!-- Grille statique uniquement si « réduire les animations » (accessibilité) -->
    <div
      v-if="section.items?.length"
      class="mx-auto hidden max-w-6xl grid-cols-1 gap-3 px-4 motion-reduce:grid sm:gap-4 sm:px-5 md:grid-cols-2 md:gap-6 md:px-8 lg:grid-cols-3 lg:gap-8"
    >
      <div
        v-for="(item, i) in section.items"
        :key="`static-${i}`"
        class="flex flex-col items-center gap-2 rounded-xl border border-ink/10 bg-surface/80 px-3 py-3 text-center dark:border-white/10 dark:bg-ink/60 sm:gap-3 sm:px-4 sm:py-4 md:rounded-wax md:px-5 md:py-5"
      >
        <component :is="iconFor(item.icon)" class="h-6 w-6 text-gold sm:h-7 sm:w-7 md:h-8 md:w-8" :stroke-width="1.25" aria-hidden="true" />
        <p class="text-[10px] font-bold uppercase leading-snug tracking-[0.22em] sm:text-xs sm:tracking-[0.28em]">
          {{ item.title }}
        </p>
        <p class="line-clamp-3 text-[11px] leading-snug text-muted sm:text-sm sm:leading-normal md:line-clamp-none">
          {{ item.body }}
        </p>
      </div>
    </div>

    <!-- Défilement horizontal en boucle (tous écrans ; masqué si réduire les animations) -->
    <div v-if="section.items?.length" class="motion-reduce:hidden overflow-hidden">
      <div class="flex w-max animate-trust-marquee motion-reduce:animate-none">
        <ul class="flex shrink-0 items-stretch gap-4 px-4 sm:gap-5 sm:px-5 md:gap-10 md:px-8 lg:gap-14 lg:px-10" role="list">
          <li
            v-for="(item, i) in section.items"
            :key="`a-${i}`"
            :class="[cardClass, 'w-[min(76vw,14.75rem)] md:w-64 lg:w-72']"
          >
            <component :is="iconFor(item.icon)" class="h-5 w-5 shrink-0 text-gold sm:h-6 sm:w-6 md:h-7 md:w-7" :stroke-width="1.25" aria-hidden="true" />
            <p class="text-[9px] font-bold uppercase leading-tight tracking-[0.22em] sm:text-[10px] sm:tracking-[0.26em] md:text-[11px] md:tracking-[0.28em]">
              {{ item.title }}
            </p>
            <p class="line-clamp-3 text-[10px] leading-snug text-muted sm:text-[11px] md:line-clamp-none md:text-xs md:leading-relaxed">
              {{ item.body }}
            </p>
          </li>
        </ul>
        <ul class="flex shrink-0 items-stretch gap-4 px-4 sm:gap-5 sm:px-5 md:gap-10 md:px-8 lg:gap-14 lg:px-10" aria-hidden="true">
          <li
            v-for="(item, i) in section.items"
            :key="`b-${i}`"
            :class="[cardClass, 'w-[min(76vw,14.75rem)] md:w-64 lg:w-72']"
          >
            <component :is="iconFor(item.icon)" class="h-5 w-5 shrink-0 text-gold sm:h-6 sm:w-6 md:h-7 md:w-7" :stroke-width="1.25" aria-hidden="true" />
            <p class="text-[9px] font-bold uppercase leading-tight tracking-[0.22em] sm:text-[10px] sm:tracking-[0.26em] md:text-[11px] md:tracking-[0.28em]">
              {{ item.title }}
            </p>
            <p class="line-clamp-3 text-[10px] leading-snug text-muted sm:text-[11px] md:line-clamp-none md:text-xs md:leading-relaxed">
              {{ item.body }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
