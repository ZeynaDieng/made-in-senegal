<script setup lang="ts">
const { data: cms } = await usePublicCms()
const ok = computed(() => cms.value?.site.success)

const cart = useCartStore()
const formatPrice = useFormatPrice()

const lastRef = ref('')
const lastTotal = ref<number | null>(null)

onMounted(() => {
  cart.clear()
  if (!import.meta.client) return
  lastRef.value = sessionStorage.getItem('waxtu-last-order-ref') || ''
  const raw = sessionStorage.getItem('waxtu-last-order-total')
  const n = raw != null ? Number(raw) : NaN
  lastTotal.value = Number.isFinite(n) ? n : null
})

useHead({ title: 'Merci — WAXTU' })
</script>

<template>
  <section
    class="flex min-h-[60vh] flex-col items-center justify-center px-5 py-14 pb-[max(4rem,env(safe-area-inset-bottom))] text-center md:py-24"
  >
    <p class="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-gold">{{ ok?.kicker }}</p>
    <h1 class="mb-4 max-w-xl text-balance font-serif text-3xl text-ink dark:text-paper sm:text-4xl md:text-5xl">
      {{ ok?.title }}
    </h1>
    <p class="max-w-lg text-sm text-muted md:text-base">
      {{ ok?.subtitle }}
    </p>
    <div
      v-if="lastRef"
      class="mt-8 max-w-md rounded-wax border border-ink/10 bg-paper px-6 py-4 text-left text-sm text-ink dark:border-white/10 dark:bg-night dark:text-paper"
    >
      <p class="text-xs font-bold uppercase tracking-[0.2em] text-muted">
        {{ ok?.refLabel }}
      </p>
      <p class="mt-1 font-mono text-base font-semibold">
        {{ lastRef }}
      </p>
      <p v-if="lastTotal != null" class="mt-3 text-muted">
        {{ ok?.amountLabel }} : <span class="font-serif text-gold">{{ formatPrice(lastTotal) }}</span>
      </p>
      <p class="mt-3 text-xs text-muted">
        {{ ok?.refHint }}
      </p>
    </div>
    <NuxtLink
      to="/shop"
      class="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-wax bg-gold px-8 py-3 text-xs font-bold uppercase tracking-[0.35em] text-white transition hover:bg-ink"
    >
      {{ ok?.ctaLabel }}
    </NuxtLink>
    <NuxtLink to="/contact" class="mt-4 text-xs text-muted underline hover:text-gold">
      {{ ok?.helpLink }}
    </NuxtLink>
  </section>
</template>
