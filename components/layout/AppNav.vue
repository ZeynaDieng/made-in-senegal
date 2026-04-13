<script setup lang="ts">
import { CircleUser, Facebook, Instagram, MessageCircle, Moon, ShoppingBag, SunMedium, X } from 'lucide-vue-next'
import { ref } from 'vue'
import { useCartStore } from '../../stores/cart'
import type { WaxtuCms } from '../../types/cms'
import { contactWhatsappHref } from '../../utils/contact-links'
import { siteNavLinks } from '../../utils/site-nav'

const props = defineProps<{
  cms: WaxtuCms | null
}>()

const contactBlock = computed(() => props.cms?.site.contact)
const igHref = computed(() => contactBlock.value?.instagramUrl?.trim() ?? '')
const fbHref = computed(() => contactBlock.value?.facebookUrl?.trim() ?? '')
const waHref = computed(() => contactWhatsappHref(contactBlock.value?.phone ?? ''))

const cart = useCartStore()
const colorMode = useColorMode()
const isMenuOpen = ref(false)
/** Évite la fermeture instantanée par « ghost click » iOS/Android après ouverture. */
const menuBackdropIgnoreCloseUntil = ref(0)
const MENU_OPEN_CLICK_GUARD_MS = 700

const links = computed(() => siteNavLinks(props.cms))

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

function openMenu() {
  /** Garde posée avant l’ouverture : évite une fermeture dans la même micro-tâche que le ghost click. */
  if (import.meta.client) {
    menuBackdropIgnoreCloseUntil.value = performance.now() + MENU_OPEN_CLICK_GUARD_MS
  }
  isMenuOpen.value = true
}

function onMenuBackdropClick() {
  if (import.meta.client && performance.now() < menuBackdropIgnoreCloseUntil.value) return
  isMenuOpen.value = false
}

/** Même clé que `pages/admin/login.vue` — si présent, priorité back-office. */
const ADMIN_TOKEN_STORAGE_KEY = 'waxtu-admin-token'

function goAccountOrAdmin() {
  if (import.meta.client && localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)?.trim()) {
    void navigateTo('/admin')
    return
  }
  void navigateTo('/compte')
}

</script>

<template>
  <nav
    class="fixed top-0 z-50 w-full border-b border-ink/10 bg-surface/95 py-4 text-ink shadow-sm backdrop-blur-md transition-colors duration-300 dark:border-white/10 dark:bg-night/95 dark:text-paper dark:shadow-none"
  >
    <div class="mx-auto flex max-w-6xl items-center justify-between px-5 md:px-8">
      <button
        type="button"
        class="group flex touch-manipulation items-center gap-3 text-ink dark:text-paper"
        aria-haspopup="dialog"
        :aria-expanded="isMenuOpen"
        aria-controls="waxtu-menu-dialog"
        @click.stop="openMenu"
      >
        <div class="space-y-1.5">
          <div class="h-px w-5 bg-current transition-all group-hover:w-8" />
          <div class="h-px w-8 bg-current" />
        </div>
        <span class="hidden text-[10px] font-bold uppercase tracking-[0.35em] md:inline">Menu</span>
      </button>

      <NuxtLink to="/" class="flex items-center gap-3 text-ink dark:text-paper">
        <span class="font-serif text-2xl tracking-[0.35em] transition-colors md:text-3xl">
          {{ cms?.global.brand ?? 'WAXTU' }}
        </span>
      </NuxtLink>

      <div class="flex items-center gap-4 text-ink dark:text-paper md:gap-6">
        <button
          type="button"
          class="rounded-wax border border-transparent p-2 transition hover:border-ink/10 dark:hover:border-white/10"
          :aria-label="colorMode.value === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'"
          @click="toggleColorMode"
        >
          <SunMedium v-if="colorMode.value === 'dark'" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </button>
        <button
          type="button"
          class="rounded-wax border border-transparent p-2 transition hover:border-ink/10 hover:text-gold dark:hover:border-white/10"
          aria-label="Mon compte ou administration"
          @click="goAccountOrAdmin"
        >
          <CircleUser class="h-5 w-5" :stroke-width="1.5" />
        </button>
        <button type="button" class="relative" @click="cart.open()">
          <ShoppingBag class="h-6 w-6" :stroke-width="1.5" />
          <span
            v-if="cart.count"
            class="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-pill bg-gold text-[9px] font-bold text-white"
          >
            {{ cart.count }}
          </span>
        </button>
      </div>
    </div>
  </nav>

  <!-- Teleport vers body : dernier nœud possible, z max — évite tout parent (transform, isolation) qui piège le fixed. -->
  <Teleport to="body">
    <div
      v-if="isMenuOpen"
      id="waxtu-menu-dialog"
      class="fixed inset-0 z-[99999] text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div
        class="absolute inset-0 flex max-h-[100dvh] flex-col overflow-y-auto bg-ink md:max-h-none md:flex-row md:overflow-hidden"
        @click.self="onMenuBackdropClick"
      >
        <div
          class="flex w-full shrink-0 flex-col justify-between px-6 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))] md:w-1/2 md:max-h-none md:overflow-visible md:p-16 lg:p-24"
        >
          <button
            type="button"
            class="group flex items-center gap-4 self-start text-gold transition hover:text-white"
            @click="isMenuOpen = false"
          >
            <X class="h-8 w-8" />
            <span class="text-xs font-bold uppercase tracking-[0.35em]">Fermer</span>
          </button>
          <div class="my-8 space-y-5 md:my-10 md:space-y-6 lg:space-y-8">
            <NuxtLink
              v-for="(item, idx) in links"
              :key="item.to"
              :to="item.to"
              class="block font-serif text-4xl transition duration-500 hover:text-gold hover:italic sm:text-5xl md:text-6xl lg:text-7xl animate-slide-up opacity-0"
              :style="{ animationDelay: `${idx * 90}ms` }"
              @click="isMenuOpen = false"
            >
              {{ item.label }}
            </NuxtLink>
          </div>
          <div class="flex flex-wrap gap-6 text-xs uppercase tracking-[0.35em] opacity-70">
            <a
              v-if="igHref"
              :href="igHref"
              target="_blank"
              rel="noopener noreferrer"
              class="transition hover:text-gold hover:opacity-100"
              aria-label="Instagram"
              @click="isMenuOpen = false"
            >
              <Instagram class="h-5 w-5" />
            </a>
            <a
              v-if="fbHref"
              :href="fbHref"
              target="_blank"
              rel="noopener noreferrer"
              class="transition hover:text-gold hover:opacity-100"
              aria-label="Facebook"
              @click="isMenuOpen = false"
            >
              <Facebook class="h-5 w-5" />
            </a>
            <a
              v-if="waHref"
              :href="waHref"
              target="_blank"
              rel="noopener noreferrer"
              class="transition hover:text-gold hover:opacity-100"
              aria-label="WhatsApp"
              @click="isMenuOpen = false"
            >
              <MessageCircle class="h-5 w-5" />
            </a>
          </div>
        </div>
        <div class="relative min-h-[38vh] w-full flex-1 overflow-hidden md:h-full md:min-h-0 md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1200"
            alt="Menu"
            class="h-full min-h-[38vh] w-full scale-110 object-cover opacity-60 transition duration-[2000ms] hover:scale-100 md:min-h-0"
          >
          <div
            class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black to-transparent p-8 md:p-16 lg:p-24"
          >
            <p class="mb-3 text-sm tracking-[0.35em] text-gold">ÉDITION LIMITÉE</p>
            <h4 class="font-serif text-2xl text-white md:text-3xl lg:text-4xl">
              La Collection Dakar 1960
            </h4>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
