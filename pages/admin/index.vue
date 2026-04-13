<script setup lang="ts">
import { ChevronRight, FileText, LayoutTemplate, Mail, MessageSquare, Package, Percent, ShoppingBag, Tags, Users, WalletCards } from 'lucide-vue-next'
import type { AdminCustomerRow } from '../../types/customer'
import type { WaxtuStoredOrder } from '../../types/orders'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

type DashboardPayload = {
  stats: {
    products: number
    forSale: number
    sections: number
    sectionsOn: number
    promoOn: boolean
  },
  orders: {
    count: number
    count30: number
    revenueAll: number
    revenue30: number
  },
  recentOrders: WaxtuStoredOrder[],
  alerts: {
    lowStock: { id: number; name: string; stock: number }[]
    outOfStock: { id: number; name: string }[]
  },
  customers: {
    count: number
    recent: AdminCustomerRow[]
  },
  mail: {
    configured: boolean
    missing: string[]
  },
}

const dash = ref<DashboardPayload | null>(null)
const loadError = ref<string | null>(null)
const formatPrice = useFormatPrice()

const crudModules = [
  {
    title: 'Ventes',
    to: '/admin/orders',
    badge: 'Commandes',
    detail: 'Historique des achats payés et export liste.',
    icon: ShoppingBag,
  },
  {
    title: 'Contacts',
    to: '/admin/contacts',
    badge: 'Messages',
    detail: 'Demandes envoyées depuis le formulaire de contact.',
    icon: MessageSquare,
  },
  {
    title: 'Comptes clients',
    to: '/admin/clients',
    badge: 'Espace client',
    detail: 'Inscriptions, emails, points fidélité et nombre de favoris.',
    icon: Users,
  },
  {
    title: 'Page d’accueil',
    to: '/admin/landing',
    badge: 'Blocs',
    detail: 'Grande image, textes, produits mis en avant.',
    icon: LayoutTemplate,
  },
  {
    title: 'Produits',
    to: '/admin/products',
    badge: 'Boutique',
    detail: 'Articles, photos, prix et quantités.',
    icon: Package,
  },
  {
    title: 'Catégories',
    to: '/admin/categories',
    badge: 'Filtres',
    detail: 'Créer, renommer ou supprimer les rayons affichés sur la boutique.',
    icon: Tags,
  },
  {
    title: 'Textes des pages',
    to: '/admin/textes',
    badge: 'Site',
    detail: 'Checkout, merci, menu vitrine, contact, lookbook, héritage, espace client, légal, fiche produit.',
    icon: FileText,
  },
  {
    title: 'Promotions',
    to: '/admin/promotions',
    badge: 'Réductions',
    detail: 'Message d’accueil et code promo.',
    icon: Percent,
  },
  {
    title: 'Réglages paiement',
    to: '/admin/paytech',
    badge: 'Avancé',
    detail: 'Connexion technique au prestataire de paiement.',
    icon: WalletCards,
  },
] as const

async function load() {
  loadError.value = null
  try {
    const token = localStorage.getItem('waxtu-admin-token')
    if (!token) return
    dash.value = await $fetch<DashboardPayload>('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
  }
  catch {
    loadError.value = 'Impossible de charger le tableau de bord. Reconnectez-vous.'
  }
}

onMounted(load)

const mailTestBusy = ref(false)
const mailTestMessage = ref<string | null>(null)

async function sendMailTest() {
  mailTestMessage.value = null
  mailTestBusy.value = true
  try {
    const token = localStorage.getItem('waxtu-admin-token')
    if (!token) return
    await $fetch('/api/admin/mail-test', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    mailTestMessage.value = 'Email de test envoyé. Vérifiez la boîte configurée dans NUXT_MAIL_TO_SHOP (et le dossier indésirables).'
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string; message?: string }; message?: string }
    mailTestMessage.value =
      err?.data?.statusMessage || err?.data?.message || err?.message
      || 'Échec de l’envoi. Vérifiez la console serveur et la configuration Resend.'
  }
  finally {
    mailTestBusy.value = false
  }
}

function formatDateShort(iso: string) {
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  }
  catch {
    return iso
  }
}

function formatCustomerDate(iso: string) {
  if (!iso) return '—'
  return formatDateShort(iso)
}

