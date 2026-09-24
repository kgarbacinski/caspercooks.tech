'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useSafeReducedMotion'
import { useTheme } from '@/contexts/ThemeContext'
import { KEY, roomSrcOf, roomSrcSet } from '@/components/diorama/rooms'
import { ROOM_BOX } from '@/components/diorama/layout'
import DepthRoom, { type DepthTarget } from '@/components/diorama/DepthRoom'
import RoomAmbient from '@/components/diorama/Ambient'

export const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Pokój z dioramy wycięty dokładnie po kształcie (ta sama grafika co w hero) — "żywa makieta":
 *  - pop-up book: pokój leży złożony płasko i wstaje razem ze scrollem, gdy wjeżdża w kadr
 *    (scroll w górę składa go z powrotem); po wstaniu zapala się w nim światło (mrugnięcie jak w hero),
 *  - 2.5D: mapa głębi z AI → przy przewijaniu kamera schodzi z widoku z góry na wprost,
 *    a na desktopie lekko podąża za kursorem (DepthRoom, WebGL tylko gdy pokój jest w kadrze),
 *  - przy zmianie motywu pokój składa się i wyskakuje już z nowego świata (jak w hero),
 *  - żywe animacje pokoju z hero (RoomAmbient: ekrany z kodem, lampki, ramię robota, sejf…) na tej
 *    samej geometrii (% wyciętego pokoju); pętle chodzą tylko w kadrze i dopiero po wstaniu pokoju,
 *    poświaty zapalają się razem z lampą; przy reduced motion pokój zostaje statyczny.
 * Z jawnym `world` grafika nie zależy od trybu (i nie przeskakuje przy przełączeniu).
 */
