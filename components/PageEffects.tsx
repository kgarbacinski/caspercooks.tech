'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { useTheme } from '@/contexts/ThemeContext'

/**
 * Efekty całej strony, bez własnego DOM:
 *  - Lenis: płynny, "ciężki" scroll (wyłączony przy prefers-reduced-motion),
 *  - fold-in: każda .paper-card rozkłada się jak kartka papieru przy wejściu w widok,
 *  - spotlight: ciepłe światło lampki pod kursorem na kartach (CSS vars --mx/--my).
 * Po zmianie trybu (theme) karty są wyszukiwane ponownie, bo sekcje renderują się od nowa.
 */
export default function PageEffects() {
  const { theme } = useTheme()

  useEffect(() => {
    // hero ma zawsze startować od góry (wejście wyspy), więc bez przywracania scrolla po odświeżeniu
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    if (!location.hash) window.scrollTo(0, 0)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
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

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.paper-card:not(.no-fold)'))
    if (reduce) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement
            // lekkie przesunięcie w czasie dla kart w jednym rzędzie
            el.style.transitionDelay = `${Math.min(Number(el.dataset.foldIdx ?? 0) * 70, 280)}ms`
            el.classList.add('fold-in')
            io.unobserve(el)
            // po rozłożeniu zdejmujemy klasy, żeby hover (translate) kart działał normalnie
            const done = (ev: TransitionEvent) => {
              if (ev.propertyName !== 'transform') return
              el.classList.remove('fold', 'fold-in')
              el.style.transitionDelay = ''
              el.removeEventListener('transitionend', done)
            }
            el.addEventListener('transitionend', done)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    cards.forEach((c, i) => {
      if (c.closest('[data-no-fold]')) return
      if (c.getBoundingClientRect().top < window.innerHeight * 0.9) {
        return // już widoczne przy starcie — bez animacji
      }
      c.dataset.foldIdx = String(i % 4)
      c.classList.add('fold')
      io.observe(c)
    })

    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest?.('.paper-card') as HTMLElement | null
      if (!card) return
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${e.clientX - r.left}px`)
      card.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    document.addEventListener('pointermove', onMove)
    return () => {
      io.disconnect()
      document.removeEventListener('pointermove', onMove)
    }
  }, [theme])

  return null
}
