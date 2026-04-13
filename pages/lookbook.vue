<script setup lang="ts">
const { data: cms } = await usePublicCms()
const lb = computed(() => cms.value?.site.lookbook)

useHead(() => ({
  title: lb.value?.pageTitle ?? 'Lookbook — WAXTU',
}))

/** Classes par cellule pour conserver la grille d’origine (4 visuels). */
const lookbookCellClass = [
  'aspect-[3/4] w-full max-md:max-h-[min(72vh,520px)] overflow-hidden motion-reduce:opacity-100 animate-reveal-up opacity-0 max-md:opacity-100 md:col-span-8 md:aspect-auto md:h-[640px] md:max-h-none lg:h-[760px]',
  'aspect-[3/4] w-full max-md:max-h-[min(72vh,520px)] overflow-hidden motion-reduce:opacity-100 animate-reveal-up opacity-0 max-md:opacity-100 md:col-span-4 md:mt-20 md:aspect-auto md:h-[640px] md:max-h-none lg:h-[760px]',
  'aspect-[3/4] w-full max-md:max-h-[min(65vh,440px)] overflow-hidden motion-reduce:opacity-100 animate-reveal-up opacity-0 max-md:opacity-100 md:col-span-4 md:aspect-auto md:h-[520px] md:max-h-none',
  'aspect-[16/10] w-full max-md:max-h-[min(65vh,440px)] overflow-hidden motion-reduce:opacity-100 animate-reveal-up opacity-0 max-md:opacity-100 md:col-span-8 md:-mt-16 md:aspect-auto md:h-[520px] md:max-h-none',
] as const
</script>

<template>
  <section class="pb-[max(4rem,env(safe-area-inset-bottom))] pt-20 md:pb-24 md:pt-28">
    <div class="mx-auto max-w-6xl px-5 md:px-8">
      <h2
        class="mb-10 text-center font-serif text-3xl text-ink motion-reduce:opacity-100 animate-reveal-up opacity-0 max-md:opacity-100 dark:text-paper sm:text-4xl md:mb-20 md:text-6xl lg:text-7xl"
      >
        {{ lb?.heading }}
      </h2>
      <div class="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-8">
        <div
          v-for="i in 4"
          :key="i"
          :class="lookbookCellClass[i - 1]"
          :style="i === 2 || i === 4 ? { animationDelay: '160ms' } : undefined"
        >
          <img
            v-if="lb?.images?.[i - 1]?.src"
            :src="lb?.images?.[i - 1]?.src"
            :alt="lb?.images?.[i - 1]?.alt ?? ''"
            class="h-full w-full object-cover"
          >
        </div>
      </div>
    </div>
  </section>
</template>
