<script setup lang="ts">
import {
  ExternalLink,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  MessageSquare,
  Package,
  Percent,
  ShoppingBag,
  Tags,
  Users,
  WalletCards,
} from 'lucide-vue-next'

defineEmits<{
  close: []
}>()

const route = useRoute()

type NavItem = { to: string; label: string; subtitle?: string; icon: typeof Package }

const navMain: NavItem[] = [
  {
    to: '/admin',
    label: 'Accueil',
    subtitle: 'Chiffres et raccourcis',
    icon: LayoutDashboard,
  },
  {
    to: '/admin/orders',
    label: 'Ventes',
    subtitle: 'Liste des commandes payées',
    icon: ShoppingBag,
  },
  {
    to: '/admin/contacts',
    label: 'Contacts',
    subtitle: 'Messages formulaire conciergerie',
    icon: MessageSquare,
  },
  {
    to: '/admin/clients',
    label: 'Clients',
    subtitle: 'Comptes espace client',
    icon: Users,
  },
  {
    to: '/admin/landing',
    label: 'Page d’accueil',
    subtitle: 'Bannières et blocs',
    icon: LayoutTemplate,
  },
  {
    to: '/admin/products',
    label: 'Produits',
    subtitle: 'Prix, photos, stock',
    icon: Package,
  },
  {
    to: '/admin/categories',
    label: 'Catégories',
    subtitle: 'Filtres de la boutique',
    icon: Tags,
  },
  {
    to: '/admin/textes',
    label: 'Textes des pages',
    subtitle: 'Paiement, menu, contact, légal…',
    icon: FileText,
  },
  {
    to: '/admin/promotions',
    label: 'Promotions',
    subtitle: 'Code promo sur le site',
    icon: Percent,
  },
  // {
  //   to: '/admin/paytech',
  //   label: 'Réglages paiement',
  //   subtitle: 'Pour la personne technique',
  //   icon: WalletCards,
  // },
]

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path === to || route.path.startsWith(`${to}/`)
}

function logout() {
  if (import.meta.client) localStorage.removeItem('waxtu-admin-token')
  navigateTo('/admin/login')
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-1 flex-col">
    <div class="border-b border-ink/10 px-5 py-6 dark:border-white/10">
      <NuxtLink
        to="/admin"
        class="block font-serif text-lg tracking-[0.28em] text-ink transition hover:text-gold dark:text-paper"
        @click="$emit('close')"
      >
        WAXTU
      </NuxtLink>
      <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
        Gestion du site
      </p>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      <NuxtLink
        v-for="item in navMain"
        :key="item.to"
        :to="item.to"
        class="flex items-start gap-3 rounded-wax px-3 py-3 text-left transition"
        :class="
          isActive(item.to)
            ? 'bg-gold/15 text-ink dark:bg-gold/10 dark:text-paper'
            : 'text-muted hover:bg-ink/5 hover:text-ink dark:hover:bg-white/5 dark:hover:text-paper'
        "
        @click="$emit('close')"
      >
        <component :is="item.icon" class="mt-0.5 h-5 w-5 shrink-0 text-gold" :stroke-width="1.5" />
        <span>
          <span class="block text-sm font-semibold">{{ item.label }}</span>
          <span v-if="item.subtitle" class="mt-0.5 block text-xs font-normal opacity-80">{{ item.subtitle }}</span>
        </span>
      </NuxtLink>
    </nav>

    <div class="border-t border-ink/10 p-3 dark:border-white/10">
      <NuxtLink
        to="/"
        class="mb-2 flex items-center gap-2 rounded-wax px-3 py-2.5 text-sm text-muted transition hover:bg-ink/5 hover:text-ink dark:hover:bg-white/5 dark:hover:text-paper"
        @click="$emit('close')"
      >
        <ExternalLink class="h-4 w-4 shrink-0" />
        Voir la vitrine
      </NuxtLink>
      <button
        type="button"
        class="flex w-full items-center gap-2 rounded-wax px-3 py-2.5 text-left text-sm text-muted transition hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
        @click="logout"
      >
        <LogOut class="h-4 w-4 shrink-0" />
        Déconnexion
      </button>
    </div>
  </div>
</template>
