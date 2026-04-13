<script setup lang="ts">
import type { WaxtuCms } from '../../types/cms'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const cms = ref<WaxtuCms | null>(null)
const status = ref<string | null>(null)

async function load() {
  const token = localStorage.getItem('waxtu-admin-token')
  cms.value = await $fetch<WaxtuCms>('/api/cms/admin', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

onMounted(load)

async function save() {
  if (!cms.value) return
  const token = localStorage.getItem('waxtu-admin-token')
  cms.value = await $fetch<WaxtuCms>('/api/cms/admin', {
    method: 'PUT',
    body: cms.value,
    headers: { Authorization: `Bearer ${token}` },
  })
  await refreshNuxtData('waxtu-cms-public')
  status.value = 'Paramètres PayTech sauvegardés'
  window.setTimeout(() => (status.value = null), 2400)
}

useHead({ title: 'PayTech — Admin WAXTU' })
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8 px-5 py-10 md:px-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.35em] text-gold">Paiement</p>
        <h1 class="font-serif text-3xl">PayTech</h1>
        <p class="text-sm text-muted">
          Les clés API restent exclusivement sur le serveur. Configurez
          <code class="text-gold">NUXT_PAYTECH_API_KEY</code> et
          <code class="text-gold">NUXT_PAYTECH_API_SECRET</code>, ainsi que
          <code class="text-gold">NUXT_PUBLIC_SITE_URL</code> pour les URLs de retour.
        </p>
      </div>
      <button
        type="button"
        class="rounded-wax bg-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.35em] text-white transition hover:bg-gold dark:bg-paper dark:text-ink dark:hover:bg-gold dark:hover:text-white"
        @click="save"
      >
        Enregistrer
      </button>
    </div>
    <p v-if="status" class="text-sm text-gold">
      {{ status }}
    </p>
    <div v-if="cms" class="space-y-6 rounded-wax border border-ink/10 bg-paper p-6 dark:border-white/10 dark:bg-ink">
      <label class="block text-xs font-bold uppercase tracking-[0.28em] text-muted">
        Environnement PayTech
        <select v-model="cms.paytech.env" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          <option value="test">Test</option>
          <option value="prod">Production</option>
        </select>
      </label>
      <label class="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-muted">
        <input v-model="cms.paytech.isMobileFlow" type="checkbox" class="accent-gold">
        Utiliser les URLs mobiles PayTech (succès / annulation hébergées)
      </label>
      <label class="block text-xs font-bold uppercase tracking-[0.28em] text-muted">
        Chemin de succès (relatif au site)
        <input v-model="cms.paytech.successPath" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
      </label>
      <label class="block text-xs font-bold uppercase tracking-[0.28em] text-muted">
        Chemin d’annulation
        <input v-model="cms.paytech.cancelPath" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
      </label>
      <label class="block text-xs font-bold uppercase tracking-[0.28em] text-muted">
        Chemin IPN (relatif)
        <input v-model="cms.paytech.ipnPath" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
      </label>
    </div>
  </div>
</template>
