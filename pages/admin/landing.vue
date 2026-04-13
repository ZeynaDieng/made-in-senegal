<script setup lang="ts">
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-vue-next'
import { VueDraggable } from 'vue-draggable-plus'
import type {
  CmsCategoryShowcaseSection,
  CmsCategoryShowcaseTile,
  CmsParallaxVideoSection,
  CmsTrustStripSection,
  CmsTrustStripItem,
  CmsVideoSpotlightSection,
  LandingSection,
  ParallaxVideoHeight,
  ProductGender,
  TrustStripIcon,
  WaxtuCms,
} from '../../types/cms'
import { defaultCms } from '../../data/default-cms'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const SECTION_TYPE_LABEL: Record<string, string> = {
  hero: 'Bandeau principal',
  story: 'Bloc histoire',
  trust_strip: 'Bandeau confiance',
  featured_products: 'Grille produits',
  category_showcase: 'Vitrine catégories',
  video_spotlight: 'Bloc vidéo',
  parallax_video: 'Bandeau parallaxe (plein écran)',
}

function sectionTypeLabel(section: LandingSection) {
  return SECTION_TYPE_LABEL[section.type] ?? section.type
}

function looksLikeYoutubeInput(v: string) {
  return /youtube\.com|youtu\.be/i.test(v.trim())
}

type VideoSourceFields = Pick<CmsVideoSpotlightSection, 'youtubeUrl' | 'mp4Url'>

function videoSourceDisplay(section: VideoSourceFields) {
  const y = String(section.youtubeUrl ?? '').trim()
  if (y) return y
  return String(section.mp4Url ?? '').trim()
}

function setVideoSourceDisplay(section: VideoSourceFields, value: string) {
  const v = String(value ?? '').trim()
  if (!v) {
    section.youtubeUrl = ''
    section.mp4Url = ''
    return
  }
  if (looksLikeYoutubeInput(v)) {
    section.youtubeUrl = v
    section.mp4Url = ''
  }
  else {
    section.mp4Url = v
    section.youtubeUrl = ''
  }
}

function onAddSectionSelect(ev: Event) {
  const el = ev.target as HTMLSelectElement
  const key = el.value
  if (key === 'trust') addTrustStrip()
  else if (key === 'showcase') addCategoryShowcase()
  else if (key === 'video') addVideoSpotlight()
  else if (key === 'parallax') addParallaxVideo()
  el.value = ''
}

const TRUST_ICONS: TrustStripIcon[] = ['truck', 'shield', 'credit', 'support', 'package']

function defaultTrustItems(): CmsTrustStripItem[] {
  return [
    { icon: 'truck', title: 'Livraison express', body: 'Dakar et zones desservies.' },
    { icon: 'shield', title: 'Paiement sécurisé', body: 'Prestataire certifié.' },
    { icon: 'credit', title: 'Prix clairs', body: 'Affichage en FCFA.' },
    { icon: 'support', title: 'Conciergerie', body: 'Équipe à Dakar.' },
    { icon: 'package', title: 'Emballage soigné', body: 'Préparation premium.' },
  ]
}

function normalizeTrustItem(raw: Partial<CmsTrustStripItem>): CmsTrustStripItem {
  const icon = TRUST_ICONS.includes(raw.icon as TrustStripIcon) ? (raw.icon as TrustStripIcon) : 'truck'
  return {
    title: String(raw.title ?? '').trim() || 'Sans titre',
    body: String(raw.body ?? '').trim(),
    icon,
  }
}

function defaultShowcaseTiles(): CmsCategoryShowcaseTile[] {
  return [
    {
      title: 'Montres',
      subtitle: 'Sous-titre',
      categoryId: 'montres',
      genre: 'unisexe',
      image:
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=900',
    },
    {
      title: 'Maroquinerie',
      subtitle: 'Sous-titre',
      categoryId: 'maroquinerie',
      genre: 'femme',
      image:
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=900',
    },
  ]
}

