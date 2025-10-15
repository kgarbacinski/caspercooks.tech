'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export default function Footer() {
  const { theme } = useTheme()
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { name: 'GitHub', icon: '🐙', url: '#' },
    { name: 'LinkedIn', icon: '💼', url: '#' },
    { name: 'Twitter', icon: '🐦', url: '#' },
    { name: 'Email', icon: '📧', url: 'mailto:casper@caspercooks.me' },
  ]

  return (
    <footer className={`
      py-12 px-8 border-t transition-colors duration-500
      ${theme === 'developer'
        ? 'border-developer-accent/20 bg-developer-bg'
        : 'border-founder-accent/20 bg-founder-bg'}
    `}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <motion.div
              className="font-mono text-lg mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <span className={theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'}>
                $ caspercooks.com
              </span>
              <span className="animate-pulse ml-1">_</span>
            </motion.div>
            <p className={`text-sm font-mono ${theme === 'founder' ? 'text-gray-600' : 'text-gray-400'}`}>
              {'> Full-Stack Developer & Serial Entrepreneur'}
            </p>
            <p className={`text-sm font-mono ${theme === 'founder' ? 'text-gray-600' : 'text-gray-400'}`}>
              {'> Building systems and companies that matter.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              {['About', 'Projects', 'Brands', 'Contact'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className={`
                    block text-sm transition-colors
                    ${theme === 'founder'
                      ? 'text-gray-600 hover:text-founder-accent'
                      : 'text-gray-400 hover:text-developer-accent'}
                  `}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold mb-4">Connect</h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-xl
                    transition-colors duration-300
                    ${theme === 'developer'
                      ? 'bg-developer-secondary hover:bg-developer-accent hover:text-developer-bg'
                      : 'bg-gray-800 hover:bg-founder-accent hover:text-white'}
                  `}
                  title={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className={`
          pt-8 border-t text-center text-sm font-mono
          ${theme === 'developer'
            ? 'border-developer-accent/10 text-gray-500'
            : 'border-founder-accent/10 text-gray-500'}
        `}>
          <p>
            © {currentYear} caspercooks.com // Built with Next.js + TypeScript + Framer Motion
          </p>
          <p className="mt-2">
            <span className={theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'}>
              {theme === 'developer' ? '0x' : '#'}
            </span>
            {theme === 'developer' ? 'CODED' : 'BUILT'} with passion
          </p>
        </div>
      </div>
    </footer>
  )
}
