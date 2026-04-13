<script setup lang="ts">
import { PlayCircle } from 'lucide-vue-next'

const { data: cms } = await usePublicCms()
const hg = computed(() => cms.value?.site.heritage)

useHead(() => ({
  title: hg.value?.pageTitle ?? 'Héritage — WAXTU',
}))
</script>

<template>
  <section class="pb-[max(4rem,env(safe-area-inset-bottom))] pt-20 md:pb-24 md:pt-28">
    <div class="mx-auto max-w-4xl px-5 text-center md:px-8">
      <span class="mb-4 block text-xs font-bold uppercase tracking-[0.35em] text-gold">{{ hg?.eyebrow }}</span>
      <h2 class="mb-8 font-serif text-3xl leading-tight text-ink dark:text-paper sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl">
        {{ hg?.manifestTitle }}
      </h2>
      <p class="mb-10 text-base font-light italic leading-relaxed text-muted md:mb-12 md:text-lg lg:text-2xl">
        {{ hg?.manifestBody }}
      </p>
    </div>

    <div class="group relative mb-12 min-h-[44vh] w-full cursor-pointer overflow-hidden bg-ink max-md:max-h-[min(70vh,560px)] md:mb-24 md:h-[70vh] md:max-h-none">
      <img
        v-if="hg?.filmPoster"
        :src="hg.filmPoster"
        :alt="hg.filmPosterAlt"
        class="h-full w-full object-cover opacity-40 transition duration-[2000ms] group-hover:scale-105"
      >
      <div class="absolute inset-0 flex flex-col items-center justify-center text-white">
        <PlayCircle class="mb-6 h-20 w-20 text-gold md:h-24 md:w-24" :stroke-width="0.5" />
        <span class="text-xs font-bold uppercase tracking-[0.35em]">{{ hg?.filmLabel }}</span>
      </div>
    </div>

    <div class="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 md:grid-cols-2 md:gap-16 md:px-8 lg:gap-24">
      <div>
        <h4 class="mb-6 font-serif text-2xl text-ink dark:text-paper sm:text-3xl md:text-5xl">
          {{ hg?.block1Title }}
        </h4>
        <p class="mb-6 text-sm leading-relaxed text-muted md:text-base">
          {{ hg?.block1Body }}
        </p>
        <img
          v-if="hg?.block1Image"
          :src="hg.block1Image"
          :alt="hg.block1ImageAlt"
          class="aspect-[4/3] max-h-[min(50vh,320px)] w-full object-cover md:aspect-auto md:h-80 md:max-h-none"
        >
      </div>
      <div class="md:mt-16">
        <img
          v-if="hg?.block2Image"
          :src="hg.block2Image"
          :alt="hg.block2ImageAlt"
          class="mb-6 aspect-[3/4] max-h-[min(55vh,380px)] w-full object-cover md:aspect-auto md:h-[480px] md:max-h-none"
        >
        <h4 class="mb-3 font-serif text-2xl italic text-ink dark:text-paper">
          {{ hg?.block2Title }}
        </h4>
        <p class="text-sm leading-relaxed text-muted md:text-base">
          {{ hg?.block2Body }}
        </p>
      </div>
    </div>
  </section>
</template>
