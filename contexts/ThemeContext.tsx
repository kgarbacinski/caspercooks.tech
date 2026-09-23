'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

type Theme = 'developer' | 'founder'

/**
 * Fazy przełączenia DEV ⇄ CEO (choreografia całej strony):
 *  idle      — nic się nie dzieje,
 *  leaving   — stara wyspa zapada się w pustkę (widać to, kurtyna jeszcze nie weszła),
 *  covered   — papierowa kurtyna zakrywa ekran, wbija się pieczęć; pod spodem zmienia się motyw
 *              i strona wraca na górę,
 *  entering  — kurtyna schodzi, nowa wyspa opada i zapala światła pokój po pokoju.
 */
export type SwitchPhase = 'idle' | 'leaving' | 'covered' | 'entering'

interface ThemeContextType {
  theme: Theme
  phase: SwitchPhase
  /** true w trakcie całej sekwencji (dla komponentów, które mają się wstrzymać) */
  transitioning: boolean
  /** tryb docelowy trwającego przełączenia (dla napisu na kurtynie) */
  target: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/** Oś czasu przełączenia w ms (ThemeWipe i FloatingDiorama czytają te same stałe). */
export const SWITCH = {
  sheetIn: 640, // kurtyna zaczyna wjeżdżać (wcześniej widać zapadanie starej wyspy)
  covered: 1020, // ekran zakryty → zmiana motywu
  sheetOut: 1380, // kurtyna zaczyna zjeżdżać
  entering: 1500, // nowa wyspa zaczyna opadać
  done: 4050, // koniec zapalania świateł (entering + 0.5s + 2s)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('developer')
  const [phase, setPhase] = useState<SwitchPhase>('idle')
  const [target, setTarget] = useState<Theme>('developer')
  const timers = useRef<number[]>([])

  useEffect(() => {
    document.body.classList.toggle('founder-mode', theme === 'founder')
  }, [theme])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const toggleTheme = useCallback(() => {
    if (phase !== 'idle') return
    const next: Theme = theme === 'developer' ? 'founder' : 'developer'
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTheme(next)
      return
    }
    setTarget(next)
    setPhase('leaving')
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))
    at(SWITCH.covered, () => {
      setPhase('covered')
      setTheme(next)
      // pod kurtyną wracamy do hero, żeby zobaczyć wejście nowej wyspy
      const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
      else window.scrollTo(0, 0)
    })
    at(SWITCH.entering, () => setPhase('entering'))
    at(SWITCH.done, () => setPhase('idle'))
  }, [phase, theme])

  return (
    <ThemeContext.Provider value={{ theme, phase, transitioning: phase !== 'idle', target, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
