'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimate, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useSafeReducedMotion'
import { SWITCH, useTheme } from '@/contexts/ThemeContext'
import type { Theme } from '@/contexts/ThemeContext'
import { FRAME, ROOM_BOX } from './layout'
import { KEY, ROOMS, roomSrc, scrollToHash } from './rooms'
import Figure, { type FigureHandle } from './Figure'
import Sparks from './Sparks'
import PaperBurst from './PaperBurst'
import RoomAmbient from './Ambient'

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
const OFF = 0.45 // jasność pokoju ze zgaszonym światłem (półmrok, nie czerń)

// żywe światła w pokojach (pozycje w % kadru): delikatnie pulsujące poświaty ekranów, lamp i ring lighta
const GLOWS: Record<'dev' | 'ceo', { x: number; y: number; r: number; c: string; d: number }[]> = {
  dev: [
    { x: 16.8, y: 39, r: 7, c: '120,255,180', d: 3.1 }, // monitory w Dev cave
    { x: 50.7, y: 39, r: 9, c: '90,255,160', d: 4.2 }, // skarbiec web3
    { x: 72.3, y: 41, r: 6, c: '140,255,190', d: 2.7 }, // ekrany AI lab
    { x: 82.3, y: 35.5, r: 6, c: '255,236,200', d: 3.6 }, // ring light
  ],
  ceo: [
    { x: 16.4, y: 30, r: 8, c: '150,180,255', d: 4.4 }, // okno z miastem
    { x: 33.7, y: 35, r: 7, c: '255,190,120', d: 3.3 }, // tablica
    { x: 71.2, y: 32.5, r: 5, c: '120,255,150', d: 2.4 }, // radar
    { x: 82.3, y: 35.5, r: 6, c: '255,236,200', d: 3.6 }, // ring light
  ],
}

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
  const [burst, setBurst] = useState(0)
  const [flash, setFlash] = useState(0)
  const panRef = useRef<HTMLDivElement>(null)
  // mobile: startowo pokazujemy pokój z figurką
  useEffect(() => {
    const el = panRef.current
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = (el.scrollWidth - el.clientWidth) * 0.05
  }, [])
  const [bounceRef, animateBounce] = useAnimate()
  const k = KEY[theme]
  const info = ROOMS[theme]
  const boxes = ROOM_BOX[k]

  const at = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)')
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
      for (let i = 0; i < 5; i++) at(delay + E.popUp + i * 70, () => setRooms((r) => r.map((s, j) => (j === i ? { ...s, up: true } : s))))
      at(delay + E.figure, () => figRef.current?.arrive())
      // lądowanie figurki: cała wyspa ugina się i odbija (moment "bum")
      at(delay + E.figure + 500, () => {
        if (bounceRef.current)
          animateBounce(bounceRef.current, { y: [0, 16, -6, 2, 0], scaleY: [1, 0.985, 1.006, 1, 1], rotateZ: [0, -0.7, 0.35, 0, 0] }, { duration: 0.75, ease: 'easeOut' })
      })
      for (let i = 0; i < 5; i++)
        at(delay + E.lights + i * 110, () => setRooms((r) => r.map((s, j) => (j === i ? { ...s, lit: true, flicker: true } : s))))
      at(delay + E.lights + 4 * 110 + 100, () => setBaseLit(true))
    },
    [at, animateBounce, bounceRef],
  )

  // intro po załadowaniu grafik
  useEffect(() => {
    let cancelled = false
    // czekamy na obrazy, które faktycznie są w DOM (przeglądarka sama wybrała wariant ze srcSet) —
    // osobne new Image() pobierało pełną bazę 2400 px także na telefonie (podwójny transfer)
    const imgs = Array.from(boxRef.current?.querySelectorAll('img') ?? [])
    const wait = Promise.all(
      imgs.map(
        (im) =>
          new Promise<void>((res) => {
            if (im.complete) return res()
            im.addEventListener('load', () => res(), { once: true })
            im.addEventListener('error', () => res(), { once: true })
          }),
      ),
    )
    Promise.race([wait, new Promise((r) => setTimeout(r, 2500))]).then(() => {
      if (cancelled) return
      setReady(true)
      // stan z media query czytamy bezpośrednio (hook zwraca prawdę dopiero po montażu)
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
      for (let i = 0; i < 5; i++) at(L.fold + i * 60, () => setRooms((r) => r.map((s, j) => (j === i ? { ...s, up: false } : s))))
    }
    if (phase === 'covered') {
      // nowy świat startuje złożony i ciemny (w trybie kurtyny od razu, bez animacji)
      setRooms(allRooms({ up: false, lit: false, flicker: false }))
      setBaseLit(false)
      figRef.current?.hide()
    }
    if (phase === 'entering') {
      // papierowe ścinki wystrzeliwują z wyspy, gdy wyskakuje nowy świat
      setBurst((b) => b + 1)
      setFlash((f) => f + 1)
      enter(mode === 'curtain' ? 150 : 0)
    }
  }, [phase, mode, reduce, at, enter])

  // Wyspa NIE pochyla się za kursorem (świadomie): to płaski render, więc tilt zdradzał "kartkę",
  // dublował się z lewitacją i hoverem pokoi, a hit-test po obróconym prostokącie trafiał obok.
  // Jedyna reakcja na kursor = podświetlenie pokoju. Ruch wyspy zostaje tylko ze scrolla.
  const spring = { damping: 26, stiffness: 110, mass: 0.7 }
  const { scrollY } = useScroll()
  const scrollYShift = useSpring(useTransform(scrollY, [0, 850], [0, 120]), spring)
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setWide(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  const dive = wide && !reduce
  const capFade = useTransform(scrollY, [0, 50], [1, 0]) // podpisy gasną razem z tekstem hero

  /*
   * Desktop: "wjazd kamery" w pierwszy pokój. Hero jest przypięte (sticky) przez D px scrolla,
   * więc kadr stoi w miejscu, a wyspa (transform z originem 0 0) przesuwa się i rośnie tak, żeby
   * pokój nr 1 wylądował DOKŁADNIE tam, gdzie leży pokój w przypiętej scenie About
   * ([data-dive-target]). Reszta wyspy (baza, kable, pozostałe pokoje) gaśnie po drodze,
   * a na końcu pokój + figurka podmieniają się 1:1 na te z sekcji About (bez skoku).
   */
  // pętle CSS (lewitacja, oddychające światła) i iskry pauzują, gdy hero jest poza kadrem
  // albo już zgasło po wjeździe kamery — nie malujemy niewidocznej sceny
  const figureRef = useRef<HTMLElement>(null)
  const [onScreen, setOnScreen] = useState(true)
  useEffect(() => {
    const el = figureRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const wrapRef = useRef<HTMLDivElement>(null)
  const floatRef = useRef<HTMLDivElement>(null)
  type Geo = { L: number; T: number; W: number; H: number; rx: number; ry: number; tx: number; ty: number; s1: number }
  const geo = useRef<Geo | null>(null)
  const span = useRef(1) // D: długość przypięcia hero w px
  const floatM = useRef(0) // przesunięcie zatrzymanej lewitacji (wchodzi do rachunku kamery)
  const geoTick = useMotionValue(0)
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
  const diveP = useTransform([scrollY, geoTick], ([v]: number[]) => clamp01(v / span.current))
  // kamera rusza od razu (wyspa wjeżdża w miejsce gasnącego tekstu), hamuje łagodnie
  // i dojeżdża na 85% drogi — potem stoi, gdy obok wjeżdżają notatki About
  const camE = useTransform(diveP, (p) => {
    const t = clamp01(p / 0.65)
    return 1 - (1 - t) * (1 - t)
  })
  // tor pokoju wyprzedza zbliżenie: pokój od pierwszych pikseli jedzie w lewo, na miejsce gasnącego tekstu
  const camPos = useTransform(diveP, (p) => {
    const t = clamp01(p / 0.5)
    return 1 - Math.pow(1 - t, 3)
  })
  const cam = (e: number, q: number) => {
    const g = geo.current
    if (!g) return { s: 1, x: 0, y: 0 }
    const { rx, ry } = g
    const m = floatM.current
    // skala rośnie wykładniczo (równe tempo zbliżenia), środek pokoju jedzie po prostej
    const s = Math.pow(g.s1, e)
    const cx = g.L + rx * g.W + (g.tx - (g.L + rx * g.W)) * q
    const cy = g.T + ry * g.H + m + (g.ty - (g.T + ry * g.H + m)) * q
    return { s, x: cx - g.L - rx * g.W * s, y: cy - g.T - (ry * g.H + m) * s }
  }
  const camX = useTransform([camE, camPos], ([e, q]: number[]) => cam(e, q).x)
  const camY = useTransform([camE, camPos], ([e, q]: number[]) => cam(e, q).y)
  const camS = useTransform([camE, camPos], ([e, q]: number[]) => cam(e, q).s)
  // reszta wyspy gaśnie w pierwszej połowie drogi — zanim obok pojawią się notatki
  const rest = useTransform(diveP, [0.03, 0.3], [1, 0])
  // skała, kable i ich poświata gasną szybciej niż pokoje — zanim od dołu wjedzie nagłówek About
  const baseFade = useTransform(diveP, [0.02, 0.15], [1, 0])
  // pozostałe pokoje nie tylko gasną, ale odjeżdżają w prawo poza kadr (paralaksa "najazdu" kamery)
  const out1 = useTransform(rest, (r) => `${(1 - r) * 60}%`)
  const out2 = useTransform(rest, (r) => `${(1 - r) * 90}%`)
  const out3 = useTransform(rest, (r) => `${(1 - r) * 120}%`)
  const out4 = useTransform(rest, (r) => `${(1 - r) * 150}%`)
  const outX = [0, out1, out2, out3, out4]
  // podmiana na scenę About dokładnie w chwili jej przypięcia
  const handoff = useTransform([scrollY, geoTick], ([v]: number[]) => (v >= span.current - 1 ? 0 : 1))

  const measure = useCallback(() => {
    const wrap = wrapRef.current
    const sec = figureRef.current?.closest('section')
    if (!wrap || !sec) return
    const vh = window.innerHeight
    span.current = Math.max(1, sec.offsetHeight - vh)
    const tgt = document.querySelector<HTMLElement>('[data-dive-target]')
    const box = tgt?.parentElement
    const stage = tgt?.closest<HTMLElement>('[data-dive-stage]')
    if (!tgt || !box || !stage || !tgt.offsetWidth) {
      geo.current = null
      geoTick.set(geoTick.get() + 1)
      return
    }
    // położenie wyspy bez transformu kamery (po odpięciu hero przesunęło się w górę o nadmiar scrolla)
    const r = wrap.getBoundingClientRect()
    const over = Math.max(0, window.scrollY - span.current)
    const L = r.left - camX.get()
    const T = r.top - camY.get() + over
    const W = wrap.offsetWidth
    const H = wrap.offsetHeight
    // cel: układ (bez transformów) pokoju w scenie About, względem przypiętej sceny (= okno)
    const br = box.getBoundingClientRect()
    const sr = stage.getBoundingClientRect()
    const tx = br.left - sr.left + tgt.offsetLeft + tgt.offsetWidth / 2
    const ty = br.top - sr.top + tgt.offsetTop + tgt.offsetHeight / 2
    const b = ROOM_BOX[k][0]
    geo.current = { L, T, W, H, rx: (b.l + b.w / 2) / 100, ry: (b.t + b.h / 2) / 100, tx, ty, s1: tgt.offsetWidth / ((b.w / 100) * W) }
    geoTick.set(geoTick.get() + 1)
  }, [k, camX, camY, geoTick])

  useEffect(() => {
    if (!dive) return
    measure()
    // obrazy/fonty mogą jeszcze przesuwać układ — pomiar też po chwili
    const t = window.setTimeout(measure, 600)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
  }, [dive, measure])

  // lewitacja zatrzymuje się, gdy kamera rusza (jej bieżące przesunięcie wchodzi do rachunku)
  const [diving, setDiving] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => {
    const d = dive && v > 2
    if (d !== diving) {
      if (d && floatRef.current) {
        const tr = getComputedStyle(floatRef.current).transform
        floatM.current = tr && tr !== 'none' ? new DOMMatrixReadOnly(tr).m42 : 0
      }
      if (!d) floatM.current = 0
      setDiving(d)
    }
  })
  // po zaniknięciu diorama nie może łapać kliknięć nad sekcją About
  const [gone, setGone] = useState(false)
  useMotionValueEvent(handoff, 'change', (v) => setGone(v < 0.5))

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

  const paused = !onScreen || (dive && gone)
  // w trakcie wjazdu kamery wyspa nie reaguje na hover/klik (etykiety nad powiększonym pokojem)
  const interactive = phase === 'idle' && ready && !diving
  const accent = ACCENT[theme]
  const spot = hover !== null && interactive

  return (
    <figure ref={figureRef} data-paused={paused || undefined} className="relative m-0 select-none" aria-label="Interactive papercraft diorama">
      {/* iskry tylko przy myszy (desktop) — na dotyku to koszt baterii bez zysku */}
      <motion.div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ opacity: dive ? baseFade : 1 }}>
        <Sparks accent={accent} reduce={reduce || !finePointer} paused={paused} />

        {/* poświata kabli pod wyspą — w kolorze akcentu, zapala się razem z bazą */}
        <div
          className="absolute left-[12%] right-[12%] bottom-[2%] h-[34%] rounded-[50%] blur-3xl transition-opacity duration-700"
          style={{ background: `rgba(${accent},${theme === 'developer' ? 0.13 : 0.22})`, opacity: baseLit ? 1 : 0 }}
        />
      </motion.div>

      {/* mobile: scena szersza niż ekran, przesuwana palcem (większe pokoje); desktop bez zmian */}
      {/* miękkie wygaszenie brzegów zamiast twardego cięcia sceny na krawędzi ekranu */}
      <div ref={panRef} className="overflow-x-auto overflow-y-visible sm:overflow-visible no-scrollbar snap-x max-sm:[mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]">
      <div className="w-[165%] sm:w-full pt-12 pb-7 sm:p-0">
      <motion.div
        ref={wrapRef}
        style={{
          x: dive ? camX : 0,
          y: reduce ? 0 : dive ? camY : scrollYShift,
          scale: dive ? camS : 1,
          opacity: dive ? handoff : 1,
          transformOrigin: '0 0',
          pointerEvents: dive && gone ? 'none' : 'auto',
        }}
      >
        <div ref={floatRef} className={reduce ? 'relative' : 'relative animate-float'} style={diving ? { animationPlayState: 'paused' } : undefined}>
          <div ref={bounceRef} className="relative">
          <div
            ref={boxRef}
            className={`relative ${spot ? 'cursor-pointer' : ''}`}
            style={{ aspectRatio: ASPECT }}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setHover(null)}
            onClick={onClick}
          >
            {/* cień wyspy w pustce */}
            <motion.div aria-hidden="true" className="absolute left-[16%] right-[16%] top-[76%] h-[16%] rounded-[50%] bg-black/70 blur-2xl" style={{ opacity: dive ? baseFade : 1 }} />

            {/* podstawa wyspy: skała, kable, pieczęć KG — przygasa przy hoverze i przy zgaszonych światłach */}
            <motion.div className="absolute inset-0" style={{ opacity: dive ? baseFade : 1 }}>
            <AnimatePresence initial={false}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                key={k}
                src={`/diorama/v2/base-${k}.webp`}
                srcSet={`/diorama/v2/base-${k}-sm.webp 1200w, /diorama/v2/base-${k}.webp 2400w`}
                sizes="(min-width: 1024px) 100vw, 165vw"
                alt={
                  theme === 'developer'
                    ? "Papercraft diorama of Casper's developer workspace: dev cave, infra room, web3 vault, AI lab and studio on a floating island with glowing green cables."
                    : "Papercraft diorama of Casper's founder world: CEO office, devs-mentoring classroom, coderiv app studio, devs-hunting scouting room and Efektywniejsi webinar stage on a floating island with glowing orange cables."
                }
                draggable={false}
                fetchPriority="high"
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  filter: `brightness(${!baseLit ? 0.55 : spot ? 0.55 : 1}) saturate(${spot || !baseLit ? 0.75 : 1})`,
                  transition: 'filter .45s ease',
                }}
              />
            </AnimatePresence>
            </motion.div>

            {/* pokoje — każdy osobną warstwą w dokładnym kształcie */}
            {boxes.map((b, i) => {
              const s = rooms[i]
              const isHover = spot && hover === i
              const bright = !s.lit ? OFF : spot ? (isHover ? 1.1 : 0.42) : 1
              const src = roomSrc(theme, i)
              const litClass = s.flicker && !reduce ? 'animate-lights-on' : ''
              const litStyle: React.CSSProperties | undefined =
                s.flicker && !reduce && !spot
                  ? undefined
                  : { filter: `brightness(${bright}) saturate(${bright < 0.5 ? 0.6 : 1})`, transition: 'filter .4s ease' }
              // maska = ten sam plik co pokój (już w cache, bez 5 dodatkowych pobrań)
              const maskStyle = {
                WebkitMaskImage: `url(${src})`,
                maskImage: `url(${src})`,
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
                    // przy wjeździe kamery zostaje tylko pokój nr 1
                    opacity: dive && i > 0 ? rest : 1,
                    x: dive ? outX[i] : 0,
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
                      style={{ ...maskStyle, background: `rgb(${accent})`, filter: 'blur(14px)', transform: 'scale(1.04)', opacity: isHover ? 0.7 : 0 }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 transition-opacity duration-300"
                      style={{ ...maskStyle, background: 'linear-gradient(180deg, #ffe2b8, #ffb56b)', filter: 'blur(1.5px)', transform: 'scale(1.014)', opacity: isHover ? 0.9 : 0 }}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      // zawsze pełna rozdzielczość (20–30 KB): przy wjeździe kamery pokój jest powiększony do 1.9×
                      src={src}
                      alt=""
                      draggable={false}
                      className={`absolute inset-0 w-full h-full ${litClass}`}
                      style={litStyle}
                      onAnimationEnd={() => setRooms((r) => r.map((x, j) => (j === i ? { ...x, flicker: false } : x)))}
                    />
                    {/* żywa miniatura: animacje wewnątrz warstwy pokoju (składają się z nim i jadą z kamerą) */}
                    {!reduce && (
                      <RoomAmbient
                        world={k}
                        room={i}
                        run={!paused && s.lit}
                        show={s.lit && !s.flicker && (!spot || isHover)}
                        lite={!finePointer}
                        artClass={litClass}
                        // ta sama jasność co obrazek pokoju (bez filtra, gdy nic nie przygasa)
                        artStyle={litStyle && bright === 1 ? { filter: 'none', transition: 'filter .4s ease' } : litStyle}
                      />
                    )}
                  </div>
                </motion.div>
              )
            })}

            {/* żywe światła (tylko przy zapalonych światłach i bez podświetlenia pokoju) */}
            {!reduce && (
              <motion.div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ zIndex: 12, opacity: dive ? rest : 1 }}>
              {GLOWS[k].map((g, i) => (
                // zewnętrzny span: włącz/wyłącz (przejście), wewnętrzny: oddech na samym opacity (kompozytor, bez repaintu)
                <span
                  key={`${k}-g${i}`}
                  aria-hidden="true"
                  className="absolute pointer-events-none mix-blend-screen"
                  style={{
                    left: `${g.x}%`,
                    top: `${g.y}%`,
                    width: `${g.r * 2}%`,
                    aspectRatio: '1',
                    transform: 'translate(-50%,-50%)',
                    opacity: baseLit && !spot ? 1 : 0,
                    transition: 'opacity .6s ease',
                    zIndex: 12,
                  }}
                >
                  <span
                    className="absolute inset-0 rounded-full animate-glow-breathe"
                    style={{ background: `radial-gradient(circle, rgba(${g.c},0.4), rgba(${g.c},0.09) 45%, transparent 70%)`, animationDuration: `${g.d + 2.5}s` }}
                  />
                </span>
              ))}
              </motion.div>
            )}

            {burst > 0 && <PaperBurst key={burst} accent={accent} />}
            {/* błysk światła, gdy nowe pokoje wyskakują */}
            {flash > 0 && (
              <motion.span
                key={`flash-${flash}`}
                aria-hidden="true"
                className="absolute inset-[-10%] pointer-events-none z-[25] mix-blend-screen"
                style={{ background: `radial-gradient(ellipse 60% 45% at 50% 42%, rgba(255,240,215,0.3), rgba(${accent},0.1) 45%, transparent 70%)` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.55, times: [0, 0.25, 1] }}
              />
            )}

            {/* figurka — własna warstwa i paralaksa */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
              <Figure ref={figRef} theme={theme} reduce={reduce} dim={spot && hover !== 0 && hover !== 1} />
            </div>

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
                  <div className="paper-tag">
                    <span className="block font-display text-lg leading-tight text-ink">{info[hover].label}</span>
                    <span className="block font-mono text-[11px] text-ink/60">
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
                  style={{ left: '26.8%', top: '6%', x: '-50%', y: '-100%' }}
                >
                  <div className="paper-tag whitespace-nowrap">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-ink/55">psst — click me</span>
                    <span className="block font-display text-base text-ink">
                      change into {theme === 'developer' ? 'the CEO suit' : 'dev clothes'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </div>
        </div>
      </motion.div>
      </div>
      </div>
      {!finePointer && (
        <div aria-hidden="true" className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-10 w-14 bg-gradient-to-l from-night/80 to-transparent flex items-center justify-end pr-2">
          <span className="grid place-items-center w-7 h-7 rounded-full bg-cream text-ink text-sm shadow-lg animate-nudge-3">→</span>
        </div>
      )}

      <motion.figcaption style={{ opacity: baseLit ? (dive ? capFade : 1) : 0 }} className="mt-0 mb-5 sm:mb-0 sm:mt-5 px-3 sm:px-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 eyebrow !text-[10px] sm:!text-[11px]">
        <AnimatePresence mode="wait">
          <motion.span key={theme} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            {theme === 'developer' ? 'My very normal workspace' : 'The companies I build'}
          </motion.span>
        </AnimatePresence>
        <span className="text-accent/80 text-right">{finePointer ? 'hover a room · click Casper to switch DEV ⇄ CEO' : 'swipe ↔ · tap a room'}</span>
      </motion.figcaption>
    </figure>
  )
}
