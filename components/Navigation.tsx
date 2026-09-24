'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect } from 'react'

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
const TAG = 'polygon(0 0, 100% 0, 100% 74%, 74% 100%, 0 100%)'

function Brand({ theme }: { theme: 'developer' | 'founder' }) {
  const k = theme === 'developer' ? 'dev' : 'ceo'
  return (
    <a href="#" className="flex items-center gap-3 group" aria-label="caspercooks.tech — back to top">
      <span aria-hidden="true" className="relative w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] shrink-0 mt-1.5 -rotate-[4deg] transition-transform duration-200 ease-out group-hover:rotate-[-1deg] group-hover:-translate-y-px">
        {/* hover: karteczka w kolorze akcentu wysuwa się spod spodu (przesunięty "drugi arkusz") */}
        <span
          className="absolute inset-0 bg-accent opacity-0 translate-x-0 translate-y-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-[2px] group-hover:translate-y-[2px]"
          style={{ clipPath: TAG }}
        />
        {/* karteczka: krem, zagięty róg, miękki cień */}
        <span className="absolute inset-0 bg-[#efe4cf] shadow-[0_2px_0_rgba(0,0,0,0.35)]" style={{ clipPath: TAG }} />
        {/* głowa wychodzi z "kieszonki": szyję zakrywa przednia klapka karteczki, górą włosy wystają ~6 px */}
        <span className="absolute inset-0" style={{ clipPath: 'polygon(-10% -40%, 110% -40%, 100% 0, 100% 100%, 0 100%, 0 0)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/diorama/v2/logo-head-${k}.webp`}
            alt=""
            className="absolute left-1/2 bottom-[14%] w-[108%] max-w-none -translate-x-1/2 origin-bottom transition-transform duration-200 ease-out group-hover:-translate-y-[2px] group-hover:-rotate-[4deg]"
          />
        </span>
        <span
          className="absolute inset-x-0 bottom-0 h-[24%] bg-[#e6d8bd] border-t border-[rgba(0,0,0,0.25)] shadow-[0_-1px_0_rgba(255,250,235,0.7),0_-3px_4px_rgba(0,0,0,0.18)]"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 13%, 13% 100%, 0 100%)' }}
        />
        <span className="absolute right-0 bottom-0 w-[26%] h-[26%] bg-[#c9b18e]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
      </span>
      <span className="font-mono text-sm text-paper/80 group-hover:text-accent transition-colors">
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    )
    // #stack nie ma linku, ale obserwujemy go, żeby podświetlenie "projects" gasło nad pegboardem
    ;[...navLinks.map((l) => l.label), 'stack'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
    // sekcja Stack montuje się na nowo po zmianie trybu — obserwujemy świeże elementy
  }, [theme])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-night/95 backdrop-blur-md border-b border-cocoa-500/40' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
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
            className="relative flex items-center w-[104px] h-10 p-1 border border-cocoa-500 hover:border-accent/60 bg-cocoa-800 font-mono text-[11px] transition-colors"
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              className="absolute top-1 bottom-1 w-[48px] bg-accent"
              style={{ left: theme === 'developer' ? 4 : 52 }}
            />
            <span className={`relative z-10 w-1/2 text-center ${theme === 'developer' ? 'text-night' : 'text-paper-muted'}`}>DEV</span>{' '}
            <span className={`relative z-10 w-1/2 text-center ${theme === 'founder' ? 'text-night' : 'text-paper-muted'}`}>CEO</span>
            <span className="sr-only"> — switch to {theme === 'developer' ? 'founder (CEO)' : 'developer'} view</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            type="button"
            className="lg:hidden w-10 h-10 grid place-items-center border border-cocoa-500 hover:border-accent/60 text-paper transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="font-mono text-lg leading-none">{isMobileMenuOpen ? '×' : '≡'}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-night/95 backdrop-blur-lg border-t border-cocoa-500/40"
          >
            <div className="px-4 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-3 font-mono text-lg border-b border-cocoa-500/30 ${
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
