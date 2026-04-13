<script setup lang="ts">
const { data: cms } = await usePublicCms()
const page = computed(() => cms.value?.site.legal.mentions)

useHead(() => ({
  title: page.value?.title ? `${page.value.title} — WAXTU` : 'Mentions légales — WAXTU',
}))
useSeoMeta({
  description: 'Informations légales sur l’éditeur du site WAXTU et l’hébergement.',
})
</script>

<template>
  <article
    class="mx-auto max-w-prose px-5 py-14 pb-[max(3.5rem,env(safe-area-inset-bottom))] text-ink dark:text-paper md:max-w-3xl md:py-24"
  >
    <h1 class="mb-6 font-serif text-3xl text-balance md:mb-8 md:text-4xl">
      {{ page?.title }}
    </h1>
    <div class="space-y-5 text-sm leading-relaxed text-muted md:space-y-6 md:text-base">
      <p v-for="(para, i) in page?.paragraphs" :key="i">
        {{ para }}
      </p>
    </div>
  </article>
</template>
