<script setup lang="ts">
import { Facebook, Instagram, Loader2, Mail, MapPin, MessageCircle, Phone } from 'lucide-vue-next'
import { contactTelHref, contactWhatsappHref } from '../utils/contact-links'

const { data: cms } = await usePublicCms()
const ct = computed(() => cms.value?.site.contact)

const telHref = computed(() => contactTelHref(ct.value?.phone ?? ''))
const waHref = computed(() => contactWhatsappHref(ct.value?.phone ?? ''))
const igHref = computed(() => (ct.value?.instagramUrl?.trim() ? ct.value.instagramUrl.trim() : ''))
const fbHref = computed(() => (ct.value?.facebookUrl?.trim() ? ct.value.facebookUrl.trim() : ''))

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const message = ref('')
const busy = ref(false)
const feedback = ref<{ ok: boolean; text: string } | null>(null)

async function submit() {
  feedback.value = null
  busy.value = true
  try {
    await $fetch('/api/contact-leads', {
      method: 'POST',
      body: {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        message: message.value,
      },
    })
    feedback.value = { ok: true, text: 'Merci. Notre équipe vous répondra très bientôt.' }
    firstName.value = ''
    lastName.value = ''
    email.value = ''
    message.value = ''
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; message?: string }
    const msg = err?.data?.statusMessage || err?.message || 'Envoi impossible. Réessayez plus tard.'
    feedback.value = { ok: false, text: msg }
  }
  finally {
    busy.value = false
  }
}

useHead(() => ({
  title: ct.value?.pageTitle || 'Conciergerie — WAXTU',
}))
</script>

<template>
  <section class="pb-[max(4rem,env(safe-area-inset-bottom))] pt-20 md:pb-24 md:pt-28">
    <div class="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 md:grid-cols-2 md:gap-16 md:px-8 lg:gap-24">
      <div class="space-y-6 md:space-y-8">
        <h2 class="font-serif text-3xl text-ink dark:text-paper sm:text-4xl md:text-6xl lg:text-7xl">
          {{ ct?.heading }}
        </h2>
        <p class="text-base font-light italic leading-relaxed text-muted md:text-lg lg:text-xl">
          {{ ct?.quote }}
        </p>
        <div class="space-y-6">
          <div class="flex items-start gap-4">
            <MapPin class="mt-0.5 h-7 w-7 shrink-0 text-gold md:h-8 md:w-8" :stroke-width="1" />
            <span class="text-xs font-bold uppercase tracking-[0.28em] text-ink dark:text-paper">
              {{ ct?.address }}
            </span>
          </div>
          <div class="flex items-start gap-4">
            <Phone class="mt-0.5 h-7 w-7 shrink-0 text-gold md:h-8 md:w-8" :stroke-width="1" />
            <div class="space-y-2 text-xs font-bold uppercase tracking-[0.28em] text-ink dark:text-paper">
              <a
                v-if="telHref"
                :href="telHref"
                class="block transition hover:text-gold"
              >{{ ct?.phone }}</a>
              <span v-else>{{ ct?.phone }}</span>
              <a
                v-if="waHref"
                :href="waHref"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] text-gold transition hover:underline"
              >
                <MessageCircle class="h-4 w-4 shrink-0" :stroke-width="1.5" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <Mail class="mt-0.5 h-7 w-7 shrink-0 text-gold md:h-8 md:w-8" :stroke-width="1" />
            <a
              v-if="ct?.email"
              class="break-all text-xs font-bold uppercase tracking-[0.28em] text-ink transition hover:text-gold dark:text-paper"
              :href="`mailto:${ct.email}`"
            >{{ ct.email }}</a>
          </div>
          <div
            v-if="igHref || fbHref"
            class="flex flex-wrap items-center gap-5 border-t border-ink/10 pt-6 dark:border-white/10"
          >
            <a
              v-if="igHref"
              :href="igHref"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-ink transition hover:text-gold dark:text-paper"
              aria-label="Instagram WAXTU"
            >
              <Instagram class="h-6 w-6 text-gold" :stroke-width="1.25" aria-hidden="true" />
              Instagram
            </a>
            <a
              v-if="fbHref"
              :href="fbHref"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-ink transition hover:text-gold dark:text-paper"
              aria-label="Facebook WAXTU"
            >
              <Facebook class="h-6 w-6 text-gold" :stroke-width="1.25" aria-hidden="true" />
              Facebook
            </a>
          </div>
        </div>
      </div>
      <form
        class="space-y-5 rounded-wax bg-paper p-5 shadow-lift dark:bg-night sm:p-6 md:space-y-6 md:p-8"
        @submit.prevent="submit"
      >
        <p
          v-if="feedback"
          class="rounded-wax border px-4 py-3 text-sm"
          :class="feedback.ok ? 'border-gold/40 bg-gold/10 text-ink dark:text-paper' : 'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200'"
          role="status"
        >
          {{ feedback.text }}
        </p>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label class="space-y-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
            {{ ct?.formFirstName }}
            <input
              v-model="firstName"
              required
              autocomplete="given-name"
              class="min-h-[44px] w-full border-b border-ink/10 bg-transparent py-2 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:text-paper"
            >
          </label>
          <label class="space-y-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
            {{ ct?.formLastName }}
            <input
              v-model="lastName"
              required
              autocomplete="family-name"
              class="min-h-[44px] w-full border-b border-ink/10 bg-transparent py-2 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:text-paper"
            >
          </label>
        </div>
        <label class="block space-y-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
          {{ ct?.formEmail || 'Email' }}
          <input
            v-model="email"
            required
            type="email"
            autocomplete="email"
            class="min-h-[44px] w-full border-b border-ink/10 bg-transparent py-2 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:text-paper"
          >
        </label>
        <label class="block space-y-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
          {{ ct?.formMessage }}
          <textarea
            v-model="message"
            required
            minlength="10"
            rows="5"
            class="min-h-[8rem] w-full resize-none border-b border-ink/10 bg-transparent py-2 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:text-paper"
          />
        </label>
        <button
          type="submit"
          :disabled="busy"
          class="flex min-h-[48px] w-full items-center justify-center gap-2 bg-ink py-4 text-[10px] font-bold uppercase tracking-[0.35em] text-white transition duration-500 hover:bg-gold disabled:opacity-60 dark:bg-paper dark:text-ink dark:hover:bg-gold dark:hover:text-white md:py-5"
        >
          <Loader2 v-if="busy" class="h-4 w-4 animate-spin" aria-hidden="true" />
          {{ ct?.submitLabel }}
        </button>
      </form>
    </div>
  </section>
</template>
