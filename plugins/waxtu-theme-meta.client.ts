/**
 * Aligne la meta theme-color du navigateur avec le thème Nuxt (clair / sombre).
 */
export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()

  useHead(() => ({
    meta: [
      {
        name: 'theme-color',
        content: colorMode.value === 'dark' ? '#0A0A0A' : '#F9F9F7',
      },
    ],
  }))
})
