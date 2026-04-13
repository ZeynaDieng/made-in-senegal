<script setup lang="ts">
import type { CmsLegalPage, WaxtuCms } from '../../types/cms'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const cms = ref<WaxtuCms | null>(null)
const status = ref<string | null>(null)
const drawer = ref<string | null>(null)

const rows = [
  {
    id: 'checkout',
    title: 'Valider la commande',
    hint: 'Textes de la page panier avant le paiement.',
  },
  {
    id: 'redirect',
    title: 'Redirection vers le paiement',
    hint: 'Message affiché quelques secondes avant le site sécurisé.',
  },
  {
    id: 'success',
    title: 'Merci après paiement',
    hint: 'Page de remerciement et numéro de commande.',
  },
  {
    id: 'contact',
    title: 'Page Contact',
    hint: 'Titres, adresse, téléphone (appel + WhatsApp), réseaux, email, libellés du formulaire.',
  },
  {
    id: 'nav',
    title: 'Menu vitrine',
    hint: 'Noms des liens (menu latéral et pied de page) — les URLs des pages ne changent pas.',
  },
  {
    id: 'lookbook',
    title: 'Page Lookbook',
    hint: 'Titre et quatre visuels (import fichiers ou URL) sur /lookbook.',
  },
  {
    id: 'heritage',
    title: 'Page Héritage',
    hint: 'Manifeste, bandeau, colonnes : textes + images (fichiers ou URL) sur /heritage.',
  },
  {
    id: 'legal:cgv',
    title: 'Conditions générales de vente',
    hint: 'Titre et paragraphes affichés sur le site.',
  },
  {
    id: 'legal:mentions',
    title: 'Mentions légales',
    hint: 'Titre et paragraphes.',
  },
  {
    id: 'legal:privacy',
    title: 'Politique de confidentialité',
    hint: 'Titre et paragraphes.',
  },
  {
    id: 'product',
    title: 'Fiche produit (boutique)',
    hint: 'Boutons et titres autour des photos et descriptions (pas le détail de chaque article).',
  },
  {
    id: 'storefront',
    title: 'Accueil boutique (nouveautés)',
    hint: 'Position du bloc nouveautés dans la landing.',
  },
  {
    id: 'account',
    title: 'Espace client (Mon compte)',
    hint: 'Titres, retour boutique, fidélité, favoris, libellés connexion / inscription.',
  },
] as const

const legalKey = computed(() => {
  const d = drawer.value
  if (!d?.startsWith('legal:')) return null
  return d.slice(6) as 'cgv' | 'mentions' | 'privacy'
})

function drawerTitle(id: string | null) {
  if (!id) return ''
  return rows.find((r) => r.id === id)?.title ?? ''
}

function paragraphText(page: CmsLegalPage) {
  return page.paragraphs.join('\n\n')
}

function setParagraphs(page: CmsLegalPage, raw: string) {
  const parts = raw.split(/\n\n+/).map((s) => s.trim()).filter(Boolean)
  page.paragraphs = parts.length ? parts : ['À compléter.']
}

function onLegalParagraphInput(e: Event) {
  const k = legalKey.value
  if (!cms.value || !k) return
  setParagraphs(cms.value.site.legal[k], (e.target as HTMLTextAreaElement).value)
}

const mediaBusy = ref<string | null>(null)
const mediaError = ref<string | null>(null)

async function onLookbookImageFile(idx: number, e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !cms.value) return
  const slot = cms.value.site.lookbook.images[idx]
  if (!slot) return
  mediaBusy.value = `lb-${idx}`
  mediaError.value = null
  try {
    slot.src = await uploadAdminMedia(file)
    await persistCms('Image enregistrée sur le site.')
  }
  catch (err: unknown) {
    const ex = err as { data?: { message?: string }; message?: string }
    mediaError.value = ex.data?.message || ex.message || 'Échec de l’envoi'
  }
  finally {
    mediaBusy.value = null
  }
}

