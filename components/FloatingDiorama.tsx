'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

/**
 * Lewitująca diorama w hero — komponent obok nagłówka (wzór: gabeonchain.com), nie wideo w tle.
 *
 * Choreografia przełączenia (fazy z ThemeContext):
 *   leaving  → obecna wyspa zapada się w pustkę na oczach użytkownika,
 *   covered  → pod kurtyną podmieniamy obraz (nowa wyspa czeka ukryta nad kadrem),
 *   entering → nowa wyspa opada, a światła zapalają się pokój po pokoju (od lewej).
 * Pokoje są klikalne: hover = reflektor w kształcie pokoju (ze szczytem dachu) + podpis,
 * klik = przewinięcie do sekcji. Do tego lewitacja, pochylenie za kursorem, paralaksa, iskry.
 */

type Room = { x0: number; x1: number; peak: number; label: string; hint: string; href: string }
type ThemeKey = 'developer' | 'founder'

// granice pokoi w % szerokości wyspy (obie makiety mają ten sam kadr); peak = x szczytu dachu
const X = [1.5, 23.5, 42.5, 60, 79, 98.5]
const FLOOR = 61 // % wysokości — linia podłogi pokoi
const EAVE = 19 // % — wysokość ścian bocznych
const APEX = 2 // % — szczyt dachu

const ROOMS: Record<ThemeKey, Room[]> = {
  developer: [
    { x0: X[0], x1: X[1], peak: 14, label: 'Dev cave', hint: 'who I am', href: '#about' },
    { x0: X[1], x1: X[2], peak: 32, label: 'Infra', hint: 'systems I shipped', href: '#projects' },
    { x0: X[2], x1: X[3], peak: 51, label: 'Web3 vault', hint: 'Octant, DeFi, Solidity', href: '#brands' },
    { x0: X[3], x1: X[4], peak: 69, label: 'AI lab', hint: 'my stack', href: '#stack' },
    { x0: X[4], x1: X[5], peak: 87, label: 'Studio', hint: 'content I make', href: '#tiktok' },
  ],
  founder: [
    { x0: X[0], x1: X[1], peak: 14, label: 'CEO office', hint: 'the founder story', href: '#about' },
    { x0: X[1], x1: X[2], peak: 32, label: 'devs-mentoring', hint: '300+ devs mentored', href: '#projects' },
    { x0: X[2], x1: X[3], peak: 51, label: 'coderiv', hint: 'the app studio', href: '#brands' },
    { x0: X[3], x1: X[4], peak: 69, label: 'devs-hunting', hint: 'talent scouting', href: '#brands' },
    { x0: X[4], x1: X[5], peak: 87, label: 'Efektywniejsi', hint: 'AI webinars', href: '#tiktok' },
  ],
}

/** Wielokąt pokoju (ściany + szczyt dachu) w % — ta sama liczba punktów dla każdego pokoju. */
const roomPoly = (r: Pick<Room, 'x0' | 'x1' | 'peak'>) =>
  [
    [r.x0, FLOOR],
    [r.x0, EAVE],
    [r.peak, APEX],
    [r.x1, EAVE],
    [r.x1, FLOOR],
  ] as const
const clipOf = (r: Pick<Room, 'x0' | 'x1' | 'peak'>) => `polygon(${roomPoly(r).map(([x, y]) => `${x}% ${y}%`).join(', ')})`
const pointsOf = (r: Room) => roomPoly(r).map(([x, y]) => `${x},${y}`).join(' ')
/** ten sam wielokąt we współrzędnych przycisku (strefa klikalna = kształt pokoju) */
const localClip = (r: Room) => {
  const w = r.x1 - r.x0
  const h = FLOOR - APEX
  const pts: [number, number][] = [
    [0, 100],
    [0, ((EAVE - APEX) / h) * 100],
    [((r.peak - r.x0) / w) * 100, 0],
    [100, ((EAVE - APEX) / h) * 100],
    [100, 100],
  ]
  return `polygon(${pts.map(([x, y]) => `${x}% ${y}%`).join(', ')})`
}

const SIZES = '(min-width: 1024px) 62vw, 100vw'
const ISLAND: Record<ThemeKey, { src: string; srcSet: string; alt: string }> = {
  developer: {
    src: '/diorama/island.webp',
    srcSet: '/diorama/island.webp 1200w, /diorama/island@2x.webp 2400w',
    alt: "Papercraft diorama of Casper's developer workspace: dev cave, infra room, web3 vault, AI lab and studio on a floating island with glowing green cables.",
  },
  founder: {
    src: '/diorama/island-founder.webp',
    srcSet: '/diorama/island-founder.webp 1200w, /diorama/island-founder@2x.webp 2400w',
    alt: "Papercraft diorama of Casper's founder world: CEO office, devs-mentoring classroom, coderiv app studio, devs-hunting scouting room and Efektywniejsi webinar stage on a floating island with glowing orange cables.",
  },
}

