import type { Ref } from 'vue'

function prefersReducedMotion(): boolean {
  if (!import.meta.client) return false
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  catch {
    return false
  }
}

/**
 * Décale verticalement une couche de fond au scroll tant que la section intersecte le viewport.
 * Désactivé si `prefers-reduced-motion: reduce`.
 */
export function useHeroParallax(
  sectionRef: Ref<HTMLElement | null>,
  options?: { strength?: number; maxShift?: number },
) {
  const strength = options?.strength ?? 0.38
  const maxShift = options?.maxShift ?? 160
  const offsetPx = ref(0)

  let rafId = 0
  let scheduled = false

  function tick() {
    scheduled = false
    if (prefersReducedMotion()) {
      offsetPx.value = 0
      return
    }
    if (!import.meta.client) return
    const el = sectionRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.bottom < 0 || rect.top > window.innerHeight) return
    // Plus le hero remonte (scroll vers le bas), plus le fond glisse — effet nettement visible
    const raw = -rect.top * strength
    offsetPx.value = Math.max(-maxShift, Math.min(maxShift, raw))
  }

  function schedule() {
    if (scheduled) return
    scheduled = true
    rafId = requestAnimationFrame(() => {
      rafId = 0
      tick()
    })
  }

  let stopScroll: (() => void) | undefined
  let stopResize: (() => void) | undefined
  let stopMedia: (() => void) | undefined

  onMounted(() => {
    if (!import.meta.client) return
    stopScroll = useEventListener(window, 'scroll', schedule, { passive: true, capture: false })
    stopResize = useEventListener(window, 'resize', schedule, { passive: true })
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => tick()
    mq.addEventListener('change', onMq)
    stopMedia = () => mq.removeEventListener('change', onMq)
    nextTick(() => {
      schedule()
      requestAnimationFrame(schedule)
    })
  })

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId)
    stopScroll?.()
    stopResize?.()
    stopMedia?.()
  })

  const layerStyle = computed(() => {
    if (import.meta.server || prefersReducedMotion()) return {}
    return { transform: `translate3d(0, ${offsetPx.value}px, 0)` }
  })

  return { layerStyle }
}
