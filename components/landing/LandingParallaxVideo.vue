<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import type { CmsParallaxVideoSection, ParallaxVideoHeight } from '../../types/cms'
import { resolveMediaUrl } from '../../utils/cms-media'
import { parseYouTubeEmbedSrc } from '../../utils/youtube-embed'
import { buildChromelessYoutubeIframeSrc } from '../../utils/youtube-chromeless'

const props = defineProps<{
  section: CmsParallaxVideoSection
}>()

const cmsImg = useCmsImg()
const config = useRuntimeConfig()
const siteBase = computed(() => String(config.public?.siteUrl || '').replace(/\/$/, ''))

const sectionRef = ref<HTMLElement | null>(null)
const { layerStyle: parallaxStyle } = useHeroParallax(sectionRef, { strength: 0.48, maxShift: 200 })

const motionOk = usePreferredReducedMotion()
const allowAutoplay = computed(() => motionOk.value !== true)

const youtubeEmbed = computed(() => parseYouTubeEmbedSrc(String(props.section.youtubeUrl ?? '')))
const youtubeIframeSrc = computed(() =>
  buildChromelessYoutubeIframeSrc(String(props.section.youtubeUrl ?? ''), allowAutoplay.value),
)

const resolvedMp4 = computed(() => {
  const u = String(props.section.mp4Url ?? '').trim()
  if (!u) return ''
  return resolveMediaUrl(u, siteBase.value)
})

const heightClass: Record<ParallaxVideoHeight, string> = {
  short: 'min-h-[50vh] md:min-h-[56vh]',
  medium: 'min-h-[58vh] md:min-h-[70vh]',
  tall: 'min-h-[68vh] md:min-h-[85vh]',
}

const minH = computed(() => heightClass[props.section.minHeight ?? 'tall'] ?? heightClass.tall)

const overlayAlpha = computed(() => {
  const raw = Number(props.section.overlayOpacity)
  const n = Number.isFinite(raw) ? raw : 42
  return Math.min(0.88, Math.max(0.15, n / 100))
})

const ctaHref = computed(() => {
  const raw = String(props.section.cta?.href ?? '').trim()
  if (!raw) return '/shop'
  if (!raw.startsWith('/shop')) return raw
  if (/[?&]genre=/.test(raw)) return raw

  const needle = `${props.section.id} ${props.section.title} ${props.section.eyebrow} ${props.section.subtitle}`
    .toLowerCase()
  const genre
    = needle.includes('homme') ? 'homme'
      : needle.includes('femme') ? 'femme'
        : ''
  if (!genre) return raw
  return raw.includes('?') ? `${raw}&genre=${genre}` : `${raw}?genre=${genre}`
})
</script>

<template>
  <section
    ref="sectionRef"
    class="relative overflow-hidden bg-ink text-white"
    :class="minH"
  >
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        class="absolute -top-[14%] left-0 h-[128%] w-full will-change-transform motion-reduce:!transform-none"
        :style="parallaxStyle"
      >
        <iframe
          v-if="youtubeEmbed"
          :key="youtubeIframeSrc"
          :src="youtubeIframeSrc"
          class="absolute inset-0 h-full w-full border-0 object-cover"
          :title="section.title"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        />
        <video
          v-else-if="resolvedMp4"
          class="absolute inset-0 h-full min-h-full w-full object-cover"
          :autoplay="allowAutoplay"
          :muted="allowAutoplay"
          :controls="!allowAutoplay"
          loop
          playsinline
          preload="metadata"
          :poster="cmsImg(section.poster)"
          :aria-label="section.title"
        >
          <source :src="resolvedMp4" type="video/mp4">
        </video>
        <img
          v-else
          :src="cmsImg(section.poster)"
          alt=""
          class="h-full min-h-full w-full object-cover"
        >
      </div>
    </div>

    <div
      class="pointer-events-none absolute inset-0 bg-ink"
      :style="{ opacity: overlayAlpha }"
      aria-hidden="true"
    />

    <div
      class="relative z-10 flex w-full flex-col items-center justify-center px-5 py-16 text-center md:px-10 md:py-20"
      :class="minH"
    >
      <p
        v-if="section.eyebrow"
        class="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-gold"
      >
        {{ section.eyebrow }}
      </p>
      <p
        v-if="section.subtitle"
        class="mb-4 max-w-xl text-sm font-light uppercase tracking-[0.25em] text-white/85 md:text-base"
      >
        {{ section.subtitle }}
      </p>
      <h2
        class="max-w-4xl text-balance font-serif text-3xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
      >
        {{ section.title }}
      </h2>
      <NuxtLink
        :to="ctaHref"
        class="pointer-events-auto mt-8 inline-flex min-h-[48px] items-center justify-center gap-3 border border-white/90 bg-transparent px-6 py-3 text-xs font-bold uppercase tracking-[0.35em] text-white transition hover:border-gold hover:bg-gold/20 hover:text-white max-md:px-8 md:mt-12 md:px-10 md:py-4"
      >
        {{ section.cta.label }}
        <ArrowRight class="h-4 w-4 shrink-0" aria-hidden="true" />
      </NuxtLink>
    </div>
  </section>
</template>
