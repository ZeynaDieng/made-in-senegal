<script setup lang="ts">
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import type { WaxtuOrderStatus, WaxtuStoredOrder } from '../../../types/orders'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const route = useRoute()
const formatPrice = useFormatPrice()
const order = ref<WaxtuStoredOrder | null>(null)
const loadError = ref<string | null>(null)
const statusEdit = ref<WaxtuOrderStatus>('paid')
const noteEdit = ref('')
const saveMsg = ref<string | null>(null)
const saving = ref(false)

const refKey = computed(() => decodeURIComponent(String(route.params.ref ?? '')))

async function load() {
  loadError.value = null
  order.value = null
  const ref = refKey.value
  if (!ref) {
    loadError.value = 'Référence invalide.'
    return
  }
  try {
    const token = localStorage.getItem('waxtu-admin-token')
    order.value = await $fetch<WaxtuStoredOrder>(`/api/orders/admin/${encodeURIComponent(ref)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    statusEdit.value = order.value.status
    noteEdit.value = order.value.adminNote ?? ''
  }
  catch {
    loadError.value = 'Commande introuvable ou accès refusé.'
  }
}

watch(refKey, load, { immediate: true })

async function saveOps() {
  if (!order.value) return
  saveMsg.value = null
  saving.value = true
  try {
    const token = localStorage.getItem('waxtu-admin-token')
    order.value = await $fetch<WaxtuStoredOrder>(`/api/orders/admin/${encodeURIComponent(order.value.ref)}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        status: statusEdit.value,
        adminNote: noteEdit.value,
      },
    })
    statusEdit.value = order.value.status
    noteEdit.value = order.value.adminNote ?? ''
    saveMsg.value = 'Enregistré.'
    window.setTimeout(() => (saveMsg.value = null), 2500)
  }
  catch {
    saveMsg.value = 'Échec de l’enregistrement.'
  }
  finally {
    saving.value = false
  }
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(iso))
  }
  catch {
    return iso
  }
}

useHead(() => ({
  title: order.value ? `Commande ${order.value.ref} — Admin` : 'Commande — Admin WAXTU',
}))
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8">
    <div>
      <NuxtLink
        to="/admin/orders"
        class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-muted transition hover:text-gold"
      >
        <ArrowLeft class="h-4 w-4" :stroke-width="1.5" />
        Toutes les commandes
      </NuxtLink>
    </div>

    <p v-if="loadError" class="rounded-wax border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
      {{ loadError }}
    </p>

    <template v-else-if="order">
      <header class="space-y-2">
        <p class="text-xs font-bold uppercase tracking-[0.35em] text-gold">Détail</p>
        <h1 class="break-all font-mono text-xl text-ink dark:text-paper md:text-2xl">
          {{ order.ref }}
        </h1>
        <p class="text-sm text-muted">
          Payée le {{ formatDate(order.paidAt) }} · statut : <span class="text-ink dark:text-paper">{{ order.status }}</span>
        </p>
      </header>

      <section
        v-if="order.customer && (order.customer.email || order.customer.phone || order.customer.name)"
        class="rounded-wax border border-ink/10 bg-paper p-4 dark:border-white/10 dark:bg-ink"
      >
        <h2 class="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
          Client
        </h2>
        <ul class="space-y-1 text-sm text-ink dark:text-paper">
          <li v-if="order.customer.name">
            {{ order.customer.name }}
          </li>
          <li v-if="order.customer.email">
            <a :href="`mailto:${order.customer.email}`" class="text-gold underline">{{ order.customer.email }}</a>
          </li>
          <li v-if="order.customer.phone">
            {{ order.customer.phone }}
          </li>
        </ul>
      </section>

      <section
        v-if="order.paytechMeta && (order.paytechMeta.paymentMethod || order.paytechMeta.token)"
        class="rounded-wax border border-ink/10 bg-paper p-4 text-xs text-muted dark:border-white/10 dark:bg-ink"
      >
        <h2 class="mb-2 font-bold uppercase tracking-[0.28em] text-muted">
          PayTech
        </h2>
        <p v-if="order.paytechMeta.paymentMethod">
          Moyen : {{ order.paytechMeta.paymentMethod }}
        </p>
        <p v-if="order.paytechMeta.token" class="mt-1 font-mono">
          Token : {{ order.paytechMeta.token }}
        </p>
      </section>

      <section class="rounded-wax border border-ink/10 bg-paper p-4 dark:border-white/10 dark:bg-ink">
        <h2 class="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-muted">
          Suivi interne
        </h2>
        <div class="space-y-4">
          <div>
            <label for="order-status" class="mb-1 block text-xs text-muted">Statut</label>
            <select
              id="order-status"
              v-model="statusEdit"
              class="w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
            >
              <option value="paid">
                Payée
              </option>
              <option value="fulfilled">
                Traitée / livrée
              </option>
              <option value="cancelled">
                Annulée
              </option>
            </select>
          </div>
          <div>
            <label for="order-note" class="mb-1 block text-xs text-muted">Note interne</label>
            <textarea
              id="order-note"
              v-model="noteEdit"
              rows="3"
              class="w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
              placeholder="Commentaire visible uniquement dans l’admin…"
            />
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="rounded-wax border border-ink/10 bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-gold dark:border-white/10 dark:bg-paper dark:text-ink dark:hover:bg-gold dark:hover:text-white"
              :disabled="saving"
              @click="saveOps"
            >
              <Loader2 v-if="saving" class="mr-2 inline h-4 w-4 animate-spin" aria-hidden="true" />
              Enregistrer
            </button>
            <p v-if="saveMsg" class="text-sm text-muted">
              {{ saveMsg }}
            </p>
          </div>
        </div>
      </section>

      <div class="overflow-hidden rounded-wax border border-ink/10 bg-paper dark:border-white/10 dark:bg-ink">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-ink/10 bg-ink/[0.03] text-[10px] font-bold uppercase tracking-[0.2em] text-muted dark:border-white/10 dark:bg-white/5">
            <tr>
              <th class="px-4 py-3">
                Produit
              </th>
              <th class="px-4 py-3 text-right">
                Qté
              </th>
              <th class="px-4 py-3 text-right">
                P.u.
              </th>
              <th class="px-4 py-3 text-right">
                Sous-total
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ink/10 dark:divide-white/10">
            <tr v-for="(line, idx) in order.lines" :key="`${line.productId}-${idx}`">
              <td class="px-4 py-3 text-ink dark:text-paper">
                {{ line.name }}
                <span class="ml-1 text-xs text-muted">#{{ line.productId }}</span>
              </td>
              <td class="px-4 py-3 text-right tabular-nums">
                {{ line.qty }}
              </td>
              <td class="px-4 py-3 text-right tabular-nums text-muted">
                {{ formatPrice(line.unitPrice) }}
              </td>
              <td class="px-4 py-3 text-right font-medium text-ink dark:text-paper">
                {{ formatPrice(line.lineSubtotal) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="space-y-2 border-t border-ink/10 px-4 py-4 text-sm dark:border-white/10">
          <div class="flex justify-between text-muted">
            <span>Sous-total</span>
            <span>{{ formatPrice(order.subtotal) }}</span>
          </div>
          <div v-if="order.discount > 0" class="flex justify-between text-gold">
            <span>Remise</span>
            <span>- {{ formatPrice(order.discount) }}</span>
          </div>
          <div class="flex justify-between border-t border-ink/10 pt-2 font-serif text-lg text-ink dark:border-white/10 dark:text-paper">
            <span>Total</span>
            <span>{{ formatPrice(order.total) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
