'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { FaGithub, FaLinkedin, FaEnvelope, FaTiktok } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6' // ikona X zamiast starego ptaka

export default function Footer() {
  const { theme } = useTheme()
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { name: 'GitHub', icon: FaGithub, url: 'https://github.com/kgarbacinski' },
    { name: 'LinkedIn', icon: FaLinkedin, url: 'https://www.linkedin.com/in/kacper-garbacinski-3271b81a2/' },
    { name: 'Twitter', icon: FaXTwitter, url: 'https://x.com/KGarbacinski' },
    { name: 'TikTok', icon: FaTiktok, url: 'https://www.tiktok.com/@kacper.senior.dev' },
    { name: 'Email', icon: FaEnvelope, url: 'mailto:kacpergarbacinski@gmail.com' },
  ]

  return (
    <footer className="bg-night border-t border-cocoa-500/40 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-8 mb-10">
          {/* Brand */}
          <div>
            <a href="#" className="inline-flex items-center gap-3 mb-5 group">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-[#9a4f2c] text-paper font-display text-sm">
                KG
              </span>
              <span className="font-mono text-sm text-paper group-hover:text-accent transition-colors">
                caspercooks<span className="text-accent">.tech</span>
              </span>
            </a>
            <p className="text-sm text-paper-muted">Full-Stack Developer &amp; Serial Founder</p>
            <p className="text-sm text-paper-muted mt-1">Building systems and companies that matter.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="eyebrow mb-4">Quick Links</h3>
            <div className="space-y-0.5">
              {['About', 'Projects', 'Brands', 'Studio', 'Contact'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="block w-fit py-1 text-sm text-paper-muted hover:text-accent transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="eyebrow mb-4">Connect</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  // mailto bez nowej karty (inaczej zostaje pusta karta)
                  {...(social.url.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  title={social.name}
                  aria-label={social.name}
                  className="w-10 h-10 grid place-items-center border border-cocoa-500/60 bg-cocoa-900 text-paper-muted hover:text-accent hover:border-accent/50 hover:-translate-y-0.5 transition"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-cocoa-500/40 flex flex-col sm:flex-row sm:justify-between gap-2 text-center sm:text-left font-mono text-xs text-paper-dim">
          <p className="text-balance">© {currentYear} caspercooks.tech // Built with Next.js + TypeScript + Framer Motion</p>
          <p>
            <span className="text-accent">{theme === 'developer' ? '0x' : '#'}</span>
            {theme === 'developer' ? 'CODED' : 'BUILT'} with passion
          </p>
        </div>
      </div>
    </footer>
  )
}
