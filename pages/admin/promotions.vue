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
  status.value = 'Promotions mises à jour'
  window.setTimeout(() => (status.value = null), 2400)
}

useHead({ title: 'Promotions — Admin WAXTU' })
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8 px-5 py-10 md:px-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.35em] text-gold">Commerce</p>
        <h1 class="font-serif text-3xl">Promotions</h1>
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
      <label class="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-muted">
        <input v-model="cms.promotions.active" type="checkbox" class="accent-gold">
        Promotion active
      </label>
      <label class="block text-xs font-bold uppercase tracking-[0.28em] text-muted">
        Titre
        <input v-model="cms.promotions.title" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
      </label>
      <label class="block text-xs font-bold uppercase tracking-[0.28em] text-muted">
        Sous-titre
        <input v-model="cms.promotions.subtitle" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
      </label>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
          Code
          <input v-model="cms.promotions.code" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
        </label>
        <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
          Réduction (%)
          <input v-model.number="cms.promotions.percentOff" type="number" min="0" max="90" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
        </label>
      </div>
      <label class="block text-xs font-bold uppercase tracking-[0.28em] text-muted">
        Montant minimum (FCFA)
        <input v-model.number="cms.promotions.minAmount" type="number" min="0" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
      </label>
    </div>
  </div>
</template>
