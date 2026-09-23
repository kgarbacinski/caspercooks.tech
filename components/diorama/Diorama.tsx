'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { SWITCH, useTheme } from '@/contexts/ThemeContext'
import type { Theme } from '@/contexts/ThemeContext'
import { FRAME, ROOM_BOX } from './layout'
import { KEY, ROOMS, roomSrc, scrollToHash } from './rooms'
import Figure, { type FigureHandle } from './Figure'
import Sparks from './Sparks'

/**
 * Lewitująca diorama v2 — złożona z warstw zamiast jednego obrazka:
 *   podstawa wyspy (skała + kable, z "dziurami" po pokojach) + 5 pokoi wyciętych dokładnie
 *   po kształcie (segmentacja SAM) + figurka jako osobny sprite.
 * Dzięki temu:
 *   - hover podświetla dokładny kształt pokoju: pokój unosi się, reszta przygasa,
 *     wokół konturu świeci poświata w kolorze akcentu (maska = alfa pokoju),
 *   - przy przełączeniu DEV ⇄ CEO pokoje składają się jak książka pop-up i wyskakują
 *     już z nowego świata, a figurki zeskakują / wskakują,
 *   - intro strony: pokoje wyskakują, figurka spada, światła zapalają się pokój po pokoju.
 */

const ASPECT = `${FRAME.w} / ${FRAME.h}`
const ACCENT: Record<Theme, string> = { developer: '0,255,136', founder: '255,107,53' }
const FOLDED = 86 // kąt złożonego pokoju (leży płasko do tyłu)
const OFF = 0.16 // jasność pokoju ze zgaszonym światłem

type RoomState = { up: boolean; lit: boolean; flicker: boolean }
const allRooms = (s: RoomState) => Array.from({ length: 5 }, () => ({ ...s }))

