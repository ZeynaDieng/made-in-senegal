<script setup lang="ts">
import { useCartStore } from '../stores/cart'

const route = useRoute()
const { data: cms } = await usePublicCms()
const cart = useCartStore()

const isHome = computed(() => route.path === '/')

watch(
  cms,
  (c) => {
    if (import.meta.client && c) cart.syncWithCatalog(c)
  },
  { immediate: true },
)
</script>

<template>
  <div class="min-h-screen bg-surface text-foreground">
    <LayoutAppCartDrawer :site-promotions="cms?.promotions ?? null" />
    <div
      v-if="cart.notification"
      class="fixed bottom-20 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-3 bg-ink px-4 py-3 text-white shadow-lift animate-reveal-right md:bottom-auto md:left-auto md:right-8 md:top-24 md:translate-x-0 md:gap-4 md:px-6 md:py-4"
    >
      <span class="h-2 w-2 animate-pulse rounded-pill bg-gold" />
      <span class="text-xs font-bold uppercase tracking-[0.35em]">{{ cart.notification }}</span>
    </div>
    <main :class="isHome ? 'pt-0' : 'pt-16 md:pt-20'">
      <template v-if="isHome">
        <LandingPromoBanner v-if="cms?.promotions?.active" :promo="cms.promotions" />
        <slot />
      </template>
      <slot v-else />
    </main>
    <LayoutAppFooter :cms="cms" />
    <!-- Nav en dernier : barre fixe + overlay menu au-dessus du flux (hit-test / peinture). -->
    <LayoutAppNav :cms="cms" />
  </div>
</template>
