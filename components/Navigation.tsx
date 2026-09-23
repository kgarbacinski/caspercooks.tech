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
        scrolled ? 'bg-night/80 backdrop-blur-md border-b border-cocoa-500/40' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          {/* pieczęć KG — ta sama co na froncie wyspy */}
          <span className="grid place-items-center w-9 h-9 rounded-full bg-[#9a4f2c] text-paper font-display text-sm shadow-[inset_0_-2px_0_rgba(0,0,0,0.25),0_0_0_3px_rgba(184,102,63,0.25)]">
            KG
          </span>
          <span className="font-mono text-sm text-paper group-hover:text-accent transition-colors">
            caspercooks<span className="text-accent">.tech</span>
          </span>
        </a>

        <div className="hidden lg:flex items-center gap-8 font-mono text-sm">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
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
            className="relative flex items-center w-[104px] h-10 p-1 border border-cocoa-500 bg-cocoa-800 font-mono text-[11px]"
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
            className="lg:hidden w-10 h-10 grid place-items-center border border-cocoa-500 text-paper"
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
