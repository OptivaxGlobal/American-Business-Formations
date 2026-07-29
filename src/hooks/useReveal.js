import { useEffect, useRef, useState } from 'react'

export default function useReveal(options = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.unobserve(node)
      }
    }, { threshold: 0.1, rootMargin: '80px 0px 80px 0px', ...options })
    observer.observe(node)

    // Safety net: content must never stay permanently invisible if the
    // observer misses a callback (e.g. rapid scroll, layout shifts while
    // a sibling animates). Reveal it unconditionally after a short delay.
    const fallback = setTimeout(() => setVisible(true), 1200)

    return () => {
      observer.disconnect()
      clearTimeout(fallback)
    }
  }, [])

  return [ref, visible]
}
