'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { FaGithub, FaLinkedin, FaEnvelope, FaTiktok } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6' // ikona X zamiast starego ptaka

const socialLinks = [
  { name: 'GitHub', icon: FaGithub, url: 'https://github.com/kgarbacinski' },
  { name: 'LinkedIn', icon: FaLinkedin, url: 'https://www.linkedin.com/in/kacper-garbacinski-3271b81a2/' },
  { name: 'Twitter', icon: FaXTwitter, url: 'https://x.com/KGarbacinski' },
  { name: 'TikTok', icon: FaTiktok, url: 'https://www.tiktok.com/@kacper.senior.dev' },
  { name: 'Email', icon: FaEnvelope, url: 'mailto:kacpergarbacinski@gmail.com' },
]

// stopka: znak + rola, linki społecznościowe, copyright — bez powtórzenia nawigacji
export default function Footer() {
  const { theme } = useTheme()
  const k = theme === 'developer' ? 'dev' : 'ceo'

  return (
    <footer className="bg-night border-t border-cocoa-500/40 py-10 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <a href="#" className="inline-flex items-center gap-3 min-h-11 group" aria-label="caspercooks.tech — back to top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/diorama/v2/avatar-${k}.webp`}
            alt=""
            aria-hidden="true"
            width={36}
            height={36}
            className="block w-9 h-9 shrink-0 rounded-full ring-2 ring-white/5 transition-[transform,box-shadow] duration-200 group-hover:-translate-y-px group-hover:ring-accent"
          />
          <span>
            <span className="block font-mono text-sm text-paper group-hover:text-accent transition-colors">
              caspercooks<span className="text-accent">.tech</span>
            </span>
            <span className="block text-xs text-paper-muted">Full-Stack Developer &amp; Serial Founder</span>
          </span>
        </a>

        <div className="flex flex-wrap gap-3">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              // mailto bez nowej karty (inaczej zostaje pusta karta)
              {...(social.url.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              title={social.name}
              aria-label={social.name}
              className="w-11 h-11 grid place-items-center border border-cocoa-500/60 bg-cocoa-900 text-paper-muted hover:text-accent hover:border-accent/50 hover:-translate-y-0.5 transition"
            >
              <social.icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
      <p className="max-w-6xl mx-auto px-4 sm:px-8 mt-8 font-mono text-xs text-paper-dim">© {new Date().getFullYear()} caspercooks.tech</p>
    </footer>
  )
}
