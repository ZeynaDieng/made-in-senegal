export default defineNuxtPlugin(() => {
  if (!import.meta.dev) return

  const PX_TOLERANCE = 1

  function getSelector(el: Element) {
    const parts: string[] = []
    let cur: Element | null = el
    for (let i = 0; i < 4 && cur; i++) {
      const tag = cur.tagName.toLowerCase()
      const id = (cur as HTMLElement).id ? `#${(cur as HTMLElement).id}` : ''
      const cls = (cur as HTMLElement).className
        ? `.${String((cur as HTMLElement).className)
          .trim()
          .split(/\s+/)
          .slice(0, 3)
          .join('.')}`
        : ''
      parts.unshift(`${tag}${id}${cls}`)
      cur = cur.parentElement
    }
    return parts.join(' > ')
  }

  function scanOverflowX() {
    const doc = document.documentElement
    const viewportW = window.innerWidth
    const scrollW = doc.scrollWidth

    if (scrollW <= viewportW + PX_TOLERANCE) return

    const offenders: Array<{ el: Element; right: number; width: number }> = []
    const elements = Array.from(document.body.querySelectorAll('*'))

    for (const el of elements) {
      const rect = (el as HTMLElement).getBoundingClientRect?.()
      if (!rect) continue
      if (rect.width <= 0 || rect.height <= 0) continue
      if (rect.right > viewportW + PX_TOLERANCE) {
        offenders.push({ el, right: rect.right, width: rect.width })
      }
    }

    offenders.sort((a, b) => b.right - a.right)

    // eslint-disable-next-line no-console
    console.groupCollapsed(
      `[waxtu] overflow-x détecté: scrollWidth=${scrollW}px, viewport=${viewportW}px, offenders=${offenders.length}`,
    )
    for (const o of offenders.slice(0, 20)) {
      // eslint-disable-next-line no-console
      console.log(
        `${getSelector(o.el)}  right=${Math.round(o.right)}px  width=${Math.round(o.width)}px`,
        o.el,
      )
    }
    // eslint-disable-next-line no-console
    console.groupEnd()
  }

  // Expose un hook manuel: `window.__waxtuScanOverflowX?.()`
  ;(window as any).__waxtuScanOverflowX = scanOverflowX

  // Après rendu initial + au resize.
  window.addEventListener('load', () => setTimeout(scanOverflowX, 0), { once: true })
  window.addEventListener('resize', () => setTimeout(scanOverflowX, 0))

  // Après navigation Nuxt.
  const router = useRouter()
  router.afterEach(() => setTimeout(scanOverflowX, 0))
})

