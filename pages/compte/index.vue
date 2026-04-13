<script setup lang="ts">
import { ArrowLeft, Loader2 } from 'lucide-vue-next'

const { data: cms } = await usePublicCms()

type MeCustomer = {
  id: string
  email: string
  favoriteProductIds: number[]
  loyaltyPoints: number
}

const me = ref<MeCustomer | null | undefined>(undefined)
const busy = ref(false)
const tab = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const password2 = ref('')
const error = ref<string | null>(null)

const ac = computed(() => cms.value?.site.account)

const backShopHref = computed(() => {
  const raw = (ac.value?.backToShopHref ?? '/shop').trim()
  return raw.startsWith('/') ? raw : '/shop'
})

async function refreshMe() {
  try {
    const res = await $fetch<{ customer: MeCustomer | null }>('/api/customer/me', { credentials: 'include' })
    me.value = res.customer ?? null
  }
  catch {
    me.value = null
  }
}

onMounted(refreshMe)

useHead(() => ({
  title: ac.value?.pageTitle ?? 'Mon compte — WAXTU',
}))

async function submitLogin() {
  error.value = null
  busy.value = true
  try {
    await $fetch('/api/auth/customer-login', {
      method: 'POST',
      credentials: 'include',
      body: { email: email.value, password: password.value },
    })
    await refreshMe()
    email.value = ''
    password.value = ''
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err?.data?.statusMessage || 'Connexion impossible'
  }
  finally {
    busy.value = false
  }
}

async function submitRegister() {
  error.value = null
  if (password.value !== password2.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }
  busy.value = true
  try {
    await $fetch('/api/auth/customer-register', {
      method: 'POST',
      credentials: 'include',
      body: { email: email.value, password: password.value },
    })
    await refreshMe()
    email.value = ''
    password.value = ''
    password2.value = ''
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    error.value = err?.data?.statusMessage || 'Inscription impossible'
  }
  finally {
    busy.value = false
  }
}

async function logout() {
  await $fetch('/api/auth/customer-logout', { method: 'POST', credentials: 'include' })
  me.value = null
}

function productName(id: number) {
  return cms.value?.products.find((p) => p.id === id)?.name ?? `Produit #${id}`
}
</script>

