<script setup lang="ts">
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const pending = ref(false)

async function submit() {
  error.value = null
  if (!email.value.trim() || !password.value) {
    error.value = 'Renseignez l’email et le mot de passe.'
    return
  }
  pending.value = true
  try {
    const { token } = await $fetch<{ token: string }>('/api/auth/admin-login', {
      method: 'POST',
      body: {
        email: email.value.trim(),
        password: password.value,
      },
    })
    localStorage.setItem('waxtu-admin-token', token)
    await navigateTo('/admin')
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string; statusMessage?: string }; message?: string }
    const msg =
      err?.data?.message
      ?? err?.data?.statusMessage
      ?? err?.message
      ?? 'Connexion impossible. Vérifiez vos identifiants et la configuration serveur.'
    error.value = typeof msg === 'string' ? msg : 'Connexion impossible.'
  }
  finally {
    pending.value = false
  }
}

useHead({ title: 'Connexion admin — WAXTU' })
definePageMeta({ layout: false })
</script>

<template>
  <div class="flex min-h-screen flex-col justify-center bg-ink px-6 text-white">
    <div class="mx-auto w-full max-w-md space-y-8">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.35em] text-gold">Espace réservé</p>
        <h1 class="mt-3 font-serif text-3xl">Administration WAXTU</h1>
        <p class="mt-2 text-sm text-white/60">
          Identifiants définis côté serveur :
          <code class="text-gold">NUXT_ADMIN_EMAIL</code>,
          <code class="text-gold">NUXT_ADMIN_PASSWORD</code>
          et un secret de session
          <code class="text-gold">NUXT_ADMIN_SESSION_SECRET</code>
          (ou <code class="text-gold">NUXT_ADMIN_TOKEN</code> comme secret de secours).
        </p>
      </div>
      <label class="block space-y-2 text-xs uppercase tracking-[0.28em] text-white/60">
        Email
        <input
          v-model="email"
          type="email"
          autocomplete="username"
          class="w-full rounded-wax border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-gold"
        >
      </label>
      <label class="block space-y-2 text-xs uppercase tracking-[0.28em] text-white/60">
        Mot de passe
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          class="w-full rounded-wax border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-gold"
          @keydown.enter.prevent="submit"
        >
      </label>
      <p v-if="error" class="text-sm text-red-300">
        {{ error }}
      </p>
      <button
        type="button"
        class="w-full rounded-wax bg-gold py-3 text-xs font-bold uppercase tracking-[0.35em] text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="pending"
        @click="submit"
      >
        {{ pending ? 'Connexion…' : 'Se connecter' }}
      </button>
      <NuxtLink class="block text-center text-xs text-white/50 underline" to="/">
        Retour au site
      </NuxtLink>
    </div>
  </div>
</template>
