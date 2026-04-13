<script setup lang="ts">
import { Search, Sparkles } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { data: cms } = await usePublicCms()
const cmsImg = useCmsImg()
const cart = useCartStore()

/** Valeur réservée (aucun slug produit ne doit utiliser cet id). */
const ALL = '__all__'
const genderTabs = [
  { id: 'homme', name: 'Homme' },
  { id: 'femme', name: 'Femme' },
  { id: 'unisexe', name: 'Unisexe' },
] as const
const sortTabs = [
  { id: 'featured', name: 'Mise en avant' },
  { id: 'newest', name: 'Nouveautés' },
  { id: 'price-asc', name: 'Prix croissant' },
  { id: 'price-desc', name: 'Prix décroissant' },
  { id: 'name-asc', name: 'Nom A-Z' },
] as const

const categoryTabs = computed(() => {
  const list = cms.value?.categories ?? []
  return list.map((c) => ({ id: c.id, name: c.name }))
})

const activeCategories = ref<string[]>([])
const activeGenres = ref<string[]>([])
const activeSort = ref<(typeof sortTabs)[number]['id']>('featured')
const mobileCategoryOpen = ref(false)
const mobileGenreOpen = ref(false)
const mobileFiltersOpen = ref(false)
const minPrice = ref('')
const maxPrice = ref('')
const searchQuery = ref('')
const onlyNew = ref(false)

function applyCategoryFromQuery() {
  const raw = route.query.cat
  const chunks = typeof raw === 'string' ? raw.split(',').map((x) => x.trim()).filter(Boolean) : []
  const valid = categoryTabs.value.map((c) => c.id)
  activeCategories.value = chunks.filter((id) => valid.includes(id))
}

function applyGenreFromQuery() {
  const raw = route.query.genre
  const chunks = typeof raw === 'string' ? raw.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean) : []
  const normalized = chunks.map((idRaw) =>
    idRaw === 'hommes' ? 'homme'
      : idRaw === 'femmes' ? 'femme'
        : idRaw,
  )
  const valid = genderTabs.map((g) => g.id)
  activeGenres.value = normalized.filter((id) => valid.includes(id))
}

function applyPriceFromQuery() {
  const min = typeof route.query.min === 'string' ? route.query.min.trim() : ''
  const max = typeof route.query.max === 'string' ? route.query.max.trim() : ''
  minPrice.value = /^\d+$/.test(min) ? min : ''
  maxPrice.value = /^\d+$/.test(max) ? max : ''
}

function applySearchFromQuery() {
  const q = typeof route.query.q === 'string' ? route.query.q.trim() : ''
  searchQuery.value = q
}

function applyNewFromQuery() {
  const v = typeof route.query.new === 'string' ? route.query.new.trim() : ''
  onlyNew.value = v === '1' || v === 'true'
}

function applySortFromQuery() {
  const raw = route.query.sort
  const id = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  activeSort.value = 'featured'
  if (sortTabs.some((s) => s.id === id)) activeSort.value = id as (typeof sortTabs)[number]['id']
}

watch(
  () => [route.query.cat, route.query.genre, route.query.sort, route.query.min, route.query.max, route.query.q, route.query.new, cms.value?.categories],
  () => {
    applyCategoryFromQuery()
    applyGenreFromQuery()
    applySortFromQuery()
    applyPriceFromQuery()
    applySearchFromQuery()
    applyNewFromQuery()
  },
  { immediate: true },
)

const newestIds = computed(() => {
  if (!cms.value) return new Set<number>()
  return new Set(
    [...cms.value.products]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 6)
      .map((p) => p.id),
  )
})

const searchIndexById = computed(() => {
  const map = new Map<number, string>()
  for (const p of cms.value?.products ?? []) {
    map.set(
      p.id,
      [
        p.name,
        p.category,
        p.tagline,
        p.description,
        p.story,
        ...(p.details ?? []),
      ]
        .join(' ')
        .toLowerCase(),
    )
  }
  return map
})

