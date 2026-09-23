'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Efekty całej strony, bez własnego DOM:
 *  - Lenis: płynny, "ciężki" scroll (wyłączony przy prefers-reduced-motion).
 * (Fold-in kart i reflektor pod kursorem usunięte w przeglądzie "mniej efektów" —
 *  sekcje mają własne, jednorazowe wejścia.)
 */
export default function PageEffects() {
  useEffect(() => {
    // hero ma zawsze startować od góry (wejście wyspy), więc bez przywracania scrolla po odświeżeniu
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    if (!location.hash) window.scrollTo(0, 0)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 0.95, smoothWheel: true }) // krócej: kamera i teczki mają jeszcze własne sprężyny
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
    let raf = 0
    const loop = (t: number) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    // wejście z linkiem do sekcji (np. /#contact) — Lenis przejmuje scroll, więc skaczemy sami
    if (location.hash) {
      const target = document.querySelector(location.hash) as HTMLElement | null
      if (target) window.setTimeout(() => lenis.scrollTo(target, { offset: -72, immediate: true }), 60)
    }
    // kotwice (#about itd.) przez Lenis, żeby przewijanie było spójne
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const id = a.getAttribute('href')
      if (!id || id === '#') return
      const el = document.querySelector(id)
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el as HTMLElement, { offset: -72 })
    }
    document.addEventListener('click', onClick)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('click', onClick)
      lenis.destroy()
      delete (window as unknown as { __lenis?: Lenis }).__lenis
    }
  }, [])

  return null
}
