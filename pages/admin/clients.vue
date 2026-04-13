<script setup lang="ts">
import type { AdminCustomerRow } from '../../types/customer'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const customers = ref<AdminCustomerRow[]>([])
const error = ref<string | null>(null)

async function load() {
  error.value = null
  try {
    const token = localStorage.getItem('waxtu-admin-token')
    if (!token) return
    const res = await $fetch<{ customers: AdminCustomerRow[] }>('/api/customers/admin', {
      headers: { Authorization: `Bearer ${token}` },
    })
    customers.value = res.customers
  }
  catch {
    error.value = 'Impossible de charger les comptes clients.'
  }
}

onMounted(load)

function formatDate(iso: string) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  }
  catch {
    return iso
  }
}

useHead({ title: 'Comptes clients — Admin WAXTU' })
</script>

<template>
  <div class="space-y-8">
    <div>
      <p class="text-xs font-bold uppercase tracking-[0.28em] text-gold">
        Espace client
      </p>
      <h1 class="mt-2 font-serif text-3xl text-ink dark:text-paper">
        Comptes clients
      </h1>
      <p class="mt-2 max-w-2xl text-sm text-muted">
        Inscriptions avec email et mot de passe (fichier <code class="rounded bg-ink/5 px-1 text-xs dark:bg-white/10">.data/waxtu-customers.json</code>). Les mots de passe ne sont jamais affichés.
      </p>
    </div>

    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </p>

    <div v-else-if="!customers.length" class="rounded-wax border border-ink/10 bg-paper px-6 py-10 text-center text-sm text-muted dark:border-white/10 dark:bg-night">
      Aucun compte client pour le moment.
    </div>

    <div v-else class="overflow-x-auto rounded-wax border border-ink/10 dark:border-white/10">
      <table class="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr class="border-b border-ink/10 bg-ink/[0.03] text-[10px] font-bold uppercase tracking-[0.2em] text-muted dark:border-white/10 dark:bg-white/[0.04]">
            <th class="px-4 py-3">
              Inscription
            </th>
            <th class="px-4 py-3">
              Email
            </th>
            <th class="px-4 py-3">
              Points fidélité
            </th>
            <th class="px-4 py-3">
              Favoris
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-ink/10 dark:divide-white/10">
          <tr v-for="c in customers" :key="c.id" class="bg-paper dark:bg-night">
            <td class="whitespace-nowrap px-4 py-3 text-xs text-muted">
              {{ formatDate(c.createdAt) }}
            </td>
            <td class="px-4 py-3 font-mono text-xs text-ink dark:text-paper">
              {{ c.email }}
            </td>
            <td class="px-4 py-3 text-ink dark:text-paper">
              {{ c.loyaltyPoints }}
            </td>
            <td class="px-4 py-3 text-muted">
              {{ c.favoritesCount }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