function normalizeParallaxVideo(section: LandingSection): CmsParallaxVideoSection {
  const s = section as CmsParallaxVideoSection
  const mh = s.minHeight
  const minHeight: ParallaxVideoHeight =
    mh === 'short' || mh === 'medium' || mh === 'tall' ? mh : 'tall'
  const ov = Number(s.overlayOpacity)
  const overlayOpacity = Number.isFinite(ov) ? Math.min(90, Math.max(10, Math.round(ov))) : 42
  return {
    ...s,
    type: 'parallax_video',
    title: String(s.title ?? '').trim() || 'Titre',
    eyebrow: String(s.eyebrow ?? '').trim(),
    subtitle: String(s.subtitle ?? '').trim(),
    poster:
      String(s.poster ?? '').trim()
      || '/cms-defaults/parallax-hommes.jpg',
    youtubeUrl: String(s.youtubeUrl ?? '').trim(),
    mp4Url: String(s.mp4Url ?? '').trim(),
    minHeight,
    overlayOpacity,
    cta: {
      label: String(s.cta?.label ?? '').trim() || 'Découvrir',
      href: String(s.cta?.href ?? '').trim() || '/shop',
    },
  }
}

function normalizeVideoSpotlight(section: LandingSection): CmsVideoSpotlightSection {
  const s = section as CmsVideoSpotlightSection
  return {
    ...s,
    type: 'video_spotlight',
    title: String(s.title ?? '').trim() || 'Vidéo',
    eyebrow: String(s.eyebrow ?? '').trim(),
    subtitle: String(s.subtitle ?? '').trim(),
    body: String(s.body ?? '').trim(),
    poster:
      String(s.poster ?? '').trim()
      || 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1600',
    youtubeUrl: String(s.youtubeUrl ?? '').trim(),
    mp4Url: String(s.mp4Url ?? '').trim(),
  }
}

function normalizeShowcaseTile(raw: Partial<CmsCategoryShowcaseTile>): CmsCategoryShowcaseTile {
  const href = String(raw.href ?? '').trim()
  const genreRaw = String(raw.genre ?? '').trim().toLowerCase()
  const genre: ProductGender | undefined
    = genreRaw === 'homme' || genreRaw === 'femme' || genreRaw === 'unisexe'
      ? (genreRaw as ProductGender)
      : undefined
  const base = {
    title: String(raw.title ?? '').trim() || 'Sans titre',
    subtitle: String(raw.subtitle ?? '').trim(),
    image:
      String(raw.image ?? '').trim()
      || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=900',
    ...(genre ? { genre } : {}),
  }
  if (href) return { ...base, href }
  const categoryId = String(raw.categoryId ?? '').trim() || 'montres'
  return { ...base, categoryId }
}

const cms = ref<WaxtuCms | null>(null)
const sections = ref<LandingSection[]>([])
const status = ref<string | null>(null)
/** Sections repliées (aperçu seulement) pour limiter le défilement. */
const collapsed = ref<Record<string, boolean>>({})

function sectionCollapsed(id: string) {
  return !!collapsed.value[id]
}

function toggleSectionCollapse(id: string) {
  collapsed.value = { ...collapsed.value, [id]: !collapsed.value[id] }
}

function collapseAllLandingSections() {
  const next: Record<string, boolean> = {}
  for (const s of sections.value) next[s.id] = true
  collapsed.value = next
}

function expandAllLandingSections() {
  collapsed.value = {}
}

function normalizeSections(list: LandingSection[]) {
  return list.map((section) => {
    if (section.type === 'hero') {
      return {
        ...section,
        secondaryCta: section.secondaryCta ?? { label: '', href: '' },
      }
    }
    if (section.type === 'trust_strip') {
      const items =
        Array.isArray(section.items) && section.items.length
          ? section.items.map((it) => normalizeTrustItem(it))
          : defaultTrustItems()
      return { ...section, items }
    }
    if (section.type === 'category_showcase') {
      const tiles =
        Array.isArray(section.tiles) && section.tiles.length
          ? section.tiles.map((t) => normalizeShowcaseTile(t))
          : defaultShowcaseTiles()
      return { ...section, tiles }
    }
    if (section.type === 'video_spotlight') return normalizeVideoSpotlight(section)
    if (section.type === 'parallax_video') return normalizeParallaxVideo(section)
    return section
  })
}

