<script setup lang="ts">
import { ChevronLeft, ChevronRight, Heart, Loader2, ShieldCheck, Truck } from 'lucide-vue-next'
import { resolveMediaUrl } from '../../utils/cms-media'

const route = useRoute()
const { data: cms } = await usePublicCms()
const cart = useCartStore()

const idNum = Number(route.params.id)

watch(
  cms,
  (c) => {
    if (!c) return
    if (Number.isNaN(idNum) || !c.products.some((p) => p.id === idNum)) {
      throw createError({ statusCode: 404, statusMessage: 'Produit introuvable ou indisponible' })
    }
  },
  { immediate: true },
)

const product = computed(() => cms.value?.products.find((p) => p.id === idNum))

const pp = computed(() => cms.value?.site.productPage)

const config = useRuntimeConfig()
const siteUrl = computed(() => String(config.public.siteUrl || '').replace(/\/$/, ''))
const cmsImg = useCmsImg()

/** URLs résolues + repli ; évite les src vides après édition CMS. */
const displayImages = computed(() => {
  const p = product.value
  if (!p?.images?.length) return [cmsImg(null)]
  return p.images.map((src) => cmsImg(src))
})

const activeImg = ref(0)

watch(product, () => {
  activeImg.value = 0
})

watch(displayImages, (imgs) => {
  if (activeImg.value >= imgs.length) activeImg.value = Math.max(0, imgs.length - 1)
})

const others = computed(() => cms.value?.products.filter((p) => p.id !== product.value?.id) ?? [])

function genreLabel(v: string) {
  if (v === 'homme') return 'Homme'
  if (v === 'femme') return 'Femme'
  return 'Unisexe'
}

