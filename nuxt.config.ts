// https://nuxt.com/docs/api/configuration/nuxt-config
import { defaultPublicSiteUrlFromEnv } from './utils/public-site-url-default'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  /** Racine du code Vue : `pages/`, `layouts/`, etc. à la racine du projet (pas seulement sous `app/`). */
  srcDir: '.',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxtjs/color-mode', '@vueuse/nuxt'],
  colorMode: {
    classSuffix: '',
    /** Défaut clair (maquette) ; l’utilisateur peut basculer (nav) ou suivre l’OS en changeant la préférence. */
    preference: 'light',
    fallback: 'light',
    storageKey: 'waxtu-color-mode',
  },
  css: ['./app/assets/css/main.css'],
  app: {
    head: {
      title: 'WAXTU',
      htmlAttrs: { lang: 'fr' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#F9F9F7' },
        { name: 'description', content: 'WAXTU — luxe sénégalais, montres et maroquinerie.' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap',
        },
      ],
    },
  },
  runtimeConfig: {
    /** Connexion admin : email + mot de passe (.env NUXT_ADMIN_EMAIL / NUXT_ADMIN_PASSWORD). */
    adminEmail: '',
    adminPassword: '',
    /** Secret pour signer les JWT (min. 32 caractères aléatoires en prod). */
    adminSessionSecret: '',
    /** Ancien jeton statique ; sert aussi de repli pour signer le JWT si adminSessionSecret est vide. */
    adminToken: '',
    paytechApiKey: '',
    paytechApiSecret: '',
    /**
     * Base URL HTTPS dédiée à l’IPN PayTech (ex. tunnel ngrok vers le port local).
     * Si vide, l’IPN utilise NUXT_PUBLIC_SITE_URL (doit alors être en https).
     */
    paytechIpnPublicUrl: '',
    /** Dev uniquement : accepter l’IPN sans HMAC / SHA256 (ne jamais activer en prod). */
    paytechIpnSkipVerify: false,
    /** Espace client (JWT cookie httpOnly) — min. 32 caractères en prod, ex. openssl rand -hex 32 */
    customerSessionSecret: '',
    /** Resend : https://resend.com — notification commande payée */
    resendApiKey: '',
    /** Expéditeur vérifié chez Resend, ex. WAXTU <commandes@votredomaine.com> */
    mailFrom: '',
    /** Destinataire interne (boutique) pour chaque paiement confirmé */
    mailToShop: '',
    public: {
      /** En prod Vercel, dérivé de VERCEL_* si NUXT_PUBLIC_SITE_URL absent. */
      siteUrl: defaultPublicSiteUrlFromEnv(),
    },
  },
  vite: {
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit'],
    },
    server: {
      watch: {
        /** Réduit les EPERM « operation not permitted, watch » sous Windows / antivirus. */
        usePolling: true,
        interval: 1000,
      },
    },
  },
})
