<script setup lang="ts">
import { ArrowRight, Facebook, Instagram, MessageCircle } from 'lucide-vue-next'
import type { WaxtuCms } from '../../types/cms'
import { contactWhatsappHref } from '../../utils/contact-links'
import { siteNavLinks } from '../../utils/site-nav'

const props = defineProps<{
  cms: WaxtuCms | null
}>()

const links = computed(() => siteNavLinks(props.cms))

const contactBlock = computed(() => props.cms?.site.contact)
const igHref = computed(() => contactBlock.value?.instagramUrl?.trim() ?? '')
const fbHref = computed(() => contactBlock.value?.facebookUrl?.trim() ?? '')
const waHref = computed(() => contactWhatsappHref(contactBlock.value?.phone ?? ''))
</script>

<template>
  <footer
    class="border-t border-white/10 bg-ink pb-[max(2.75rem,env(safe-area-inset-bottom))] pt-14 text-white dark:border-white/10 dark:bg-surface dark:text-foreground md:pb-12 md:pt-20"
  >
    <div class="mx-auto max-w-6xl px-5 md:px-8">
      <div class="mb-16 grid grid-cols-1 gap-12 md:mb-24 md:grid-cols-12 md:gap-16">
        <div class="md:col-span-5">
          <div class="mb-6">
            <BrandWaxtuLogo variant="footer" :brand="cms?.global.brand ?? 'WAXTU'" />
          </div>
          <p
            class="mb-8 max-w-sm text-base font-light italic leading-relaxed text-white/60 dark:text-muted"
          >
             Incarnation de l'élégance sénégalaise moderne, portée par une ambition sans frontières. 
          </p>
          <div class="flex flex-wrap gap-6 text-white/70 dark:text-foreground/70">
            <a
              v-if="igHref"
              :href="igHref"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex transition hover:text-gold dark:hover:text-gold"
              aria-label="Instagram"
            >
              <Instagram class="h-5 w-5" />
            </a>
            <a
              v-if="fbHref"
              :href="fbHref"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex transition hover:text-gold dark:hover:text-gold"
              aria-label="Facebook"
            >
              <Facebook class="h-5 w-5" />
            </a>
            <a
              v-if="waHref"
              :href="waHref"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex transition hover:text-gold dark:hover:text-gold"
              aria-label="WhatsApp"
            >
              <MessageCircle class="h-5 w-5" />
            </a>
          </div>
        </div>
        <div class="md:col-span-3">
          <h5 class="mb-8 text-[10px] font-bold uppercase tracking-[0.35em] text-gold">
            Navigation
          </h5>
          <ul class="space-y-4 text-sm text-white/60 dark:text-muted">
            <li v-for="item in links" :key="item.to">
              <NuxtLink
                class="inline-flex min-h-[44px] items-center py-1 transition hover:translate-x-2 hover:text-white dark:hover:text-foreground"
                :to="item.to"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div class="md:col-span-4">
          <h5 class="mb-8 text-[10px] font-bold uppercase tracking-[0.35em] text-gold">
            Le Cercle Waxtu
          </h5>
          <p class="mb-6 text-sm italic text-white/60 dark:text-muted">
            Soyez informé de nos éditions ultra-limitées avant tout le monde.
          </p>
          <div
            class="flex flex-col gap-3 border-b border-white/25 pb-3 dark:border-white/15 sm:flex-row sm:items-end"
          >
            <input
              id="footer-newsletter-email"
              type="email"
              autocomplete="email"
              aria-label="Adresse email pour la newsletter"
              class="min-h-[48px] w-full min-w-0 flex-1 bg-transparent text-xs uppercase tracking-[0.2em] text-white placeholder:text-white/45 outline-none ring-offset-0 focus-visible:border-0 focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink dark:text-foreground dark:placeholder:text-muted dark:focus-visible:ring-offset-surface"
              placeholder="Votre adresse email"
            >
            <button
              type="button"
              class="flex min-h-[48px] shrink-0 items-center justify-center gap-2 self-stretch px-2 text-[10px] font-bold uppercase tracking-[0.35em] text-gold transition hover:text-white sm:self-auto dark:hover:text-gold"
              aria-label="S’inscrire à la newsletter"
            >
              S'inscrire
              <ArrowRight class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div
        class="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 text-[9px] uppercase tracking-[0.35em] text-white/40 dark:border-white/10 dark:text-muted md:flex-row"
      >
        <p>© {{ new Date().getFullYear() }} WAXTU INTERNATIONAL. DAKAR — SÉNÉGAL.</p>
        <div class="flex flex-wrap justify-center gap-x-6 gap-y-2 md:gap-8">
          <NuxtLink
            to="/mentions-legales"
            class="inline-flex min-h-[40px] items-center transition hover:text-white dark:hover:text-foreground"
          >
            Mentions légales
          </NuxtLink>
          <NuxtLink to="/cgv" class="inline-flex min-h-[40px] items-center transition hover:text-white dark:hover:text-foreground">
            CGV
          </NuxtLink>
          <NuxtLink
            to="/politique-confidentialite"
            class="inline-flex min-h-[40px] items-center transition hover:text-white dark:hover:text-foreground"
          >
            Confidentialité
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
