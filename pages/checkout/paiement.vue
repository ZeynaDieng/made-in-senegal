<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'

const { data: cms } = await usePublicCms()
const rd = computed(() => cms.value?.site.redirect)

const PAYTECH_REDIRECT_KEY = 'waxtu-paytech-redirect-url'

const router = useRouter()
const paytechUrl = ref<string | null>(null)
const stuck = ref(false)

onMounted(() => {
  if (!import.meta.client) return
  const url = sessionStorage.getItem(PAYTECH_REDIRECT_KEY)
  if (!url?.trim()) {
    router.replace({ path: '/checkout', query: { paye: '0' } })
    return
  }
  sessionStorage.removeItem(PAYTECH_REDIRECT_KEY)
  paytechUrl.value = url.trim()
  window.location.replace(paytechUrl.value)
  window.setTimeout(() => {
    stuck.value = true
  }, 4000)
})

useHead(() => ({
  title: rd.value?.pageTitle ? `${rd.value.pageTitle} — WAXTU` : 'Paiement — WAXTU',
}))
</script>

<template>
  <section
    class="flex min-h-[60vh] flex-col items-center justify-center px-5 pb-[max(4rem,env(safe-area-inset-bottom))] pt-20 md:pt-28"
  >
    <Loader2 class="h-10 w-10 animate-spin text-gold" aria-hidden="true" />
    <h1 class="mt-8 text-balance text-center font-serif text-2xl text-ink dark:text-paper md:text-3xl">
      {{ rd?.mainTitle }}
    </h1>
    <p class="mt-3 max-w-md text-center text-sm text-muted">
      {{ rd?.subtitle }}
    </p>
    <div v-if="stuck && paytechUrl" class="mt-8 text-center">
      <p class="text-sm text-muted">
        {{ rd?.manualHint }}
      </p>
      <a
        :href="paytechUrl"
        class="mt-4 inline-flex min-h-[44px] items-center justify-center text-sm font-bold uppercase tracking-[0.2em] text-gold underline"
      >
        {{ rd?.manualLink }}
      </a>
    </div>
    <NuxtLink to="/checkout" class="mt-10 text-xs text-muted underline">
      {{ rd?.backLink }}
    </NuxtLink>
  </section>
</template>
