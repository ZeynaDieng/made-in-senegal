<script setup lang="ts">
import { useCartStore } from '../stores/cart'

const { data: cms, pending } = await usePublicCms()
const cart = useCartStore()

const pageTitle = computed(() =>
  cms.value ? `${cms.value.global.brand} — ${cms.value.global.tagline}` : 'WAXTU',
)

const pageDesc = computed(() =>
  cms.value?.global.tagline || 'Luxe sénégalais : montres, maroquinerie et accessoires WAXTU.',
)

useSeoMeta({
  title: pageTitle,
  description: pageDesc,
  ogTitle: pageTitle,
  ogDescription: pageDesc,
})

const ok = computed(() => cms.value?.site.success)
const formatPrice = useFormatPrice()

const thankYou = ref<{ ref: string; total: number | null } | null>(null)

onMounted(() => {
  if (!import.meta.client) return
  const r = sessionStorage.getItem('waxtu-last-order-ref')
  const raw = sessionStorage.getItem('waxtu-last-order-total')
  if (!r?.trim()) return
  const n = raw != null ? Number(raw) : NaN
  thankYou.value = { ref: r.trim(), total: Number.isFinite(n) ? n : null }
  sessionStorage.removeItem('waxtu-last-order-ref')
  sessionStorage.removeItem('waxtu-last-order-total')
  cart.clear()
})
</script>

<template>
  <div v-if="pending" class="flex min-h-[50vh] items-center justify-center text-sm text-muted">
    Chargement de l’expérience WAXTU…
  </div>
  <template v-else-if="cms">
    <div
      v-if="thankYou"
      class="border-b border-gold/30 bg-gold/10 px-5 py-4 text-center dark:bg-gold/15"
      role="status"
    >
      <p class="text-xs font-bold uppercase tracking-[0.28em] text-gold">
        {{ ok?.kicker }}
      </p>
      <p class="mt-1 font-serif text-lg text-ink dark:text-paper">
        {{ ok?.title }}
      </p>
      <p class="mt-1 text-sm text-muted">
        {{ ok?.subtitle }}
      </p>
      <p class="mt-3 font-mono text-sm font-semibold text-ink dark:text-paper">
        {{ ok?.refLabel }} : {{ thankYou.ref }}
      </p>
      <p v-if="thankYou.total != null" class="mt-1 text-sm text-muted">
        {{ ok?.amountLabel }} : <span class="font-serif text-gold">{{ formatPrice(thankYou.total) }}</span>
      </p>
    </div>
    <LandingSectionRenderer :cms="cms" />
  </template>
  <div
    v-else
    class="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted"
  >
    <p>Le contenu de la page d’accueil n’a pas pu être chargé.</p>
    <p class="text-xs">Vérifiez la console réseau (requête <code class="rounded bg-ink/5 px-1 py-0.5 text-ink dark:bg-white/10">/api/cms/public</code>) puis rechargez.</p>
  </div>
</template>
