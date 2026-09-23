'use client'

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
// wyjście starej treści = jedno szybkie zgaśnięcie całego bloku (bez kaskady), żeby statystyki
// DEV nie wisiały w kolorze CEO po zmianie akcentu
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

export default function HeroSection() {
  const { theme, phase } = useTheme()
  const c = COPY[theme]
  const reduce = useReducedMotion()
  // desktop: przy "wjeździe kamery" w pokój tekst hero znika jako pierwszy
  const { scrollY } = useScroll()
  const uiFade = useTransform(scrollY, [0, 200], [1, 0])

  return (
    <section className="relative z-10 min-h-[100svh] lg:min-h-[125vh] lg:items-start lg:pt-[max(6rem,calc((100vh-620px)/2))] flex items-center overflow-x-clip pt-20 sm:pt-24 pb-16 lg:pb-20">
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
      {/* sygnał scrolla: kabel, po którym spływa impuls */}
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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] gap-8 lg:gap-6 items-center">
        {/* przy przełączeniu stara treść gaśnie razem ze światłami wyspy, nowa wjeżdża po zmianie motywu */}
        <motion.div style={{ opacity: uiFade }} className="max-lg:!opacity-100">
        <motion.div // przygaszone aż do wejścia nowej treści (akcent zmienia się już w fazie covered)
        animate={{ opacity: phase === 'leaving' || phase === 'covered' ? 0.2 : 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
        <AnimatePresence mode={reduce ? 'popLayout' : 'wait'}>
          <motion.div key={theme} initial={reduce ? false : 'hidden'} animate="show" exit={reduce ? undefined : 'exit'} variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: phase === 'idle' ? 0 : 0.3 } }, exit: { opacity: 0, transition: { duration: 0.15 } } }}>
            <motion.p variants={fade} className="eyebrow mb-5">
              <span className="inline-block px-3 py-1.5 border border-accent/50 text-accent">{c.eyebrow}</span>
            </motion.p>

            <h1 className="font-display text-[2.75rem] sm:text-6xl lg:text-[3.1rem] xl:text-[3.4rem] 2xl:text-[4rem] leading-[1.02] tracking-tight mb-6">
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

            <p className="font-mono text-sm sm:text-base text-paper-muted leading-relaxed max-w-md mb-7">
              {c.lines.map((l) => (
                <motion.span key={l} variants={fade} className="block">
                  {l}
                </motion.span>
              ))}
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-7 max-w-md">
              {c.stats.map((s) => (
                <motion.div key={s.value} variants={pop} className="paper-card px-2.5 sm:px-4 py-3 font-mono">
                  <div className="text-accent text-[12px] xl:text-[13px] whitespace-nowrap">{s.value}</div>
                  <div className="text-paper-dim text-[10px] sm:text-xs whitespace-nowrap">{s.label}</div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fade} className="flex flex-wrap items-center gap-4">
              <a href="#projects" className="btn-accent">
                See the work <span aria-hidden="true">↓</span>
              </a>
              <a href="#contact" className="btn-ghost">
                Let&apos;s talk <span aria-hidden="true">↗</span>
              </a>
            </motion.div>
          </motion.div>
        </AnimatePresence>
        </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 1, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="order-first lg:order-none -mt-6 -mb-8 sm:my-0 -mx-3 sm:mx-0 lg:-mr-[1vw] xl:-mr-[3vw] 2xl:-mr-[6vw]"
        >
          <Diorama />
        </motion.div>
      </div>
    </section>
  )
}
