export type SectionLayout = 'imageLeft' | 'imageRight' | 'stack'

export interface CmsHeroSection {
  id: string
  type: 'hero'
  enabled: boolean
  order: number
  layout: 'center'
  kicker: string
  title: string
  subtitle?: string
  image: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

export interface CmsStorySection {
  id: string
  type: 'story'
  enabled: boolean
  order: number
  layout: SectionLayout
  eyebrow: string
  title: string
  body: string
  image: string
  link?: { label: string; href: string }
}

export interface CmsFeaturedProductsSection {
  id: string
  type: 'featured_products'
  enabled: boolean
  order: number
  layout: SectionLayout
  title: string
  subtitle: string
  browseLabel: string
  browseHref: string
  productIds: number[]
}

/** Icônes disponibles pour la bande « confiance » (défilante). */
export type TrustStripIcon = 'truck' | 'shield' | 'credit' | 'support' | 'package'

export interface CmsTrustStripItem {
  title: string
  body: string
  icon: TrustStripIcon
}

export interface CmsTrustStripSection {
  id: string
  type: 'trust_strip'
  enabled: boolean
  order: number
  eyebrow?: string
  title?: string
  items: CmsTrustStripItem[]
}

/** Tuile grande image : lien libre ou filtre boutique `?cat=id`. */
export interface CmsCategoryShowcaseTile {
  title: string
  subtitle: string
  image: string
  /** Si `href` est vide : lien vers `/shop` (filtres `cat`/`genre` selon les champs renseignés). */
  categoryId?: string
  genre?: ProductGender
  href?: string
}

export interface CmsCategoryShowcaseSection {
  id: string
  type: 'category_showcase'
  enabled: boolean
  order: number
  eyebrow?: string
  title: string
  subtitle?: string
  tiles: CmsCategoryShowcaseTile[]
}

/** Hauteur du bandeau « vidéo parallaxe » (plein écran relatif). */
export type ParallaxVideoHeight = 'short' | 'medium' | 'tall'

/**
 * Bandeau plein écran : vidéo ou image en fond avec parallax, titre blanc centré, CTA bordure
 * (style vitrine type Hommes / Femmes).
 */
export interface CmsParallaxVideoSection {
  id: string
  type: 'parallax_video'
  enabled: boolean
  order: number
  minHeight?: ParallaxVideoHeight
  eyebrow?: string
  title: string
  subtitle?: string
  poster: string
  youtubeUrl: string
  mp4Url: string
  cta: { label: string; href: string }
  /** Opacité du voile sombre sur le média (0–100). Défaut ~42. */
  overlayOpacity?: number
}

/** Bloc vidéo pleine largeur (YouTube ou fichier .mp4), textes et affiche éditables en admin. */
export interface CmsVideoSpotlightSection {
  id: string
  type: 'video_spotlight'
  enabled: boolean
  order: number
  eyebrow?: string
  title: string
  subtitle?: string
  /** Légende sous le lecteur (optionnel). */
  body?: string
  /** Image de couverture (affiche native + repli si pas de lecteur). */
  poster: string
  /**
   * Lien YouTube (watch, youtu.be, shorts ou embed).
   * Si renseigné en même temps que `mp4Url`, la priorité d’affichage est YouTube.
   */
  youtubeUrl: string
  /** URL directe d’un fichier .mp4 (absolu ou chemin `/uploads/…`). */
  mp4Url: string
}

export type LandingSection =
  | CmsHeroSection
  | CmsStorySection
  | CmsFeaturedProductsSection
  | CmsTrustStripSection
  | CmsCategoryShowcaseSection
  | CmsVideoSpotlightSection
  | CmsParallaxVideoSection

export interface CmsCategory {
  /** Identifiant stable (URL-friendly), ex. maroquinerie */
  id: string
  /** Nom affiché en boutique */
  name: string
}

export interface CmsProduct {
  id: number
  name: string
  /** Date de création ISO (sert pour les nouveautés et le tri récent). */
  createdAt: string
  /** Référence à une entrée de `cms.categories`. */
  categoryId: string
  /** Libellé affiché (aligné sur la catégorie ; rempli à la lecture si ancien JSON). */
  category: string
  /** Cible de style principale (filtres boutique). */
  genre: ProductGender
  /** Prix de vente actuel (FCFA). */
  price: number
  /**
   * Prix d’origine plus élevé (FCFA), affiché barré si présent.
   * Doit être strictement supérieur à `price` ; sinon ignoré à la normalisation.
   */
  compareAtPrice?: number
  /** Produit affiché en boutique et achetable. */
  forSale: boolean
  /** Quantité disponible (0 = rupture). */
  stock: number
  tagline: string
  images: string[]
  description: string
  story: string
  details: string[]
  reviews: { user: string; rating: number; comment: string }[]
}

export type ProductGender = 'homme' | 'femme' | 'unisexe'

export interface CmsPromotions {
  active: boolean
  title: string
  subtitle?: string
  code: string
  percentOff: number
  minAmount?: number
}

export interface CmsPaytechSettings {
  env: 'test' | 'prod'
  successPath: string
  cancelPath: string
  ipnPath: string
  isMobileFlow: boolean
}

export interface CmsCheckoutCopy {
  pageTitle: string
  emptyCartMessage: string
  emptyCartLink: string
  summarySubtotal: string
  summaryTotal: string
  coordTitle: string
  coordHint: string
  emailLabel: string
  emailPlaceholder: string
  nameLabel: string
  phoneLabel: string
  phonePlaceholder: string
  payTitle: string
  payBody: string
  payButton: string
}

export interface CmsRedirectCopy {
  pageTitle: string
  mainTitle: string
  subtitle: string
  manualHint: string
  manualLink: string
  backLink: string
}

export interface CmsSuccessCopy {
  kicker: string
  title: string
  subtitle: string
  refLabel: string
  amountLabel: string
  refHint: string
  ctaLabel: string
  helpLink: string
}

export interface CmsContactCopy {
  pageTitle: string
  heading: string
  quote: string
  address: string
  /** Affiché sur la page contact ; sert aussi pour appel, WhatsApp (menu / pied de page). */
  phone: string
  email: string
  /** Lien profil ou publication Instagram (https://…). */
  instagramUrl: string
  /** Lien page Facebook (https://…). */
  facebookUrl: string
  formFirstName: string
  formLastName: string
  formEmail: string
  formMessage: string
  submitLabel: string
}

export interface CmsLegalPage {
  title: string
  paragraphs: string[]
}

export interface CmsProductPageCopy {
  inStock: string
  stockSeparator: string
  addToCart: string
  deliveryTitle: string
  deliverySub: string
  warrantyTitle: string
  warrantySub: string
  blockKicker: string
  blockTitle: string
  matieresTitle: string
  matieresBody: string
  storyBlockTitle: string
  ficheTitle: string
  avisTitle: string
  noReviews: string
  crossSellTitle: string
  crossSellCta: string
}

export type NewArrivalsPlacement = 'hidden' | 'after_hero' | 'after_trust'

export interface CmsStorefrontSettings {
  /** Position du bloc nouveautés sur la landing. */
  newArrivalsPlacement: NewArrivalsPlacement
}

/** Page /lookbook — quatre visuels (même grille que la maquette). */
export interface CmsLookbookImage {
  src: string
  alt: string
}

export interface CmsLookbookPage {
  pageTitle: string
  heading: string
  images: CmsLookbookImage[]
}

/** Page /heritage — manifeste, bandeau « film », deux colonnes texte + image. */
export interface CmsHeritagePage {
  pageTitle: string
  eyebrow: string
  manifestTitle: string
  manifestBody: string
  filmLabel: string
  filmPoster: string
  filmPosterAlt: string
  block1Title: string
  block1Body: string
  block1Image: string
  block1ImageAlt: string
  block2Title: string
  block2Body: string
  block2Image: string
  block2ImageAlt: string
}

/** Textes de la page Mon compte (connexion, favoris, fidélité). */
export interface CmsAccountCopy {
  pageTitle: string
  pageHeading: string
  backToShopLabel: string
  /** Lien du bouton retour (ex. /shop). */
  backToShopHref: string
  /** Affiché avant l’email du client connecté. */
  connectedPrefix: string
  loyaltyKicker: string
  loyaltyHint: string
  favoritesKicker: string
  logoutLabel: string
  loginTab: string
  registerTab: string
  loginSubmit: string
  registerSubmit: string
  registerPasswordHint: string
  formEmailLabel: string
  formPasswordLabel: string
  formPasswordConfirmLabel: string
}

/** Libellés du menu vitrine (routes fixes : /, /shop, /lookbook, /heritage, /contact). */
export interface CmsSiteNav {
  home: string
  shop: string
  lookbook: string
  heritage: string
  contact: string
}

export interface CmsSite {
  checkout: CmsCheckoutCopy
  redirect: CmsRedirectCopy
  success: CmsSuccessCopy
  contact: CmsContactCopy
  /** Titres affichés dans le menu et le pied de page. */
  nav: CmsSiteNav
  legal: {
    cgv: CmsLegalPage
    mentions: CmsLegalPage
    privacy: CmsLegalPage
  }
  productPage: CmsProductPageCopy
  storefront: CmsStorefrontSettings
  account: CmsAccountCopy
  lookbook: CmsLookbookPage
  heritage: CmsHeritagePage
}

export interface WaxtuCms {
  version: 1
  global: {
    brand: string
    tagline: string
  }
  promotions: CmsPromotions
  paytech: CmsPaytechSettings
  /** Textes des pages (checkout, légal, contact, fiche produit…). */
  site: CmsSite
  /** Catégories boutique (filtres + fiche produit). */
  categories: CmsCategory[]
  sections: LandingSection[]
  products: CmsProduct[]
}
