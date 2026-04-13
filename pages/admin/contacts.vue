<script setup lang="ts">
import { Mail } from 'lucide-vue-next'
import type { WaxtuContactLead } from '../../types/contact-lead'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const leads = ref<WaxtuContactLead[]>([])
const total = ref(0)
const error = ref<string | null>(null)
const selectedLead = ref<WaxtuContactLead | null>(null)

async function load() {
  error.value = null
  try {
    const token = localStorage.getItem('waxtu-admin-token')
    if (!token) return
    const res = await $fetch<{ leads: WaxtuContactLead[]; total: number }>('/api/contact-leads/admin', {
      headers: { Authorization: `Bearer ${token}` },
    })
    leads.value = res.leads
    total.value = res.total
  }
  catch {
    error.value = 'Impossible de charger les messages.'
  }
}

onMounted(load)

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  }
  catch {
    return iso
  }
}

function messagePlain(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function mailtoHref(lead: WaxtuContactLead) {
  const subject = encodeURIComponent('WAXTU — réponse à votre message')
  let body = `Bonjour ${lead.firstName},\n\n\n(— Message initial —)\n${lead.message.trim()}`
  if (body.length > 1600) body = `${body.slice(0, 1600)}\n\n[… texte tronqué — voir le panneau pour l’intégralité]`
  const bodyQ = encodeURIComponent(body)
  return `mailto:${lead.email}?subject=${subject}&body=${bodyQ}`
}

function closeLeadDrawer() {
  selectedLead.value = null
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <p class="text-xs font-bold uppercase tracking-[0.28em] text-gold">
        Conciergerie
      </p>
      <h1 class="mt-2 font-serif text-3xl text-ink dark:text-paper">
        Demandes de contact
      </h1>
      <p class="mt-2 max-w-2xl text-sm text-muted">
        Messages enregistrés depuis la page Contact ({{ total }} au total). Si Resend est configuré sur le serveur, une
        copie est aussi envoyée à l’adresse boutique (<code class="rounded bg-ink/5 px-1 text-xs dark:bg-white/10">NUXT_MAIL_TO_SHOP</code>).
        Un aperçu reste dans le tableau ; <strong class="font-medium text-ink dark:text-paper">Voir</strong> ouvre le
        texte complet.
      </p>
    </div>

    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </p>

    <div v-else-if="!leads.length" class="rounded-wax border border-ink/10 bg-paper px-6 py-10 text-center text-sm text-muted dark:border-white/10 dark:bg-night">
      Aucun message pour le moment.
    </div>

    <div v-else class="overflow-x-auto rounded-wax border border-ink/10 dark:border-white/10">
      <table class="table-fixed w-full min-w-[52rem] border-collapse text-left text-sm">
        <colgroup>
          <col style="width: 10.5rem">
          <col style="width: 10rem">
          <col style="width: 12rem">
          <col>
          <col style="width: 5.25rem">
        </colgroup>
        <thead>
          <tr class="border-b border-ink/10 bg-ink/[0.03] text-[10px] font-bold uppercase tracking-[0.2em] text-muted dark:border-white/10 dark:bg-white/[0.04]">
            <th class="px-4 py-3">
              Date
            </th>
            <th class="px-4 py-3">
              Nom
            </th>
            <th class="px-4 py-3">
              Email
            </th>
            <th class="px-4 py-3">
              Message
            </th>
            <th class="px-3 py-3 text-center">
              Voir
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="l in leads"
            :key="l.id"
            class="border-b border-ink/10 align-top dark:border-white/10"
          >
            <td class="whitespace-nowrap px-4 py-3 text-muted">
              {{ formatDate(l.createdAt) }}
            </td>
            <td class="min-w-0 px-4 py-3 text-ink dark:text-paper">
              <span class="line-clamp-2 break-words">{{ l.firstName }} {{ l.lastName }}</span>
            </td>
            <td class="min-w-0 px-4 py-3">
              <a
                :href="`mailto:${l.email}?subject=${encodeURIComponent('WAXTU — votre message')}`"
                class="inline-flex max-w-full items-center gap-1 break-all text-gold underline"
              >
                <Mail class="h-3.5 w-3.5 shrink-0" />
                <span class="min-w-0">{{ l.email }}</span>
              </a>
            </td>
            <td class="min-w-0 px-4 py-3">
              <p
                class="line-clamp-2 overflow-hidden text-xs leading-snug text-muted break-words hyphens-auto"
                :title="messagePlain(l.message)"
              >
                {{ messagePlain(l.message) }}
              </p>
            </td>
            <td class="px-3 py-3 text-center">
              <button
                type="button"
                class="rounded-wax border border-ink/15 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold transition hover:border-gold hover:bg-gold/5 dark:border-white/15"
                @click="selectedLead = l"
              >
                Voir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminDrawer
      :open="!!selectedLead"
      :title="selectedLead ? `Message — ${selectedLead.firstName} ${selectedLead.lastName}` : 'Message'"
      @close="closeLeadDrawer"
    >
      <template v-if="selectedLead">
        <p class="text-xs text-muted">
          {{ formatDate(selectedLead.createdAt) }}
        </p>
        <a
          :href="`mailto:${selectedLead.email}?subject=${encodeURIComponent('WAXTU — votre message')}`"
          class="mt-2 inline-flex items-center gap-1 break-all text-sm text-gold underline"
        >
          <Mail class="h-4 w-4 shrink-0" />
          {{ selectedLead.email }}
        </a>
        <div
          class="mt-6 rounded-wax border border-ink/10 bg-ink/[0.02] p-4 text-sm leading-relaxed text-ink dark:border-white/10 dark:bg-white/[0.03] dark:text-paper"
        >
          <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
            Contenu du message
          </p>
          <p class="whitespace-pre-wrap break-words">
            {{ selectedLead.message.trim() }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            class="rounded-wax border border-ink/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink dark:border-white/15 dark:text-paper"
            @click="closeLeadDrawer"
          >
            Fermer
          </button>
          <a
            v-if="selectedLead"
            :href="mailtoHref(selectedLead)"
            class="rounded-wax bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white dark:bg-paper dark:text-ink"
          >
            Répondre par email
          </a>
        </div>
      </template>
    </AdminDrawer>
  </div>
</template>