// "zapalanie świateł" — animacja CSS `lights-on` w globals.css (2 s, pokój po pokoju)
const LIGHTS_DUR = 2

export default function FloatingDiorama() {
  const { theme, phase } = useTheme()
  const reduce = useReducedMotion()
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const accentRef = useRef('0,255,136')
  const [hover, setHover] = useState<number | null>(null)
  const [desktop, setDesktop] = useState(false)
  const rooms = ROOMS[theme]
  const img = ISLAND[theme]

  const hidden = phase === 'covered' // nowa wyspa czeka pod kurtyną
  const leaving = phase === 'leaving' // stara zapada się na oczach
  const lightsDelay = phase === 'entering' ? 0.5 : 0.9

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (hover: hover)')
    const sync = () => setDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    setHover(null)
    accentRef.current = theme === 'founder' ? '255,107,53' : '0,255,136'
  }, [theme])

  // pochylenie za kursorem + paralaksa scrolla
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const spring = { damping: 25, stiffness: 120, mass: 0.6 }
  const rotY = useSpring(useTransform(mx, [-1, 1], [-8, 8]), spring)
  const rotXMouse = useTransform(my, [-1, 1], [6, -6])
  const shiftX = useSpring(useTransform(mx, [-1, 1], [-12, 12]), spring)
  const { scrollY } = useScroll()
  const scrollTilt = useTransform(scrollY, [0, 700], [0, 16])
  const rotX = useSpring(useTransform([rotXMouse, scrollTilt], ([a, b]: number[]) => a + b), spring)
  const scrollYShift = useSpring(useTransform(scrollY, [0, 700], [0, 90]), spring)
  const scrollScale = useSpring(useTransform(scrollY, [0, 700], [1, 0.9]), spring)

  useEffect(() => {
    if (reduce) return
    const onMove = (e: PointerEvent) => {
      const r = boxRef.current?.getBoundingClientRect()
      if (!r) return
      mx.set(Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2))))
      my.set(Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2))))
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [mx, my, reduce])

  // iskry; część w kolorze akcentu (kolor z ref — bez getComputedStyle w każdej klatce)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduce) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
    }
    resize()
    const sparks = Array.from({ length: 64 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 1.9,
      v: 0.00012 + Math.random() * 0.00035,
      p: Math.random() * Math.PI * 2,
      c: Math.random() < 0.2,
    }))
    const tick = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of sparks) {
        s.y -= s.v * 16
        if (s.y < -0.02) {
          s.y = 1.02
          s.x = Math.random()
        }
        const a = 0.3 + 0.35 * Math.sin(t / 650 + s.p)
        const x = (s.x + Math.sin(t / 2600 + s.p) * 0.012) * canvas.width
        const y = s.y * canvas.height
        const rad = s.r * 3 * dpr
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
        g.addColorStop(0, s.c ? `rgba(${accentRef.current},${a})` : `rgba(255,170,90,${a})`)
        g.addColorStop(1, 'rgba(255,120,40,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, rad, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [reduce])

  const go = (href: string) => {
    const el = document.querySelector(href) as HTMLElement | null
    if (!el) return
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).__lenis
    if (lenis) lenis.scrollTo(el, { offset: -72 })
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const drop = { opacity: 0, y: -170, rotateX: -38, rotateZ: -4, scale: 0.84 }
  const rest = { opacity: 1, y: 0, rotateX: 0, rotateZ: 0, scale: 1 }
  const collapse = { opacity: 0, y: 240, rotateX: 58, rotateZ: 3, scale: 0.68 }
  const spotOn = hover !== null && phase === 'idle'

  return (
    <figure ref={boxRef} className="relative m-0 select-none" style={{ perspective: 1400 }}>
      <canvas ref={canvasRef} className="absolute -inset-[14%] w-[128%] h-[128%] pointer-events-none" aria-hidden="true" />

      {/* poświata kabli pod wyspą — w kolorze akcentu, pulsuje; gaśnie razem z wyspą */}
      <motion.div
        aria-hidden="true"
        className="absolute left-[14%] right-[14%] bottom-[4%] h-[30%] rounded-[50%] blur-3xl"
        style={{ background: 'rgb(var(--accent-rgb) / 0.24)' }}
        initial={{ opacity: 0 }}
        animate={
          reduce ? { opacity: 0.8 } : leaving || hidden ? { opacity: 0, scaleX: 0.6 } : { opacity: [0.55, 1, 0.55], scaleX: [0.95, 1.05, 0.95] }
        }
        // kable zapalają się na końcu sekwencji świateł
        transition={
          leaving || hidden ? { duration: 0.5 } : { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: lightsDelay + LIGHTS_DUR - 0.2 }
        }
      />

      <motion.div
        style={{
          rotateX: reduce ? 0 : rotX,
          rotateY: reduce ? 0 : rotY,
          x: reduce ? 0 : shiftX,
          y: reduce || !desktop ? 0 : scrollYShift,
          scale: reduce || !desktop ? 1 : scrollScale,
          transformStyle: 'preserve-3d',
        }}
      >
        <div className={reduce ? 'relative' : 'relative animate-float'} style={{ perspective: 1400 }} onMouseLeave={() => setHover(null)}>
          {/* rezerwuje miejsce (proporcje wyspy) */}
          <div style={{ aspectRatio: '2588 / 1262' }} />
          {/* cień wyspy w pustce — tania elipsa zamiast drop-shadow na dużym obrazie */}
          <motion.div
            aria-hidden="true"
            className="absolute left-[18%] right-[18%] top-[72%] h-[18%] rounded-[50%] bg-black/70 blur-2xl pointer-events-none"
            animate={{ opacity: leaving || hidden ? 0 : 1, scaleX: leaving || hidden ? 0.5 : 1 }}
            transition={{ duration: 0.6 }}
          />

          <AnimatePresence initial mode="popLayout">
            <motion.div
              key={theme}
              className="absolute inset-0"
              style={{ transformPerspective: 1200 }}
              initial={reduce ? { opacity: 0 } : drop}
              animate={reduce ? { opacity: 1 } : hidden ? drop : leaving ? collapse : rest}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={
                leaving
                  ? { duration: 0.62, ease: [0.45, 0, 0.9, 0.5] }
                  : hidden
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 70, damping: 13, mass: 1, delay: phase === 'entering' ? 0.05 : 0.15 }
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                srcSet={img.srcSet}
                sizes={SIZES}
                alt={img.alt}
                width={1200}
                height={585}
                fetchPriority="high"
                draggable={false}
                className="absolute inset-0 w-full h-auto"
              />
              {/* światła zapalają się pokój po pokoju: ciemna kopia odsłaniana od lewej */}
              {!reduce && !hidden && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  aria-hidden="true"
                  alt=""
                  src={img.src}
                  srcSet={img.srcSet}
                  sizes={SIZES}
                  className="lights-off absolute inset-0 w-full h-auto pointer-events-none"
                  style={{ filter: 'brightness(0.22) saturate(0.5)', ['--lights-delay' as string]: `${lightsDelay}s` }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* reflektor: wyspa przygasa, wskazany pokój (wielokąt ze szczytem dachu) świeci */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: spotOn ? 1 : 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} srcSet={img.srcSet} sizes={SIZES} alt="" className="absolute inset-0 w-full h-auto" style={{ filter: 'brightness(0.3) saturate(0.55)' }} />
            {hover !== null && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  src={img.src}
                  srcSet={img.srcSet}
                  sizes={SIZES}
                  alt=""
                  className="absolute inset-0 w-full h-auto"
                  initial={false}
                  animate={{ clipPath: clipOf(rooms[hover]) }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  style={{ filter: 'brightness(1.12) saturate(1.1)' }}
                />
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
                  <motion.polygon
                    initial={false}
                    animate={{ points: pointsOf(rooms[hover]) }}
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    fill="none"
                    stroke="rgb(var(--accent-rgb))"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray="6 5"
                    style={{ filter: 'drop-shadow(0 0 6px rgb(var(--accent-rgb)))' }}
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-22" dur="0.9s" repeatCount="indefinite" />
                  </motion.polygon>
                </svg>
              </>
            )}
          </motion.div>

          {/* strefy klikalne w kształcie pokoi */}
          <div className="absolute inset-0">
            {rooms.map((r, i) => (
              <button
                key={`${theme}-${r.label}`}
                type="button"
                disabled={phase !== 'idle'}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={() => go(r.href)}
                aria-label={`${r.label} — ${r.hint}`}
                className="absolute cursor-pointer focus:outline-none"
                style={{ left: `${r.x0}%`, width: `${r.x1 - r.x0}%`, top: `${APEX}%`, height: `${FLOOR - APEX}%`, clipPath: localClip(r) }}
              />
            ))}
          </div>

          <AnimatePresence>
            {spotOn && hover !== null && (
              <motion.div
                key={`${theme}-${hover}`}
                initial={{ opacity: 0, y: 10, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.22 }}
                className="absolute pointer-events-none z-10"
                style={{ left: `${(rooms[hover].x0 + rooms[hover].x1) / 2}%`, top: `${FLOOR + 3}%`, x: '-50%' }}
              >
                <div className="paper-card no-fold px-4 py-2.5 whitespace-nowrap text-center">
                  <div className="font-display text-lg leading-tight">{rooms[hover].label}</div>
                  <div className="font-mono text-[11px] text-accent">
                    {rooms[hover].hint} <span aria-hidden="true">→</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <figcaption className="mt-6 flex items-center justify-between eyebrow">
        <AnimatePresence mode="wait">
          <motion.span key={theme} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            {theme === 'developer' ? 'My very normal workspace' : 'The companies I build'}
          </motion.span>
        </AnimatePresence>
        <span className="text-ember">{desktop ? 'hover a room ↗' : 'tap a room ↗'}</span>
      </figcaption>
    </figure>
  )
}