type HeritageImageKey = 'filmPoster' | 'block1Image' | 'block2Image'

async function onHeritageImageFile(field: HeritageImageKey, e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !cms.value) return
  mediaBusy.value = `hg-${field}`
  mediaError.value = null
  try {
    cms.value.site.heritage[field] = await uploadAdminMedia(file)
    await persistCms('Image enregistrée sur le site.')
  }
  catch (err: unknown) {
    const ex = err as { data?: { message?: string }; message?: string }
    mediaError.value = ex.data?.message || ex.message || 'Échec de l’envoi'
  }
  finally {
    mediaBusy.value = null
  }
}

async function load() {
  const token = localStorage.getItem('waxtu-admin-token')
  cms.value = await $fetch<WaxtuCms>('/api/cms/admin', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

onMounted(load)

watch(drawer, () => {
  mediaError.value = null
})

/** Sauvegarde CMS (après upload média ou bouton « Enregistrer tout »). */
async function persistCms(message: string) {
  if (!cms.value) return
  const token = localStorage.getItem('waxtu-admin-token')
  cms.value = await $fetch<WaxtuCms>('/api/cms/admin', {
    method: 'PUT',
    body: cms.value,
    headers: { Authorization: `Bearer ${token}` },
  })
  await refreshNuxtData('waxtu-cms-public')
  status.value = message
  window.setTimeout(() => (status.value = null), 2800)
}

async function save() {
  await persistCms('Modifications enregistrées sur le site.')
}

const inp =
  'mt-1 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-gold dark:border-white/10 dark:text-paper'
const lab = 'block text-xs font-bold uppercase tracking-[0.2em] text-muted'

useHead({ title: 'Textes des pages — Admin WAXTU' })
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-8">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.35em] text-gold">Contenu visible</p>
        <h1 class="font-serif text-3xl text-ink dark:text-paper md:text-4xl">
          Textes des pages
        </h1>
        <p class="mt-1 max-w-xl text-sm text-muted">
          Modifiez les messages affichés sur la boutique, le paiement et les pages d’information. Une ligne vide entre deux blocs crée un nouveau paragraphe (pages légales).
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-wax bg-ink px-5 py-2.5 text-xs font-bold uppercase tracking-[0.28em] text-white transition hover:bg-gold dark:bg-paper dark:text-ink dark:hover:bg-gold dark:hover:text-white"
        @click="save"
      >
        Enregistrer tout
      </button>
    </header>

    <p v-if="status" class="text-sm text-gold">
      {{ status }}
    </p>

    <div v-if="cms" class="overflow-hidden rounded-wax border border-ink/10 bg-paper dark:border-white/10 dark:bg-ink">
      <table class="w-full text-left text-sm">
        <thead class="hidden border-b border-ink/10 bg-ink/[0.03] text-xs font-bold uppercase tracking-[0.2em] text-muted dark:border-white/10 dark:bg-white/[0.04] sm:table-header-group">
          <tr>
            <th class="px-4 py-3 font-semibold">
              Page
            </th>
            <th class="hidden px-4 py-3 font-semibold md:table-cell">
              À quoi ça sert
            </th>
            <th class="w-32 px-4 py-3 text-right font-semibold">
              Action
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-ink/10 dark:divide-white/10">
          <tr v-for="row in rows" :key="row.id" class="hover:bg-gold/[0.06] dark:hover:bg-white/[0.04]">
            <td class="px-4 py-4">
              <p class="font-medium text-ink dark:text-paper">
                {{ row.title }}
              </p>
              <p class="mt-1 text-xs text-muted md:hidden">
                {{ row.hint }}
              </p>
            </td>
            <td class="hidden px-4 py-4 text-muted md:table-cell">
              {{ row.hint }}
            </td>
            <td class="px-4 py-4 text-right">
              <button
                type="button"
                class="rounded-wax border border-ink/15 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink transition hover:border-gold dark:border-white/15 dark:text-paper"
                @click="drawer = row.id"
              >
                Modifier
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminDrawer :open="!!drawer" :title="drawerTitle(drawer)" @close="drawer = null">
      <template v-if="cms && drawer === 'checkout'">
        <div class="space-y-4">
          <label :class="lab">Titre principal<input v-model="cms.site.checkout.pageTitle" :class="inp"></label>
          <label :class="lab">Message panier vide<textarea v-model="cms.site.checkout.emptyCartMessage" rows="2" :class="inp" /></label>
          <label :class="lab">Lien  retour boutique <input v-model="cms.site.checkout.emptyCartLink" :class="inp"></label>
          <label :class="lab">Libellé sous-total<input v-model="cms.site.checkout.summarySubtotal" :class="inp"></label>
          <label :class="lab">Libellé total<input v-model="cms.site.checkout.summaryTotal" :class="inp"></label>
          <label :class="lab">Titre bloc coordonnées<input v-model="cms.site.checkout.coordTitle" :class="inp"></label>
          <label :class="lab">Texte d’aide sous le titre<textarea v-model="cms.site.checkout.coordHint" rows="2" :class="inp" /></label>
          <label :class="lab">Libellé email<input v-model="cms.site.checkout.emailLabel" :class="inp"></label>
          <label :class="lab">Exemple email<input v-model="cms.site.checkout.emailPlaceholder" :class="inp"></label>
          <label :class="lab">Libellé nom<input v-model="cms.site.checkout.nameLabel" :class="inp"></label>
          <label :class="lab">Libellé téléphone<input v-model="cms.site.checkout.phoneLabel" :class="inp"></label>
          <label :class="lab">Exemple téléphone<input v-model="cms.site.checkout.phonePlaceholder" :class="inp"></label>
          <label :class="lab">Titre encadré paiement<input v-model="cms.site.checkout.payTitle" :class="inp"></label>
          <label :class="lab">Texte sous le titre<textarea v-model="cms.site.checkout.payBody" rows="4" :class="inp" /></label>
          <label :class="lab">Texte du bouton principal<input v-model="cms.site.checkout.payButton" :class="inp"></label>
        </div>
      </template>

      <template v-else-if="cms && drawer === 'redirect'">
        <div class="space-y-4">
          <label :class="lab">Titre de l’onglet (navigateur)<input v-model="cms.site.redirect.pageTitle" :class="inp"></label>
          <label :class="lab">Grand titre<input v-model="cms.site.redirect.mainTitle" :class="inp"></label>
          <label :class="lab">Sous-titre<textarea v-model="cms.site.redirect.subtitle" rows="2" :class="inp" /></label>
          <label :class="lab">Message si la page ne s’ouvre pas<textarea v-model="cms.site.redirect.manualHint" rows="2" :class="inp" /></label>
          <label :class="lab">Texte du lien manuel<input v-model="cms.site.redirect.manualLink" :class="inp"></label>
          <label :class="lab">Lien retour<input v-model="cms.site.redirect.backLink" :class="inp"></label>
        </div>
      </template>

      <template v-else-if="cms && drawer === 'success'">
        <div class="space-y-4">
          <label :class="lab">Petit surtitre (ligne dorée)<input v-model="cms.site.success.kicker" :class="inp"></label>
          <label :class="lab">Titre principal<input v-model="cms.site.success.title" :class="inp"></label>
          <label :class="lab">Texte principal<textarea v-model="cms.site.success.subtitle" rows="4" :class="inp" /></label>
          <label :class="lab">Libellé  référence <input v-model="cms.site.success.refLabel" :class="inp"></label>
          <label :class="lab">Libellé montant <input v-model="cms.site.success.amountLabel" :class="inp"></label>
          <label :class="lab">Texte sous la référence<textarea v-model="cms.site.success.refHint" rows="3" :class="inp" /></label>
          <label :class="lab">Bouton retour boutique<input v-model="cms.site.success.ctaLabel" :class="inp"></label>
          <label :class="lab">Lien d’aide (texte)<input v-model="cms.site.success.helpLink" :class="inp"></label>
        </div>
      </template>

      <template v-else-if="cms && drawer === 'contact'">
        <div class="space-y-4">
          <label :class="lab">Titre navigateur<input v-model="cms.site.contact.pageTitle" :class="inp"></label>
          <label :class="lab">Grand titre<input v-model="cms.site.contact.heading" :class="inp"></label>
          <label :class="lab">Citation<textarea v-model="cms.site.contact.quote" rows="3" :class="inp" /></label>
          <label :class="lab">Adresse (ligne affichée)<input v-model="cms.site.contact.address" :class="inp"></label>
          <label :class="lab">Téléphone (affiché, appel et WhatsApp)<input v-model="cms.site.contact.phone" :class="inp" placeholder="+221 …"></label>
          <p class="text-xs text-muted">
            Le même numéro génère les liens « appeler » et WhatsApp sur la page contact, dans le menu et le pied de page.
          </p>
          <label :class="lab">Lien Instagram (URL complète)<input v-model="cms.site.contact.instagramUrl" type="url" :class="inp" placeholder="https://www.instagram.com/…"></label>
          <label :class="lab">Lien Facebook (URL complète)<input v-model="cms.site.contact.facebookUrl" type="url" :class="inp" placeholder="https://www.facebook.com/…"></label>
          <label :class="lab">Email<input v-model="cms.site.contact.email" :class="inp"></label>
          <label :class="lab">Libellé prénom<input v-model="cms.site.contact.formFirstName" :class="inp"></label>
          <label :class="lab">Libellé nom<input v-model="cms.site.contact.formLastName" :class="inp"></label>
          <label :class="lab">Libellé email (formulaire)<input v-model="cms.site.contact.formEmail" :class="inp"></label>
          <label :class="lab">Libellé message<input v-model="cms.site.contact.formMessage" :class="inp"></label>
          <label :class="lab">Texte du bouton envoyer<input v-model="cms.site.contact.submitLabel" :class="inp"></label>
        </div>
      </template>

      <template v-else-if="cms && drawer === 'nav'">
        <div class="space-y-4">
          <p class="text-xs text-muted">
            Libellés visibles dans le menu principal et sous « Navigation » dans le pied de page. Les chemins (/shop, /lookbook, etc.) restent inchangés.
          </p>
          <label :class="lab">Accueil<input v-model="cms.site.nav.home" :class="inp"></label>
          <label :class="lab">Boutique<input v-model="cms.site.nav.shop" :class="inp"></label>
          <label :class="lab">Lookbook<input v-model="cms.site.nav.lookbook" :class="inp"></label>
          <label :class="lab">Héritage<input v-model="cms.site.nav.heritage" :class="inp"></label>
          <label :class="lab">Contact<input v-model="cms.site.nav.contact" :class="inp"></label>
        </div>
      </template>

      <template v-else-if="cms && drawer === 'lookbook'">
        <div class="space-y-4">
          <label :class="lab">Titre navigateur<input v-model="cms.site.lookbook.pageTitle" :class="inp"></label>
          <label :class="lab">Grand titre sur la page<input v-model="cms.site.lookbook.heading" :class="inp"></label>
          <p class="text-xs text-muted">
            Quatre visuels (grille identique au site). Importez des fichiers (JPEG, PNG, WebP, GIF) — vous pouvez aussi coller une URL si besoin.
          </p>
          <p v-if="mediaError" class="text-xs text-red-600 dark:text-red-400" role="alert">
            {{ mediaError }}
          </p>
          <div
            v-for="(img, idx) in cms.site.lookbook.images"
            :key="idx"
            class="space-y-3 rounded-wax border border-ink/10 p-3 dark:border-white/10"
          >
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              Visuel {{ idx + 1 }}
            </p>
            <div
              v-if="img.src"
              class="h-28 w-full max-w-xs overflow-hidden rounded-wax border border-ink/10 dark:border-white/10"
            >
              <img :src="img.src" alt="" class="h-full w-full object-cover">
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                class="max-w-xs text-xs text-muted file:mr-2 file:rounded-wax file:border file:border-ink/15 file:bg-paper file:px-3 file:py-2 file:text-[10px] file:font-bold file:uppercase dark:file:border-white/15 dark:file:bg-ink"
                :disabled="mediaBusy === `lb-${idx}`"
                @change="onLookbookImageFile(idx, $event)"
              >
              <span v-if="mediaBusy === `lb-${idx}`" class="text-xs text-gold">Envoi…</span>
            </div>
            <label :class="lab">URL directe (optionnel)<input v-model="img.src" type="url" :class="inp" placeholder="https://…"></label>
            <label :class="lab">Texte alternatif (alt)<input v-model="img.alt" :class="inp"></label>
          </div>
        </div>
      </template>

      <template v-else-if="cms && drawer === 'heritage'">
        <div class="max-h-[min(70vh,32rem)] space-y-4 overflow-y-auto pr-1">
          <p v-if="mediaError" class="text-xs text-red-600 dark:text-red-400" role="alert">
            {{ mediaError }}
          </p>
          <label :class="lab">Titre navigateur<input v-model="cms.site.heritage.pageTitle" :class="inp"></label>
          <label :class="lab">Surtitre (ligne dorée)<input v-model="cms.site.heritage.eyebrow" :class="inp"></label>
          <label :class="lab">Grand titre manifeste<input v-model="cms.site.heritage.manifestTitle" :class="inp"></label>
          <label :class="lab">Paragraphe sous le titre<textarea v-model="cms.site.heritage.manifestBody" rows="4" :class="inp" /></label>
          <label :class="lab">Texte sous l’icône lecture (bandeau)<input v-model="cms.site.heritage.filmLabel" :class="inp"></label>
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            Image de fond du bandeau
          </p>
          <div
            v-if="cms.site.heritage.filmPoster"
            class="h-28 w-full max-w-md overflow-hidden rounded-wax border border-ink/10 dark:border-white/10"
          >
            <img :src="cms.site.heritage.filmPoster" alt="" class="h-full w-full object-cover">
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="max-w-xs text-xs text-muted file:mr-2 file:rounded-wax file:border file:border-ink/15 file:bg-paper file:px-3 file:py-2 file:text-[10px] file:font-bold file:uppercase dark:file:border-white/15 dark:file:bg-ink"
              :disabled="mediaBusy === 'hg-filmPoster'"
              @change="onHeritageImageFile('filmPoster', $event)"
            >
            <span v-if="mediaBusy === 'hg-filmPoster'" class="text-xs text-gold">Envoi…</span>
          </div>
          <label :class="lab">URL directe (optionnel)<input v-model="cms.site.heritage.filmPoster" type="url" :class="inp" placeholder="https://…"></label>
          <label :class="lab">Alt image bandeau<input v-model="cms.site.heritage.filmPosterAlt" :class="inp"></label>
          <hr class="border-ink/10 dark:border-white/10">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            Colonne gauche
          </p>
          <label :class="lab">Titre<input v-model="cms.site.heritage.block1Title" :class="inp"></label>
          <label :class="lab">Texte<textarea v-model="cms.site.heritage.block1Body" rows="4" :class="inp" /></label>
          <div
            v-if="cms.site.heritage.block1Image"
            class="h-28 w-full max-w-xs overflow-hidden rounded-wax border border-ink/10 dark:border-white/10"
          >
            <img :src="cms.site.heritage.block1Image" alt="" class="h-full w-full object-cover">
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="max-w-xs text-xs text-muted file:mr-2 file:rounded-wax file:border file:border-ink/15 file:bg-paper file:px-3 file:py-2 file:text-[10px] file:font-bold file:uppercase dark:file:border-white/15 dark:file:bg-ink"
              :disabled="mediaBusy === 'hg-block1Image'"
              @change="onHeritageImageFile('block1Image', $event)"
            >
            <span v-if="mediaBusy === 'hg-block1Image'" class="text-xs text-gold">Envoi…</span>
          </div>
          <label :class="lab">URL directe (optionnel)<input v-model="cms.site.heritage.block1Image" type="url" :class="inp" placeholder="https://…"></label>
          <label :class="lab">Alt image<input v-model="cms.site.heritage.block1ImageAlt" :class="inp"></label>
          <hr class="border-ink/10 dark:border-white/10">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            Colonne droite
          </p>
          <label :class="lab">Titre<input v-model="cms.site.heritage.block2Title" :class="inp"></label>
          <label :class="lab">Texte<textarea v-model="cms.site.heritage.block2Body" rows="4" :class="inp" /></label>
          <div
            v-if="cms.site.heritage.block2Image"
            class="h-28 w-full max-w-xs overflow-hidden rounded-wax border border-ink/10 dark:border-white/10"
          >
            <img :src="cms.site.heritage.block2Image" alt="" class="h-full w-full object-cover">
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="max-w-xs text-xs text-muted file:mr-2 file:rounded-wax file:border file:border-ink/15 file:bg-paper file:px-3 file:py-2 file:text-[10px] file:font-bold file:uppercase dark:file:border-white/15 dark:file:bg-ink"
              :disabled="mediaBusy === 'hg-block2Image'"
              @change="onHeritageImageFile('block2Image', $event)"
            >
            <span v-if="mediaBusy === 'hg-block2Image'" class="text-xs text-gold">Envoi…</span>
          </div>
          <label :class="lab">URL directe (optionnel)<input v-model="cms.site.heritage.block2Image" type="url" :class="inp" placeholder="https://…"></label>
          <label :class="lab">Alt image<input v-model="cms.site.heritage.block2ImageAlt" :class="inp"></label>
        </div>
      </template>

      <template v-else-if="cms && legalKey">
        <div class="space-y-4">
          <label :class="lab">Titre de la page<input v-model="cms.site.legal[legalKey].title" :class="inp"></label>
          <label :class="lab">
            Paragraphes
            <textarea
              rows="14"
              :class="inp"
              :value="paragraphText(cms.site.legal[legalKey])"
              @input="onLegalParagraphInput"
            />
          </label>
        </div>
      </template>

      <template v-else-if="cms && drawer === 'product'">
        <div class="space-y-4">
          <label :class="lab">Texte  en stock <input v-model="cms.site.productPage.inStock" :class="inp"></label>
          <label :class="lab">Séparateur avant le chiffre (ex. ·)<input v-model="cms.site.productPage.stockSeparator" :class="inp"></label>
          <label :class="lab">Bouton ajouter au panier<input v-model="cms.site.productPage.addToCart" :class="inp"></label>
          <label :class="lab">Bloc livraison — titre<input v-model="cms.site.productPage.deliveryTitle" :class="inp"></label>
          <label :class="lab">Bloc livraison — sous-titre<input v-model="cms.site.productPage.deliverySub" :class="inp"></label>
          <label :class="lab">Bloc garantie — titre<input v-model="cms.site.productPage.warrantyTitle" :class="inp"></label>
          <label :class="lab">Bloc garantie — sous-titre<input v-model="cms.site.productPage.warrantySub" :class="inp"></label>
          <label :class="lab">Surtitre section histoire<input v-model="cms.site.productPage.blockKicker" :class="inp"></label>
          <label :class="lab">Titre section histoire<input v-model="cms.site.productPage.blockTitle" :class="inp"></label>
          <label :class="lab">Titre  matières <input v-model="cms.site.productPage.matieresTitle" :class="inp"></label>
          <label :class="lab">Texte matières <textarea v-model="cms.site.productPage.matieresBody" rows="3" :class="inp" /></label>
          <label :class="lab">Titre au-dessus de l’histoire produit<input v-model="cms.site.productPage.storyBlockTitle" :class="inp"></label>
          <label :class="lab">Titre fiche technique<input v-model="cms.site.productPage.ficheTitle" :class="inp"></label>
          <label :class="lab">Titre avis<input v-model="cms.site.productPage.avisTitle" :class="inp"></label>
          <label :class="lab">Message si aucun avis<textarea v-model="cms.site.productPage.noReviews" rows="2" :class="inp" /></label>
          <label :class="lab">Titre  complétez votre style <input v-model="cms.site.productPage.crossSellTitle" :class="inp"></label>
          <label :class="lab">Lien sous les produits associés<input v-model="cms.site.productPage.crossSellCta" :class="inp"></label>
        </div>
      </template>

      <template v-else-if="cms && drawer === 'storefront'">
        <div class="space-y-4">
          <label :class="lab">
            Emplacement du bloc nouveautés
            <select v-model="cms.site.storefront.newArrivalsPlacement" :class="inp">
              <option value="hidden">
                Masquer le bloc nouveautés
              </option>
              <option value="after_hero">
                Juste après le hero
              </option>
              <option value="after_trust">
                Après le bandeau confiance
              </option>
            </select>
          </label>
        </div>
      </template>

      <template v-else-if="cms && drawer === 'account'">
        <div class="space-y-4">
          <label :class="lab">Titre de l’onglet (navigateur)<input v-model="cms.site.account.pageTitle" :class="inp"></label>
          <label :class="lab">Grand titre de la page<input v-model="cms.site.account.pageHeading" :class="inp"></label>
          <label :class="lab">Libellé du lien retour boutique<input v-model="cms.site.account.backToShopLabel" :class="inp"></label>
          <label :class="lab">Lien retour (chemin interne, ex. /shop)<input v-model="cms.site.account.backToShopHref" :class="inp"></label>
          <label :class="lab">Texte avant l’email (connecté)<input v-model="cms.site.account.connectedPrefix" :class="inp"></label>
          <label :class="lab">Surtitre fidélité<input v-model="cms.site.account.loyaltyKicker" :class="inp"></label>
          <label :class="lab">Texte d’aide fidélité<textarea v-model="cms.site.account.loyaltyHint" rows="3" :class="inp" /></label>
          <label :class="lab">Surtitre favoris<input v-model="cms.site.account.favoritesKicker" :class="inp"></label>
          <label :class="lab">Bouton déconnexion<input v-model="cms.site.account.logoutLabel" :class="inp"></label>
          <label :class="lab">Onglet connexion<input v-model="cms.site.account.loginTab" :class="inp"></label>
          <label :class="lab">Onglet inscription<input v-model="cms.site.account.registerTab" :class="inp"></label>
          <label :class="lab">Bouton se connecter<input v-model="cms.site.account.loginSubmit" :class="inp"></label>
          <label :class="lab">Bouton créer le compte<input v-model="cms.site.account.registerSubmit" :class="inp"></label>
          <label :class="lab">Libellé mot de passe inscription<textarea v-model="cms.site.account.registerPasswordHint" rows="2" :class="inp" /></label>
          <label :class="lab">Libellé email (formulaires)<input v-model="cms.site.account.formEmailLabel" :class="inp"></label>
          <label :class="lab">Libellé mot de passe<input v-model="cms.site.account.formPasswordLabel" :class="inp"></label>
          <label :class="lab">Libellé confirmation mot de passe<input v-model="cms.site.account.formPasswordConfirmLabel" :class="inp"></label>
        </div>
      </template>

      <template #footer>
        <div class="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            class="rounded-wax border border-ink/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink dark:border-white/15 dark:text-paper"
            @click="drawer = null"
          >
            Fermer
          </button>
          <button
            type="button"
            class="rounded-wax bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white dark:bg-paper dark:text-ink"
            @click="save(); drawer = null"
          >
            Enregistrer
          </button>
        </div>
      </template>
    </AdminDrawer>
  </div>
</template>