export function RoomCutout({
  room,
  className = '',
  float = false,
  sizes = '(min-width: 1024px) 250px, 200px',
  world,
}: {
  room: number
  /** stały świat grafiki (np. marki: zawsze pokój z wyspy CEO); domyślnie świat aktywnego trybu */
  world?: 'dev' | 'ceo'
  className?: string
  float?: boolean
  /** szacowana szerokość pokoju w kadrze (srcSet dobiera wariant -sm / bazowy / -lg; potem liczy się pomiar) */
  sizes?: string
}) {
  const { theme } = useTheme()
  const reduce = useReducedMotion()
  const w = world ?? KEY[theme]
  const src = roomSrcOf(w, room)
  const b = ROOM_BOX[w][room]
  // proporcje wyciętego pokoju (kadr 2400×1224) — canvas 2.5D musi mieć dokładnie kształt grafiki
  const aspect = (b.w * 24) / (b.h * 12.24)

  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '120px' })
  // wstawanie: od wjazdu dolnej krawędzi w kadr do ~60% wysokości ekranu
  const { scrollYProgress: rise } = useScroll({ target: ref, offset: ['start 0.98', 'start 0.62'] })
  // dotyk (lite): pop-up odgrywa się raz, gdy pokój wjeżdża w kadr (played 0 → 1), zamiast iść za palcem —
  // przy natywnym scrollu z pędem składanie/rozkładanie w obie strony i gaszenie światła przy każdym
  // powrocie było nerwowe; mysz na desktopie: bez zmian (wstawanie sterowane scrollem)
  const played = useMotionValue(0)
  const liteMV = useMotionValue(0)
  const foldTarget = useTransform([rise, played, liteMV], ([r, p, l]: number[]) => (l ? (p ? 0 : 84) : 84 * (1 - Math.min(1, Math.max(0, r)))))
  const fold = useSpring(foldTarget, { stiffness: 140, damping: 22, mass: 0.6 })
  const shadow = useTransform(fold, [84, 0], [0.25, 1])
  const [lit, setLit] = useState(true)
  // dotyk / wąski ekran: wariant "lite" animacji (bez najdroższych drobiazgów), jak w hero
  const [lite, setLite] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)')
    const sync = () => {
      setLite(!mq.matches)
      // (odświeżenie w połowie strony: pokój, który już minął próg, stoi od razu)
      if (!mq.matches && rise.get() >= 0.5) played.set(1)
      liteMV.set(mq.matches ? 0 : 1)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  const layer = useRef<HTMLDivElement>(null)
  const [flick, setFlick] = useState(false)
  const flickT = useRef(0)
  useEffect(() => () => window.clearTimeout(flickT.current), [])
  const litOnce = () => {
    if (lit || flickT.current) return
    flickT.current = window.setTimeout(() => {
      flickT.current = 0
      setLit(true)
      setFlick(true)
    }, 520) // po rozłożeniu pokoju (sprężyna ~0,5 s)
  }
  useMotionValueEvent(rise, 'change', (v) => {
    if (reduce) return
    if (liteMV.get()) {
      // raz i na stałe: przewinięcie w górę nie składa pokoju ani nie gasi światła
      if (v >= 0.5 && !played.get()) {
        played.set(1)
        litOnce()
      }
      return
    }
    // światło dopiero, gdy pokój już stoi (pop-up najpierw, potem mrugnięcie lampy)
    if (v >= 0.995 && !lit && !flickT.current) {
      flickT.current = window.setTimeout(() => {
        flickT.current = 0
        setLit(true)
        setFlick(true)
      }, 260)
    } else if (v < 0.5) {
      window.clearTimeout(flickT.current)
      flickT.current = 0
      if (lit) setLit(false)
    }
  })
  useEffect(() => {
    // stan początkowy zgodny z położeniem (np. po odświeżeniu w połowie strony)
    if (!reduce) setLit(rise.get() >= (liteMV.get() ? 0.5 : 0.995))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce])

  // kamera 2.5D: przejazd pokoju przez ekran (z góry → na wprost → lekko z dołu) + kursor na desktopie
  const peek = useRef<DepthTarget>({ x: 0, y: 0 })
  const cx = useRef(0)
  const { scrollYProgress: pass } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const aim = () => {
    peek.current = { x: cx.current, y: Math.max(-1, Math.min(1, (0.5 - pass.get()) * 1.8)) }
  }
  useMotionValueEvent(pass, 'change', aim)
  useEffect(() => {
    if (!inView || reduce) return
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      cx.current = (e.clientX / window.innerWidth - 0.5) * 1.6
      aim()
    }
    aim()
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce])

  const on = lit || reduce
  const light: React.CSSProperties = flick
    ? {}
    : { filter: `brightness(${on ? 1 : 0.5}) saturate(${on ? 1 : 0.7})`, transition: 'filter .5s ease' }

  return (
    // data-paused: pętle CSS animacji pokoju stoją, gdy pokój jest poza kadrem
    <div ref={ref} aria-hidden="true" data-paused={inView ? undefined : true} className={`relative ${className}`} style={{ perspective: 900 }}>
      <div className={reduce || !float ? '' : 'animate-float'} style={{ animationDuration: '6.5s' }}>
        <motion.div className="relative" style={{ aspectRatio: '6 / 7', rotateX: reduce ? 0 : fold, transformOrigin: '50% 100%', transformPerspective: 800 }}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={src}
              className="absolute bottom-0 left-1/2 h-full drop-shadow-[0_28px_26px_rgba(0,0,0,0.65)]"
              style={{ aspectRatio: `${aspect}`, x: '-50%', transformOrigin: '50% 100%' }}
              initial={reduce ? { opacity: 0 } : { rotateX: 86, opacity: 1 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { rotateX: 86, transition: { duration: 0.35, ease: [0.55, 0, 0.85, 0.35] } }}
              transition={{ type: 'spring', stiffness: 170, damping: 14, delay: 0.35 }}
            >
              <div ref={layer} className="absolute inset-0">
                <DepthRoom
                  src={src}
                  srcSet={roomSrcSet(w, room)}
                  sizes={sizes}
                  depth={`/diorama/v2/depth-${w}-${room}.webp`}
                  target={peek}
                  active={inView && !reduce}
                  amp={0.05}
                  // sprite'y animacji leżą na płaskiej warstwie DOM — paralaksa 2.5D ich nie rozjeżdża
                  freeze={layer}
                  className={`absolute inset-0 w-full h-full ${flick ? 'animate-lights-on' : ''}`}
                  style={light}
                  imgProps={{ alt: '', loading: 'lazy', onAnimationEnd: () => setFlick(false) }}
                />
                {/* te same animacje co w hero; grafika animacji dostaje tę samą jasność/mrugnięcie co obrazek */}
                {!reduce && (
                  <RoomAmbient
                    world={w}
                    room={room}
                    run={inView && on}
                    show={on && !flick}
                    lite={lite}
                    hi
                    artClass={flick ? 'animate-lights-on' : ''}
                    artStyle={light}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <motion.div className="mx-auto -mt-1 h-3 w-3/4 rounded-[50%] bg-black/60 blur-md" style={{ opacity: reduce ? 1 : shadow }} />
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
      <div className="overflow-hidden py-1 -my-1 mb-3">
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
      {/* maska wjazdu tytułu: zapas u góry i u dołu na wydłużenia liter (Fraunces przy leading 1.04) */}
      <div className="overflow-hidden pt-[0.14em] -mt-[0.14em] pb-2">
        <motion.h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-balance" variants={rise} custom={0.08}>
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
