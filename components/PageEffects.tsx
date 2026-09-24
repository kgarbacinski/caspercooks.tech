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
    let offTouch = () => {}
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // telefon / tablet (dotyk jako główne wejście): Lenis i tak nie wygładza dotyku (syncTouch: false),
      // a jego touchstart/touchmove/wheel na window są NIEPASYWNE — każdy ruch palca (także w poziomej
      // panoramie hero) czekał wtedy na wolny wątek główny, zanim przeglądarka mogła przewinąć. Na dotyku
      // Lenis nasłuchuje więc na odłączonym elemencie (zero listenerów na stronie, scroll w całości natywny
      // na kompozytorze), a zostaje tylko do programowego scrollTo nawigacji (components/scrollNav).
      const touch = window.matchMedia('(hover: none) and (pointer: coarse)').matches
      lenis = new Lenis({ duration: 0.95, smoothWheel: true, ...(touch ? { eventsTarget: document.createElement('div') } : {}) }) // krócej: kamera i teczki mają jeszcze własne sprężyny
      ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
      if (touch) {
        // jak wcześniej: palec przerywa płynny przejazd nawigacji (pasywnie, bez blokowania scrolla)
        const l = lenis
        const onMove = () => {
          if (l.isScrolling === 'smooth') l.scrollTo(window.scrollY, { immediate: true, force: true })
        }
        window.addEventListener('touchmove', onMove, { passive: true })
        offTouch = () => window.removeEventListener('touchmove', onMove)
      }
      // Desktop: pętla Lenisa co klatkę (wygładza kółko myszy). Dotyk: Lenis nie ma czego wygładzać, więc
      // pętla chodzi TYLKO w trakcie programowego przejazdu (scrollTo nawigacji) i gaśnie po nim — bez
      // wiecznego rAF, który na iOS budził wątek główny w każdej klatce przewijania strony i panoramy.
      // Czas dla Lenisa jest własny (krok ≤ 50 ms): po uśpieniu przejazd nie przeskakuje od razu do celu.
      let clock = 0
      let last = 0
      let idle = 0
      const l = lenis
      const loop = (t: number) => {
        clock += last ? Math.min(50, Math.max(0, t - last)) : 16
        last = t
        l.raf(clock)
        if (touch) {
          idle = l.isScrolling ? 0 : idle + 1
          if (idle > 3) {
            raf = 0
            last = 0
            return
          }
        }
        raf = requestAnimationFrame(loop)
      }
      if (touch) {
        const scrollTo = l.scrollTo.bind(l)
        l.scrollTo = ((...args: Parameters<typeof scrollTo>) => {
          idle = 0
          if (!raf) raf = requestAnimationFrame(loop)
          return scrollTo(...args)
        }) as typeof l.scrollTo
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
      offTouch()
      document.removeEventListener('click', onClick)
      window.removeEventListener('hashchange', onHash)
      lenis?.destroy()
      delete (window as unknown as { __lenis?: Lenis }).__lenis
    }
  }, [])

  return null
}