function addTrustStrip() {
  const seed = defaultCms.sections.find((s): s is CmsTrustStripSection => s.type === 'trust_strip')
  if (seed) {
    const copy = structuredClone(seed)
    copy.id = `trust-${Date.now()}`
    copy.order = sections.value.length
    sections.value.push(normalizeSections([copy])[0]!)
    return
  }
  sections.value.push({
    id: `trust-${Date.now()}`,
    type: 'trust_strip',
    enabled: true,
    order: sections.value.length,
    eyebrow: 'Pour commander sereinement',
    title: 'Engagements WAXTU',
    items: defaultTrustItems(),
  })
}

function addCategoryShowcase() {
  const seed = defaultCms.sections.find((s): s is CmsCategoryShowcaseSection => s.type === 'category_showcase')
  if (seed) {
    const copy = structuredClone(seed)
    copy.id = `showcase-${Date.now()}`
    copy.order = sections.value.length
    sections.value.push(normalizeSections([copy])[0]!)
    return
  }
  sections.value.push({
    id: `showcase-${Date.now()}`,
    type: 'category_showcase',
    enabled: true,
    order: sections.value.length,
    eyebrow: 'Explorer',
    title: 'Univers',
    subtitle: 'Grandes cartes vers la boutique ou une page.',
    tiles: defaultShowcaseTiles(),
  })
}

function addVideoSpotlight() {
  const seed = defaultCms.sections.find((s): s is CmsVideoSpotlightSection => s.type === 'video_spotlight')
  if (seed) {
    const copy = structuredClone(seed)
    copy.id = `video-${Date.now()}`
    copy.order = sections.value.length
    sections.value.push(normalizeVideoSpotlight(copy))
    return
  }
  sections.value.push(
    normalizeVideoSpotlight({
      id: `video-${Date.now()}`,
      type: 'video_spotlight',
      enabled: true,
      order: sections.value.length,
      eyebrow: 'En mouvement',
      title: 'Votre film',
      subtitle: '',
      body: '',
      poster:
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1600',
      youtubeUrl: '',
      mp4Url: '',
    } as CmsVideoSpotlightSection),
  )
}

function addParallaxVideo() {
  const seed =
    defaultCms.sections.find((s): s is CmsParallaxVideoSection => s.type === 'parallax_video' && s.id === 'parallax-hommes')
    ?? defaultCms.sections.find((s): s is CmsParallaxVideoSection => s.type === 'parallax_video')
  if (seed) {
    const copy = structuredClone(seed)
    copy.id = `parallax-${Date.now()}`
    copy.order = sections.value.length
    copy.title = 'Nouveau bandeau'
    copy.subtitle = 'Sous-titre à personnaliser — une ligne pour le contexte.'
    copy.eyebrow = 'Collection'
    copy.cta = { label: 'Découvrir', href: '/shop' }
    sections.value.push(normalizeParallaxVideo(copy))
    return
  }
  sections.value.push(
    normalizeParallaxVideo({
      id: `parallax-${Date.now()}`,
      type: 'parallax_video',
      enabled: true,
      order: sections.value.length,
      minHeight: 'tall',
      eyebrow: 'Collection',
      subtitle: 'Une ligne d’accroche sous le bandeau.',
      title: 'Votre titre',
      poster: '/cms-defaults/parallax-hommes.jpg',
      youtubeUrl: '',
      mp4Url: '',
      cta: { label: 'Découvrir', href: '/shop' },
      overlayOpacity: 44,
    } as CmsParallaxVideoSection),
  )
}

