'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useReducedMotion } from '@/hooks/useSafeReducedMotion'
import Diorama from './diorama/Diorama'

/** Treść obu trybów bez zmian względem poprzedniej wersji — zmienił się tylko wygląd. */
const COPY = {
  developer: {
    eyebrow: '$ whoami',
    title: ['AI & Full-Stack', '<Engineer />'],
    lines: [
      '> Building scalable systems since 2015',
      '> From microservices to AI agents & Web3',
      '> Complex problems → elegant solutions',
    ],
    stats: [
      { value: '0x0A+ years', label: '// experience' },
      { value: '0x09 projects', label: '// delivered' },
      { value: 'AI + Web3', label: '// focus' },
    ],
  },
  founder: {
    eyebrow: '# portfolio',
    title: ['Serial', '[Founder]'],
    lines: [
      '# Building companies that empower devs',
      '# From mentorship to AI automation',
      '# Creating ecosystems of growth',
    ],
    stats: [
      { value: '4 brands', label: '// founded' },
      { value: '15+ mentors', label: '// team' },
      { value: '300+ devs', label: '// impact' },
    ],
  },
} as const

const EASE = [0.22, 1, 0.36, 1] as const
// nagłówek: samo przenikanie z uniesieniem (bez rozmycia — filtr na dużym tekście to zbędny koszt i szum)
const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}
const fade = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}
const pop = {
  hidden: { opacity: 0, y: 18, rotateX: -60 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.7, ease: EASE } },
}

type Part = 'head' | 'lines' | 'stats' | 'cta'
// kolejność wejścia części przy starcie strony
const PART_DELAY: Record<Part, number> = { head: 0, lines: 0.12, stats: 0.2, cta: 0.26 }

/**
 * Jedna część treści hero. Przy przełączeniu DEV ⇄ CEO:
 *  - przed zmianą motywu cała treść przygasa razem ze światłami wyspy (wciąż czytelna),
 *  - nagłówek i linie: stara wersja gaśnie w 0,15 s, nowa wjeżdża tuż po niej; obie leżą w tej samej
 *    komórce siatki ([grid-area:1/1]), więc wysokość się nie zmienia i nic pod spodem nie skacze,
 *  - karty statystyk i przyciski zostają na miejscu — zmienia się tylko napis w kartach
 *    i kolor akcentu, więc kolumna nigdy nie jest pusta.
 */
