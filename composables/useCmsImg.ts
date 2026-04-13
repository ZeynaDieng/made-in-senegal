import { resolveCmsImageUrl } from '../utils/cms-media'

/**
 * À appeler une fois dans `<script setup>` ; utiliser la fonction retournée dans le template
 * (`:src="cmsImg(url)"`) pour éviter d’appeler `useRuntimeConfig` hors contexte Nuxt.
 */
export function useCmsImg() {
  const config = useRuntimeConfig()
  const base = computed(() => String(config.public?.siteUrl || '').replace(/\/$/, ''))
  return (path: string | undefined | null) => resolveCmsImageUrl(path, base.value)
}
