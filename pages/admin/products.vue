<script setup lang="ts">
import type { CmsProduct, WaxtuCms } from '../../types/cms'
import { productOnPromotion, productPromoPercentOff } from '../../utils/product-promo'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const cms = ref<WaxtuCms | null>(null)
const status = ref<string | null>(null)
const uploadingProductId = ref<number | null>(null)
const imageUploadErrors = reactive<Record<number, string>>({})
const pendingImageUrl = reactive<Record<number, string>>({})
const selectedId = ref<number | null>(null)
const GENDER_OPTIONS = [
  { id: 'homme', label: 'Homme' },
  { id: 'femme', label: 'Femme' },
  { id: 'unisexe', label: 'Unisexe' },
] as const

const selectedProduct = computed(() => {
  if (!cms.value || selectedId.value == null) return null
  return cms.value.products.find((p) => p.id === selectedId.value) ?? null
})

/** v-model fiable pour `compareAtPrice` (évite chaînes / NaN qui cassent la promo au save). */
const compareAtModel = computed({
  get(): number | undefined {
    const p = selectedProduct.value
    if (!p) return undefined
    const v = p.compareAtPrice
    if (typeof v !== 'number' || Number.isNaN(v)) return undefined
    return v
  },
  set(v: number | string | undefined | null) {
    const p = selectedProduct.value
    if (!p) return
    if (v === '' || v == null || (typeof v === 'number' && Number.isNaN(v))) {
      delete p.compareAtPrice
      return
    }
    const n = typeof v === 'number' ? v : Number(v)
    if (!Number.isFinite(n) || n <= 0) {
      delete p.compareAtPrice
      return
    }
    p.compareAtPrice = Math.round(n)
  },
})

