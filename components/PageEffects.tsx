'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { navigateTo } from '@/components/scrollNav'

/**
 * Efekty całej strony, bez własnego DOM:
 *  - Lenis: płynny, "ciężki" scroll (wyłączony przy prefers-reduced-motion),
 *  - kotwice i hash w adresie → navigateTo (components/scrollNav).
 * (Fold-in kart i reflektor pod kursorem usunięte w przeglądzie "mniej efektów" —
 *  sekcje mają własne, jednorazowe wejścia.)
 */
export default function PageEffects() {
  useEffect(() => {
    // hero ma zawsze startować od góry (wejście wyspy), więc bez przywracania scrolla po odświeżeniu
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    // …ale nie, jeśli użytkownik zaczął już przewijać przed hydracją (wolny telefon) — skok na górę
    // w trakcie przewijania palcem to najgorsze, co może się stać (flaga z app/layout.tsx)
    if (!location.hash && !(window as unknown as { __userScrolled?: boolean }).__userScrolled) window.scrollTo(0, 0)
    // kotwice (#about, #brands/coderiv, # = góra) przez wspólną nawigację: pasek, przypięte sceny,
    // głębokie linki; działa też bez Lenisa (prefers-reduced-motion → skok bez animacji)
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href') ?? '#'
      if (navigateTo(href)) e.preventDefault()
    }
    document.addEventListener('click', onClick)
    // zmiana hasha bez przeładowania (wklejony link, wstecz/dalej) — ta sama nawigacja
    const onHash = () => navigateTo(location.hash || '#')
    window.addEventListener('hashchange', onHash)

    let lenis: Lenis | null = null
    let raf = 0
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      lenis = new Lenis({ duration: 0.95, smoothWheel: true }) // krócej: kamera i teczki mają jeszcze własne sprężyny
      ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
      const loop = (t: number) => {
        lenis!.raf(t)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }
    // wejście z linkiem do sekcji (np. /#contact, /#brands/coderiv) — skaczemy sami, po ułożeniu fontów
    let t = 0
    if (location.hash && location.hash !== '#') {
      const hash = location.hash
      t = window.setTimeout(() => {
        const go = () => navigateTo(hash, { instant: true })
        if (document.fonts?.ready) document.fonts.ready.then(go)
        else go()
      }, 60)
    }
    return () => {
      clearTimeout(t)
      cancelAnimationFrame(raf)
      document.removeEventListener('click', onClick)
      window.removeEventListener('hashchange', onHash)
      lenis?.destroy()
      delete (window as unknown as { __lenis?: Lenis }).__lenis
    }
  }, [])

  return null
}
