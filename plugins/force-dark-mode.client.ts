export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()

  // Force le mode sombre partout, même si un choix "light" avait été stocké.
  colorMode.preference = 'dark'
  colorMode.value = 'dark'

  // Nettoie la clé de persistance pour éviter qu’un ancien choix ne revienne.
  try {
    localStorage.removeItem('waxtu-color-mode')
  }
  catch {
    // ignore
  }
})