async function load() {
  const token = localStorage.getItem('waxtu-admin-token')
  cms.value = await $fetch<WaxtuCms>('/api/cms/admin', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

onMounted(load)

function nextProductId(products: CmsProduct[]) {
  return products.reduce((max, p) => Math.max(max, p.id), 0) + 1
}

function openProduct(id: number) {
  selectedId.value = id
}

function firstCategory() {
  const c = cms.value?.categories[0]
  return { id: c?.id ?? 'autres', name: c?.name ?? 'Autres' }
}

function syncProductCategoryLabel(p: { categoryId: string; category: string }) {
  const c = cms.value?.categories.find((x) => x.id === p.categoryId)
  if (c) p.category = c.name
}

function addProduct() {
  if (!cms.value) return
  const id = nextProductId(cms.value.products)
  const cat = firstCategory()
  cms.value.products.push({
    id,
    name: 'Nouveau produit',
    createdAt: new Date().toISOString(),
    categoryId: cat.id,
    category: cat.name,
    genre: 'unisexe',
    price: 0,
    forSale: false,
    stock: 0,
    tagline: '',
    images: [],
    description: '',
    story: '',
    details: [],
    reviews: [],
  })
  selectedId.value = id
  status.value = 'Produit créé — complétez la fiche puis enregistrez.'
  window.setTimeout(() => (status.value = null), 3200)
}

function removeProduct(p: CmsProduct) {
  if (!cms.value) return
  if (!confirm(`Retirer ${p.name}  du catalogue ?`)) return
  cms.value.products = cms.value.products.filter((x) => x.id !== p.id)
  if (selectedId.value === p.id) selectedId.value = null
}

function removeImageAt(p: CmsProduct, index: number) {
  p.images.splice(index, 1)
}

function markAsNewToday(p: CmsProduct) {
  p.createdAt = new Date().toISOString()
  status.value = 'Produit marqué comme nouveauté.'
  window.setTimeout(() => (status.value = null), 2200)
}

async function onProductImageFile(p: CmsProduct, e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  delete imageUploadErrors[p.id]
  uploadingProductId.value = p.id
  try {
    const url = await uploadAdminMedia(file)
    p.images.push(url)
    await persistCatalog('Photo enregistrée — elle s’affiche maintenant sur la boutique.')
  }
  catch (err: unknown) {
    const e2 = err as { data?: { message?: string }; message?: string }
    imageUploadErrors[p.id] = e2.data?.message || e2.message || 'Échec de l’envoi'
  }
  finally {
    uploadingProductId.value = null
  }
}

async function pushPendingImageUrl(p: CmsProduct) {
  const u = (pendingImageUrl[p.id] || '').trim()
  if (!u) return
  p.images.push(u)
  pendingImageUrl[p.id] = ''
  await persistCatalog('Photo (lien) enregistrée — visible sur la boutique.')
}

/** Envoie le CMS au serveur (obligatoire pour que les photos uploadées apparaissent sur le site). */
async function persistCatalog(successMessage: string) {
  if (!cms.value || !import.meta.client) return
  const token = localStorage.getItem('waxtu-admin-token')
  if (!token) return
  try {
    cms.value = await $fetch<WaxtuCms>('/api/cms/admin', {
      method: 'PUT',
      body: cms.value,
      headers: { Authorization: `Bearer ${token}` },
    })
    await refreshNuxtData('waxtu-cms-public')
    status.value = successMessage
    window.setTimeout(() => (status.value = null), 3200)
  }
  catch {
    status.value = 'Enregistrement impossible. Vérifiez la connexion ou reconnectez-vous à l’admin.'
    window.setTimeout(() => (status.value = null), 5000)
  }
}

async function save() {
  await persistCatalog('Catalogue enregistré.')
}

const formatPrice = useFormatPrice()
const formatDate = (iso?: string) => {
  const ts = Date.parse(String(iso ?? ''))
  if (!Number.isFinite(ts)) return '—'
  return new Date(ts).toLocaleDateString('fr-FR')
}

const cell = 'border-b border-ink/10 px-3 py-3 text-sm dark:border-white/10'
const inp =
  'mt-1 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10'
const lab = 'block text-xs font-bold uppercase tracking-[0.2em] text-muted'

useHead({ title: 'Produits — Admin WAXTU' })
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.35em] text-gold">Boutique</p>
        <h1 class="font-serif text-3xl text-ink dark:text-paper md:text-4xl">
          Produits
        </h1>
        <p class="mt-1 max-w-xl text-sm text-muted">
          Cliquez sur un produit pour le modifier. Cochez  visible sur le site  et mettez un stock pour la vente.
          <strong class="font-semibold text-ink dark:text-paper">Chaque photo envoyée est enregistrée automatiquement</strong>
          (plus besoin d’appuyer sur Enregistrer après un upload).
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-wax border border-ink/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-ink dark:border-white/15 dark:text-paper"
          @click="addProduct"
        >
          Ajouter
        </button>
        <button
          type="button"
          class="rounded-wax bg-ink px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white dark:bg-paper dark:text-ink"
          @click="save"
        >
          Enregistrer
        </button>
      </div>
    </div>

    <p v-if="status" class="text-sm text-gold">
      {{ status }}
    </p>

    <div v-if="cms" class="overflow-hidden rounded-wax border border-ink/10 bg-paper dark:border-white/10 dark:bg-ink">
      <div class="hidden md:block">
        <table class="w-full text-left">
          <thead class="border-b border-ink/10 bg-ink/[0.03] text-xs font-bold uppercase tracking-[0.2em] text-muted dark:border-white/10 dark:bg-white/[0.04]">
            <tr>
              <th class="px-3 py-3" />
              <th class="px-3 py-3">
                Nom
              </th>
              <th class="px-3 py-3">
                Catégorie
              </th>
              <th class="px-3 py-3">
                Genre
              </th>
              <th class="px-3 py-3">
                Ajouté
              </th>
              <th class="px-3 py-3">
                Prix
              </th>
              <th class="px-3 py-3">
                Stock
              </th>
              <th class="px-3 py-3">
                Vente
              </th>
              <th class="px-3 py-3 text-right" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in cms.products"
              :key="p.id"
              class="cursor-pointer transition hover:bg-gold/[0.07] dark:hover:bg-white/[0.05]"
              @click="openProduct(p.id)"
            >
              <td :class="cell">
                <img
                  v-if="p.images[0]"
                  :src="p.images[0]"
                  alt=""
                  class="h-12 w-12 rounded-wax object-cover"
                >
                <div v-else class="flex h-12 w-12 items-center justify-center rounded-wax bg-ink/5 text-[10px] text-muted dark:bg-white/10">
                  —
                </div>
              </td>
              <td :class="cell + ' font-medium text-ink dark:text-paper'">
                {{ p.name }}
              </td>
              <td :class="cell + ' text-muted'">
                {{ p.category }}
              </td>
              <td :class="cell + ' text-muted capitalize'">
                {{ p.genre }}
              </td>
              <td :class="cell + ' text-muted'">
                {{ formatDate(p.createdAt) }}
              </td>
              <td :class="cell">
                <span>{{ formatPrice(p.price) }}</span>
                <span
                  v-if="productOnPromotion(p)"
                  class="ml-2 inline-block rounded-pill bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase text-gold"
                >
                  −{{ productPromoPercentOff(p) }}&nbsp;%
                </span>
              </td>
              <td :class="cell">
                {{ p.stock }}
              </td>
              <td :class="cell">
                <span v-if="p.forSale && p.stock > 0" class="text-gold">Oui</span>
                <span v-else class="text-muted">Non</span>
              </td>
              <td :class="cell + ' text-right'">
                <button
                  type="button"
                  class="rounded-wax border border-ink/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] dark:border-white/15"
                  @click.stop="openProduct(p.id)"
                >
                  Modifier
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ul class="divide-y divide-ink/10 md:hidden dark:divide-white/10">
        <li
          v-for="p in cms.products"
          :key="p.id"
          class="flex items-center gap-3 px-4 py-3"
          @click="openProduct(p.id)"
        >
          <img v-if="p.images[0]" :src="p.images[0]" alt="" class="h-14 w-14 shrink-0 rounded-wax object-cover">
          <div class="min-w-0 flex-1">
            <p class="font-medium text-ink dark:text-paper">
              {{ p.name }}
            </p>
            <p class="text-xs text-muted">
              {{ p.category }} · {{ p.genre }} · {{ formatPrice(p.price) }} · {{ formatDate(p.createdAt) }}
            </p>
          </div>
          <span class="text-xs text-gold">{{ p.forSale && p.stock > 0 ? 'En ligne' : 'Hors ligne' }}</span>
        </li>
      </ul>
    </div>

    <AdminDrawer
      :open="!!selectedProduct"
      :title="selectedProduct ? `Produit : ${selectedProduct.name}` : ''"
      @close="selectedId = null"
    >
      <template v-if="selectedProduct">
        <div class="space-y-4 pb-4">
          <p
            v-if="!selectedProduct.images?.length"
            class="rounded-wax border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-50"
          >
            Aucune photo : choisissez un fichier image ou collez un lien, puis attendez le message de confirmation (enregistrement automatique).
          </p>
          <div class="flex justify-end">
            <button
              type="button"
              class="text-xs uppercase tracking-[0.2em] text-red-500 underline"
              @click="removeProduct(selectedProduct)"
            >
              Supprimer ce produit
            </button>
          </div>
          <label :class="lab">Nom<input v-model="selectedProduct.name" :class="inp"></label>
          <p class="text-[11px] text-muted">
            Ajouté le {{ formatDate(selectedProduct.createdAt) }}
          </p>
          <div class="flex justify-end">
            <button
              type="button"
              class="border-b border-ink/25 pb-1 text-[10px] font-bold uppercase tracking-[0.24em] text-ink transition hover:border-gold hover:text-gold dark:border-white/25 dark:text-paper"
              @click="markAsNewToday(selectedProduct)"
            >
              Marquer comme nouveauté (aujourd’hui)
            </button>
          </div>
          <label :class="lab">
            Catégorie
            <select
              v-model="selectedProduct.categoryId"
              :class="inp"
              @change="syncProductCategoryLabel(selectedProduct)"
            >
              <option v-for="c in cms?.categories ?? []" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </label>
          <label :class="lab">
            Genre
            <select v-model="selectedProduct.genre" :class="inp">
              <option v-for="g in GENDER_OPTIONS" :key="g.id" :value="g.id">
                {{ g.label }}
              </option>
            </select>
          </label>
          <div
            class="rounded-wax border border-ink/10 bg-ink/[0.03] p-4 text-xs leading-relaxed text-ink dark:border-white/10 dark:bg-white/[0.04] dark:text-paper"
          >
            <p class="font-bold uppercase tracking-[0.2em] text-gold">
              Promo sur ce produit
            </p>
            <ol class="mt-2 list-decimal space-y-1.5 pl-4 text-muted">
              <li>
                <strong class="text-ink dark:text-paper">Prix de vente</strong> : ce que le client paie pour une unité (affiché en gros sur la boutique).
              </li>
              <li>
                <strong class="text-ink dark:text-paper">Prix d’origine barré</strong> (optionnel) : un montant
                <em>plus élevé</em> que le prix de vente. La vitrine affiche alors le prix barré, le pourcentage d’économie et
                <strong class="text-ink dark:text-paper">le montant en FCFA économisé</strong> sur ce produit.
              </li>
              <li>
                Pour retirer la promo article : videz le champ « prix d’origine » puis enregistrez le catalogue.
              </li>
            </ol>
            <p class="mt-2 text-[11px] text-muted">
              La <strong class="text-ink dark:text-paper">promo globale</strong> (page Admin → Promotions) est une remise sur le
              <em>total du panier</em> au checkout : elle s’affiche en plus sur les fiches, avec le montant estimé pour une pièce seule.
            </p>
          </div>
          <label :class="lab">Prix de vente (FCFA)<input v-model.number="selectedProduct.price" type="number" min="0" :class="inp"></label>
          <label :class="lab">
            Prix d’origine barré (optionnel, FCFA)
            <input
              :key="selectedProduct.id"
              v-model.number="compareAtModel"
              type="number"
              min="0"
              step="1"
              :class="inp"
              placeholder="Ex. 55 000 si le prix de vente est 45 000"
            >
            <span class="mt-1 block text-[11px] font-normal normal-case tracking-normal text-muted">
              Obligatoirement <strong class="text-ink dark:text-paper">strictement supérieur</strong> au prix de vente, sinon il est ignoré.
            </span>
          </label>
          <label class="flex flex-row items-center gap-2" :class="lab">
            <input v-model="selectedProduct.forSale" type="checkbox" class="accent-gold">
            Visible et vendable sur le site
          </label>
          <label :class="lab">Quantité en stock<input v-model.number="selectedProduct.stock" type="number" min="0" :class="inp"></label>
          <label :class="lab">Phrase d’accroche<input v-model="selectedProduct.tagline" :class="inp"></label>
          <div>
            <p :class="lab + ' mb-2'">
              Photos
            </p>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(imgUrl, i) in selectedProduct.images"
                :key="`${selectedProduct.id}-${i}-${imgUrl.slice(-24)}`"
                class="group relative h-24 w-24 overflow-hidden rounded-wax border border-ink/10 dark:border-white/10"
              >
                <img :src="imgUrl" alt="" class="h-full w-full object-cover">
                <button
                  type="button"
                  class="absolute right-1 top-1 rounded bg-ink/85 px-1.5 py-0.5 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100"
                  title="Retirer"
                  @click="removeImageAt(selectedProduct, i)"
                >
                  ×
                </button>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                class="max-w-xs text-xs text-muted file:mr-2 file:rounded-wax file:border file:border-ink/15 file:bg-paper file:px-3 file:py-2 file:text-[10px] file:font-bold file:uppercase dark:file:border-white/15 dark:file:bg-ink"
                :disabled="uploadingProductId === selectedProduct.id"
                @change="onProductImageFile(selectedProduct, $event)"
              >
              <span v-if="uploadingProductId === selectedProduct.id" class="text-xs text-gold">Envoi…</span>
            </div>
            <p v-if="imageUploadErrors[selectedProduct.id]" class="mt-2 text-xs text-red-500" role="alert">
              {{ imageUploadErrors[selectedProduct.id] }}
            </p>
            <div class="mt-3 flex flex-wrap items-end gap-2">
              <label class="min-w-[10rem] flex-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                Lien photo (optionnel)
                <input
                  v-model="pendingImageUrl[selectedProduct.id]"
                  type="url"
                  class="mt-1 w-full rounded-wax border border-ink/10 bg-transparent px-2 py-1.5 font-mono text-[11px] dark:border-white/10"
                  placeholder="https://…"
                  @keydown.enter.prevent="pushPendingImageUrl(selectedProduct)"
                >
              </label>
              <button
                type="button"
                class="rounded-wax border border-ink/15 px-3 py-2 text-[10px] font-bold uppercase dark:border-white/15"
                @click="pushPendingImageUrl(selectedProduct)"
              >
                Ajouter le lien
              </button>
            </div>
          </div>
          <label :class="lab">Description<textarea v-model="selectedProduct.description" rows="3" :class="inp" /></label>
          <label :class="lab">Histoire / fabrication<textarea v-model="selectedProduct.story" rows="3" :class="inp" /></label>
        </div>
      </template>
      <template #footer>
        <div class="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            class="rounded-wax border border-ink/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] dark:border-white/15"
            @click="selectedId = null"
          >
            Fermer
          </button>
          <button
            type="button"
            class="rounded-wax bg-ink px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white dark:bg-paper dark:text-ink"
            @click="save(); selectedId = null"
          >
            Enregistrer
          </button>
        </div>
      </template>
    </AdminDrawer>
  </div>
</template>
