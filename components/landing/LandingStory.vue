<script setup lang="ts">
import type { CmsStorySection } from '../../types/cms'

const props = defineProps<{
  section: CmsStorySection
}>()

const cmsImg = useCmsImg()
const isStack = computed(() => props.section.layout === 'stack')
const imageFirst = computed(() => props.section.layout === 'imageLeft')
</script>

<template>
  <section class="bg-cream py-16 text-ink dark:bg-night dark:text-paper md:py-24">
    <div class="mx-auto max-w-6xl px-5 md:px-8">
      <div
        class="grid grid-cols-1 items-center gap-12 lg:gap-20"
        :class="isStack ? '' : 'lg:grid-cols-2'"
      >
        <div
          v-if="!isStack"
          class="relative order-2 lg:order-none"
          :class="imageFirst ? 'lg:order-1' : 'lg:order-2'"
        >
          <div class="absolute -inset-3 -z-10 translate-x-3 translate-y-3 border border-gold/25 md:-inset-4 md:translate-x-4 md:translate-y-4" />
          <img
            :src="cmsImg(section.image)"
            alt=""
            class="aspect-[4/5] max-h-[min(70vh,520px)] w-full object-cover shadow-lift md:aspect-auto md:h-[560px] md:max-h-none lg:h-[600px]"
          >
        </div>
        <div
          class="order-1 space-y-6 md:space-y-8"
          :class="!isStack && imageFirst ? 'lg:order-2' : 'lg:order-1'"
        >
          <span class="text-sm font-bold uppercase italic tracking-[0.28em] text-gold">
            {{ section.eyebrow }}
          </span>
          <h3 class="font-serif text-3xl leading-tight text-ink dark:text-paper sm:text-4xl md:text-5xl lg:text-6xl">
            {{ section.title }}
          </h3>
          <p class="text-base font-light leading-relaxed text-muted md:text-lg">
            {{ section.body }}
          </p>
          <div v-if="isStack" class="pt-4">
            <img
              :src="cmsImg(section.image)"
              alt=""
              class="aspect-[16/10] max-h-[min(55vh,360px)] w-full object-cover shadow-lift md:aspect-auto md:h-96 md:max-h-none"
            >
          </div>
          <div v-if="section.link" class="pt-4">
            <NuxtLink
              class="group inline-flex min-h-[44px] items-center gap-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-ink dark:text-paper"
              :to="section.link.href"
            >
              {{ section.link.label }}
              <span class="h-px w-12 bg-ink transition-all duration-700 group-hover:w-20 dark:bg-paper" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