const productJsonLd = computed(() => {
  const p = product.value
  const base = siteUrl.value
  if (!p || !base) return null
  const url = `${base}/shop/${p.id}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: (p.tagline || p.description || '').slice(0, 5000),
    image: (p.images?.filter(Boolean).length ? p.images.filter(Boolean) : ['/placeholder-waxtu.svg']).map((src) =>
      resolveMediaUrl(src, base, { absolute: true }),
    ),
    sku: String(p.id),
    offers: {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: 'XOF',
      availability:
        p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url,
    },
  }
})

const metaDesc = computed(() => {
  const p = product.value
  if (!p) return 'Produit WAXTU.'
  return (p.tagline || p.description || '').slice(0, 160) || 'Produit WAXTU.'
})

const pageTitle = computed(() =>
  product.value ? `${product.value.name} — WAXTU` : 'Produit — WAXTU',
)

const ogImage = computed(() => {
  const src = product.value?.images?.[0]
  return src ? resolveMediaUrl(src, siteUrl.value, { absolute: true }) : undefined
})

useSeoMeta({
  title: pageTitle,
  description: metaDesc,
  ogTitle: pageTitle,
  ogDescription: metaDesc,
  ogImage,
  twitterCard: 'summary_large_image',
})

useHead(() => {
  const p = product.value
  const jd = productJsonLd.value
  return {
    link: p && siteUrl.value ? [{ rel: 'canonical', href: `${siteUrl.value}/shop/${p.id}` }] : [],
    script: jd
      ? [{ type: 'application/ld+json' as const, children: JSON.stringify(jd) }]
      : [],
  }
})

const favoriteIds = ref<number[]>([])
const favoriteBusy = ref(false)
const favoriteHint = ref<string | null>(null)

async function loadFavorites() {
  try {
    const res = await $fetch<{ customer: { favoriteProductIds: number[] } | null }>('/api/customer/me', {
      credentials: 'include',
    })
    favoriteIds.value = res.customer?.favoriteProductIds ?? []
  }
  catch {
    favoriteIds.value = []
  }
}

onMounted(loadFavorites)

const isFavorite = computed(() => favoriteIds.value.includes(idNum))

async function toggleFavorite() {
  favoriteHint.value = null
  favoriteBusy.value = true
  try {
    const res = await $fetch<{ favoriteProductIds: number[] }>('/api/customer/favorites', {
      method: 'PATCH',
      credentials: 'include',
      body: {
        productId: idNum,
        action: isFavorite.value ? 'remove' : 'add',
      },
    })
    favoriteIds.value = res.favoriteProductIds
  }
  catch (e: unknown) {
    const err = e as { statusCode?: number; status?: number; data?: { statusMessage?: string } }
    const code = err?.statusCode ?? err?.status
    if (code === 401 || err?.data?.statusMessage?.includes('Connexion')) {
      favoriteHint.value = 'Connectez-vous (Mon compte) pour enregistrer vos favoris.'
    }
    else {
      favoriteHint.value = err?.data?.statusMessage || 'Action impossible.'
    }
  }
  finally {
    favoriteBusy.value = false
  }
}
</script>

<template>
  <div v-if="product" class="pb-[max(4rem,env(safe-area-inset-bottom))] pt-20 md:pb-16 md:pt-28">
    <section class="mx-auto max-w-6xl px-5 md:px-8">
      <div class="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
        <div class="space-y-4">
          <div class="group relative aspect-[4/5] overflow-hidden bg-paper shadow-lift dark:bg-night">
            <ProductPromoBadge :product="product" :site-promotions="cms?.promotions" />
            <img
              :src="displayImages[activeImg]"
              :alt="product.name"
              width="800"
              height="1000"
              class="h-full w-full object-cover animate-fade-in"
              loading="eager"
              fetchpriority="high"
            >
            <div
              class="absolute inset-0 flex items-center justify-between px-3 opacity-100 transition md:opacity-0 md:group-hover:opacity-100"
            >
              <button
                type="button"
                class="rounded-pill bg-paper/90 p-3 shadow-lift touch-manipulation"
                @click="activeImg = Math.max(0, activeImg - 1)"
              >
                <ChevronLeft class="h-5 w-5" />
              </button>
              <button
                type="button"
                class="rounded-pill bg-paper/90 p-3 shadow-lift touch-manipulation"
                @click="activeImg = Math.min(displayImages.length - 1, activeImg + 1)"
              >
                <ChevronRight class="h-5 w-5" />
              </button>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(img, i) in displayImages"
              :key="`${i}-${img.slice(-24)}`"
              type="button"
              class="border-2 p-1 transition"
              :class="activeImg === i ? 'border-gold' : 'border-transparent'"
              @click="activeImg = i"
            >
              <img :src="img" :alt="`${product.name} ${i + 1}`" width="120" height="120" class="aspect-square h-16 w-16 object-cover sm:h-20 sm:w-20" loading="lazy">
            </button>
          </div>
        </div>
        <div class="flex flex-col justify-center space-y-8">
          <div>
            <div class="mb-4 flex flex-wrap items-center gap-2">
              <NuxtLink
                :to="`/shop?cat=${encodeURIComponent(product.categoryId)}`"
                class="rounded-pill border border-ink/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted transition hover:border-gold hover:text-gold dark:border-white/10"
              >
                {{ product.category }}
              </NuxtLink>
              <NuxtLink
                :to="`/shop?genre=${encodeURIComponent(product.genre)}`"
                class="rounded-pill px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] transition"
                :class="product.genre === 'homme'
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200'
                  : product.genre === 'femme'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'"
              >
                {{ genreLabel(product.genre) }}
              </NuxtLink>
            </div>
            <h2 class="mb-4 font-serif text-3xl leading-tight text-ink dark:text-paper sm:text-4xl md:text-6xl lg:text-7xl">
              {{ product.name }}
            </h2>
            <ProductPriceTag :product="product" />
          </div>
          <p class="text-base italic leading-relaxed text-muted md:text-lg lg:text-xl">
             {{ product.tagline }} 
          </p>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              class="flex min-h-[48px] flex-1 items-center justify-center bg-ink py-4 text-xs font-bold uppercase tracking-[0.35em] text-white shadow-lift transition duration-500 hover:bg-gold dark:bg-paper dark:text-ink dark:hover:bg-gold dark:hover:text-white md:py-5"
              :aria-label="pp?.addToCart"
              @click="cart.add(product)"
            >
              {{ pp?.addToCart }}
            </button>
            <button
              type="button"
              class="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-wax border border-ink/10 px-6 py-4 transition hover:border-gold hover:text-gold disabled:opacity-50 dark:border-white/10 md:py-5"
              :aria-label="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
              :disabled="favoriteBusy"
              @click="toggleFavorite"
            >
              <Loader2 v-if="favoriteBusy" class="mx-auto h-5 w-5 animate-spin" aria-hidden="true" />
              <Heart
                v-else
                class="mx-auto h-5 w-5"
                :class="isFavorite ? 'fill-gold text-gold' : ''"
                :stroke-width="1.5"
                aria-hidden="true"
              />
            </button>
          </div>
          <p v-if="favoriteHint" class="text-xs text-muted">
            {{ favoriteHint }}
          </p>
          <div class="grid grid-cols-1 gap-6 border-t border-ink/5 pt-8 sm:grid-cols-2 dark:border-white/10">
            <div class="flex items-center gap-3">
              <Truck class="h-6 w-6 text-gold" :stroke-width="1" />
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.35em]">{{ pp?.deliveryTitle }}</p>
                <p class="text-xs text-muted">{{ pp?.deliverySub }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <ShieldCheck class="h-6 w-6 text-gold" :stroke-width="1" />
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.35em]">{{ pp?.warrantyTitle }}</p>
                <p class="text-xs text-muted">{{ pp?.warrantySub }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-paper py-12 dark:bg-night md:py-20">
      <div class="mx-auto max-w-6xl px-5 md:px-8">
        <div class="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <span class="mb-4 block font-serif text-3xl italic text-gold md:text-4xl">{{ pp?.blockKicker }}</span>
          <h3 class="mb-6 font-serif text-3xl leading-tight text-ink dark:text-paper md:text-5xl lg:text-6xl">
            {{ pp?.blockTitle }}
          </h3>
          <p class="text-base font-light leading-relaxed text-muted md:text-lg">
            {{ product.description }}
          </p>
        </div>
        <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div class="space-y-8">
            <div class="animate-reveal-up opacity-0">
              <h4 class="mb-3 font-serif text-xl italic text-ink dark:text-paper md:text-2xl">
                {{ pp?.matieresTitle }}
              </h4>
              <p class="text-sm leading-relaxed text-muted md:text-base">
                {{ pp?.matieresBody }}
              </p>
            </div>
            <div class="animate-reveal-up opacity-0" style="animation-delay: 160ms">
              <h4 class="mb-3 font-serif text-xl italic text-ink dark:text-paper md:text-2xl">
                {{ pp?.storyBlockTitle }}
              </h4>
              <p class="text-sm leading-relaxed text-muted md:text-base">
                {{ product.story }}
              </p>
            </div>
          </div>
          <div class="group h-[360px] overflow-hidden md:h-[520px] lg:h-[600px]">
            <img
              :src="displayImages[1] || displayImages[0]"
              alt=""
              class="h-full w-full object-cover transition duration-[2000ms] group-hover:scale-110"
            >
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <h4 class="mb-8 font-serif text-2xl italic text-ink dark:text-paper md:text-3xl">
            {{ pp?.ficheTitle }}
          </h4>
          <div class="space-y-4">
            <div
              v-for="(detail, i) in product.details"
              :key="i"
              class="flex items-center justify-between border-b border-ink/5 pb-3 text-xs font-light uppercase tracking-[0.25em] text-muted dark:border-white/10"
            >
              <span>{{ detail.split(' ')[0] }}</span>
              <span class="font-semibold text-ink dark:text-paper">{{ detail.split(' ').slice(1).join(' ') }}</span>
            </div>
          </div>
        </div>
        <div>
          <h4 class="mb-8 font-serif text-2xl italic text-ink dark:text-paper md:text-3xl">
            {{ pp?.avisTitle }}
          </h4>
          <div v-if="product.reviews.length" class="space-y-6">
            <div
              v-for="(r, idx) in product.reviews"
              :key="idx"
              class="rounded-wax border border-ink/5 bg-paper p-6 dark:border-white/10 dark:bg-night"
            >
              <p class="mb-3 font-serif text-lg italic text-ink dark:text-paper"> {{ r.comment }} </p>
              <p class="text-[10px] font-bold uppercase tracking-[0.35em] text-muted">
                — {{ r.user }}
              </p>
            </div>
          </div>
          <p v-else class="py-10 text-center font-serif italic text-muted">
            {{ pp?.noReviews }}
          </p>
        </div>
      </div>
    </section>

    <section class="bg-ink py-12 text-white md:py-20">
      <div class="mx-auto max-w-6xl px-5 md:px-8">
        <h4 class="mb-10 text-center font-serif text-3xl md:mb-16 md:text-4xl">
          {{ pp?.crossSellTitle }}
        </h4>
        <div class="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
          <button
            v-for="p in others"
            :key="p.id"
            type="button"
            class="group text-center"
            @click="navigateTo(`/shop/${p.id}`)"
          >
            <div class="relative mb-6 aspect-square overflow-hidden">
              <ProductPromoBadge :product="p" :site-promotions="cms?.promotions" />
              <img
                :src="cmsImg(p.images[0])"
                :alt="p.name"
                class="h-full w-full object-cover opacity-70 transition duration-700 group-hover:opacity-100"
              >
            </div>
            <h5 class="mb-2 font-serif text-lg">{{ p.name }}</h5>
            <p class="mb-2 text-[10px] uppercase tracking-[0.28em] text-white/70">
              {{ p.category }} · {{ genreLabel(p.genre) }}
            </p>
            <div class="mb-2 flex justify-center">
              <ProductPriceTag :product="p" compact />
            </div>
            <span class="text-[10px] font-bold uppercase tracking-[0.35em] text-gold">{{ pp?.crossSellCta }}</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