export default function Diorama() {
  const { theme, phase, mode, toggleTheme } = useTheme()
  const reduce = !!useReducedMotion()
  const boxRef = useRef<HTMLDivElement>(null)
  const figRef = useRef<FigureHandle>(null)
  const mapRef = useRef<Record<string, { data: Uint8ClampedArray; w: number; h: number }>>({})
  const timers = useRef<number[]>([])
  const [rooms, setRooms] = useState<RoomState[]>(() => allRooms({ up: false, lit: false, flicker: false }))
  const [hover, setHover] = useState<number | null>(null)
  const [figHover, setFigHover] = useState(false)
  const [baseLit, setBaseLit] = useState(false)
  const [finePointer, setFinePointer] = useState(true)
  const [ready, setReady] = useState(false)
  const k = KEY[theme]
  const info = ROOMS[theme]
  const boxes = ROOM_BOX[k]
  const interactive = phase === 'idle' && ready

  const at = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setFinePointer(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // mapy etykiet pokoi (300 px szerokości) do hit-testu po dokładnym kształcie
  useEffect(() => {
    ;(['dev', 'ceo'] as const).forEach((key) => {
      if (mapRef.current[key]) return
      const img = new Image()
      img.src = `/diorama/v2/map-${key}.png`
      img.onload = () => {
        const c = document.createElement('canvas')
        c.width = img.naturalWidth
        c.height = img.naturalHeight
        const ctx = c.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(img, 0, 0)
        mapRef.current[key] = { data: ctx.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height }
      }
    })
  }, [])

  // wejście nowego świata: pokoje wyskakują kolejno, figurka spada, światła zapalają się od lewej
  const enter = useCallback(
    (delay = 0) => {
      const E = SWITCH.enter
      for (let i = 0; i < 5; i++) at(delay + E.popUp + i * 85, () => setRooms((r) => r.map((s, j) => (j === i ? { ...s, up: true } : s))))
      at(delay + E.figure, () => figRef.current?.arrive())
      for (let i = 0; i < 5; i++)
        at(delay + E.lights + i * 140, () => setRooms((r) => r.map((s, j) => (j === i ? { ...s, lit: true, flicker: true } : s))))
      at(delay + E.lights + 4 * 140 + 120, () => setBaseLit(true))
    },
    [at],
  )

  // intro po załadowaniu grafik
  useEffect(() => {
    let cancelled = false
    const srcs = [`/diorama/v2/base-${k}.webp`, ...boxes.map((_, i) => roomSrc(theme, i))]
    const wait = Promise.all(
      srcs.map(
        (s) =>
          new Promise<void>((res) => {
            const im = new Image()
            im.onload = im.onerror = () => res()
            im.src = s
          }),
      ),
    )
    Promise.race([wait, new Promise((r) => setTimeout(r, 2500))]).then(() => {
      if (cancelled) return
      setReady(true)
      if (reduce) {
        setRooms(allRooms({ up: true, lit: true, flicker: false }))
        setBaseLit(true)
        figRef.current?.show()
        return
      }
      figRef.current?.hide()
      enter(250)
    })
    return () => {
      cancelled = true
    }
    // tylko przy montażu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // choreografia przełączenia DEV ⇄ CEO
  useEffect(() => {
    if (reduce) return
    const L = SWITCH.leave
    if (phase === 'leaving') {
      setHover(null)
      if (mode === 'curtain') return
      figRef.current?.leave()
      for (let i = 0; i < 5; i++)
        at(L.lightsOff + i * 70, () => setRooms((r) => r.map((s, j) => (j === i ? { ...s, lit: false, flicker: false } : s))))
      at(L.lightsOff, () => setBaseLit(false))
      for (let i = 0; i < 5; i++) at(L.fold + i * 80, () => setRooms((r) => r.map((s, j) => (j === i ? { ...s, up: false } : s))))
    }
    if (phase === 'covered') {
      // nowy świat startuje złożony i ciemny (w trybie kurtyny od razu, bez animacji)
      setRooms(allRooms({ up: false, lit: false, flicker: false }))
      setBaseLit(false)
      figRef.current?.hide()
    }
    if (phase === 'entering') enter(mode === 'curtain' ? 150 : 0)
  }, [phase, mode, reduce, at, enter])

  // pochylenie za kursorem + paralaksa scrolla
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const spring = { damping: 26, stiffness: 110, mass: 0.7 }
  const rotY = useSpring(useTransform(mx, [-1, 1], [-7, 7]), spring)
  const rotXMouse = useTransform(my, [-1, 1], [5, -5])
  const { scrollY } = useScroll()
  const scrollTilt = useTransform(scrollY, [0, 700], [0, 14])
  const rotX = useSpring(useTransform([rotXMouse, scrollTilt], ([a, b]: number[]) => a + b), spring)
  const shiftX = useSpring(useTransform(mx, [-1, 1], [-10, 10]), spring)
  const scrollYShift = useSpring(useTransform(scrollY, [0, 700], [0, 80]), spring)
  // figurka ma własną, mocniejszą paralaksę (stoi przed pokojami)
  const figX = useSpring(useTransform(mx, [-1, 1], [-6, 6]), spring)

  const locate = useCallback(
    (clientX: number, clientY: number) => {
      const el = boxRef.current
      const map = mapRef.current[k]
      if (!el || !map) return null
      const r = el.getBoundingClientRect()
      const u = (clientX - r.left) / r.width
      const v = (clientY - r.top) / r.height
      if (u < 0 || u >= 1 || v < 0 || v >= 1) return null
      const px = Math.floor(u * map.w)
      const py = Math.floor(v * map.h)
      const val = map.data[(py * map.w + px) * 4]
      return val > 0 ? Math.round(val / 40) - 1 : null
    },
    [k],
  )

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

  const onPointerMove = (e: React.PointerEvent) => {
    if (!interactive || e.pointerType !== 'mouse') return
    // nad figurką działa jej własny hover (podskok + podpowiedź), nie pokój pod nią
    if ((e.target as HTMLElement).closest('button')) return
    setHover(locate(e.clientX, e.clientY))
  }
  const onClick = (e: React.MouseEvent) => {
    if (!interactive) return
    const i = locate(e.clientX, e.clientY)
    if (i === null) return
    if (!finePointer) {
      // dotyk: krótkie podświetlenie pokoju, potem przejście do sekcji
      setHover(i)
      at(420, () => {
        setHover(null)
        scrollToHash(info[i].href)
      })
      return
    }
    scrollToHash(info[i].href)
  }

  const accent = ACCENT[theme]
  const spot = hover !== null && interactive

  return (
    <figure className="relative m-0 select-none" aria-label="Interactive papercraft diorama">
      <Sparks accent={accent} reduce={reduce} />

      {/* poświata kabli pod wyspą — w kolorze akcentu, zapala się razem z bazą */}
      <div
        aria-hidden="true"
        className="absolute left-[12%] right-[12%] bottom-[2%] h-[34%] rounded-[50%] blur-3xl transition-opacity duration-700"
        style={{ background: `rgba(${accent},0.26)`, opacity: baseLit ? 1 : 0 }}
      >
        {!reduce && <div className="absolute inset-0 rounded-[50%] animate-cable-pulse" style={{ background: `rgba(${accent},0.2)` }} />}
      </div>

      <motion.div
        style={{
          rotateX: reduce ? 0 : rotX,
          rotateY: reduce ? 0 : rotY,
          x: reduce ? 0 : shiftX,
          y: reduce ? 0 : scrollYShift,
          transformPerspective: 1600,
        }}
      >
        <div className={reduce ? 'relative' : 'relative animate-float'}>
          <div
            ref={boxRef}
            className={`relative ${spot ? 'cursor-pointer' : ''}`}
            style={{ aspectRatio: ASPECT }}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setHover(null)}
            onClick={onClick}
          >
            {/* cień wyspy w pustce */}
            <div aria-hidden="true" className="absolute left-[16%] right-[16%] top-[76%] h-[16%] rounded-[50%] bg-black/70 blur-2xl" />

            {/* podstawa wyspy: skała, kable, pieczęć KG — przygasa przy hoverze i przy zgaszonych światłach */}
            <AnimatePresence initial={false}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                key={k}
                src={`/diorama/v2/base-${k}.webp`}
                srcSet={`/diorama/v2/base-${k}-sm.webp 1200w, /diorama/v2/base-${k}.webp 2400w`}
                sizes="(min-width: 1024px) 62vw, 100vw"
                alt={
                  theme === 'developer'
                    ? "Papercraft diorama of Casper's developer workspace: dev cave, infra room, web3 vault, AI lab and studio on a floating island with glowing green cables."
                    : "Papercraft diorama of Casper's founder world: CEO office, devs-mentoring classroom, coderiv app studio, devs-hunting scouting room and Efektywniejsi webinar stage on a floating island with glowing orange cables."
                }
                draggable={false}
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  filter: `brightness(${!baseLit ? 0.4 : spot ? 0.55 : 1}) saturate(${spot ? 0.75 : 1})`,
                  transition: 'filter .45s ease',
                }}
              />
            </AnimatePresence>

            {/* pokoje — każdy osobną warstwą w dokładnym kształcie */}
            {boxes.map((b, i) => {
              const s = rooms[i]
              const isHover = spot && hover === i
              const bright = !s.lit ? OFF : spot ? (isHover ? 1.1 : 0.42) : 1
              const src = roomSrc(theme, i)
              const small = roomSrc(theme, i, true)
              const maskStyle = {
                WebkitMaskImage: `url(${small})`,
                maskImage: `url(${small})`,
                WebkitMaskSize: '100% 100%',
                maskSize: '100% 100%',
              } as React.CSSProperties
              return (
                <motion.div
                  key={`${k}-${i}`}
                  className="absolute"
                  style={{
                    left: `${b.l}%`,
                    top: `${b.t}%`,
                    width: `${b.w}%`,
                    height: `${b.h}%`,
                    transformOrigin: '50% 100%',
                    transformPerspective: 900,
                    zIndex: isHover ? 15 : 10,
                  }}
                  initial={reduce ? false : { rotateX: FOLDED }}
                  animate={{ rotateX: s.up || reduce ? 0 : FOLDED }}
                  transition={
                    s.up ? { type: 'spring', stiffness: 170, damping: 13, mass: 0.9 } : { duration: 0.42, ease: [0.55, 0, 0.85, 0.35] }
                  }
                >
                  <div
                    className="absolute inset-0 transition-transform duration-500"
                    style={{
                      transformOrigin: '50% 100%',
                      transform: isHover ? 'translateY(-4.5%) scale(1.05)' : 'none',
                      transitionTimingFunction: 'cubic-bezier(.3,1.5,.5,1)',
                    }}
                  >
                    {/* cień uniesionego pokoju */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-black transition-opacity duration-500"
                      style={{ ...maskStyle, filter: 'blur(10px)', transform: 'translateY(6%) scale(0.97)', opacity: isHover ? 0.75 : 0 }}
                    />
                    {/* poświata po konturze pokoju w kolorze akcentu */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 transition-opacity duration-500"
                      style={{ ...maskStyle, background: `rgb(${accent})`, filter: 'blur(9px)', transform: 'scale(1.03)', opacity: isHover ? 0.85 : 0 }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 transition-opacity duration-300"
                      style={{ ...maskStyle, background: `rgb(${accent})`, transform: 'scale(1.012)', opacity: isHover ? 1 : 0 }}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      srcSet={`${small} ${Math.round(b.px / 2)}w, ${src} ${b.px}w`}
                      sizes={`(min-width: 1024px) ${Math.round(b.w * 0.62)}vw, ${Math.round(b.w)}vw`}
                      alt=""
                      draggable={false}
                      className={`absolute inset-0 w-full h-full ${s.flicker && !reduce ? 'animate-lights-on' : ''}`}
                      style={
                        s.flicker && !reduce && !spot
                          ? undefined
                          : { filter: `brightness(${bright}) saturate(${bright < 0.5 ? 0.6 : 1})`, transition: 'filter .4s ease' }
                      }
                      onAnimationEnd={() => setRooms((r) => r.map((x, j) => (j === i ? { ...x, flicker: false } : x)))}
                    />
                  </div>
                </motion.div>
              )
            })}

            {/* figurka — własna warstwa i paralaksa */}
            <motion.div className="absolute inset-0 pointer-events-none" style={{ x: reduce ? 0 : figX, zIndex: 20 }}>
              <Figure ref={figRef} theme={theme} reduce={reduce} dim={spot && hover !== 0 && hover !== 1} />
            </motion.div>

            {/* strefa figurki: podskok na hover, klik = przebranie (DEV ⇄ CEO) */}
            <button
              type="button"
              className="absolute z-30 cursor-pointer rounded-full focus-visible:outline-accent"
              style={{ left: '23.4%', top: '22%', width: '6.8%', height: '42%' }}
              aria-label={`Switch to ${theme === 'developer' ? 'founder (CEO)' : 'developer'} mode`}
              disabled={!interactive}
              onMouseEnter={() => {
                setHover(null)
                setFigHover(true)
                figRef.current?.hop()
              }}
              onMouseLeave={() => setFigHover(false)}
              onClick={(e) => {
                e.stopPropagation()
                setFigHover(false)
                toggleTheme()
              }}
            />

            {/* dostępność: pokoje jako przyciski (fokus z klawiatury podświetla dokładny kształt) */}
            <div className="sr-only">
              {info.map((r, i) => (
                <button key={r.label} type="button" onFocus={() => setHover(i)} onBlur={() => setHover(null)} onClick={() => scrollToHash(r.href)}>
                  {r.label} — {r.hint}
                </button>
              ))}
            </div>

            {/* podpis pokoju nad dachem */}
            <AnimatePresence>
              {spot && hover !== null && (
                <motion.div
                  key={`${k}-${hover}`}
                  initial={{ opacity: 0, y: 12, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, transition: { duration: 0.12 } }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  className="absolute pointer-events-none z-40"
                  style={{ left: `${boxes[hover].l + boxes[hover].w / 2}%`, top: `${boxes[hover].t - 5}%`, x: '-50%', y: '-100%' }}
                >
                  <div className="tag-card">
                    <span className="block font-display text-lg leading-tight text-paper">{info[hover].label}</span>
                    <span className="block font-mono text-[11px] text-accent">
                      {info[hover].hint} <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </motion.div>
              )}
              {figHover && interactive && (
                <motion.div
                  key="fig-tip"
                  initial={{ opacity: 0, y: 8, rotate: -4 }}
                  animate={{ opacity: 1, y: 0, rotate: -2 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  className="absolute pointer-events-none z-40"
                  style={{ left: '26.8%', top: '14%', x: '-50%', y: '-100%' }}
                >
                  <div className="tag-card whitespace-nowrap">
                    <span className="block font-mono text-[11px] text-paper-muted">psst — click me</span>
                    <span className="block font-display text-base text-accent">
                      change into {theme === 'developer' ? 'the CEO suit' : 'dev clothes'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <figcaption className="mt-5 flex items-center justify-between gap-4 eyebrow">
        <AnimatePresence mode="wait">
          <motion.span key={theme} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            {theme === 'developer' ? 'My very normal workspace' : 'The companies I build'}
          </motion.span>
        </AnimatePresence>
        <span className="text-ember text-right">{finePointer ? 'hover a room · click me to change' : 'tap a room ↗'}</span>
      </figcaption>
    </figure>
  )
}
