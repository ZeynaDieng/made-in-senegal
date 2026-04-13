<script setup lang="ts">
import type { CmsPromotions } from '../../types/cms'

defineProps<{
  promo: CmsPromotions
}>()
</script>

<template>
  <div
    v-if="promo.active"
    class="border-b border-gold/30 bg-gradient-to-r from-gold/15 via-gold/5 to-gold/15 px-4 pb-3 pt-[max(4.25rem,env(safe-area-inset-top))] text-center text-xs font-semibold uppercase tracking-[0.28em] text-ink dark:border-gold/25 dark:from-gold/10 dark:via-gold/5 dark:to-gold/10 dark:text-paper md:pb-3 md:pt-20 md:text-sm"
  >
    <span class="text-balance">{{ promo.title }}</span>
    <span v-if="promo.subtitle" class="mt-1 block text-[10px] font-normal normal-case tracking-normal text-muted dark:text-subtle">
      {{ promo.subtitle }}
      <span class="font-bold text-gold">{{ promo.code }}</span>
      <span v-if="promo.percentOff"> · -{{ promo.percentOff }}%</span>
    </span>
  </div>
</template>