function addShowcaseTile(section: LandingSection) {
  if (section.type !== 'category_showcase') return
  section.tiles.push({
    title: 'Nouvelle tuile',
    subtitle: '',
    categoryId: 'accessoires',
    genre: 'unisexe',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=900',
  })
}

function removeShowcaseTile(section: LandingSection, index: number) {
  if (section.type !== 'category_showcase') return
  if (section.tiles.length <= 1) return
  section.tiles.splice(index, 1)
}

function addTrustItem(section: LandingSection) {
  if (section.type !== 'trust_strip') return
  section.items.push({ icon: 'truck', title: 'Nouveau bloc', body: '' })
}

function removeTrustItem(section: LandingSection, index: number) {
  if (section.type !== 'trust_strip') return
  if (section.items.length <= 1) return
  section.items.splice(index, 1)
}

async function load() {
  const token = localStorage.getItem('waxtu-admin-token')
  cms.value = await $fetch<WaxtuCms>('/api/cms/admin', {
    headers: { Authorization: `Bearer ${token}` },
  })
  sections.value = normalizeSections([...cms.value.sections]).sort((a, b) => a.order - b.order)
  collapsed.value = {}
}

function updateProductIds(section: LandingSection, event: Event) {
  if (section.type !== 'featured_products') return
  const value = (event.target as HTMLInputElement).value
  section.productIds = value
    .split(',')
    .map((chunk) => Number(chunk.trim()))
    .filter((id) => !Number.isNaN(id))
}

onMounted(load)

async function save() {
  if (!cms.value) return
  const token = localStorage.getItem('waxtu-admin-token')
  const next: WaxtuCms = {
    ...cms.value,
    sections: sections.value.map((section, index) => ({ ...section, order: index })),
  }
  cms.value = await $fetch<WaxtuCms>('/api/cms/admin', {
    method: 'PUT',
    body: next,
    headers: { Authorization: `Bearer ${token}` },
  })
  await refreshNuxtData('waxtu-cms-public')
  sections.value = normalizeSections([...cms.value.sections]).sort((a, b) => a.order - b.order)
  status.value = 'Enregistré'
  window.setTimeout(() => (status.value = null), 2400)
}

