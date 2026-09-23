'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { FaTiktok, FaGraduationCap, FaRocket, FaCode, FaBookOpen, FaFlag, FaArrowRight } from 'react-icons/fa'
import Image from 'next/image'
import { Section } from '@/components/ui/Section'

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
}

const TIKTOK_URL = 'https://www.tiktok.com/@kacper.senior.dev'

export default function TikTokSection() {
  const { theme } = useTheme()

  const contentTypes = [
    { icon: FaGraduationCap, text: 'Mentor insights' },
    { icon: FaRocket, text: 'Tips & tricks' },
    { icon: FaCode, text: 'Code reviews' },
    { icon: FaBookOpen, text: 'Quick tutorials' },
  ]

  return (
    <Section
      id="tiktok"
      index="05"
      eyebrow="tiktok --lang=pl --content=dev"
      title="Programming content in Polish"
    >
      <div className="grid md:grid-cols-2 gap-10 sm:gap-14 items-center">
        {/* Phone with thumbnail */}
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex justify-center"
        >
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group block transition-transform duration-300 hover:-translate-y-1"
          >
            {/* Phone frame: paper-card surface */}
            <div className="paper-card relative w-[240px] sm:w-[280px] h-[480px] sm:h-[560px] rounded-[36px] p-2 shadow-paper">
              {/* Screen */}
              <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-cocoa-900 border border-cocoa-500/40">
                <Image
                  src="/tiktok-thumbnail.png"
                  alt="TikTok content preview"
                  fill
                  className="object-cover"
                />

                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-night/35 group-hover:bg-night/15 transition-colors duration-300">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-accent/90 transition-transform duration-300 group-hover:scale-105"
                    style={{ boxShadow: '0 10px 40px -8px rgb(var(--accent-rgb) / 0.6)' }}
                  >
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-night ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* TikTok badge */}
                <div className="absolute top-4 right-4 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-cocoa-900/80 border border-cocoa-500/60 backdrop-blur-sm">
                  <FaTiktok className="w-4 h-4 sm:w-5 sm:h-5 text-paper" />
                </div>

                {/* Username */}
                <div className="absolute bottom-4 left-4 right-4 bg-cocoa-900/85 border border-cocoa-500/50 backdrop-blur-sm px-3 py-2">
                  <p className="text-paper font-display text-base sm:text-lg leading-tight">@kacper.senior.dev</p>
                  <p className="font-mono text-[11px] text-paper-muted">Polish dev community</p>
                </div>
              </div>

              {/* Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-night rounded-full" />
            </div>
          </a>
        </motion.div>

        {/* Info */}
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="space-y-5"
        >
          <div className="paper-card p-6 sm:p-8">
            {/* Polish badge */}
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-1 border border-accent/40 text-accent mb-5">
              <FaFlag className="w-3 h-3" /> Polish Content
            </span>

            <h3 className="font-display text-2xl sm:text-3xl text-paper mb-3 leading-tight">
              {theme === 'developer'
                ? 'Programming Mentor on TikTok'
                : 'Devs-Mentoring on TikTok'}
            </h3>
            <p className="text-paper-muted mb-7 text-sm sm:text-base leading-relaxed">
              {theme === 'developer'
                ? 'Sharing knowledge and experience with the Polish dev community. Short, practical content for learning.'
                : 'We promote programming mentorship through valuable content. TikTok is our platform for sharing knowledge.'}
            </p>

            {/* Content types */}
            <ul className="grid grid-cols-2 gap-2 sm:gap-3 mb-7">
              {contentTypes.map((item) => (
                <li
                  key={item.text}
                  className="flex items-center gap-2 px-3 py-2.5 border border-cocoa-500/50 bg-cocoa-900/40"
                >
                  <item.icon className="w-3.5 h-3.5 shrink-0 text-ember" />
                  <span className="text-xs sm:text-sm text-paper">{item.text}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent w-full justify-center"
            >
              <FaTiktok className="w-4 h-4" />
              Follow on TikTok
            </a>
          </div>

          {/* Bottom link - different for each mode */}
          <a
            href={theme === 'founder' ? 'https://devs-mentoring.pl/' : TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-4 px-5 py-4 border border-cocoa-500/50 hover:border-accent/50 transition-colors"
          >
            <p className="text-sm text-paper-muted">
              {theme === 'founder' ? (
                <>
                  Want more? Visit{' '}
                  <span className="text-paper group-hover:text-accent transition-colors">devs-mentoring.pl</span>
                </>
              ) : (
                <>
                  Join the{' '}
                  <span className="text-paper group-hover:text-accent transition-colors">Polish dev community</span>
                </>
              )}
            </p>
            <FaArrowRight className="w-3.5 h-3.5 text-paper-dim group-hover:text-accent group-hover:translate-x-1 transition" />
          </a>
        </motion.div>
      </div>
    </Section>
  )
}
