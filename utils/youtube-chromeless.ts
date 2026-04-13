import { parseYouTubeEmbedSrc } from './youtube-embed'

/**
 * URL d’iframe YouTube : boucle, sans barre de contrôle, autoplay muet si demandé.
 */
export function buildChromelessYoutubeIframeSrc(youtubeInput: string, allowAutoplay: boolean): string {
  const base = parseYouTubeEmbedSrc(youtubeInput)
  if (!base) return ''
  const vidMatch = base.match(/\/embed\/([^/?]+)/)
  const vid = vidMatch?.[1] ?? ''
  try {
    const u = new URL(base)
    u.searchParams.set('rel', '0')
    u.searchParams.set('loop', '1')
    if (vid) u.searchParams.set('playlist', vid)
    u.searchParams.set('controls', '0')
    u.searchParams.set('modestbranding', '1')
    if (allowAutoplay) {
      u.searchParams.set('autoplay', '1')
      u.searchParams.set('mute', '1')
      u.searchParams.set('playsinline', '1')
    }
    return u.toString()
  }
  catch {
    const auto = allowAutoplay ? '&autoplay=1&mute=1&playsinline=1' : ''
    const pl = vid ? `&loop=1&playlist=${encodeURIComponent(vid)}` : ''
    return `${base}?rel=0&controls=0&modestbranding=1${pl}${auto}`
  }
}