const filteredProducts = computed(() => {
  if (!cms.value) return []
  if (priceRangeInvalid.value) return []
  const term = searchQuery.value.trim().toLowerCase()
  return cms.value.products.filter((p) => {
    const categoryOk = activeCategories.value.length === 0 || activeCategories.value.includes(p.categoryId)
    const genreOk = activeGenres.value.length === 0 || activeGenres.value.includes(p.genre)
    const min = minPrice.value.trim() ? Number(minPrice.value) : Number.NaN
    const max = maxPrice.value.trim() ? Number(maxPrice.value) : Number.NaN
    const minOk = !Number.isFinite(min) || p.price >= min
    const maxOk = !Number.isFinite(max) || p.price <= max
    const searchOk = !term || (searchIndexById.value.get(p.id) ?? '').includes(term)
    const newOk = !onlyNew.value || newestIds.value.has(p.id)
    return categoryOk && genreOk && minOk && maxOk && searchOk && newOk
  })
})

const products = computed(() => {
  const list = [...filteredProducts.value]
  if (activeSort.value === 'newest') return list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  if (activeSort.value === 'price-asc') return list.sort((a, b) => a.price - b.price)
  if (activeSort.value === 'price-desc') return list.sort((a, b) => b.price - a.price)
  if (activeSort.value === 'name-asc') return list.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  return list
})

function toggleCategory(id: string) {
  if (activeCategories.value.includes(id)) activeCategories.value = activeCategories.value.filter((x) => x !== id)
  else activeCategories.value = [...activeCategories.value, id]
  mobileCategoryOpen.value = false
  syncQuery()
}

function toggleGenre(id: string) {
  if (activeGenres.value.includes(id)) activeGenres.value = activeGenres.value.filter((x) => x !== id)
  else activeGenres.value = [...activeGenres.value, id]
  mobileGenreOpen.value = false
  syncQuery()
}

function setSort(id: (typeof sortTabs)[number]['id']) {
  activeSort.value = id
  syncQuery()
}

function clearAllFilters() {
  activeCategories.value = []
  activeGenres.value = []
  minPrice.value = ''
  maxPrice.value = ''
  searchQuery.value = ''
  onlyNew.value = false
  activeSort.value = 'featured'
  mobileCategoryOpen.value = false
  mobileGenreOpen.value = false
  mobileFiltersOpen.value = false
  syncQuery()
}

function removeCategoryFilter(id: string) {
  activeCategories.value = activeCategories.value.filter((x) => x !== id)
  syncQuery()
}

function removeGenreFilter(id: string) {
  activeGenres.value = activeGenres.value.filter((x) => x !== id)
  syncQuery()
}

function clearPriceFilter() {
  minPrice.value = ''
  maxPrice.value = ''
  syncQuery()
}

function syncQuery() {
  const q: Record<string, string> = {}
  if (activeCategories.value.length) q.cat = activeCategories.value.join(',')
  if (activeGenres.value.length) q.genre = activeGenres.value.join(',')
  if (minPrice.value.trim()) q.min = minPrice.value.trim()
  if (maxPrice.value.trim()) q.max = maxPrice.value.trim()
  if (searchQuery.value.trim()) q.q = searchQuery.value.trim()
  if (onlyNew.value) q.new = '1'
  if (activeSort.value !== 'featured') q.sort = activeSort.value
  router.replace({ query: q })
}

function genreLabel(v: string) {
  if (v === 'homme') return 'Homme'
  if (v === 'femme') return 'Femme'
  return 'Unisexe'
}

const activeCategoryLabel = computed(
  () => (activeCategories.value.length ? `${activeCategories.value.length} sélection(s)` : 'Toutes'),
)
const activeGenreLabel = computed(
  () => (activeGenres.value.length ? `${activeGenres.value.length} sélection(s)` : 'Tous genres'),
)
const minPriceNum = computed(() => (minPrice.value.trim() ? Number(minPrice.value) : Number.NaN))
const maxPriceNum = computed(() => (maxPrice.value.trim() ? Number(maxPrice.value) : Number.NaN))
const priceRangeInvalid = computed(
  () =>
    Number.isFinite(minPriceNum.value)
    && Number.isFinite(maxPriceNum.value)
    && minPriceNum.value > maxPriceNum.value,
)
const hasActiveFilters = computed(
  () =>
    activeCategories.value.length > 0
    || activeGenres.value.length > 0
    || !!minPrice.value.trim()
    || !!maxPrice.value.trim()
    || !!searchQuery.value.trim()
    || onlyNew.value
    || activeSort.value !== 'featured',
)