useHead({ title: 'Tableau de bord — Admin WAXTU' })
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-8">
    <header class="space-y-1">
      <p class="text-xs font-bold uppercase tracking-[0.35em] text-gold">Résumé</p>
      <h1 class="font-serif text-3xl text-ink dark:text-paper md:text-4xl">
        Bienvenue
      </h1>
      <p class="max-w-2xl text-sm text-muted">
        Ici vous voyez d’un coup d’œil les <strong class="text-foreground">ventes</strong>, le catalogue et les petites alertes (stock).
        Utilisez le menu à gauche ou la liste ci-dessous pour modifier le site.
      </p>
    </header>

    <p v-if="loadError" class="rounded-wax border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
      {{ loadError }}
    </p>

    <template v-if="dash">
      <section aria-label="Indicateurs catalogue">
        <h2 class="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-muted">
          Boutique
        </h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded-wax border border-ink/10 bg-paper p-4 dark:border-white/10 dark:bg-ink">
            <p class="text-2xl font-serif text-ink dark:text-paper">{{ dash.stats.products }}</p>
            <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Produits</p>
          </div>
          <div class="rounded-wax border border-ink/10 bg-paper p-4 dark:border-white/10 dark:bg-ink">
            <p class="text-2xl font-serif text-gold">{{ dash.stats.forSale }}</p>
            <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">En vente (public)</p>
          </div>
          <div class="rounded-wax border border-ink/10 bg-paper p-4 dark:border-white/10 dark:bg-ink">
            <p class="text-2xl font-serif text-ink dark:text-paper">{{ dash.stats.sectionsOn }}/{{ dash.stats.sections }}</p>
            <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Sections actives</p>
          </div>
          <div class="rounded-wax border border-ink/10 bg-paper p-4 dark:border-white/10 dark:bg-ink">
            <p class="text-2xl font-serif" :class="dash.stats.promoOn ? 'text-gold' : 'text-muted'">
              {{ dash.stats.promoOn ? 'Oui' : 'Non' }}
            </p>
            <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Promo accueil</p>
          </div>
        </div>
      </section>

      <section aria-label="Ventes">
        <h2 class="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-muted">
          Ventes
        </h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div class="rounded-wax border border-ink/10 bg-paper p-4 dark:border-white/10 dark:bg-ink">
            <p class="text-2xl font-serif text-ink dark:text-paper">{{ dash.orders.count }}</p>
            <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Commandes enregistrées</p>
          </div>
          <div class="rounded-wax border border-ink/10 bg-paper p-4 dark:border-white/10 dark:bg-ink">
            <p class="text-2xl font-serif text-gold">{{ dash.orders.count30 }}</p>
            <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">30 derniers jours</p>
          </div>
          <div class="col-span-2 rounded-wax border border-ink/10 bg-paper p-4 sm:col-span-1 dark:border-white/10 dark:bg-ink">
            <p class="text-2xl font-serif text-ink dark:text-paper">
              {{ formatPrice(dash.orders.revenue30) }}
            </p>
            <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">CA 30 jours</p>
            <p class="mt-2 text-xs text-muted">
              Total historique : {{ formatPrice(dash.orders.revenueAll) }}
            </p>
          </div>
        </div>
      </section>