useHead({ title: 'Landing — Admin WAXTU' })
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-8 px-5 py-10 md:px-8">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.35em] text-gold">Contenus</p>
        <h1 class="font-serif text-3xl">Landing page</h1>
        <p class="text-sm text-muted">
          <strong class="font-medium text-ink dark:text-paper">Ordre des blocs :</strong> saisissez la barre grise
          « Glisser pour déplacer » en haut de chaque carte, puis déposez au bon endroit. Dans les bandeaux confiance
          et vitrine catégories, la même chose s’applique aux sous-blocs.
        </p>
        <p class="text-sm text-muted">
          Le menu « Ajouter une section » crée un <strong class="font-medium text-ink dark:text-paper">nouveau</strong>
          bloc (ex. une 2ᵉ grille produits).
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <label class="flex min-w-[200px] flex-1 flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted sm:max-w-xs">
          Ajouter une section
          <select
            class="rounded-wax border border-ink/15 bg-transparent px-3 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink dark:border-white/15 dark:text-paper"
            @change="onAddSectionSelect"
          >
            <option value="">Choisir…</option>
            <option value="trust">Bandeau confiance</option>
            <option value="showcase">Vitrine catégories</option>
            <option value="video">Bloc vidéo</option>
            <option value="parallax">Bandeau parallaxe</option>
          </select>
        </label>
        <button
          type="button"
          class="rounded-wax border border-ink/15 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink transition hover:border-gold dark:border-white/15 dark:text-paper"
          @click="collapseAllLandingSections"
        >
          Tout réduire
        </button>
        <button
          type="button"
          class="rounded-wax border border-ink/15 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink transition hover:border-gold dark:border-white/15 dark:text-paper"
          @click="expandAllLandingSections"
        >
          Tout déplier
        </button>
        <button
          type="button"
          class="rounded-wax bg-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.35em] text-white transition hover:bg-gold dark:bg-paper dark:text-ink dark:hover:bg-gold dark:hover:text-white"
          @click="save"
        >
          Enregistrer
        </button>
      </div>
    </div>
    <p v-if="status" class="text-sm text-gold">
      {{ status }}
    </p>

    <VueDraggable
      v-model="sections"
      handle=".drag-handle"
      :animation="220"
      ghost-class="landing-sortable-ghost"
      chosen-class="landing-sortable-chosen"
      class="space-y-4"
    >
      <article
        v-for="(section, sectionIndex) in sections"
        :key="section.id"
        class="rounded-wax border border-ink/10 bg-paper p-4 shadow-sm dark:border-white/10 dark:bg-ink md:p-6"
      >
        <button
          type="button"
          class="drag-handle mb-3 flex w-full touch-manipulation items-center gap-3 rounded-wax border border-ink/15 bg-ink/[0.04] px-3 py-3 text-left transition hover:border-gold/60 hover:bg-gold/5 active:cursor-grabbing dark:border-white/15 dark:bg-white/[0.06] dark:hover:border-gold/50"
          aria-label="Glisser pour réordonner ce bloc sur la page d’accueil"
        >
          <GripVertical class="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
          <span class="min-w-0 flex-1">
            <span class="block text-xs font-bold uppercase tracking-[0.28em] text-gold">
              Bloc {{ sectionIndex + 1 }} — {{ sectionTypeLabel(section) }}
            </span>
            <span class="mt-0.5 block text-[11px] font-medium text-muted">
              Glisser-déposer cette barre pour changer l’ordre sur la landing
            </span>
          </span>
          <span class="shrink-0 rounded-pill bg-ink/10 px-2 py-1 text-[10px] font-bold text-muted dark:bg-white/10">
            {{ sectionIndex + 1 }} / {{ sections.length }}
          </span>
        </button>

        <div class="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-3 dark:border-white/10">
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              class="shrink-0 rounded-wax border border-ink/15 p-1.5 text-muted transition hover:border-gold hover:text-gold dark:border-white/15"
              :aria-expanded="!sectionCollapsed(section.id)"
              :aria-label="sectionCollapsed(section.id) ? 'Déplier le formulaire' : 'Replier le formulaire'"
              @click="toggleSectionCollapse(section.id)"
            >
              <ChevronDown v-if="!sectionCollapsed(section.id)" class="h-4 w-4" />
              <ChevronRight v-else class="h-4 w-4" />
            </button>
            <p class="truncate font-mono text-[11px] text-muted">
              {{ section.id }}
            </p>
          </div>
          <label class="flex cursor-pointer items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted">
            <input v-model="section.enabled" type="checkbox" class="accent-gold">
            Visible sur le site
          </label>
        </div>

        <div
          v-show="!sectionCollapsed(section.id)"
          class="border-t border-ink/10 pt-4 dark:border-white/10"
        >
        <div v-if="section.type === 'hero'" class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Accroche
            <input v-model="section.kicker" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <AdminImageField v-model="section.image" label="Visuel" />
          <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Titre
            <input v-model="section.title" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Sous-titre (optionnel, sous le titre)
            <textarea
              v-model="section.subtitle"
              rows="2"
              class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
              placeholder="Une phrase pour densifier le hero sans surcharger le titre."
            />
          </label>
          <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
            CTA principal
            <input v-model="section.primaryCta.label" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Lien CTA principal
            <input v-model="section.primaryCta.href" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <template v-if="section.secondaryCta">
            <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
              CTA secondaire
              <input v-model="section.secondaryCta.label" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
            </label>
            <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
              Lien CTA secondaire
              <input v-model="section.secondaryCta.href" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
            </label>
          </template>
        </div>

        <div v-else-if="section.type === 'story'" class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Mise en page
            <select v-model="section.layout" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
              <option value="imageLeft">Image à gauche</option>
              <option value="imageRight">Image à droite</option>
              <option value="stack">Empilé (mobile first)</option>
            </select>
          </label>
          <div class="md:col-span-2">
            <AdminImageField v-model="section.image" label="Visuel" />
          </div>
          <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Titre
            <input v-model="section.title" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Texte
            <textarea v-model="section.body" rows="4" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10" />
          </label>
        </div>

        <div v-else-if="section.type === 'video_spotlight'" class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <p class="md:col-span-2 rounded-wax border border-gold/25 bg-gold/5 px-3 py-2 text-xs leading-relaxed text-muted dark:border-gold/30 dark:bg-gold/10">
            <strong class="font-semibold text-ink dark:text-paper">Recommandé :</strong> envoyez votre affiche et votre
            vidéo MP4 ci-dessous. Les liens externes sont utiles seulement si la vidéo est déjà hébergée ailleurs.
          </p>
          <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Surtitre (optionnel)
            <input v-model="section.eyebrow" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Titre
            <input v-model="section.title" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Sous-titre (optionnel)
            <textarea v-model="section.subtitle" rows="2" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10" />
          </label>
          <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Légende sous la vidéo (optionnel)
            <textarea v-model="section.body" rows="2" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10" />
          </label>
          <div class="md:col-span-2">
            <AdminImageField v-model="section.poster" label="Affiche / poster (upload recommandé)" />
          </div>
          <div class="md:col-span-2">
            <AdminVideoUploadField
              v-model="section.mp4Url"
              label="Vidéo MP4 (upload recommandé, max 80 Mo)"
              @local-file="section.youtubeUrl = ''"
            />
          </div>
          <details class="md:col-span-2 rounded-wax border border-dashed border-ink/20 p-3 dark:border-white/20">
            <summary class="cursor-pointer select-none text-xs font-bold uppercase tracking-[0.22em] text-muted">
              Lien externe YouTube ou .mp4 (optionnel)
            </summary>
            <label class="mt-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              URL
              <input
                :value="videoSourceDisplay(section)"
                class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
                placeholder="https://www.youtube.com/watch?v=… ou https://…/fichier.mp4"
                @input="setVideoSourceDisplay(section, ($event.target as HTMLInputElement).value)"
              >
            </label>
            <p class="mt-2 text-xs text-muted">
              Si un lien YouTube est renseigné, il est lu en priorité ; sinon le MP4 uploadé ou l’URL .mp4 ; sinon
              affichage de l’affiche seule.
            </p>
          </details>
        </div>

        <div v-else-if="section.type === 'parallax_video'" class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <p class="md:col-span-2 rounded-wax border border-gold/25 bg-gold/5 px-3 py-2 text-xs leading-relaxed text-muted dark:border-gold/30 dark:bg-gold/10">
            <strong class="font-semibold text-ink dark:text-paper">Recommandé :</strong> remplacez l’image et la vidéo
            par vos fichiers (upload). Les visuels fournis avec le thème sont des exemples — un clic sur « Choisir un
            fichier » suffit pour les remplacer.
          </p>
          <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Hauteur du bandeau
            <select v-model="section.minHeight" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
              <option value="short">
                Plus bas (~56 % de l’écran)
              </option>
              <option value="medium">
                Moyen (~70 %)
              </option>
              <option value="tall">
                Haut (~85 %)
              </option>
            </select>
          </label>
          <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Opacité du voile sombre (10–90)
            <input
              v-model.number="section.overlayOpacity"
              type="number"
              min="10"
              max="90"
              class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
            >
          </label>
          <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Surtitre (ex. Univers Hommes)
            <input v-model="section.eyebrow" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Sous-titre (ligne fine au-dessus du grand titre)
            <textarea v-model="section.subtitle" rows="2" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10" />
          </label>
          <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Grand titre (affiché en blanc, centré)
            <input v-model="section.title" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <div class="md:col-span-2">
            <AdminImageField v-model="section.poster" label="Image / poster de fond (upload recommandé)" />
          </div>
          <div class="md:col-span-2">
            <AdminVideoUploadField
              v-model="section.mp4Url"
              label="Vidéo MP4 en fond (upload recommandé, max 80 Mo)"
              @local-file="section.youtubeUrl = ''"
            />
          </div>
          <details class="md:col-span-2 rounded-wax border border-dashed border-ink/20 p-3 dark:border-white/20">
            <summary class="cursor-pointer select-none text-xs font-bold uppercase tracking-[0.22em] text-muted">
              Lien externe YouTube ou .mp4 (optionnel)
            </summary>
            <label class="mt-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              URL
              <input
                :value="videoSourceDisplay(section)"
                class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
                placeholder="https://www.youtube.com/watch?v=… ou https://…/fichier.mp4"
                @input="setVideoSourceDisplay(section, ($event.target as HTMLInputElement).value)"
              >
            </label>
            <p class="mt-2 text-xs text-muted">
              Sans vidéo : l’image uploadée (poster) suffit. Avec lien YouTube : priorité sur le MP4.
            </p>
          </details>
          <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Libellé du bouton
            <input v-model="section.cta.label" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Lien du bouton
            <input v-model="section.cta.href" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <p class="md:col-span-2 text-xs text-muted">
            Effet parallaxe au scroll sur le fond. Remplacez les textes et médias : tout est déjà pré-rempli pour gagner
            du temps.
          </p>
        </div>

        <div v-else-if="section.type === 'category_showcase'" class="space-y-4">
          <label class="block text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Surtitre (optionnel)
            <input v-model="section.eyebrow" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <label class="block text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Titre
            <input v-model="section.title" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <label class="block text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Sous-titre (optionnel)
            <input v-model="section.subtitle" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <p class="text-xs text-muted">
            Chaque tuile : lien <strong class="text-ink dark:text-paper">personnalisé</strong> (champ URL) ou bien
            filtres <strong class="text-ink dark:text-paper">catégorie / genre</strong> → ouvre la boutique filtrée
            (<code class="rounded bg-ink/5 px-1 dark:bg-white/10">/shop?cat=…&amp;genre=…</code>). Utilisez la barre
            dorée pour réordonner les tuiles.
          </p>
          <VueDraggable
            v-model="section.tiles"
            handle=".mini-drag-tile"
            :animation="180"
            ghost-class="landing-sortable-ghost"
            chosen-class="landing-sortable-chosen"
            class="space-y-3"
          >
            <div
              v-for="(tile, idx) in section.tiles"
              :key="`${section.id}-tile-${idx}`"
              class="rounded-wax border border-ink/10 p-3 dark:border-white/10"
            >
              <button
                type="button"
                class="mini-drag-tile mb-2 flex w-full touch-manipulation items-center gap-2 rounded-wax border border-ink/10 bg-gold/5 px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted transition hover:border-gold/50 dark:border-white/10 dark:bg-gold/10"
              >
                <GripVertical class="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span>Tuile {{ idx + 1 }} — glisser pour réordonner</span>
              </button>
              <div class="mb-2 flex items-center justify-end">
                <button
                  type="button"
                  class="text-[10px] uppercase text-red-500 underline"
                  @click="removeShowcaseTile(section, idx)"
                >
                  Retirer
                </button>
              </div>
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
                  Titre
                  <input v-model="tile.title" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
                </label>
                <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
                  Sous-titre
                  <input v-model="tile.subtitle" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
                </label>
                <AdminImageField v-model="tile.image" label="Image" />
                <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
                  Id catégorie (boutique)
                  <input
                    v-model="tile.categoryId"
                    class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
                    placeholder="ex. montres"
                  >
                </label>
                <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
                  Genre (boutique)
                  <select
                    v-model="tile.genre"
                    class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
                  >
                    <option value="">
                      Tous
                    </option>
                    <option value="homme">
                      Homme
                    </option>
                    <option value="femme">
                      Femme
                    </option>
                    <option value="unisexe">
                      Unisexe
                    </option>
                  </select>
                </label>
                <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
                  URL complète (prioritaire)
                  <input
                    v-model="tile.href"
                    class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
                    placeholder="/heritage ou https://…"
                  >
                </label>
              </div>
            </div>
          </VueDraggable>
          <button
            type="button"
            class="mt-1 rounded-wax border border-dashed border-ink/20 px-4 py-2 text-xs font-bold uppercase text-muted dark:border-white/20"
            @click="addShowcaseTile(section)"
          >
            + Ajouter une tuile
          </button>
        </div>

        <div v-else-if="section.type === 'trust_strip'" class="space-y-4">
          <label class="block text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Surtitre (optionnel)
            <input v-model="section.eyebrow" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <label class="block text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Titre (optionnel)
            <input v-model="section.title" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <p class="text-xs text-muted">
            Les blocs défilent horizontalement sur la vitrine (sauf si animations réduites  est activé sur l’appareil).
            Réordonnez-les avec la barre sous le titre de chaque carte.
          </p>
          <VueDraggable
            v-model="section.items"
            handle=".mini-drag-trust"
            :animation="180"
            ghost-class="landing-sortable-ghost"
            chosen-class="landing-sortable-chosen"
            class="space-y-3"
          >
            <div
              v-for="(item, idx) in section.items"
              :key="`${section.id}-trust-${idx}`"
              class="rounded-wax border border-ink/10 p-3 dark:border-white/10"
            >
              <button
                type="button"
                class="mini-drag-trust mb-2 flex w-full touch-manipulation items-center gap-2 rounded-wax border border-ink/10 bg-gold/5 px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted transition hover:border-gold/50 dark:border-white/10 dark:bg-gold/10"
              >
                <GripVertical class="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span>Bloc {{ idx + 1 }} — glisser pour réordonner</span>
              </button>
              <div class="mb-2 flex items-center justify-end">
                <button
                  type="button"
                  class="text-[10px] uppercase text-red-500 underline"
                  @click="removeTrustItem(section, idx)"
                >
                  Retirer
                </button>
              </div>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
                  Icône
                  <select v-model="item.icon" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-2 py-2 text-sm dark:border-white/10">
                    <option v-for="ic in TRUST_ICONS" :key="ic" :value="ic">
                      {{ ic }}
                    </option>
                  </select>
                </label>
                <label class="sm:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
                  Titre
                  <input v-model="item.title" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
                </label>
                <label class="sm:col-span-3 text-xs font-bold uppercase tracking-[0.28em] text-muted">
                  Texte
                  <input v-model="item.body" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
                </label>
              </div>
            </div>
          </VueDraggable>
          <button
            type="button"
            class="mt-1 rounded-wax border border-dashed border-ink/20 px-4 py-2 text-xs font-bold uppercase text-muted dark:border-white/20"
            @click="addTrustItem(section)"
          >
            + Ajouter un bloc
          </button>
        </div>

        <div v-else-if="section.type === 'featured_products'" class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Titre
            <input v-model="section.title" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Sous-titre
            <input v-model="section.subtitle" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
            Libellé lien
            <input v-model="section.browseLabel" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <label class="text-xs font-bold uppercase tracking-[0.28em] text-muted">
            URL lien
            <input v-model="section.browseHref" class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10">
          </label>
          <label class="md:col-span-2 text-xs font-bold uppercase tracking-[0.28em] text-muted">
            IDs produits (séparés par des virgules)
            <input
              :value="section.productIds.join(',')"
              class="mt-2 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
              @input="updateProductIds(section, $event)"
            >
          </label>
        </div>
        </div>
      </article>
    </VueDraggable>
  </div>
</template>

<style scoped>
.landing-sortable-ghost {
  opacity: 0.55;
}
.landing-sortable-chosen {
  box-shadow:
    0 10px 40px -10px rgb(0 0 0 / 0.2),
    0 0 0 2px rgb(212 175 55 / 0.45);
}
</style>
