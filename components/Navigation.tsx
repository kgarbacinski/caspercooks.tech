'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect } from 'react'
import SteamAnimation from './SteamAnimation'

export default function Navigation() {
  const { theme, toggleTheme } = useTheme()
  const [activeSection, setActiveSection] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileScreen, setIsMobileScreen] = useState(false)

  useEffect(() => {
    const checkScreen = () => {
      setIsMobileScreen(window.innerWidth < 768) // md breakpoint
    }
    checkScreen()
    window.addEventListener('resize', checkScreen)
    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  useEffect(() => {
    const sections = ['about', 'projects', 'brands', 'contact']

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    )

    sections.forEach((section) => {
      const element = document.getElementById(section)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [])

  const navLinks = [
    { href: '#about', label: 'about' },
    { href: '#projects', label: 'projects' },
    { href: '#brands', label: 'brands' },
    { href: '#contact', label: 'contact' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 sm:py-6 backdrop-blur-sm bg-black/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-mono text-sm relative"
        >
          <SteamAnimation theme={theme} />
          <span className={theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'}>
            $ caspercooks.tech
          </span>
          <span className="animate-pulse ml-1">_</span>
        </motion.div>

        {/* Desktop Navigation Links */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex items-center gap-8 font-mono text-sm"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`
                transition-all duration-300
                ${activeSection === link.label
                  ? theme === 'developer'
                    ? 'text-developer-accent opacity-100'
                    : 'text-founder-accent opacity-100'
                  : 'opacity-70 hover:opacity-100'}
              `}
            >
              [{link.label}]
            </a>
          ))}
        </motion.div>

        {/* Mobile Menu Button & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`
              md:hidden w-10 h-10 flex items-center justify-center relative
              ${theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'}
            `}
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6 flex items-center justify-center">
              <motion.span
                animate={isMobileMenuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
                className={`absolute w-6 h-0.5 transition-colors ${
                  theme === 'developer' ? 'bg-developer-accent' : 'bg-founder-accent'
                }`}
              />
              <motion.span
                animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className={`w-6 h-0.5 transition-colors ${
                  theme === 'developer' ? 'bg-developer-accent' : 'bg-founder-accent'
                }`}
              />
              <motion.span
                animate={isMobileMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
                className={`absolute w-6 h-0.5 transition-colors ${
                  theme === 'developer' ? 'bg-developer-accent' : 'bg-founder-accent'
                }`}
              />
            </div>
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={toggleTheme}
            className={`
              relative w-20 sm:w-24 h-10 sm:h-12 rounded-full transition-all duration-300 flex items-center p-1
              ${theme === 'developer'
                ? 'bg-developer-secondary border-2 border-developer-accent/40 shadow-lg shadow-developer-accent/20'
                : 'bg-founder-secondary border-2 border-founder-accent/40 shadow-lg shadow-founder-accent/20'}
            `}
          >
            <motion.div
              layout
              className={`
                w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold
                ${theme === 'developer' ? 'bg-developer-accent text-developer-bg' : 'bg-founder-accent text-white'}
                shadow-md
              `}
              animate={{
                x: theme === 'developer' ? 0 : isMobileScreen ? 40 : 52
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {theme === 'developer' ? 'DEV' : 'CEO'}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`
              md:hidden overflow-hidden
              ${theme === 'developer' ? 'bg-developer-bg/95' : 'bg-founder-bg/95'}
              backdrop-blur-lg border-t
              ${theme === 'developer' ? 'border-developer-accent/20' : 'border-founder-accent/20'}
            `}
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    block py-3 px-4 rounded-lg font-mono text-lg transition-all duration-300
                    ${activeSection === link.label
                      ? theme === 'developer'
                        ? 'bg-developer-accent/20 text-developer-accent border-l-4 border-developer-accent'
                        : 'bg-founder-accent/20 text-founder-accent border-l-4 border-founder-accent'
                      : 'opacity-70 hover:opacity-100 hover:pl-6'}
                  `}
                >
                  [{link.label}]
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