<template>
  <section class="mx-auto max-w-lg px-5 pb-[max(4rem,env(safe-area-inset-bottom))] pt-24 md:pt-32">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <NuxtLink
        :to="backShopHref"
        class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-muted transition hover:text-gold"
      >
        <ArrowLeft class="h-4 w-4 shrink-0" :stroke-width="1.5" aria-hidden="true" />
        {{ ac?.backToShopLabel ?? 'Retour à la boutique' }}
      </NuxtLink>
    </div>

    <h1 class="mb-8 font-serif text-3xl text-ink dark:text-paper">
      {{ ac?.pageHeading ?? 'Mon compte' }}
    </h1>

    <div v-if="me === undefined" class="flex justify-center py-12 text-muted">
      <Loader2 class="h-8 w-8 animate-spin" aria-hidden="true" />
    </div>

    <div v-else-if="me" class="space-y-8 rounded-wax border border-ink/10 bg-paper p-6 dark:border-white/10 dark:bg-night">
      <p class="text-sm text-muted">
        {{ ac?.connectedPrefix ?? 'Connecté en tant que' }}
        <span class="font-medium text-ink dark:text-paper">{{ me.email }}</span>
      </p>
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.28em] text-gold">
          {{ ac?.loyaltyKicker ?? 'Fidélité' }}
        </p>
        <p class="mt-1 font-serif text-2xl text-ink dark:text-paper">
          {{ me.loyaltyPoints }} pts
        </p>
        <p class="mt-1 text-xs text-muted">
          {{ ac?.loyaltyHint ?? '' }}
        </p>
      </div>
      <div v-if="me.favoriteProductIds.length">
        <p class="text-[10px] font-bold uppercase tracking-[0.28em] text-gold">
          {{ ac?.favoritesKicker ?? 'Favoris' }}
        </p>
        <ul class="mt-3 space-y-2">
          <li v-for="pid in me.favoriteProductIds" :key="pid">
            <NuxtLink :to="`/shop/${pid}`" class="text-sm text-gold underline">
              {{ productName(pid) }}
            </NuxtLink>
          </li>
        </ul>
      </div>
      <button
        type="button"
        class="w-full border border-ink/15 py-3 text-xs font-bold uppercase tracking-[0.24em] text-ink transition hover:border-gold dark:border-white/15 dark:text-paper"
        @click="logout"
      >
        {{ ac?.logoutLabel ?? 'Déconnexion' }}
      </button>
    </div>

    <div v-else class="space-y-6">
      <div class="flex gap-2 border-b border-ink/10 dark:border-white/10">
        <button
          type="button"
          class="px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]"
          :class="tab === 'login' ? 'border-b-2 border-gold text-ink dark:text-paper' : 'text-muted'"
          @click="tab = 'login'"
        >
          {{ ac?.loginTab ?? 'Connexion' }}
        </button>
        <button
          type="button"
          class="px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]"
          :class="tab === 'register' ? 'border-b-2 border-gold text-ink dark:text-paper' : 'text-muted'"
          @click="tab = 'register'"
        >
          {{ ac?.registerTab ?? 'Inscription' }}
        </button>
      </div>
      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">
        {{ error }}
      </p>
      <form v-if="tab === 'login'" class="space-y-4" @submit.prevent="submitLogin">
        <label class="block space-y-1 text-xs text-muted">
          {{ ac?.formEmailLabel ?? 'Email' }}
          <input v-model="email" type="email" required autocomplete="email" class="min-h-[48px] w-full border border-ink/15 bg-transparent px-3 dark:border-white/15 dark:text-paper">
        </label>
        <label class="block space-y-1 text-xs text-muted">
          {{ ac?.formPasswordLabel ?? 'Mot de passe' }}
          <input v-model="password" type="password" required autocomplete="current-password" class="min-h-[48px] w-full border border-ink/15 bg-transparent px-3 dark:border-white/15 dark:text-paper">
        </label>
        <button
          type="submit"
          :disabled="busy"
          class="flex w-full min-h-[48px] items-center justify-center gap-2 bg-ink py-3 text-xs font-bold uppercase tracking-[0.24em] text-white dark:bg-paper dark:text-ink"
        >
          <Loader2 v-if="busy" class="h-4 w-4 animate-spin" />
          {{ ac?.loginSubmit ?? 'Se connecter' }}
        </button>
      </form>
      <form v-else class="space-y-4" @submit.prevent="submitRegister">
        <label class="block space-y-1 text-xs text-muted">
          {{ ac?.formEmailLabel ?? 'Email' }}
          <input v-model="email" type="email" required autocomplete="email" class="min-h-[48px] w-full border border-ink/15 bg-transparent px-3 dark:border-white/15 dark:text-paper">
        </label>
        <label class="block space-y-1 text-xs text-muted">
          {{ ac?.registerPasswordHint ?? 'Mot de passe (min. 8 caractères)' }}
          <input v-model="password" type="password" required minlength="8" autocomplete="new-password" class="min-h-[48px] w-full border border-ink/15 bg-transparent px-3 dark:border-white/15 dark:text-paper">
        </label>
        <label class="block space-y-1 text-xs text-muted">
          {{ ac?.formPasswordConfirmLabel ?? 'Confirmer le mot de passe' }}
          <input v-model="password2" type="password" required minlength="8" autocomplete="new-password" class="min-h-[48px] w-full border border-ink/15 bg-transparent px-3 dark:border-white/15 dark:text-paper">
        </label>
        <button
          type="submit"
          :disabled="busy"
          class="flex w-full min-h-[48px] items-center justify-center gap-2 bg-gold py-3 text-xs font-bold uppercase tracking-[0.24em] text-white"
        >
          <Loader2 v-if="busy" class="h-4 w-4 animate-spin" />
          {{ ac?.registerSubmit ?? 'Créer mon compte' }}
        </button>
      </form>
    </div>
  </section>
</template>
