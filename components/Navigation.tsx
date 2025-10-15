'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect } from 'react'

export default function Navigation() {
  const { theme, toggleTheme } = useTheme()
  const [activeSection, setActiveSection] = useState('')

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-mono text-sm"
        >
          <span className={theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'}>
            $ caspercooks.com
          </span>
          <span className="animate-pulse ml-1">_</span>
        </motion.div>

        {/* Navigation Links */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex items-center gap-8 font-mono text-sm"
        >
          <a
            href="#about"
            className={`
              transition-all duration-300
              ${activeSection === 'about'
                ? theme === 'developer'
                  ? 'text-developer-accent opacity-100'
                  : 'text-founder-accent opacity-100'
                : 'opacity-70 hover:opacity-100'}
            `}
          >
            [about]
          </a>
          <a
            href="#projects"
            className={`
              transition-all duration-300
              ${activeSection === 'projects'
                ? theme === 'developer'
                  ? 'text-developer-accent opacity-100'
                  : 'text-founder-accent opacity-100'
                : 'opacity-70 hover:opacity-100'}
            `}
          >
            [projects]
          </a>
          <a
            href="#brands"
            className={`
              transition-all duration-300
              ${activeSection === 'brands'
                ? theme === 'developer'
                  ? 'text-developer-accent opacity-100'
                  : 'text-founder-accent opacity-100'
                : 'opacity-70 hover:opacity-100'}
            `}
          >
            [brands]
          </a>
          <a
            href="#contact"
            className={`
              transition-all duration-300
              ${activeSection === 'contact'
                ? theme === 'developer'
                  ? 'text-developer-accent opacity-100'
                  : 'text-founder-accent opacity-100'
                : 'opacity-70 hover:opacity-100'}
            `}
          >
            [contact]
          </a>
        </motion.div>

        {/* Theme Toggle */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={toggleTheme}
          className={`
            relative w-20 h-10 rounded-full p-1 transition-colors duration-300
            ${theme === 'developer' ? 'bg-developer-secondary' : 'bg-founder-secondary border-2 border-founder-text/20'}
          `}
        >
          <motion.div
            layout
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
              ${theme === 'developer' ? 'bg-developer-accent text-developer-bg' : 'bg-founder-accent text-white'}
            `}
            animate={{ x: theme === 'developer' ? 0 : 32 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {theme === 'developer' ? 'DEV' : 'CEO'}
          </motion.div>
        </motion.button>
      </div>
    </nav>
  )
}
