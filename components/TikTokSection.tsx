'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useSafeReducedMotion'
import { FaTiktok, FaGraduationCap, FaRocket, FaCode, FaBookOpen, FaFlag, FaArrowRight } from 'react-icons/fa'
import { useTheme } from '@/contexts/ThemeContext'
import { SectionHeader, RoomCutout, EASE } from '@/components/ui/Section'

/**
 * TikTok = pokój "Studio": telefon na statywie przed ring lightem, który "nagrywa"
 * (czerwona kropka REC + licznik czasu, gdy sekcja jest w kadrze). Treść bez zmian.
 */

const TIKTOK_URL = 'https://www.tiktok.com/@kacper.senior.dev'

function RecTimer({ run }: { run: boolean }) {
  const [s, setS] = useState(0)
  useEffect(() => {
    if (!run) return
    const id = window.setInterval(() => setS((x) => x + 1), 1000)
    return () => clearInterval(id)
  }, [run])
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return (
    <span className="tabular-nums">
      00:{mm}:{ss}
    </span>
  )
}

export default function TikTokSection() {
  const { theme } = useTheme()
  const reduce = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const inView = useInView(stageRef, { margin: '-20% 0px' })

  const contentTypes = [
    { icon: FaGraduationCap, text: 'Mentor insights' },
    { icon: FaRocket, text: 'Tips & tricks' },
    { icon: FaCode, text: 'Code reviews' },
    { icon: FaBookOpen, text: 'Quick tutorials' },
  ]

  return (
    <section id="studio" className="relative pt-12 sm:pt-16 pb-12 sm:pb-16 scroll-mt-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between gap-8 mb-14 sm:mb-16">
          <SectionHeader index="05" eyebrow="tiktok --lang=pl --content=dev" title="Programming content in Polish" />
        </div>

        <div className="grid md:grid-cols-[1fr_1.05fr] gap-14 lg:gap-20 items-center">
          {/* studio: pokój "Studio" z dioramy jako plan zdjęciowy, przed nim telefon na statywie */}
          <div ref={stageRef} className="relative pt-4 pb-10">
            <div className="relative mx-auto w-full max-w-[520px]">
              <RoomCutout room={4} hi float={false} className="w-[88%] mx-auto opacity-95" />
              {/* ciepłe światło planu */}
              <div aria-hidden="true" className="absolute inset-x-[10%] bottom-[8%] h-1/3 rounded-[50%] blur-3xl bg-[rgba(255,200,140,0.18)]" />
              <motion.a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open @kacper.senior.dev on TikTok"
                className="group absolute right-[16%] sm:right-[12%] bottom-[9%] block"
                initial={reduce ? false : { y: 40, opacity: 0, rotate: -3 }}
                whileInView={{ y: 0, opacity: 1, rotate: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
                whileHover={reduce ? undefined : { y: -6, rotate: -1 }}
              >
                <div className="relative w-[118px] sm:w-[150px] aspect-[9/18.5] rounded-[26px] p-[7px] bg-gradient-to-b from-[#2a1d15] to-[#130c08] border border-cocoa-500/70 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(232,132,58,0.4)]">
                  <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-cocoa-900">
                    <Image src="/tiktok-thumbnail.png" alt="TikTok content preview" fill sizes="180px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
                    {/* nagrywanie */}
                    <div className="absolute top-6 left-2 right-2 flex items-center justify-between font-mono text-[8px] sm:text-[9px] text-white">
                      <span className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-black/45 backdrop-blur-sm">
                        <span className={`w-2 h-2 rounded-full bg-[#ff3b30] ${reduce ? '' : 'animate-rec'}`} />
                        REC <RecTimer run={inView && !reduce} />
                      </span>
                      <FaTiktok className="w-3.5 h-3.5" />
                    </div>
                    {/* przycisk play pod napisem z miniatury (nie zasłania go) */}
                    <div className="absolute inset-x-0 top-[64%] grid place-items-center">
                      <span
                        className="w-12 h-12 rounded-full grid place-items-center bg-accent/90 transition-transform duration-300 group-hover:scale-110"
                        style={{ boxShadow: '0 10px 40px -8px rgb(var(--accent-rgb) / 0.7)' }}
                      >
                        <svg className="w-5 h-5 text-night ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <p className="text-white font-display text-[9.5px] sm:text-[13px] leading-tight truncate">@kacper.senior.dev</p>
                      <p className="font-mono text-[8px] sm:text-[9px] text-white/70 truncate">Polish dev community</p>
                    </div>
                  </div>
                  <span aria-hidden="true" className="absolute top-[13px] left-1/2 -translate-x-1/2 w-12 h-3 rounded-full bg-black" />
                </div>
                {/* cień telefonu na podłodze pokoju */}
                <span aria-hidden="true" className="absolute left-[8%] right-[8%] -bottom-2 h-3 rounded-[50%] bg-black/70 blur-[5px] -z-10" />
              </motion.a>
            </div>
          </div>

          {/* opis */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-1 border border-accent/40 text-accent mb-6">
              <FaFlag className="w-3 h-3" /> Polish Content
            </span>
            <h3 className="font-display text-3xl sm:text-4xl text-paper mb-4 leading-tight">
              {theme === 'developer' ? 'Programming Mentor on TikTok' : 'Devs-Mentoring on TikTok'}
            </h3>
            <p className="text-paper-muted mb-8 text-base sm:text-lg leading-relaxed">
              {theme === 'developer'
                ? 'Sharing knowledge and experience with the Polish dev community. Short, practical content for learning.'
                : 'We promote programming mentorship through valuable content. TikTok is our platform for sharing knowledge.'}
            </p>

            {/* rodzaje treści jak klapsy filmowe */}
            <ul className="grid grid-cols-2 gap-3 mb-8">
              {contentTypes.map((item, i) => (
                <li key={item.text} className="clapper" style={{ rotate: `${[-1, 0.8, 0.6, -0.8][i]}deg` }}>
                  <item.icon className="w-4 h-4 shrink-0 text-ember" />
                  <span className="text-sm text-paper">{item.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4">
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="btn-accent">
                <FaTiktok className="w-4 h-4" />
                Follow on TikTok
              </a>
              <a
                href={theme === 'founder' ? 'https://devs-mentoring.pl/' : TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm text-paper-muted hover:text-paper transition-colors"
              >
                {theme === 'founder' ? (
                  <>
                    Want more? Visit <span className="text-paper group-hover:text-accent transition-colors">devs-mentoring.pl</span>
                  </>
                ) : (
                  <>
                    Join the <span className="text-paper group-hover:text-accent transition-colors">Polish dev community</span>
                  </>
                )}
                <FaArrowRight className="w-3 h-3 text-paper-dim group-hover:text-accent group-hover:translate-x-1 transition" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
