'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Numer sekcji → pokój z dioramy (public/diorama/rooms/{dev|founder}-N.webp).
 * Każda sekcja "jest" jednym pokojem wyspy z hero.
 */
const ROOM_OF: Record<string, number> = { '01': 0, '02': 1, '03': 3, '04': 2, '05': 4 }

function RoomThumb({ room }: { room: number }) {
  const { theme } = useTheme()
  const reduce = useReducedMotion()
  const src = `/diorama/rooms/${theme === 'founder' ? 'founder' : 'dev'}-${room}.webp`
  return (
    <motion.div
      aria-hidden="true"
      className="relative shrink-0 hidden sm:block sm:w-40 lg:w-48"
      initial={reduce ? undefined : { opacity: 0, y: 40, rotateX: -50 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 1, ease: EASE }}
      style={{ perspective: 800 }}
    >
      <div className={reduce ? '' : 'animate-float'} style={{ animationDuration: '6s' }}>
        <div className="relative" style={{ aspectRatio: '360 / 492' }}>
          <AnimatePresence initial={false}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={src}
              src={src}
              alt=""
              className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_24px_24px_rgba(0,0,0,0.6)]"
              initial={{ opacity: 0, y: -30, rotateZ: -4 }}
              animate={{ opacity: 1, y: 0, rotateZ: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
            />
          </AnimatePresence>
        </div>
        {/* cień pokoju na "podłodze" */}
        <div className="mx-auto mt-2 h-3 w-2/3 rounded-[50%] bg-black/50 blur-md" />
      </div>
    </motion.div>
  )
}

/**
 * Wspólny szkielet sekcji w motywie papercraft: numer pokoju + eyebrow + tytuł (szeryf),
 * opcjonalny lead. Każda sekcja strony odpowiada pokojowi z dioramy w hero.
 * Nagłówek wjeżdża spod maski (jak kartka wysuwana zza ściany dioramy).
 */
export function Section({
  id,
  index,
  eyebrow,
  title,
  lead,
  children,
  className = '',
}: {
  id?: string
  index?: string
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  children: ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { y: '110%' },
          whileInView: { y: '0%' },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.9, ease: EASE, delay },
        }

  return (
    <section id={id} className={`relative py-24 sm:py-32 scroll-mt-20 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <header className="mb-12 sm:mb-16 flex items-end justify-between gap-6">
          <div className="max-w-3xl">
          <div className="overflow-hidden mb-4">
            <motion.p className="eyebrow" {...rise(0)}>
              {index && (
                <span className="inline-flex items-center gap-2 text-accent mr-3">
                  <span className="w-6 h-px bg-accent shadow-glow" aria-hidden="true" />
                  {index}
                </span>
              )}
              {eyebrow}
            </motion.p>
          </div>
          <div className="overflow-hidden pb-2">
            <motion.h2
              className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-balance"
              {...rise(0.08)}
            >
              {title}
            </motion.h2>
          </div>
          {lead && (
            <motion.p
              className="mt-6 text-lg text-paper-muted max-w-2xl"
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            >
              {lead}
            </motion.p>
          )}
          </div>
          {index && ROOM_OF[index] !== undefined && <RoomThumb room={ROOM_OF[index]} />}
        </header>
        {children}
      </div>
    </section>
  )
}

const CABLE = 'M0 8 C 200 8, 260 56, 420 56 S 640 8, 800 8 S 1040 56, 1200 40'

/**
 * Świecący kabel (motyw spod wyspy) jako separator sekcji: rysuje się przy wejściu
 * w widok, potem wzdłuż niego biegnie impuls światła (jak dane w światłowodzie).
 */
export function CableDivider({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()
  return (
    <div className={`relative h-16 max-w-6xl mx-auto px-4 sm:px-8 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 64" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <motion.path
          d={CABLE}
          fill="none"
          stroke="rgb(var(--accent-rgb) / 0.22)"
          strokeWidth="7"
          style={{ filter: 'blur(7px)' }}
          initial={reduce ? undefined : { pathLength: 0 }}
          whileInView={reduce ? undefined : { pathLength: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
        />
        <motion.path
          d={CABLE}
          fill="none"
          stroke="rgb(var(--accent-rgb) / 0.8)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={reduce ? undefined : { pathLength: 0 }}
          whileInView={reduce ? undefined : { pathLength: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
        />
        {!reduce && (
          <circle r="4" opacity="0" fill="rgb(var(--accent-rgb))" style={{ filter: 'drop-shadow(0 0 6px rgb(var(--accent-rgb)))' }}>
            <animate attributeName="opacity" values="0;1" begin="1.6s" dur="0.2s" fill="freeze" />
            <animateMotion dur="3.2s" repeatCount="indefinite" begin="1.6s" path={CABLE} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          </circle>
        )}
      </svg>
    </div>
  )
}
