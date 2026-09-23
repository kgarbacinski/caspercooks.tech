'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

export type Theme = 'developer' | 'founder'

/**
 * Fazy przełączenia DEV ⇄ CEO (choreografia całej strony):
 *  idle      — nic się nie dzieje,
 *  leaving   — stara figurka zeskakuje z wyspy, gasną światła, pokoje składają się na płasko
 *              (jak zamykana książka pop-up),
 *  covered   — zmiana motywu: nowe pokoje leżą płasko i ciemne, figurki nie ma,
 *  entering  — pokoje nowego świata wyskakują do góry, nowa figurka spada na wyspę,
 *              światła zapalają się pokój po pokoju.
 *
 * Dwa tryby:
 *  inplace — użytkownik jest przy hero: całość dzieje się na oczach, bez kurtyny,
 *  curtain — użytkownik jest niżej na stronie: papierowa kurtyna zakrywa ekran, pod nią
 *            wracamy do hero i dopiero wtedy odgrywa się wejście nowego świata.
 */
export type SwitchPhase = 'idle' | 'leaving' | 'covered' | 'entering'
export type SwitchMode = 'inplace' | 'curtain'

interface ThemeContextType {
  theme: Theme
  phase: SwitchPhase
  mode: SwitchMode
  /** true w trakcie całej sekwencji (dla komponentów, które mają się wstrzymać) */
  transitioning: boolean
  /** tryb docelowy trwającego przełączenia (dla napisu na kurtynie) */
  target: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/** Oś czasu przełączenia w ms — komponenty liczą swoje animacje względem początku fazy. */
export const SWITCH = {
  inplace: { covered: 960, entering: 1020, done: 2900 },
  curtain: { sheetIn: 0, covered: 560, sheetOut: 900, entering: 1150, done: 3200 },
  /** trwanie fazy "entering" rozpisane dla dioramy (od początku fazy) */
  enter: { popUp: 0, figure: 380, lights: 700 },
  /** trwanie fazy "leaving" (tryb inplace) */
  leave: { figure: 0, lightsOff: 120, fold: 360 },
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('developer')
  const [phase, setPhase] = useState<SwitchPhase>('idle')
  const [mode, setMode] = useState<SwitchMode>('inplace')
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
      setTarget(next)
      return
    }
    // przy hero przełączamy na oczach; niżej — pod kurtyną z powrotem do hero
    const m: SwitchMode = window.scrollY > window.innerHeight * 0.45 ? 'curtain' : 'inplace'
    const T = SWITCH[m]
    setMode(m)
    setTarget(next)
    setPhase('leaving')
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))
    const swap = () => {
      setPhase('covered')
      setTheme(next)
    }
    if (m === 'inplace') at(T.covered, swap)
    else
      at(T.covered, () => {
        swap()
        const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis
        if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
        else window.scrollTo(0, 0)
      })
    at(T.entering, () => setPhase('entering'))
    at(T.done, () => setPhase('idle'))
  }, [phase, theme])

  return (
    <ThemeContext.Provider value={{ theme, phase, mode, transitioning: phase !== 'idle', target, toggleTheme }}>
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
