import type { CmsSite } from '../types/cms'

/** Textes éditables du site (hors page d’accueil déjà gérée par les sections CMS). */
export const defaultSite: CmsSite = {
  nav: {
    home: 'Home',
    shop: 'Shop',
    lookbook: 'Lookbook',
    heritage: 'Héritage',
    contact: 'Contact',
  },
  checkout: {
    pageTitle: 'Finaliser votre commande',
    emptyCartMessage: 'Votre panier est vide.',
    emptyCartLink: 'Retour à la boutique',
    summarySubtotal: 'Sous-total',
    summaryTotal: 'Total',
    coordTitle: 'Coordonnées',
    coordHint: 'Requises pour la confirmation et le suivi de votre commande.',
    emailLabel: 'Email',
    emailPlaceholder: 'vous@exemple.com',
    nameLabel: 'Nom (optionnel)',
    phoneLabel: 'Téléphone (optionnel)',
    phonePlaceholder: '+221 …',
    payTitle: 'Paiement sécurisé',
    payBody:
      'Vous serez redirigé vers notre partenaire de paiement (Orange Money, Wave, cartes bancaires, etc.). Aucune donnée bancaire complète n’est stockée sur ce site.',
    payButton: 'Payer en ligne',
  },
  redirect: {
    pageTitle: 'Paiement en ligne',
    mainTitle: 'Redirection vers la page sécurisée…',
    subtitle: 'Vous allez être redirigé pour finaliser le paiement.',
    manualHint: 'Si rien ne s’ouvre, utilisez le lien ci-dessous.',
    manualLink: 'Ouvrir la page de paiement',
    backLink: 'Retour au panier',
  },
  success: {
    kicker: 'Paiement confirmé',
    title: 'Merci pour votre confiance.',
    subtitle:
      'Votre commande est en cours de traitement. Notre conciergerie vous contactera pour la livraison express à Dakar.',
    refLabel: 'Référence commande',
    amountLabel: 'Montant',
    refHint: 'Conservez cette référence pour toute question (voir la page Contact).',
    ctaLabel: 'Continuer vos emplettes',
    helpLink: 'Besoin d’aide ? Contact',
  },
  contact: {
    pageTitle: 'Conciergerie — WAXTU',
    heading: 'Conciergerie',
    quote:
      ' Une question sur une pièce ? Un besoin de personnalisation ? Notre équipe d\'experts à Dakar est à votre entière disposition. ',
    address: 'Plateau, Rue Carnot, Dakar',
    phone: '+221 78 449 08 08',
    email: 'concierge@waxtu.sn',
    instagramUrl: 'https://www.instagram.com/waxt.u?igsh=bXdmMmpxcG83ODk5',
    facebookUrl: 'https://www.facebook.com/share/1EEqVVHYB7/?mibextid=wwXIfr',
    formFirstName: 'Prénom',
    formLastName: 'Nom',
    formEmail: 'Email',
    formMessage: 'Message',
    submitLabel: 'Envoyer ma demande',
  },
  legal: {
    cgv: {
      title: 'Conditions générales de vente',
      paragraphs: [
        'Les présentes conditions régissent les ventes réalisées sur ce site. Elles doivent être adaptées par vos soins (prix TTC / HT, délais de livraison, droit de rétractation selon la loi applicable, médiation, litiges, etc.).',
        'Commande : toute commande validée et payée en ligne constitue un engagement ferme, sous réserve de disponibilité des produits.',
        'Paiement : les paiements sont traités par un prestataire sécurisé (moyens disponibles selon configuration).',
        'Livraison : les modalités (zones desservies, frais, délais) sont précisées au client après commande ou sur demande via la page Contact.',
      ],
    },
    mentions: {
      title: 'Mentions légales',
      paragraphs: [
        'Le site waxtu est édité par WAXTU International, dont le siège est indiqué à Dakar, Sénégal. Les informations de société (forme juridique, capital, RCS, NINEA, représentant légal) doivent être complétées par vos soins selon votre situation réelle.',
        'Hébergement : à compléter avec le nom et l’adresse de votre hébergeur (ex. fournisseur cloud ou VPS utilisé pour ce site).',
        'Contact : utilisez la page Contact pour toute demande relative au site ou aux commandes.',
      ],
    },
    privacy: {
      title: 'Politique de confidentialité',
      paragraphs: [
        'WAXTU collecte les données nécessaires au traitement des commandes (notamment l’email saisi au paiement) et à la réponse à vos demandes via le formulaire de contact.',
        'Les données de paiement sensibles sont traitées par notre prestataire de paiement ; WAXTU ne conserve pas les numéros de carte complets sur ses serveurs.',
        'Conformément à la réglementation applicable, vous pouvez demander l’accès, la rectification ou la suppression des données vous concernant en contactant WAXTU via la page Contact.',
        'Cette page doit être complétée (base légale, durée de conservation, cookies, transferts hors UE si applicable) avec l’avis d’un professionnel du droit adapté à votre activité.',
      ],
    },
  },
  productPage: {
    inStock: 'En stock',
    stockSeparator: '·',
    addToCart: 'Ajouter au panier',
    deliveryTitle: 'Livraison express',
    deliverySub: 'Dakar sous 24h',
    warrantyTitle: 'Garantie 2 ans',
    warrantySub: 'Réparation à Dakar',
    blockKicker: 'Le Savoir-Faire',
    blockTitle: "Plus qu'un accessoire, un héritage.",
    matieresTitle: 'Matières nobles',
    matieresBody:
      "Nous sélectionnons nos cuirs auprès de tanneries éthiques d'Afrique de l'Ouest, garantissant une durabilité et une esthétique incomparable.",
    storyBlockTitle: "L'âme de Dakar",
    ficheTitle: 'Fiche technique',
    avisTitle: 'Avis de nos membres',
    noReviews: 'Soyez le premier à partager votre expérience.',
    crossSellTitle: 'Complétez votre style',
    crossSellCta: 'Découvrir',
  },
  storefront: {
    newArrivalsPlacement: 'after_hero',
  },
  account: {
    pageTitle: 'Mon compte — WAXTU',
    pageHeading: 'Mon compte',
    backToShopLabel: 'Retour à la boutique',
    backToShopHref: '/shop',
    connectedPrefix: 'Connecté en tant que',
    loyaltyKicker: 'Fidélité',
    loyaltyHint:
      '1 point par tranche de 1\u00a0000\u00a0FCFA sur vos commandes payées (même email que le compte).',
    favoritesKicker: 'Favoris',
    logoutLabel: 'Déconnexion',
    loginTab: 'Connexion',
    registerTab: 'Inscription',
    loginSubmit: 'Se connecter',
    registerSubmit: 'Créer mon compte',
    registerPasswordHint: 'Mot de passe (min. 8 caractères)',
    formEmailLabel: 'Email',
    formPasswordLabel: 'Mot de passe',
    formPasswordConfirmLabel: 'Confirmer le mot de passe',
  },
  lookbook: {
    pageTitle: 'Lookbook — WAXTU',
    heading: 'Inspirations',
    images: [
      {
        src: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1200',
        alt: 'Look 1',
      },
      {
        src: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800',
        alt: 'Look 2',
      },
      {
        src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
        alt: 'Look 3',
      },
      {
        src: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1200',
        alt: 'Look 4',
      },
    ],
  },
  heritage: {
    pageTitle: 'Héritage — WAXTU',
    eyebrow: 'Notre manifeste',
    manifestTitle: 'Le temps est une émotion.',
    manifestBody:
      "Né à Dakar en 2020, WAXTU est le fruit d'une ambition simple : prouver que le luxe peut rimer avec identité africaine, modernité et éthique.",
    filmLabel: 'Visionner le film  Waxtu',
    filmPoster:
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1600',
    filmPosterAlt: 'Film WAXTU',
    block1Title: "L'atelier de Dakar",
    block1Body:
      "C'est ici, dans le quartier historique du Plateau, que nos artisans maroquiniers et horlogers collaborent. Chaque couture, chaque polissage est effectué avec la précision d'un orfèvre.",
    block1Image:
      'https://images.unsplash.com/photo-1522337360788-8b13df772ce1?auto=format&fit=crop&q=80&w=800',
    block1ImageAlt: 'Atelier',
    block2Title: 'Un engagement éthique',
    block2Body:
      "Nous privilégions les circuits courts et les matières locales. En choisissant WAXTU, vous soutenez l'écosystème artisanal du Sénégal.",
    block2Image:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
    block2ImageAlt: 'Matière',
  },
}
