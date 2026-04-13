<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Nom affiché / accessibilité (ex. depuis le CMS). */
    brand?: string
    /** Affichage sur fond sombre (hors footer). */
    inverted?: boolean
    /**
     * `footer` : classes fixes alignées sur `AppFooter` (ink / surface) — pas de `useColorMode`,
     * donc pas de mismatch d’hydratation SSR ↔ client.
     */
    variant?: 'default' | 'footer'
    /** Texte « WAXTU » + tagline à droite du pictogramme. */
    showWordmark?: boolean
  }>(),
  { brand: 'WAXTU', variant: 'default', showWordmark: true },
)
</script>

<template>
  <div class="flex items-center gap-3">
    <img
      src="/favicon.png"
      :alt="showWordmark ? '' : brand"
      class="h-8 w-auto max-h-9 shrink-0 object-contain object-left md:h-9 md:max-h-10"
      width="36"
      height="36"
      decoding="async"
    >
    <div v-if="showWordmark" class="min-w-0 leading-tight">
      <p
        class="font-serif text-lg tracking-[0.35em] md:text-xl"
        :class="variant === 'footer' ? 'text-paper dark:text-foreground' : inverted ? 'text-paper' : 'text-ink dark:text-paper'"
      >
        {{ brand }}
      </p>
      <p
        class="text-[10px] uppercase tracking-[0.28em]"
        :class="variant === 'footer' ? 'text-white/60 dark:text-muted' : inverted ? 'text-white/60' : 'text-muted'"
      >
        Maison · Dakar
      </p>
    </div>
  </div>
</template>
