'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect, useRef } from 'react'

const navLinks = [
  { href: '#about', label: 'about' },
  { href: '#projects', label: 'projects' },
  { href: '#brands', label: 'brands' },
  { href: '#studio', label: 'studio' },
  { href: '#contact', label: 'contact' },
]

/**
 * Znak strony: papierowa karteczka (lekko przekrzywiona, z zagiętym rogiem) z głową figurki
 * z dioramy, która "wystaje" ponad górną krawędź — ta sama postać co na wyspie, strój zmienia się
 * z trybem (DEV / CEO). Hover: karteczka się prostuje, głowa podskakuje, obwódka w kolorze akcentu.
 */
function Brand({ theme }: { theme: 'developer' | 'founder' }) {
  const k = theme === 'developer' ? 'dev' : 'ceo'
  return (
    <a href="#" className="flex items-center gap-3 min-h-11 min-w-11 group" aria-label="caspercooks.tech — back to top">
      {/* znak: avatar figurki (głowa i ramiona, strój zgodny z trybem) w kremowym krążku; hover = pierścień w kolorze akcentu */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/diorama/v2/avatar-${k}.webp`}
        alt=""
        aria-hidden="true"
        width={36}
        height={36}
        className="block w-9 h-9 shrink-0 rounded-full ring-2 ring-white/5 shadow-[0_2px_0_rgba(0,0,0,0.35)] transition-[transform,box-shadow] duration-200 ease-out group-hover:-translate-y-px group-hover:ring-accent"
      />
      {/* najwęższe telefony (< 380 px): sam avatar — napis z przełącznikiem i menu nie mieszczą się w jednym wierszu */}
      <span className="hidden [@media(min-width:380px)]:inline font-mono text-sm text-paper/80 group-hover:text-accent transition-colors">
        caspercooks<span className="text-accent">.tech</span>
      </span>
    </a>
  )
}

export default function Navigation() {
  const { theme, toggleTheme } = useTheme()
  const [activeSection, setActiveSection] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // otwarte menu mobilne zamyka się, gdy użytkownik przewinie stronę pod nim (> 48 px) — nie wisi nad treścią
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const y0 = window.scrollY
    const on = () => {
      if (Math.abs(window.scrollY - y0) > 48) setIsMobileMenuOpen(false)
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [isMobileMenuOpen])

  // aktywny link = sekcja przecinająca linię 30% wysokości pod paskiem (z pozycji, nie z IntersectionObservera:
  // ten gubił stan przy szybkim przejeździe Lenisa przez przypięte sceny, a kontakt na dole strony nigdy nie
  // dochodził do pasma obserwacji). #stack nie ma linku — nad pegboardem podświetlenie gaśnie.
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const ids = ['about', 'projects', 'stack', 'brands', 'studio', 'contact']
    let raf = 0
    const compute = () => {
      raf = 0
      const bar = barRef.current?.getBoundingClientRect().bottom ?? 0
      const line = bar + (window.innerHeight - bar) * 0.3
      let cur = ''
      for (const id of ids) {
        const r = document.getElementById(id)?.getBoundingClientRect()
        if (r && r.top <= line && r.bottom > line) cur = id
      }
      // koniec strony: kontakt nie dojedzie pod pasek, ale to on jest na ekranie
      const contact = document.getElementById('contact')?.getBoundingClientRect()
      if (contact && contact.top < window.innerHeight && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) cur = 'contact'
      setActiveSection(cur)
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
    // sekcja Stack montuje się na nowo po zmianie trybu
  }, [theme])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        // rozmycie tła tylko na desktopie: na telefonie tło i tak jest w 95% kryjące, a backdrop-filter
        // na przypiętym pasku przelicza się w każdej klatce przewijania dotykiem
        scrolled ? 'bg-night/95 lg:backdrop-blur-md border-b border-cocoa-500/40' : 'bg-transparent'
      }`}
    >
      {/* data-nav-bar: wysokość paska dla nawigacji po stronie (components/scrollNav) */}
      <div ref={barRef} data-nav-bar className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        <Brand theme={theme} />

        <div className="hidden lg:flex items-center gap-8 font-mono text-sm">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-current={activeSection === link.label ? 'location' : undefined}
              className={`relative py-1 transition-colors ${
                activeSection === link.label ? 'text-accent' : 'text-paper-muted hover:text-paper'
              }`}
            >
              {link.label}
              {activeSection === link.label && (
                <motion.span layoutId="nav-underline" className="absolute -bottom-1 inset-x-0 h-px bg-accent shadow-glow" />
              )}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* przełącznik trybu: DEV / CEO */}
          <button
            onClick={toggleTheme}
            // nazwa dostępna = widoczny tekst (DEV CEO) + opis w sr-only — wymóg WCAG "label in name"
            type="button"
            className="relative flex items-center w-[6.5rem] h-11 lg:h-10 p-1 border border-cocoa-500 hover:border-accent/60 bg-cocoa-800 font-mono text-xs transition-colors"
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-accent"
              style={{ left: theme === 'developer' ? 4 : 'calc(50% + 0px)' }}
            />
            <span className={`relative z-10 w-1/2 text-center ${theme === 'developer' ? 'text-night' : 'text-paper-muted'}`}>DEV</span>{' '}
            <span className={`relative z-10 w-1/2 text-center ${theme === 'founder' ? 'text-night' : 'text-paper-muted'}`}>CEO</span>
            <span className="sr-only"> — switch to {theme === 'developer' ? 'founder (CEO)' : 'developer'} view</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            type="button"
            className="lg:hidden w-11 h-11 grid place-items-center border border-cocoa-500 hover:border-accent/60 text-paper transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="font-mono text-lg leading-none">{isMobileMenuOpen ? '×' : '≡'}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          // przygaszenie strony pod rozwiniętym menu (treść nie prześwituje tuż pod ostatnią pozycją); dotyk zamyka
          <motion.div
            key="menu-dim"
            aria-hidden="true"
            className="lg:hidden fixed inset-0 -z-10 bg-night/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        {isMobileMenuOpen && (
          <motion.div
            key="menu-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-night border-t border-cocoa-500/40"
          >
            {/* niski ekran (telefon poziomo): lista przewija się zamiast wychodzić poza ekran */}
            <div className="px-4 sm:px-8 py-2 max-h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-3 font-mono text-lg border-b last:border-b-0 border-cocoa-500/30 ${
                    activeSection === link.label ? 'text-accent' : 'text-paper'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
