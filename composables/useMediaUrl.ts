import { resolveCmsImageUrl, resolveMediaUrl } from '../utils/cms-media'

/** Usage depuis le `<script setup>` uniquement (pas dans le template). */
export function useMediaUrl(path: string | undefined | null): string {
  const config = useRuntimeConfig()
  return resolveMediaUrl(path, String(config.public?.siteUrl || ''))
}

/** Usage depuis le `<script setup>` uniquement ; dans le template préférer `useCmsImg()`. */
export function useCmsImageUrl(path: string | undefined | null): string {
  const config = useRuntimeConfig()
  return resolveCmsImageUrl(path, String(config.public?.siteUrl || ''))
}
