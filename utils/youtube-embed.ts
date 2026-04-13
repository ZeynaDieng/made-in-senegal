/**
 * Construit une URL d’embed YouTube uniquement à partir d’identifiants reconnus
 * (évite d’injecter une iframe vers un domaine arbitraire).
 */
const ID_RE = /[a-zA-Z0-9_-]{11}/

function extractIdFromUrl(s: string): string | null {
  const trimmed = s.trim()
  if (!trimmed) return null

  const embed = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
  if (embed?.[1]) return embed[1]

  const watch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (watch?.[1]) return watch[1]

  const short = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (short?.[1]) return short[1]

  const shorts = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
  if (shorts?.[1]) return shorts[1]

  if (/^https?:\/\//i.test(trimmed)) return null

  const bare = trimmed.match(/^([a-zA-Z0-9_-]{11})$/)
  if (bare?.[1]) return bare[1]

  return null
}

/** Retourne `https://www.youtube.com/embed/{id}` ou `null` si non reconnu. */
export function parseYouTubeEmbedSrc(input: string): string | null {
  const id = extractIdFromUrl(input)
  if (!id || !ID_RE.test(id)) return null
  return `https://www.youtube.com/embed/${id}`
}
