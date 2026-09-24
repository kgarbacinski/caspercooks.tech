'use client'

import { AnimatePresence, motion, useTransform } from 'framer-motion'
import { usePageScrollY } from '@/hooks/usePageScroll'
import { useTheme } from '@/contexts/ThemeContext'
import { useReducedMotion } from '@/hooks/useSafeReducedMotion'
import Diorama from './diorama/Diorama'
import EffectBoundary from './ui/EffectBoundary'
import { KEY } from './diorama/rooms'
import { FRAME } from './diorama/layout'

/** Zapas na wypadek błędu dioramy: ta sama wyspa jako jeden statyczny obraz (bez animacji). */
function StaticIsland() {
  const { theme } = useTheme()
  const k = KEY[theme]
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/diorama/v2/island-${k}.webp`}
      srcSet={`/diorama/v2/island-${k}-sm.webp 1200w, /diorama/v2/island-${k}.webp 2400w`}
      sizes="(min-width: 1024px) and (min-aspect-ratio: 4/5) 66vw, 100vw"
      alt="Papercraft diorama of Casper's workspace on a floating island"
      className="block w-full h-auto"
      style={{ aspectRatio: `${FRAME.w} / ${FRAME.h}` }}
    />
  )
}

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
      { value: '0x08 projects', label: '// delivered' },
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
// warianty grają tylko przy zmianie motywu (pierwszy render jest bez wejścia): nowa treść podmienia
// starą w tej samej klatce i startuje od półprzezroczystości — kolumna nigdy nie jest pusta ani podwójna
const rise = {
  hidden: { opacity: 0.4, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}
const fade = {
  hidden: { opacity: 0.4, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}
const pop = {
  hidden: { opacity: 0, y: 18, rotateX: -60 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.7, ease: EASE } },
}

type Part = 'head' | 'lines' | 'stats' | 'cta'

/**
 * Jedna część treści hero. Przy przełączeniu DEV ⇄ CEO:
 *  - przed zmianą motywu cała treść przygasa razem ze światłami wyspy (wciąż czytelna),
 *  - nagłówek i linie: nowa wersja zastępuje starą w tej samej klatce (od 40% krycia, z lekkim
 *    uniesieniem); obie leżą w jednej komórce siatki ([grid-area:1/1]), więc nic pod spodem nie skacze,
 *  - karty statystyk i przyciski zostają na miejscu — zmienia się tylko napis w kartach
 *    i kolor akcentu, więc kolumna nigdy nie jest pusta.
 */
function CopyPart({ part, className = '' }: { part: Part; className?: string }) {
  const { theme, phase } = useTheme()
  const c = COPY[theme]
  const reduce = useReducedMotion()
  // desktop: przy "wjeździe kamery" w pokój tekst hero znika jako pierwszy
  const scrollY = usePageScrollY()
  const uiFade = useTransform(scrollY, [0, 80], [1, 0])
  const uiShift = useTransform(scrollY, [0, 140], [0, -70])
  const swaps = part === 'head' || part === 'lines'

  return (
    // desktop: tekst gaśnie i odsuwa się w lewo przed nadjeżdżającą wyspą (mobile: bez zmian)
    <motion.div style={{ opacity: uiFade, x: uiShift }} className={`tab:!opacity-100 tab:![transform:none] ${className}`}>
      {/* zwykły div z przejściem CSS: przygaszenie na czas gaszenia świateł */}
      <div className="grid" style={{ opacity: phase === 'leaving' ? 0.45 : 1, transition: 'opacity .45s ease' }}>
        {/* bez animacji wejścia przy pierwszym renderze: nagłówek i przyciski są widoczne od pierwszego
            malowania (także przed hydratacją) — animuje się tylko diorama i zmiana motywu */}
        <AnimatePresence initial={false}>
          <motion.div
            key={swaps ? theme : 'static'}
            className="[grid-area:1/1]"
            initial={reduce ? false : 'hidden'}
            animate="show"
            exit={reduce ? undefined : 'exit'}
            variants={{
              show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0 } },
              exit: { opacity: 0, transition: { duration: 0 } },
            }}
          >
            {part === 'head' && (
              <>
                <motion.p variants={fade} className="eyebrow mb-4 sm:mb-5">
                  <span className="inline-block px-3 py-1.5 border border-accent/50 text-accent">{c.eyebrow}</span>
                </motion.p>
                {/* desktop: stopień liczony od szerokości lewej kolumny — pierwsza linia mieści się
                    w jednym wierszu od 1024 do 1920 px */}
                <h1 className="font-display text-[clamp(2rem,10.6vw,2.75rem)] sm:text-6xl lg:text-[min(3.3rem,calc(4.3vw-4px))] leading-[1.02] tracking-tight mb-6">
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

            {/* < 400 px: trzy karty w kolumnie (wartość i podpis w jednym wierszu) — w trzech wąskich kolumnach napisy łamały się po znaku */}
            {part === 'stats' && (
              <div className="grid grid-cols-3 [@media(max-width:399px)]:grid-cols-1 gap-2 sm:gap-3 lg:gap-2 xl:gap-3 lg:mb-7 max-w-md">
                {c.stats.map((s, i) => (
                  <motion.div key={i} variants={pop} className="paper-card px-4 [@media(min-width:400px)_and_(max-width:639px)]:px-2.5 sm:px-4 lg:px-2.5 xl:px-4 py-3 [@media(max-width:399px)]:py-2.5 font-mono">
                    {/* sama karta zostaje, podmienia się tylko napis */}
                    <div className="grid">
                    <AnimatePresence initial={false}>
                      <motion.div
                        key={s.value}
                        className="[grid-area:1/1] [@media(max-width:399px)]:flex [@media(max-width:399px)]:items-baseline [@media(max-width:399px)]:gap-3"
                        initial={{ opacity: 0.4, y: 5 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.04 * i } }}
                        exit={{ opacity: 0, transition: { duration: 0 } }}
                      >
                                                <div className="text-accent text-xs xl:text-[0.8125rem] whitespace-nowrap">{s.value}</div>
                        <div className="text-paper-dim text-xs whitespace-nowrap">{s.label}</div>
                      </motion.div>
                    </AnimatePresence>
                    </div>
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
  const scrollY = usePageScrollY()
  const uiFade = useTransform(scrollY, [0, 150], [1, 0])
  // sygnał scrolla znika od razu (inaczej nachodzi na nagłówek About wjeżdżający od dołu)
  const cueFade = useTransform(scrollY, [0, 60], [1, 0])

  return (
    // desktop (z ruchem): sekcja wyższa od ekranu, a jej zawartość przypięta (sticky) — kamera
    // "wjeżdża" w pierwszy pokój na nieruchomym kadrze, bez sprężyny goniącej scroll.
    // Sekcja About nachodzi na ostatni ekran tej sekcji (-mt-[100vh]) i przejmuje ujęcie.
    <section className="relative z-10 motion-safe:lg:h-[200vh]">
      <div className="relative min-h-[100svh] lg:min-h-0 lg:h-screen motion-safe:lg:sticky lg:top-0 flex items-start md:items-center lg:items-start lg:pt-[max(6rem,calc((100vh-38.75rem)/2))] overflow-x-clip pt-20 sm:pt-24 pb-12 lg:pb-20">
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
          className="mt-1 mb-2 sm:mt-8 sm:mb-6 lg:my-0 -mx-3 sm:mx-0 lg:col-start-2 lg:row-start-1 lg:row-span-6 lg:self-center lg:-mr-[1vw] xl:-mr-[min(3vw,calc((100vw-80rem)/2+1.5rem))] 2xl:-mr-[6vw]"
        >
          <EffectBoundary name="diorama" fallback={<StaticIsland />}>
            <Diorama />
          </EffectBoundary>
        </motion.div>

        <CopyPart part="lines" className="lg:col-start-1 lg:row-start-3" />
        <CopyPart part="stats" className="lg:col-start-1 lg:row-start-4" />
      </div>
      {/* sygnał scrolla: kabel, po którym spływa impuls (w DOM za treścią — kolejność Tab: przyciski hero najpierw) */}
      <motion.a style={{ opacity: cueFade }} href="#about" aria-label="Scroll to about" className="absolute top-[calc(100svh-6.5rem)] left-1/2 -translate-x-1/2 hidden lg:flex [@media(max-height:760px)]:!hidden flex-col items-center gap-2 eyebrow hover:text-accent transition-colors">
        <span>scroll</span>
        <span className="relative block w-px h-12 bg-cocoa-500 overflow-hidden">
          {/* trzy impulsy i cisza — w spoczynku hero ma się ruszać tylko wyspa (CSS na kompozytorze: bez pętli JS,
              która na telefonie chodziła przez 8 s mimo ukrytego sygnału) */}
          <span className="cue-pulse absolute left-0 top-0 w-px h-4 bg-accent shadow-glow" />
        </span>
      </motion.a>
      </div>
    </section>
  )
}
