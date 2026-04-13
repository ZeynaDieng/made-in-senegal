<script setup lang="ts">
import { CreditCard, Loader2 } from 'lucide-vue-next'

const { data: cms } = await usePublicCms()
const cmsImg = useCmsImg()
const cart = useCartStore()
const formatPrice = useFormatPrice()

const busy = ref(false)
const error = ref<string | null>(null)

const email = ref('')
const name = ref('')
const phone = ref('')

const discount = computed(() => {
  if (!cms.value?.promotions.active) return 0
  return Math.round(cart.subtotal * (cms.value.promotions.percentOff / 100))
})

const total = computed(() => Math.max(0, cart.subtotal - discount.value))

const co = computed(() => cms.value?.site.checkout)

const PAYTECH_REDIRECT_KEY = 'waxtu-paytech-redirect-url'

async function payWithPaytech() {
  error.value = null
  if (!cart.lines.length) return
  cart.syncWithCatalog(cms.value)
  if (!cart.lines.length) {
    error.value = 'Votre panier ne contient plus d’articles disponibles.'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    error.value = 'Veuillez saisir une adresse email valide pour la confirmation de commande.'
    return
  }
  busy.value = true
  try {
    const refCommand = `WAXTU-${Date.now()}`
    const commandName = cart.lines.map((l) => `${l.product.name} x${l.qty}`).join(', ')
    const res = await $fetch<{ redirectUrl: string }>('/api/paytech/init', {
      method: 'POST',
      credentials: 'include',
      body: {
        items: cart.lines.map((l) => ({ id: l.id, qty: l.qty })),
        refCommand,
        commandName,
        customer: {
          email: email.value.trim(),
          name: name.value.trim() || undefined,
          phone: phone.value.trim() || undefined,
        },
      },
    })
    if (import.meta.client) {
      sessionStorage.setItem('waxtu-last-order-ref', refCommand)
      sessionStorage.setItem('waxtu-last-order-total', String(total.value))
      sessionStorage.setItem(PAYTECH_REDIRECT_KEY, res.redirectUrl)
      await navigateTo('/checkout/paiement')
    }
  }
  catch (e: unknown) {
    const err = e as {
      data?: { message?: string; statusMessage?: string }
      statusMessage?: string
      message?: string
    }
    error.value =
      err.data?.statusMessage ||
      err.data?.message ||
      err.statusMessage ||
      err.message ||
      'Paiement indisponible'
  }
  finally {
    busy.value = false
  }
}

onMounted(async () => {
  cart.syncWithCatalog(cms.value)
  try {
    const res = await $fetch<{ customer: { email: string } | null }>('/api/customer/me', { credentials: 'include' })
    if (res.customer?.email) email.value = res.customer.email
  }
  catch {
    /* compte optionnel */
  }
})

useHead(() => ({
  title: co.value?.pageTitle ? `${co.value.pageTitle} — WAXTU` : 'Paiement — WAXTU',
}))
</script>