function CopyPart({ part, className = '' }: { part: Part; className?: string }) {
  const { theme, phase } = useTheme()
  const c = COPY[theme]
  const reduce = useReducedMotion()
  // desktop: przy "wjeździe kamery" w pokój tekst hero znika jako pierwszy
  const { scrollY } = useScroll()
  const uiFade = useTransform(scrollY, [0, 150], [1, 0])
  const swaps = part === 'head' || part === 'lines'
  // po starcie strony nowa treść nie czeka na wejście (przy przełączeniu liczy się tempo)
  const [booted, setBooted] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setBooted(true), 1500)
    return () => clearTimeout(t)
  }, [])
  const d = booted ? 0.1 : PART_DELAY[part]

  return (
    <motion.div style={{ opacity: uiFade }} className={`max-lg:!opacity-100 ${className}`}>
      {/* zwykły div z przejściem CSS: przygaszenie na czas gaszenia świateł */}
      <div className="grid" style={{ opacity: phase === 'leaving' ? 0.45 : 1, transition: 'opacity .45s ease' }}>
        <AnimatePresence initial={!reduce}>
          <motion.div
            key={swaps ? theme : 'static'}
            className="[grid-area:1/1]"
            initial={reduce ? false : 'hidden'}
            animate="show"
            exit={reduce ? undefined : 'exit'}
            variants={{
              show: { opacity: 1, transition: { staggerChildren: booted ? 0.05 : 0.08, delayChildren: d } },
              exit: { opacity: 0, transition: { duration: 0.12, ease: EASE } },
            }}
          >
            {part === 'head' && (
              <>
                <motion.p variants={fade} className="eyebrow mb-4 sm:mb-5">
                  <span className="inline-block px-3 py-1.5 border border-accent/50 text-accent">{c.eyebrow}</span>
                </motion.p>
                {/* desktop: stopień liczony od szerokości lewej kolumny — pierwsza linia mieści się
                    w jednym wierszu od 1024 do 1920 px */}
                <h1 className="font-display text-[2.75rem] sm:text-6xl lg:text-[min(3.3rem,calc(4.3vw-4px))] leading-[1.02] tracking-tight mb-6">
                  {c.title.map((line, i) => (
                    <span key={line} className="block pb-[0.08em]">
                      <motion.span
                        variants={rise}
                        className={`block ${i === 1 ? 'text-accent [text-shadow:0_0_30px_rgb(var(--accent-rgb)/0.35)]' : ''}`}
                      >
                        {line}
                      </motion.span>
                    </span>
                  ))}
                </h1>
              </>
            )}

            {part === 'lines' && (
              <p className="font-mono text-sm sm:text-base lg:text-[13px] xl:text-base text-paper-muted leading-relaxed max-w-md mb-7">
                {c.lines.map((l) => (
                  <motion.span key={l} variants={fade} className="block">
                    {l}
                  </motion.span>
                ))}
              </p>
            )}

            {part === 'stats' && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-2 xl:gap-3 lg:mb-7 max-w-md">
                {c.stats.map((s, i) => (
                  <motion.div key={i} variants={pop} className="paper-card px-2.5 sm:px-4 lg:px-2.5 xl:px-4 py-3 font-mono">
                    {/* sama karta zostaje, podmienia się tylko napis */}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={s.value}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.08 * i } }}
                        exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                      >
                        <div className="text-accent text-[12px] xl:text-[13px] whitespace-nowrap">{s.value}</div>
                        <div className="text-paper-dim text-[10px] sm:text-xs whitespace-nowrap">{s.label}</div>
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

            {part === 'cta' && (
              <motion.div variants={fade} className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-3 xl:gap-4">
                <a href="#projects" className="btn-accent">
                  See the work <span aria-hidden="true">↓</span>
                </a>
                <a href="#contact" className="btn-ghost">
                  Let&apos;s talk <span aria-hidden="true">↗</span>
                </a>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function HeroSection() {
  const { scrollY } = useScroll()
  const uiFade = useTransform(scrollY, [0, 150], [1, 0])

  return (
    // desktop (z ruchem): sekcja wyższa od ekranu, a jej zawartość przypięta (sticky) — kamera
    // "wjeżdża" w pierwszy pokój na nieruchomym kadrze, bez sprężyny goniącej scroll.
    // Sekcja About nachodzi na ostatni ekran tej sekcji (-mt-[100vh]) i przejmuje ujęcie.
    <section className="relative z-10 motion-safe:lg:h-[200vh]">
      <div className="relative min-h-[100svh] lg:min-h-0 lg:h-screen motion-safe:lg:sticky lg:top-0 flex items-start lg:pt-[max(6rem,calc((100vh-620px)/2))] overflow-x-clip pt-20 sm:pt-24 pb-12 lg:pb-20">
      {/* daleki grzbiet gór na horyzoncie (motyw ścian dioramy) */}
      {/* góry znikają razem z UI przy wjeździe kamery (inaczej prześwitują przez gasnący pokój) */}
      <motion.div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ opacity: uiFade }}>
      <div
        className="absolute inset-x-0 bottom-0 h-[38%] opacity-[0.07] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #c9a882, transparent)',
          WebkitMask:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 300' preserveAspectRatio='none'%3E%3Cpath d='M0 300 L0 190 L90 120 L160 170 L260 60 L360 160 L430 110 L540 190 L640 40 L760 170 L840 120 L940 180 L1040 70 L1130 150 L1200 110 L1200 300Z'/%3E%3C/svg%3E\") bottom / 100% 100% no-repeat",
          mask: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 300' preserveAspectRatio='none'%3E%3Cpath d='M0 300 L0 190 L90 120 L160 170 L260 60 L360 160 L430 110 L540 190 L640 40 L760 170 L840 120 L940 180 L1040 70 L1130 150 L1200 110 L1200 300Z'/%3E%3C/svg%3E\") bottom / 100% 100% no-repeat",
        }}
      />
      </motion.div>
      {/* mobile: nagłówek + przyciski nad dioramą (widoczne w pierwszym ekranie), linie i statystyki pod nią;
          desktop: lewa kolumna (nagłówek, linie, statystyki, przyciski) wyśrodkowana obok dioramy */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)] xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:grid-rows-[1fr_auto_auto_auto_auto_1fr] lg:gap-x-6">
        <CopyPart part="head" className="lg:col-start-1 lg:row-start-2" />
        <CopyPart part="cta" className="lg:col-start-1 lg:row-start-5" />

        <motion.div
          initial={{ opacity: 1, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="mt-1 mb-2 sm:mt-8 sm:mb-6 lg:my-0 -mx-3 sm:mx-0 lg:col-start-2 lg:row-start-1 lg:row-span-6 lg:self-center lg:-mr-[1vw] xl:-mr-[3vw] 2xl:-mr-[6vw]"
        >
          <Diorama />
        </motion.div>

        <CopyPart part="lines" className="lg:col-start-1 lg:row-start-3" />
        <CopyPart part="stats" className="lg:col-start-1 lg:row-start-4" />
      </div>
      {/* sygnał scrolla: kabel, po którym spływa impuls (w DOM za treścią — kolejność Tab: przyciski hero najpierw) */}
      <motion.a style={{ opacity: uiFade }} href="#about" aria-label="Scroll to about" className="absolute top-[calc(100svh-6.5rem)] left-1/2 -translate-x-1/2 hidden lg:flex [@media(max-height:760px)]:!hidden flex-col items-center gap-2 eyebrow hover:text-accent transition-colors">
        <span>scroll</span>
        <span className="relative block w-px h-12 bg-cocoa-500 overflow-hidden">
          <motion.span
            className="absolute left-0 top-0 w-px h-4 bg-accent shadow-glow"
            animate={{ y: [-16, 48] }}
            // trzy impulsy i cisza — w spoczynku hero ma się ruszać tylko wyspa
            transition={{ duration: 1.6, repeat: 2, repeatDelay: 0.4, ease: 'easeInOut', delay: 2.5 }}
          />
        </span>
      </motion.a>
      </div>
    </section>
  )
}