useHead({ title: 'La Boutique — WAXTU' })

useSeoMeta({
  title: 'La Boutique — WAXTU',
  description: 'Collection WAXTU : montres, sacs et accessoires conçus à Dakar. Livraison express.',
  ogTitle: 'La Boutique — WAXTU',
})
</script>

<template>
  <section v-if="cms" class="pb-[max(5rem,env(safe-area-inset-bottom))] pt-20 md:pb-24 md:pt-28">
    <div class="mx-auto max-w-6xl px-5 md:px-8">
      <div class="mb-8 flex flex-col items-start justify-between gap-6 md:mb-16 lg:flex-row">
        <div class="max-w-xl">
          <h2 class="mb-4 font-serif text-3xl text-ink dark:text-paper sm:text-4xl md:text-6xl lg:text-7xl">
            La Boutique
          </h2>
          <p class="text-base font-light text-muted md:text-lg">
            Explorez notre collection complète, filtrez par catégorie et par genre pour trouver plus vite la bonne pièce.
          </p>
        </div>
        <div class="w-full max-w-2xl text-left">
          <div class="space-y-3 md:hidden">
            <label class="group relative flex min-h-[48px] items-center gap-2 border border-ink/15 px-3 py-2 transition duration-300 focus-within:border-gold focus-within:shadow-[0_0_0_1px_rgba(197,160,89,0.45)] dark:border-white/15 dark:focus-within:border-gold">
              <Search class="h-4 w-4 shrink-0 text-muted transition duration-300 group-focus-within:scale-110 group-focus-within:text-gold" />
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Rechercher..."
                class="min-h-[44px] w-full flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted dark:text-paper"
                @input="syncQuery"
              >
              <span
                class="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-gold transition duration-300 group-focus-within:scale-x-100"
              />
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="flex min-h-[48px] items-center justify-center border border-ink/15 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-ink dark:border-white/15 dark:text-paper"
                @click="mobileFiltersOpen = true"
              >
                Filtres
              </button>
              <button
                type="button"
                class="flex min-h-[48px] items-center justify-center border border-ink/15 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-ink dark:border-white/15 dark:text-paper"
                @click="setSort(activeSort === 'newest' ? 'featured' : 'newest')"
              >
                {{ activeSort === 'newest' ? 'Standard' : 'Nouveautés' }}
              </button>
            </div>
          </div>

          <div class="hidden space-y-4 md:block">
          <div class="space-y-2">
            <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.26em] text-muted">
              Recherche
            </p>
            <label class="group relative flex items-center gap-2 border border-ink/15 px-3 py-2 transition duration-300 focus-within:border-gold focus-within:shadow-[0_0_0_1px_rgba(197,160,89,0.45)] dark:border-white/15 dark:focus-within:border-gold">
              <Search class="h-4 w-4 text-muted transition duration-300 group-focus-within:scale-110 group-focus-within:text-gold" />
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Nom, catégorie, détail..."
                class="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted transition placeholder:tracking-[0.02em] focus:placeholder:tracking-[0.08em] dark:text-paper"
                @input="syncQuery"
              >
              <span
                class="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-gold transition duration-300 group-focus-within:scale-x-100"
              />
            </label>
          </div>
          <div class="space-y-2">
            <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.26em] text-muted">
              Catégories
            </p>
            <div class="relative md:hidden">
              <button
                type="button"
                class="flex w-full items-center justify-between border border-ink/15 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ink dark:border-white/15 dark:text-paper"
                @click="mobileCategoryOpen = !mobileCategoryOpen; mobileGenreOpen = false"
              >
                <span>{{ activeCategoryLabel }}</span>
                <span aria-hidden="true">+</span>
              </button>
              <div v-if="mobileCategoryOpen" class="absolute left-0 right-0 z-20 border border-t-0 border-ink/15 bg-paper dark:border-white/15 dark:bg-night">
                <button
                  v-for="cat in categoryTabs"
                  :key="`mob-${cat.id}`"
                  type="button"
                  class="block w-full border-t border-ink/10 px-3 py-2 text-left text-[11px] uppercase tracking-[0.16em] text-ink first:border-t-0 dark:border-white/10 dark:text-paper"
                  @click="toggleCategory(cat.id)"
                >
                  {{ activeCategories.includes(cat.id) ? '✓ ' : '' }}{{ cat.name }}
                </button>
              </div>
            </div>
            <div class="hidden flex-wrap gap-x-2 gap-y-1 md:flex">
              <button
                type="button"
                class="border-b border-ink/25 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-ink transition hover:border-gold md:text-[10px] md:tracking-[0.24em] dark:border-white/20 dark:text-paper"
                :class="activeCategories.length === 0 ? 'border-gold text-gold' : ''"
                @click="activeCategories = []; syncQuery()"
              >
                Tout
              </button>
              <button
                v-for="cat in categoryTabs"
                :key="cat.id"
                type="button"
                class="border-b border-ink/25 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-ink transition hover:border-gold md:text-[10px] md:tracking-[0.24em] dark:border-white/20 dark:text-paper"
                :class="activeCategories.includes(cat.id) ? 'border-gold text-gold' : ''"
                @click="toggleCategory(cat.id)"
              >
                {{ cat.name }}
              </button>
            </div>
          </div>
          <div class="space-y-2">
            <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.26em] text-muted">
              Genres
            </p>
            <div class="relative md:hidden">
              <button
                type="button"
                class="flex w-full items-center justify-between border border-ink/15 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ink dark:border-white/15 dark:text-paper"
                @click="mobileGenreOpen = !mobileGenreOpen; mobileCategoryOpen = false"
              >
                <span>{{ activeGenreLabel }}</span>
                <span aria-hidden="true">+</span>
              </button>
              <div v-if="mobileGenreOpen" class="absolute left-0 right-0 z-20 border border-t-0 border-ink/15 bg-paper dark:border-white/15 dark:bg-night">
                <button
                  v-for="g in genderTabs"
                  :key="`mob-${g.id}`"
                  type="button"
                  class="block w-full border-t border-ink/10 px-3 py-2 text-left text-[11px] uppercase tracking-[0.16em] text-ink first:border-t-0 dark:border-white/10 dark:text-paper"
                  @click="toggleGenre(g.id)"
                >
                  {{ activeGenres.includes(g.id) ? '✓ ' : '' }}{{ g.name }}
                </button>
              </div>
            </div>
            <div class="hidden flex-wrap gap-x-2 gap-y-1 md:flex">
              <button
                type="button"
                class="border-b border-ink/25 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-ink transition hover:border-gold md:text-[10px] md:tracking-[0.24em] dark:border-white/20 dark:text-paper"
                :class="activeGenres.length === 0 ? 'border-gold text-gold' : ''"
                @click="activeGenres = []; syncQuery()"
              >
                Tout
              </button>
              <button
                v-for="g in genderTabs"
                :key="g.id"
                type="button"
                class="border-b border-ink/25 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-ink transition hover:border-gold md:text-[10px] md:tracking-[0.24em] dark:border-white/20 dark:text-paper"
                :class="activeGenres.includes(g.id) ? 'border-gold text-gold' : ''"
                @click="toggleGenre(g.id)"
              >
                {{ g.name }}
              </button>
            </div>
          </div>
          <div class="space-y-2">
            <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.26em] text-muted">
              Prix (FCFA)
            </p>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="minPrice"
                type="number"
                min="0"
                placeholder="Min"
                class="w-full border border-ink/15 bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink dark:border-white/15 dark:text-paper"
                @input="syncQuery"
              >
              <input
                v-model="maxPrice"
                type="number"
                min="0"
                placeholder="Max"
                class="w-full border border-ink/15 bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink dark:border-white/15 dark:text-paper"
                @input="syncQuery"
              >
            </div>
            <p v-if="priceRangeInvalid" class="text-[11px] text-red-500">
              Intervalle invalide : le minimum doit etre inferieur ou egal au maximum.
            </p>
          </div>
          <div v-if="hasActiveFilters" class="pt-1">
            <button
              type="button"
              class="border-b border-ink/25 pb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-ink transition hover:border-gold hover:text-gold dark:border-white/20 dark:text-paper"
              @click="clearAllFilters"
            >
              Réinitialiser les filtres
            </button>
          </div>
          <div>
            <button
              type="button"
              class="border-b border-ink/25 pb-1 text-[10px] font-bold uppercase tracking-[0.24em] text-ink transition hover:border-gold hover:text-gold dark:border-white/20 dark:text-paper"
              :class="onlyNew ? 'border-gold text-gold' : ''"
              @click="onlyNew = !onlyNew; syncQuery()"
            >
              Nouveautés seulement
            </button>
          </div>
          <div class="space-y-2">
            <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.26em] text-muted">
              Trier
            </p>
            <div class="flex flex-wrap gap-x-2 gap-y-1">
              <button
                v-for="sort in sortTabs"
                :key="sort.id"
                type="button"
                class="border-b border-ink/25 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-ink transition hover:border-gold md:text-[10px] md:tracking-[0.24em] dark:border-white/20 dark:text-paper"
                :class="sort.id === activeSort ? 'border-gold text-gold' : ''"
                @click="setSort(sort.id)"
              >
                {{ sort.name }}
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
      <div class="mb-8 flex flex-wrap items-center justify-between gap-3 border-y border-ink/10 py-3 dark:border-white/10">
        <p class="text-xs font-bold uppercase tracking-[0.26em] text-muted">
          {{ products.length }} résultat{{ products.length > 1 ? 's' : '' }}
        </p>
        <div v-if="hasActiveFilters" class="flex flex-wrap gap-2">
          <button
            v-for="id in activeCategories"
            :key="`ac-${id}`"
            type="button"
            class="border border-ink/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted transition hover:border-gold hover:text-gold dark:border-white/15"
            @click="removeCategoryFilter(id)"
          >
            {{ categoryTabs.find((c) => c.id === id)?.name ?? id }} ×
          </button>
          <button
            v-for="id in activeGenres"
            :key="`ag-${id}`"
            type="button"
            class="border border-ink/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted transition hover:border-gold hover:text-gold dark:border-white/15"
            @click="removeGenreFilter(id)"
          >
            {{ genreLabel(id) }} ×
          </button>
          <button
            v-if="minPrice || maxPrice"
            type="button"
            class="border border-ink/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted transition hover:border-gold hover:text-gold dark:border-white/15"
            @click="clearPriceFilter"
          >
            {{ minPrice || '0' }} - {{ maxPrice || '∞' }} FCFA ×
          </button>
          <button
            v-if="searchQuery"
            type="button"
            class="border border-ink/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted transition hover:border-gold hover:text-gold dark:border-white/15"
            @click="searchQuery = ''; syncQuery()"
          >
            Recherche: {{ searchQuery }} ×
          </button>
          <button
            v-if="onlyNew"
            type="button"
            class="border border-ink/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted transition hover:border-gold hover:text-gold dark:border-white/15"
            @click="onlyNew = false; syncQuery()"
          >
            Nouveautés ×
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-2 gap-y-5 md:grid-cols-2 md:gap-x-10 md:gap-y-14 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-20">
        <article
          v-for="(product, i) in products"
          :key="`${product.id}-${i}`"
          class="animate-reveal-up opacity-0"
          :style="{ animationDelay: `${(i % 3) * 120}ms` }"
        >
          <div
            class="group relative mb-2 aspect-square cursor-pointer overflow-hidden md:mb-6"
            @click="navigateTo(`/shop/${product.id}`)"
          >
            <ProductPromoBadge :product="product" :site-promotions="cms.promotions" />
            <img
              :src="cmsImg(product.images[0])"
              :alt="product.name"
              class="h-full w-full object-cover grayscale-[15%] transition duration-1000 group-hover:scale-105 group-hover:grayscale-0"
            >
            <button
              type="button"
              class="absolute bottom-0 left-0 w-full bg-ink py-1.5 text-[8px] font-bold uppercase leading-tight tracking-[0.18em] text-white transition duration-500 sm:py-2 sm:text-[9px] sm:tracking-[0.2em] md:translate-y-full md:py-5 md:text-[10px] md:tracking-[0.35em] md:group-hover:translate-y-0"
              @click.stop="cart.add(product)"
            >
              Ajouter au panier
            </button>
          </div>
          <div class="flex items-start justify-between gap-1.5 md:gap-4">
            <div class="min-w-0 flex-1">
              <h3 class="line-clamp-2 font-serif text-sm leading-snug text-ink dark:text-paper sm:text-base md:line-clamp-none md:text-2xl md:leading-normal">
                {{ product.name }}
              </h3>
              <p class="mt-0.5 text-[8px] uppercase leading-tight tracking-[0.14em] text-muted sm:mt-1 sm:text-[9px] sm:tracking-[0.16em] md:text-[10px] md:tracking-[0.35em]">
                {{ product.category }} · {{ genreLabel(product.genre) }}
              </p>
              <p v-if="newestIds.has(product.id)" class="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-gold">
                Nouveau
              </p>
            </div>
            <ProductPriceTag :product="product" compact :site-promotions="cms.promotions" />
          </div>
        </article>
      </div>
      <p v-if="!products.length" class="mt-10 border border-ink/10 px-4 py-6 text-center text-sm text-muted dark:border-white/10">
        Aucun article ne correspond à ces filtres pour le moment.
      </p>
    </div>

    <Teleport to="body">
      <div v-if="mobileFiltersOpen" class="fixed inset-0 z-[120] md:hidden">
        <div class="absolute inset-0 bg-black/55" @click="mobileFiltersOpen = false" />
        <div class="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto border-t border-ink/15 bg-paper p-4 dark:border-white/15 dark:bg-night">
          <div class="mb-4 flex items-center justify-between">
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-ink dark:text-paper">
              Filtres boutique
            </p>
            <button
              type="button"
              class="border-b border-ink/25 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink dark:border-white/25 dark:text-paper"
              @click="mobileFiltersOpen = false"
            >
              Fermer
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                Catégories
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="border-b border-ink/25 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink dark:border-white/20 dark:text-paper"
                  :class="activeCategories.length === 0 ? 'border-gold text-gold' : ''"
                  @click="activeCategories = []; syncQuery()"
                >
                  Tout
                </button>
                <button
                  v-for="cat in categoryTabs"
                  :key="`m-${cat.id}`"
                  type="button"
                  class="border-b border-ink/25 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink dark:border-white/20 dark:text-paper"
                  :class="activeCategories.includes(cat.id) ? 'border-gold text-gold' : ''"
                  @click="toggleCategory(cat.id)"
                >
                  {{ cat.name }}
                </button>
              </div>
            </div>

            <div>
              <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                Genres
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="border-b border-ink/25 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink dark:border-white/20 dark:text-paper"
                  :class="activeGenres.length === 0 ? 'border-gold text-gold' : ''"
                  @click="activeGenres = []; syncQuery()"
                >
                  Tout
                </button>
                <button
                  v-for="g in genderTabs"
                  :key="`mg-${g.id}`"
                  type="button"
                  class="border-b border-ink/25 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink dark:border-white/20 dark:text-paper"
                  :class="activeGenres.includes(g.id) ? 'border-gold text-gold' : ''"
                  @click="toggleGenre(g.id)"
                >
                  {{ g.name }}
                </button>
              </div>
            </div>

            <div>
              <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                Prix (FCFA)
              </p>
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model="minPrice"
                  type="number"
                  min="0"
                  placeholder="Min"
                  class="w-full border border-ink/15 bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink dark:border-white/15 dark:text-paper"
                  @input="syncQuery"
                >
                <input
                  v-model="maxPrice"
                  type="number"
                  min="0"
                  placeholder="Max"
                  class="w-full border border-ink/15 bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink dark:border-white/15 dark:text-paper"
                  @input="syncQuery"
                >
              </div>
            </div>

            <div>
              <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                Trier
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="sort in sortTabs"
                  :key="`ms-${sort.id}`"
                  type="button"
                  class="border-b border-ink/25 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink dark:border-white/20 dark:text-paper"
                  :class="sort.id === activeSort ? 'border-gold text-gold' : ''"
                  @click="setSort(sort.id)"
                >
                  {{ sort.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
