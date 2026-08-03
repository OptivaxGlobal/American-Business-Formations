import { useEffect, useRef } from 'react'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// Shared focus-trap/restore behavior for any open overlay (modal, drawer,
// mobile nav panel): Escape closes it, Tab cycles within the container
// instead of escaping to the page behind it, and focus returns to whatever
// had it before the overlay opened. Extracted from Modal.jsx's original
// implementation so Drawer.jsx and the header's mobile nav share one
// correct implementation instead of three divergent ones.
export default function useFocusTrap(containerRef, isOpen, onClose, { autoFocus = true, lockScroll = true } = {}) {
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    previouslyFocused.current = document.activeElement

    const onKeyDown = (e) => {
      if (e.key === 'Escape') { onClose?.(); return }
      if (e.key !== 'Tab' || !containerRef.current) return
      const focusables = containerRef.current.querySelectorAll(FOCUSABLE)
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    document.addEventListener('keydown', onKeyDown)
    if (lockScroll) document.body.style.overflow = 'hidden'
    if (autoFocus) containerRef.current?.querySelector(FOCUSABLE)?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (lockScroll) document.body.style.overflow = ''
      previouslyFocused.current?.focus?.()
    }
  }, [isOpen, onClose, containerRef, autoFocus, lockScroll])
}
