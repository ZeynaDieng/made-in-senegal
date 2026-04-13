/** Limite simple par IP : max `max` soumissions par fenêtre `windowMs`. */
const buckets = new Map<string, number[]>()

export function contactRateLimitHit(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const key = ip || 'unknown'
  const prev = buckets.get(key) ?? []
  const recent = prev.filter((t) => now - t < windowMs)
  if (recent.length >= max) {
    buckets.set(key, recent)
    return true
  }
  recent.push(now)
  buckets.set(key, recent)
  return false
}
