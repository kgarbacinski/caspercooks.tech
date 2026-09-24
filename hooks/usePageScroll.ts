'use client'

import { useEffect, useLayoutEffect } from 'react'
import type { RefObject } from 'react'
import { useMotionValue } from 'framer-motion'
import type { MotionValue } from 'framer-motion'

/**
 * Zamiennik `useScroll` z framer-motion dla przewijania okna — liczony TYLKO przy zdarzeniu scroll / zmianie
 * rozmiaru. `useScroll` framera trzyma własną pętlę rAF „keepAlive”: w każdej klatce (także gdy nic się nie
 * rusza) mierzy wszystkie śledzone elementy, co na telefonie oznaczało przeliczanie stylu i układu 60–120 razy
 * na sekundę przez cały czas pobytu na stronie (na iOS także w trakcie przesuwania panoramy w hero).
 *
 * Offsety jak we framerze: '<punkt elementu> <punkt okna>', gdzie punkt elementu to start|end|center|0..1,
 * a punkt okna start|end|center|0..1. Położenie elementu liczone z łańcucha offsetTop (bez transformów).
 */

type Edge = 'start' | 'end' | 'center' | number
type Offset = [string, string]

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect

const subs = new Set<() => void>()
let bound = false
const run = () => subs.forEach((fn) => fn())
function bind() {
  if (bound || typeof window === 'undefined') return
  bound = true
  window.addEventListener('scroll', run, { passive: true })
  window.addEventListener('resize', run, { passive: true })
  // zmiana wysokości strony (doładowane obrazy, przełączenie DEV ⇄ CEO) przesuwa sekcje bez zdarzenia scroll
  if ('ResizeObserver' in window) new ResizeObserver(run).observe(document.body)
}
function sub(fn: () => void) {
  bind()
  subs.add(fn)
  fn()
  return () => {
    subs.delete(fn)
  }
}

const edge = (v: string): Edge => (v === 'start' || v === 'end' || v === 'center' ? v : parseFloat(v))
const frac = (e: Edge) => (e === 'start' ? 0 : e === 'end' ? 1 : e === 'center' ? 0.5 : e)
function docTop(el: HTMLElement) {
  let t = 0
  let n: HTMLElement | null = el
  while (n) {
    t += n.offsetTop
    n = n.offsetParent as HTMLElement | null
  }
  return t
}

/** window.scrollY jako MotionValue (bez pętli rAF) */
export function usePageScrollY(): MotionValue<number> {
  const y = useMotionValue(0)
  useIso(() => sub(() => y.set(window.scrollY)), [y])
  return y
}

/** postęp przejazdu elementu przez okno w [0, 1] (jak scrollYProgress z useScroll({ target, offset })) */
export function usePageScrollProgress(target: RefObject<HTMLElement | null>, offset: Offset = ['start end', 'end start']): MotionValue<number> {
  const p = useMotionValue(0)
  const [a, b] = offset
  useIso(() => {
    const [ae, av] = a.split(' ').map(edge)
    const [be, bv] = b.split(' ').map(edge)
    return sub(() => {
      const el = target.current
      if (!el) return
      const top = docTop(el)
      const h = el.offsetHeight
      const vh = window.innerHeight
      const y0 = top + frac(ae) * h - frac(av) * vh
      const y1 = top + frac(be) * h - frac(bv) * vh
      const v = y1 === y0 ? (window.scrollY >= y1 ? 1 : 0) : (window.scrollY - y0) / (y1 - y0)
      p.set(Math.min(1, Math.max(0, v)))
    })
  }, [target, a, b, p])
  return p
}
