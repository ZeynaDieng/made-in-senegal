<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { WaxtuStoredOrder } from '../../../types/orders'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const formatPrice = useFormatPrice()
const orders = ref<WaxtuStoredOrder[]>([])
const total = ref(0)
const loadError = ref<string | null>(null)
const exportBusy = ref(false)
const exportError = ref<string | null>(null)

async function downloadExport() {
  if (!import.meta.client) return
  const token = localStorage.getItem('waxtu-admin-token')
  if (!token) return
  exportBusy.value = true
  exportError.value = null
  try {
    const res = await fetch('/api/orders/admin/export', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('export')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'waxtu-commandes.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
  catch {
    exportError.value = 'Export CSV impossible.'
  }
  finally {
    exportBusy.value = false
  }
}

async function load() {
  loadError.value = null
  try {
    const token = localStorage.getItem('waxtu-admin-token')
    const res = await $fetch<{ orders: WaxtuStoredOrder[]; total: number }>('/api/orders/admin', {
      headers: { Authorization: `Bearer ${token}` },
      query: { limit: 200 },
    })
    orders.value = res.orders
    total.value = res.total
  }
  catch {
    loadError.value = 'Impossible de charger les commandes.'
  }
}

onMounted(load)

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  }
  catch {
    return iso
  }
}

useHead({ title: 'Commandes — Admin WAXTU' })
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-8">
    <header class="space-y-1">
      <p class="text-xs font-bold uppercase tracking-[0.35em] text-gold">Commerce</p>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="font-serif text-3xl text-ink dark:text-paper md:text-4xl">
            Commandes payées
          </h1>
          <p class="mt-1 max-w-2xl text-sm text-muted">
            Enregistrées automatiquement après confirmation PayTech (IPN). Stock décrémenté en même temps.
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-wax border border-ink/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink transition hover:border-gold disabled:opacity-50 dark:border-white/15 dark:text-paper"
          :disabled="exportBusy"
          @click="downloadExport"
        >
          {{ exportBusy ? 'Export…' : 'Export CSV' }}
        </button>
      </div>
    </header>

    <p v-if="loadError" class="rounded-wax border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
      {{ loadError }}
    </p>
    <p v-if="exportError" class="rounded-wax border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
      {{ exportError }}
    </p>

    <p v-else-if="!orders.length" class="rounded-wax border border-dashed border-ink/15 px-4 py-8 text-center text-sm text-muted dark:border-white/15">
      Aucune commande enregistrée pour l’instant.
    </p>

    <div v-else class="overflow-hidden rounded-wax border border-ink/10 bg-paper dark:border-white/10 dark:bg-ink">
      <div class="border-b border-ink/10 px-4 py-3 text-xs text-muted dark:border-white/10">
        {{ total }} commande{{ total > 1 ? 's' : '' }} au total (affichage jusqu’à 200)
      </div>
      <ul class="divide-y divide-ink/10 dark:divide-white/10">
        <li v-for="o in orders" :key="o.ref">
          <NuxtLink
            :to="`/admin/orders/${encodeURIComponent(o.ref)}`"
            class="group flex flex-wrap items-center justify-between gap-3 px-4 py-4 transition hover:bg-gold/5 dark:hover:bg-white/5 sm:px-5"
          >
            <div class="min-w-0 flex-1">
              <p class="font-mono text-sm font-semibold text-ink dark:text-paper">
                {{ o.ref }}
              </p>
              <p class="mt-0.5 text-xs text-muted">
                {{ formatDate(o.paidAt) }} · {{ o.lines.length }} article{{ o.lines.length > 1 ? 's' : '' }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-serif text-lg text-gold">{{ formatPrice(o.total) }}</span>
              <ChevronRight
                class="h-5 w-5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-gold"
                :stroke-width="1.5"
              />
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