<!-- 
      <section aria-label="Emails commandes (Resend)">
        <h2 class="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-muted">
          Emails « commande payée »
        </h2>
        <div class="space-y-3 rounded-wax border border-ink/10 bg-paper p-4 dark:border-white/10 dark:bg-ink">
          <div class="flex flex-wrap items-center gap-2">
            <Mail class="h-4 w-4 text-gold" :stroke-width="1.5" />
            <p v-if="dash.mail.configured" class="text-sm text-ink dark:text-paper">
              Configuration Resend détectée (clé API, expéditeur, destinataire boutique).
            </p>
            <p v-else class="text-sm text-ink dark:text-paper">
              <span class="font-medium text-amber-700 dark:text-amber-300">Incomplet.</span>
              Variables manquantes : {{ dash.mail.missing.join(', ') || 'voir .env.example' }}
            </p>
          </div>
          <p class="text-xs text-muted">
            Les mails réels partent après un paiement confirmé (IPN PayTech). Ce bouton envoie un message de test uniquement à l’adresse boutique.
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="rounded-wax border border-ink/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink transition hover:border-gold disabled:opacity-50 dark:border-white/15 dark:text-paper"
              :disabled="mailTestBusy || !dash.mail.configured"
              @click="sendMailTest"
            >
              {{ mailTestBusy ? 'Envoi…' : 'Envoyer un email de test' }}
            </button>
          </div>
          <p v-if="mailTestMessage" class="text-sm text-gold">
            {{ mailTestMessage }}
          </p>
        </div>
      </section> -->

      <section aria-label="Comptes clients">
        <div class="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Comptes espace client
          </h2>
          <NuxtLink class="text-xs font-bold uppercase tracking-[0.2em] text-gold hover:underline" to="/admin/clients">
            Voir la liste
          </NuxtLink>
        </div>
        <div class="mb-3 rounded-wax border border-ink/10 bg-paper p-4 dark:border-white/10 dark:bg-ink">
          <p class="font-serif text-2xl text-ink dark:text-paper">
            {{ dash.customers.count }}
          </p>
          <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            Comptes enregistrés (inscription sur /compte)
          </p>
        </div>
        <ul
          v-if="dash.customers.recent.length"
          class="divide-y divide-ink/10 overflow-hidden rounded-wax border border-ink/10 bg-paper dark:divide-white/10 dark:border-white/10 dark:bg-ink"
        >
          <li
            v-for="c in dash.customers.recent"
            :key="c.id"
            class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm sm:px-5"
          >
            <span class="font-mono text-xs text-ink dark:text-paper">{{ c.email }}</span>
            <span class="text-xs text-muted">{{ formatCustomerDate(c.createdAt) }}</span>
            <span class="text-xs text-muted">{{ c.loyaltyPoints }} pts · {{ c.favoritesCount }} favoris</span>
          </li>
        </ul>
        <p v-else class="rounded-wax border border-ink/10 bg-paper px-4 py-3 text-sm text-muted dark:border-white/10 dark:bg-ink">
          Aucun compte pour l’instant.
        </p>
      </section>

      <section
        v-if="dash.alerts.outOfStock.length || dash.alerts.lowStock.length"
        aria-label="Alertes stock"
      >
        <h2 class="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-muted">
          Alertes stock
        </h2>
        <div class="space-y-3 rounded-wax border border-amber-500/25 bg-amber-500/5 p-4 dark:border-amber-400/20 dark:bg-amber-400/5">
          <p v-for="p in dash.alerts.outOfStock" :key="`o-${p.id}`" class="text-sm text-ink dark:text-paper">
            <strong>Rupture</strong> — {{ p.name }}
            <NuxtLink class="ml-2 text-gold underline" to="/admin/products">Gérer</NuxtLink>
          </p>
          <p v-for="p in dash.alerts.lowStock" :key="`l-${p.id}`" class="text-sm text-ink dark:text-paper">
            <strong>Stock bas ({{ p.stock }})</strong> — {{ p.name }}
            <NuxtLink class="ml-2 text-gold underline" to="/admin/products">Gérer</NuxtLink>
          </p>
        </div>
      </section>

      <section v-if="dash.recentOrders.length" aria-label="Dernières commandes">
        <div class="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Dernières commandes
          </h2>
          <NuxtLink class="text-xs font-bold uppercase tracking-[0.2em] text-gold hover:underline" to="/admin/orders">
            Voir tout
          </NuxtLink>
        </div>
        <ul class="divide-y divide-ink/10 overflow-hidden rounded-wax border border-ink/10 bg-paper dark:divide-white/10 dark:border-white/10 dark:bg-ink">
          <li v-for="o in dash.recentOrders" :key="o.ref">
            <NuxtLink
              :to="`/admin/orders/${encodeURIComponent(o.ref)}`"
              class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-gold/5 dark:hover:bg-white/5 sm:px-5"
            >
              <span class="font-mono text-xs font-semibold text-ink dark:text-paper">{{ o.ref }}</span>
              <span class="text-xs text-muted">{{ formatDateShort(o.paidAt) }}</span>
              <span class="font-serif text-gold">{{ formatPrice(o.total) }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section aria-label="Modules de gestion">
        <h2 class="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-muted">
          Que voulez-vous modifier ?
        </h2>
        <ul class="divide-y divide-ink/10 overflow-hidden rounded-wax border border-ink/10 bg-paper dark:divide-white/10 dark:border-white/10 dark:bg-ink">
          <li v-for="mod in crudModules" :key="mod.to">
            <NuxtLink
              :to="mod.to"
              class="group flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-gold/5 dark:hover:bg-white/5 md:px-5"
            >
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <component :is="mod.icon" class="h-4 w-4 shrink-0 text-gold opacity-70" :stroke-width="1.5" />
                  <span class="font-serif text-lg text-ink dark:text-paper">{{ mod.title }}</span>
                  <span
                    class="rounded-pill bg-ink/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted dark:bg-white/10"
                  >
                    {{ mod.badge }}
                  </span>
                </div>
                <p class="mt-1 text-sm text-muted">
                  {{ mod.detail }}
                </p>
              </div>
              <ChevronRight
                class="h-5 w-5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-gold"
                :stroke-width="1.5"
              />
            </NuxtLink>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