<template>
  <section class="pb-[max(4rem,env(safe-area-inset-bottom))] pt-20 md:pb-24 md:pt-28">
    <div class="mx-auto max-w-4xl px-5 md:px-8">
      <h1 class="mb-6 font-serif text-3xl text-ink dark:text-paper sm:text-4xl md:mb-8 md:text-5xl">
        {{ co?.pageTitle }}
      </h1>
      <div v-if="!cart.lines.length" class="rounded-wax border border-dashed border-ink/15 p-6 text-center text-muted dark:border-white/15 md:p-8">
        {{ co?.emptyCartMessage }}
        <NuxtLink class="mt-4 inline-block text-gold underline" to="/shop">{{ co?.emptyCartLink }}</NuxtLink>
      </div>
      <div v-else class="space-y-8">
        <div class="divide-y divide-ink/5 rounded-wax border border-ink/5 bg-paper dark:divide-white/10 dark:border-white/10 dark:bg-night">
          <div v-for="line in cart.lines" :key="line.id" class="flex items-center gap-4 p-4 md:p-6">
            <img :src="cmsImg(line.product.images[0])" :alt="line.product.name" class="h-20 w-16 object-cover">
            <div class="flex-1">
              <p class="font-serif text-lg text-ink dark:text-paper">{{ line.product.name }}</p>
              <p class="text-xs text-muted">Quantité · {{ line.qty }}</p>
            </div>
            <div class="min-w-0 text-right">
              <ProductPriceTag :product="line.product" compact :site-promotions="cms?.promotions" />
              <template v-if="line.qty > 1">
                <p class="mt-1 text-xs text-muted">
                  × {{ line.qty }}
                </p>
                <p class="mt-1 text-sm font-medium text-gold">
                  {{ formatPrice(line.product.price * line.qty) }}
                </p>
              </template>
            </div>
          </div>
        </div>

        <div class="rounded-wax border border-ink/5 bg-surface p-6 dark:border-white/10">
          <div class="flex items-center justify-between text-sm text-muted">
            <span>{{ co?.summarySubtotal }}</span>
            <span>{{ formatPrice(cart.subtotal) }}</span>
          </div>
          <div
            v-if="cms?.promotions.active"
            class="mt-3 flex items-center justify-between text-sm text-gold"
          >
            <span>Promotion {{ cms.promotions.code }} ({{ cms.promotions.percentOff }}%)</span>
            <span>- {{ formatPrice(discount) }}</span>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-ink/5 pt-4 font-serif text-xl text-ink dark:border-white/10 dark:text-paper">
            <span>{{ co?.summaryTotal }}</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
        </div>

        <fieldset class="space-y-4 rounded-wax border border-ink/5 bg-paper p-5 dark:border-white/10 dark:bg-ink sm:p-6">
          <legend class="px-1 font-serif text-lg text-ink dark:text-paper">
            {{ co?.coordTitle }}
          </legend>
          <p class="text-sm text-muted">
            {{ co?.coordHint }}
          </p>
          <div>
            <label for="checkout-email" class="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-muted">{{ co?.emailLabel }}</label>
            <input
              id="checkout-email"
              v-model="email"
              type="email"
              name="email"
              autocomplete="email"
              required
              class="mt-1 min-h-[48px] w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-gold dark:border-white/10 dark:text-paper"
              :placeholder="co?.emailPlaceholder"
            >
          </div>
          <div>
            <label for="checkout-name" class="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-muted">{{ co?.nameLabel }}</label>
            <input
              id="checkout-name"
              v-model="name"
              type="text"
              name="name"
              autocomplete="name"
              class="mt-1 min-h-[48px] w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-gold dark:border-white/10 dark:text-paper"
            >
          </div>
          <div>
            <label for="checkout-phone" class="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-muted">{{ co?.phoneLabel }}</label>
            <input
              id="checkout-phone"
              v-model="phone"
              type="tel"
              name="phone"
              autocomplete="tel"
              class="mt-1 min-h-[48px] w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-gold dark:border-white/10 dark:text-paper"
              :placeholder="co?.phonePlaceholder"
            >
          </div>
        </fieldset>

        <div class="rounded-wax border border-ink/5 bg-paper p-6 text-sm text-muted shadow-lift dark:border-white/10 dark:bg-night">
          <p class="mb-4 flex items-center gap-2 text-ink dark:text-paper">
            <CreditCard class="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
            {{ co?.payTitle }}
          </p>
          <p class="text-xs leading-relaxed">
            {{ co?.payBody }}
          </p>
        </div>

        <p v-if="error" class="text-sm text-red-500" role="alert">
          {{ error }}
        </p>

        <button
          type="button"
          class="inline-flex min-h-[52px] w-full touch-manipulation items-center justify-center gap-3 bg-ink py-4 text-xs font-bold uppercase tracking-[0.35em] text-white transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60 dark:bg-paper dark:text-ink dark:hover:bg-gold dark:hover:text-white md:py-5"
          :disabled="busy"
          :aria-busy="busy"
          @click="payWithPaytech"
        >
          <Loader2 v-if="busy" class="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>{{ co?.payButton }}</span>
        </button>
      </div>
    </div>
  </section>
</template>
