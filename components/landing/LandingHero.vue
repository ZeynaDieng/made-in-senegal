<script setup lang="ts">
import { ArrowRight, Search } from 'lucide-vue-next'
import type { CmsHeroSection } from '../../types/cms'

defineProps<{
  section: CmsHeroSection
}>()

const cmsImg = useCmsImg()
const sectionRef = ref<HTMLElement | null>(null)
const { layerStyle: heroParallaxStyle } = useHeroParallax(sectionRef, { strength: 0.42, maxShift: 180 })
const homeSearch = ref('')

function goSearch() {
  const q = homeSearch.value.trim()
  if (!q) {
    navigateTo('/shop')
    return
  }
  navigateTo(`/shop?q=${encodeURIComponent(q)}`)
}
</script>

<template>
  <section ref="sectionRef" class="relative min-h-[82dvh] overflow-hidden bg-ink md:min-h-[90vh]">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="absolute -top-[12%] left-0 right-0 h-[124%] will-change-transform motion-reduce:!transform-none"
        :style="heroParallaxStyle"
      >
        <div class="h-full w-full motion-reduce:animate-none animate-slow-pan">
          <img
            :src="cmsImg(section.image)"
            alt=""
            class="h-full min-h-full w-full object-cover opacity-50"
          >
        </div>
      </div>
    </div>
    <div
      class="relative z-10 flex min-h-[82dvh] flex-col items-center justify-center px-5 pb-[max(7rem,env(safe-area-inset-bottom))] pt-[max(5rem,env(safe-area-inset-top))] text-center md:min-h-[90vh] md:pb-32 md:pt-16"
    >
      <div class="w-full max-w-4xl">
        <p
          class="mb-6 text-balance text-xs font-bold uppercase tracking-[0.45em] text-gold motion-reduce:opacity-100 animate-reveal-up opacity-0 md:mb-8 md:text-sm"
        >
          {{ section.kicker }}
        </p>
        <h2
          class="mb-6 text-balance font-serif text-3xl leading-tight text-white motion-reduce:opacity-100 animate-reveal-up opacity-0 sm:text-4xl md:mb-8 md:text-6xl lg:text-7xl xl:text-8xl"
          style="animation-delay: 160ms"
        >
          {{ section.title }}
        </h2>
        <p
          v-if="section.subtitle"
          class="mx-auto mb-10 max-w-2xl text-balance text-sm font-light leading-relaxed text-white/80 motion-reduce:opacity-100 animate-reveal-up opacity-0 md:mb-12 md:text-base"
          style="animation-delay: 240ms"
        >
          {{ section.subtitle }}
        </p>
        <form
          class="group relative mx-auto mb-8 flex w-full max-w-2xl flex-col gap-2 border border-white/30 bg-ink/30 px-3 py-2 backdrop-blur-sm transition duration-300 focus-within:border-gold focus-within:shadow-[0_0_0_1px_rgba(197,160,89,0.45)] sm:flex-row sm:items-stretch sm:gap-0 md:mb-10"
          style="animation-delay: 280ms"
          @submit.prevent="goSearch"
        >
          <div class="flex min-h-[44px] flex-1 items-center px-1 sm:px-0">
            <Search class="h-4 w-4 shrink-0 text-white/70 transition duration-300 group-focus-within:scale-110 group-focus-within:text-gold" />
            <input
              v-model="homeSearch"
              type="search"
              placeholder="Rechercher une piece, une categorie..."
              class="ml-2 min-h-[44px] w-full flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/55 transition placeholder:tracking-[0.02em] focus:placeholder:tracking-[0.08em]"
            >
          </div>
          <button
            type="submit"
            class="flex min-h-[44px] w-full shrink-0 items-center justify-center border border-white/30 px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-white transition hover:border-gold hover:bg-white/10 hover:text-gold sm:w-auto sm:border-0 sm:border-b sm:border-white/40 sm:px-2"
          >
            Rechercher
          </button>
          <span
            class="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-gold transition duration-300 group-focus-within:scale-x-100"
          />
        </form>
        <div
          class="flex flex-col items-center justify-center gap-4 motion-reduce:opacity-100 animate-reveal-up opacity-0 sm:flex-row sm:gap-6 md:gap-8"
          style="animation-delay: 320ms"
        >
          <NuxtLink
            class="group flex min-h-[48px] w-full max-w-md items-center justify-center gap-3 bg-gold px-8 py-4 text-xs font-bold uppercase tracking-[0.35em] text-white transition duration-500 hover:bg-paper hover:text-ink sm:w-auto sm:max-w-none md:px-12 md:py-5"
            :to="section.primaryCta.href"
          >
            {{ section.primaryCta.label }}
            <ArrowRight class="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
          </NuxtLink>
          <NuxtLink
            v-if="section.secondaryCta"
            class="inline-flex min-h-[44px] w-full max-w-md items-center justify-center border-b border-white/20 px-2 py-2 text-center text-xs font-bold uppercase tracking-[0.35em] text-white transition hover:border-white sm:w-auto sm:max-w-none"
            :to="section.secondaryCta.href"
          >
            {{ section.secondaryCta.label }}
          </NuxtLink>
        </div>
      </div>
    </div>
    <!-- <div
      class="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-white/40 md:bottom-12"
    >
      <span class="text-[10px] uppercase tracking-[0.35em]">Scroll</span>
      <div class="h-12 w-px bg-white/60" />
    </div> -->
  </section>
</template>
