<script setup lang="ts">
import type { CmsVideoSpotlightSection } from '../../types/cms'
import { resolveMediaUrl } from '../../utils/cms-media'
import { parseYouTubeEmbedSrc } from '../../utils/youtube-embed'
import { buildChromelessYoutubeIframeSrc } from '../../utils/youtube-chromeless'

const props = defineProps<{
  section: CmsVideoSpotlightSection
}>()

const cmsImg = useCmsImg()
const config = useRuntimeConfig()
const siteBase = computed(() => String(config.public?.siteUrl || '').replace(/\/$/, ''))

const youtubeEmbed = computed(() => parseYouTubeEmbedSrc(String(props.section.youtubeUrl ?? '')))

/** Autoplay navigateur = muet obligatoire ; désactivé si l’utilisateur demande moins de mouvement. */
const motionOk = usePreferredReducedMotion()

const allowAutoplay = computed(() => motionOk.value !== true)

const youtubeIframeSrc = computed(() =>
  buildChromelessYoutubeIframeSrc(String(props.section.youtubeUrl ?? ''), allowAutoplay.value),
)

const resolvedMp4 = computed(() => {
  const u = String(props.section.mp4Url ?? '').trim()
  if (!u) return ''
  return resolveMediaUrl(u, siteBase.value)
})
</script>

<template>
  <section class="bg-paper py-16 text-ink dark:bg-night dark:text-paper md:py-24">
    <div class="mx-auto max-w-6xl px-5 md:px-8">
      <div class="mb-10 max-w-2xl md:mb-14">
        <p v-if="section.eyebrow" class="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-gold">
          {{ section.eyebrow }}
        </p>
        <h2 class="font-serif text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
          {{ section.title }}
        </h2>
        <p v-if="section.subtitle" class="mt-4 text-base font-light text-muted md:text-lg">
          {{ section.subtitle }}
        </p>
      </div>

      <div class="relative mx-auto max-w-5xl">
        <div
          class="absolute -inset-2 -z-10 translate-x-2 translate-y-2 border border-gold/25 md:-inset-3 md:translate-x-3 md:translate-y-3"
          aria-hidden="true"
        />
        <div
          class="relative overflow-hidden rounded-wax bg-ink shadow-lift ring-1 ring-ink/10 dark:ring-white/10"
        >
          <div class="relative aspect-video w-full">
            <iframe
              v-if="youtubeEmbed"
              :key="youtubeIframeSrc"
              :src="youtubeIframeSrc"
              class="absolute inset-0 h-full w-full border-0"
              :title="section.title"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            />
            <video
              v-else-if="resolvedMp4"
              class="absolute inset-0 h-full w-full object-cover"
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
              class="h-full w-full object-cover opacity-95"
            >
          </div>
        </div>
      </div>

      <p
        v-if="section.body"
        class="mx-auto mt-8 max-w-3xl text-center text-sm font-light leading-relaxed text-muted md:text-base"
      >
        {{ section.body }}
      </p>
    </div>
  </section>
</template>
