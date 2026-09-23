'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useSafeReducedMotion'
import { useTheme } from '@/contexts/ThemeContext'
import { roomSrc } from '@/components/diorama/rooms'

export const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Pokój z dioramy wycięty dokładnie po kształcie (ta sama grafika co w hero).
 * Przy zmianie motywu pokój składa się i wyskakuje już z nowego świata (jak w hero).
 */
export function RoomCutout({
  room,
  className = '',
  float = true,
  hi = false,
}: {
  room: number
  className?: string
  float?: boolean
  /** pełna rozdzielczość (duże ujęcia) */
  hi?: boolean
}) {
  const { theme } = useTheme()
  const reduce = useReducedMotion()
  const src = roomSrc(theme, room, !hi)
  return (
    <div aria-hidden="true" className={`relative ${className}`} style={{ perspective: 900 }}>
      <div className={reduce || !float ? '' : 'animate-float'} style={{ animationDuration: '6.5s' }}>
        <div className="relative" style={{ aspectRatio: '6 / 7' }}>
          <AnimatePresence initial={false} mode="popLayout">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={src}
              src={src}
              alt=""
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain object-bottom drop-shadow-[0_28px_26px_rgba(0,0,0,0.65)]"
              style={{ transformOrigin: '50% 100%' }}
              initial={reduce ? { opacity: 0 } : { rotateX: 86, opacity: 1 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { rotateX: 86, transition: { duration: 0.35, ease: [0.55, 0, 0.85, 0.35] } }}
              transition={{ type: 'spring', stiffness: 170, damping: 14, delay: 0.35 }}
            />
          </AnimatePresence>
        </div>
        <div className="mx-auto -mt-1 h-3 w-3/4 rounded-[50%] bg-black/60 blur-md" />
      </div>
    </div>
  )
}

/** Nagłówek sekcji: numer pokoju + eyebrow + tytuł (wjeżdża spod maski) + opcjonalny lead. */
export function SectionHeader({
  index,
  eyebrow,
  title,
  lead,
  className = '',
  align = 'left',
}: {
  index?: string
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  className?: string
  align?: 'left' | 'center'
}) {
  const reduce = useReducedMotion()
  // obserwujemy cały nagłówek (a nie przesunięte dzieci): dziecko wysunięte poza
  // overflow-hidden jest przycięte, więc IntersectionObserver nigdy by go nie zobaczył
  const rise = { hidden: { y: '110%' }, show: (d: number) => ({ y: '0%', transition: { duration: 0.9, ease: EASE, delay: d } }) }
  const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: 0.2 } } }
  return (
    <motion.header
      className={`${align === 'center' ? 'text-center mx-auto' : ''} max-w-3xl ${className}`}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
    >
      <div className="overflow-hidden mb-4">
        <motion.p className="eyebrow" variants={rise} custom={0}>
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
        <motion.h2 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.04] tracking-tight text-balance" variants={rise} custom={0.08}>
          {title}
        </motion.h2>
      </div>
      {lead && (
        <motion.div className={`mt-6 text-lg text-paper-muted max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`} variants={fade}>
          {lead}
        </motion.div>
      )}
    </motion.header>
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
