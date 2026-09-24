'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useSafeReducedMotion'
import { useTheme } from '@/contexts/ThemeContext'
import { roomSrc, roomSrcOf } from '@/components/diorama/rooms'

export const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Pokój z dioramy wycięty dokładnie po kształcie (ta sama grafika co w hero).
 * Przy zmianie motywu pokój składa się i wyskakuje już z nowego świata (jak w hero).
 * Domyślnie stoi nieruchomo — pętla lewitacji zostaje tylko w hero (float = wyjątek).
 * Z jawnym `world` grafika nie zależy od trybu (i nie przeskakuje przy przełączeniu).
 */
export function RoomCutout({
  room,
  className = '',
  float = false,
  hi = false,
  world,
}: {
  room: number
  /** stały świat grafiki (np. marki: zawsze pokój z wyspy CEO); domyślnie świat aktywnego trybu */
  world?: 'dev' | 'ceo'
  className?: string
  float?: boolean
  /** pełna rozdzielczość (duże ujęcia) */
  hi?: boolean
}) {
  const { theme } = useTheme()
  const reduce = useReducedMotion()
  const src = world ? roomSrcOf(world, room, !hi) : roomSrc(theme, room, !hi)
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

/**
 * Separator sekcji: papierowa girlanda (sznurek + chorągiewki z kraftu, kremu, terakoty i akcentu).
 * Sznurek rysuje się przy wejściu w widok, chorągiewki spadają kolejno (jednorazowo).
 */
const W = 1200
const SAG = 38
const twineY = (x: number) => 10 + SAG * Math.sin((Math.PI * x) / W)
const TWINE = `M0 10 Q ${W / 2} ${10 + SAG * 2} ${W} 10`
const FLAGS = Array.from({ length: 17 }, (_, i) => (i + 0.5) * (W / 17))
const FLAG_COLORS = ['#efe2c7', '#c9a882', '#b8663f', 'rgb(var(--accent-rgb))']

export function CableDivider({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()
  return (
    <div className={`relative max-w-6xl mx-auto px-4 sm:px-8 py-4 ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${W} 90`} className="w-full h-auto overflow-visible">
        <motion.path
          d={TWINE}
          fill="none"
          stroke="#8d6a45"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          initial={reduce ? undefined : { pathLength: 0 }}
          whileInView={reduce ? undefined : { pathLength: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        />
        {FLAGS.map((x, i) => {
          const y = twineY(x)
          return (
            <motion.g
              key={i}
              initial={reduce ? undefined : { opacity: 0, y: -14 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.35 + i * 0.03 }}
            >
              {/* bez wiecznego kołysania — chorągiewki tylko spadają przy wejściu */}
              <g>
                <polygon
                  points={`${x - 22},${y} ${x + 22},${y} ${x},${y + 38}`}
                  fill={FLAG_COLORS[i % FLAG_COLORS.length]}
                  opacity={i % 4 === 3 ? 0.85 : 0.95}
                  style={{ filter: 'drop-shadow(0 6px 5px rgba(0,0,0,0.45))' }}
                />
              </g>
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}
