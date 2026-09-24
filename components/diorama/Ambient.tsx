'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { ARM, ARM2, CITY, DUCKS, FLOW, GLOW, LAMP, LEDS, OFFICE, PHONES, RADAR, REC, SCOPE, SCREENS, SLIDES, VAULT } from './ambientLayout'
import type { Pct } from './ambientLayout'
import { ROOM_BOX } from './layout'
import { clockNow, subscribe } from './ambientClock'
import { draw, getModel } from './codeScreen'
import type { ScreenCfg } from './codeScreen'

/**
 * Żywa miniatura: animacje ambient w pokojach dioramy — wersja "żwawa".
 * Zasady:
 *  - w każdym świecie naraz dzieje się kilka rzeczy (sejf, ramię, lampa, diody, ekrany, radar,
 *    slajdy…), każda w swoim rytmie — nic nie idzie w takt, więc całość żyje, ale nie miga,
 *  - bez błysków na dużych polach: mrugają tylko klosz i plama światła lampy, diody, lampka REC,
 *  - animujemy istniejącą grafikę: sprite'y i "czyste płyty" wycięte z tych samych renderów
 *    (casper-room/v2/ambient.py + ambient2.py), pozycje w % pokoju → skalują się razem z wyspą,
 *  - warstwa leży WEWNĄTRZ warstwy pokoju, więc składa się z nim przy DEV ⇄ CEO i jedzie z kamerą,
 *  - transform/opacity (kompozytor); jeden wspólny rAF tylko dla ekranów z kodem,
 *  - pauza poza kadrem ([data-paused] zatrzymuje pętle CSS, `run` odpina canvasy),
 *  - bez prefers-reduced-motion (rodzic w ogóle tego nie renderuje); na telefonie lżej (`lite`).
 */

type World = 'dev' | 'ceo'
type Props = {
  world: World
  room: number
  /** pętle JS mają chodzić (hero w kadrze, światło zapalone) */
  run: boolean
  /** poświaty widoczne (światło zapalone, pokój nieprzygaszony hoverem innego) */
  show: boolean
  /** kursor nad tym pokojem (sejf otwiera się i czeka) */
  hot?: boolean
  /** telefon / słaby sprzęt: bez najdroższych drobiazgów */
  lite?: boolean
  /** filtr jasności obrazka pokoju — te same wartości na warstwie podmieniającej grafikę */
  artClass?: string
  artStyle?: CSSProperties
}

const A = '/diorama/v2/amb/'
const box = (p: Pct): CSSProperties => ({ position: 'absolute', left: `${p.l}%`, top: `${p.t}%`, width: `${p.w}%`, height: `${p.h}%` })
// deterministyczny "los" dla rozrzutu czasów (bez Math.random → bez rozjazdu hydracji)
// (liczby całkowite, bez Math.sin — sinus potrafi się różnić w ostatnich bitach między serwerem a przeglądarką)
const hash = (i: number) => {
  let h = Math.imul((i + 1) ^ 0x9e3779b9, 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
const sec = (v: number) => `${v.toFixed(2)}s`
const pt = (p: readonly number[]) => `${p[0]}% ${p[1]}%`

// obrazek-sprite bez interakcji
function Img({ src, style, className }: { src: string; style?: CSSProperties; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`${A}${src}.webp`} alt="" draggable={false} className={className} style={style} />
}

// warstwa na cały pokój z punktem obrotu w % pokoju (sprite'y w środku leżą w swoich miejscach)
function Pivot({ o, className, children, style }: { o: readonly number[]; className?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={`absolute inset-0 ${className ?? ''}`} style={{ transformOrigin: pt(o), ...style }}>
      {children}
    </div>
  )
}

const CFG: Record<keyof typeof SCREENS, ScreenCfg> = {
  // Dev cave, lewy monitor: edytor, ktoś szybko pisze
  dev0L: {
    mode: 'code',
    rows: 13,
    cols: 40,
    left: 0.095,
    top: 0.06,
    gutter: 'line',
    palette: ['rgb(150,235,182)', 'rgb(200,255,220)', 'rgb(90,150,114)', 'rgb(170,245,200)'],
    glow: 'rgba(120,255,170,0.75)',
    hl: 'rgba(120,255,170,0.22)',
    flash: 'rgb(210,255,225)',
    seed: 7,
    bar: 0.5,
  },
  // Dev cave, prawy monitor: terminal z logami builda (serie wpisów, zielony "OK")
  dev0R: {
    mode: 'log',
    rows: 13,
    cols: 40,
    left: 0.075,
    top: 0.07,
    gutter: 'line',
    palette: ['rgb(140,225,168)', 'rgb(185,250,205)', 'rgb(84,140,106)', 'rgb(225,255,232)'],
    glow: 'rgba(120,255,170,0.7)',
    hl: 'rgba(120,255,170,0.22)',
    flash: 'rgb(210,255,225)',
    seed: 21,
    bar: 0.48,
  },
  // devs-mentoring: ekran z live codingiem (biało-pomarańczowy jak w grafice)
  ceo1: {
    mode: 'code',
    rows: 12,
    cols: 42,
    left: 0.125,
    top: 0.075,
    gutter: 'nums',
    palette: ['rgb(246,236,224)', 'rgb(255,150,70)', 'rgb(222,168,124)', 'rgb(255,186,106)'],
    num: 'rgb(170,98,62)',
    glow: 'rgba(255,170,100,0.55)',
    hl: 'rgba(255,160,80,0.22)',
    flash: 'rgb(255,176,96)',
    seed: 3,
    bar: 0.46,
  },
}

function CodeScreen({ id, run }: { id: keyof typeof SCREENS; run: boolean }) {
  const s = SCREENS[id]
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    // gęstość 3× piksela grafiki: ostro także w zbliżeniu kamery (pokój ×1.9)
    const k = 3
    const W = Math.round(s.px[0] * k)
    const H = Math.round(s.px[1] * k)
    if (cv.width !== W) cv.width = W
    if (cv.height !== H) cv.height = H
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const m = getModel(id, CFG[id])
    let drawn = -1
    const paint = (t: number) => {
      m.step(t)
      if (m.version === drawn) return
      drawn = m.version
      draw(ctx, m, W, H)
    }
    paint(clockNow())
    if (!run) return
    return subscribe(paint)
  }, [id, run, s])
  return (
    <>
      {/* czysta płyta: ekran z grafiki bez namalowanego tekstu (zachowana winieta i poświata) */}
      <Img src={`plate-${id}`} style={box(s.plate)} />
      <canvas
        ref={ref}
        style={{
          position: 'absolute',
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: `${s.w}%`,
          height: `${s.h}%`,
          transformOrigin: '0 0',
          // równoległobok ekranu: macierz bez skali (rozmiar w % pokoju), więc działa w każdej skali
          transform: `matrix(${s.m.join(',')},0,0)`,
        }}
      />
    </>
  )
}

/** para z kubka: kilka kłębków wznoszących się i rozwiewających (x, y = środek brzegu kubka, % pokoju) */
function Steam({ x, y, w = 7, h = 12, n = 4, speed = 1 }: { x: number; y: number; w?: number; h?: number; n?: number; speed?: number }) {
  return (
    <span className="absolute" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, transform: 'translate(-50%,-100%)' }}>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="amb-steam absolute bottom-0 rounded-full"
          style={{
            left: `${18 + ((i * 29) % 50)}%`,
            width: '40%',
            height: '48%',
            animationDelay: sec((-i * 2.8 * speed) / n),
            animationDuration: sec((2.6 + (i % 2) * 0.5) * speed),
          }}
        />
      ))}
    </span>
  )
}

/** ramię robota w AI lab: łokieć podnosi kubek, nadgarstek go przechyla ("łyk"), odstawia */
function Arm({ lite }: { lite?: boolean }) {
  return (
    <>
      <Img src="arm-plate" style={box(ARM.plate)} />
      <Pivot o={ARM2.elbow} className="amb-arm">
        <Img src="arm-fore" style={box(ARM2.fore)} />
        <Pivot o={ARM2.wrist} className="amb-wrist">
          <Img src="arm-hand" style={box(ARM2.hand)} />
          {!lite && <Steam x={ARM2.cup[0]} y={ARM2.cup[1]} w={6} h={11} />}
        </Pivot>
      </Pivot>
    </>
  )
}

function Glow({ p, name, lo, hi, dur, delay = 0 }: { p: Pct; name: string; lo: number; hi: number; dur: number; delay?: number }) {
  return (
    <Img
      src={name}
      className="amb-pulse mix-blend-screen"
      style={{ ...box(p), ['--lo' as string]: lo, ['--hi' as string]: hi, animationDuration: `${dur}s`, animationDelay: `${delay}s` } as CSSProperties}
    />
  )
}

/** ciepła plama światła wokół klosza (tryb screen) — gaśnie razem z lampą, bo "zgaszona" wersja leży nad nią */
function Halo({ c, r, color, dur = 4, lo = 0.65, hi = 1, delay = 0 }: { c: readonly number[]; r: number; color: string; dur?: number; lo?: number; hi?: number; delay?: number }) {
  return (
    <span
      className="amb-pulse absolute rounded-full mix-blend-screen"
      style={
        {
          left: `${c[0]}%`,
          top: `${c[1]}%`,
          width: `${r * 2}%`,
          aspectRatio: '1',
          transform: 'translate(-50%,-50%)',
          background: `radial-gradient(circle, rgba(${color},0.55) 0%, rgba(${color},0.22) 38%, transparent 70%)`,
          ['--lo' as string]: lo,
          ['--hi' as string]: hi,
          animationDuration: `${dur}s`,
          animationDelay: `${delay}s`,
        } as CSSProperties
      }
    />
  )
}

/** lampa: serie mrugnięć — "zgaszona" wersja klosza i plamy światła nakładana na chwilę */
function Lamp({ world }: { world: World }) {
  const L = LAMP[world]
  const room = `url(/diorama/v2/room-${world}-${L.room}.webp)`
  return (
    <>
      {/* poświata klosza gaśnie razem z lampą (odwrócone klatki) */}
      <div className={`amb-lamp-${world}-on absolute inset-0`}>
        <Halo c={L.shade} r={world === 'dev' ? 11 : 13} color="255,196,120" />
      </div>
      <Img src={`lamp-${world}`} className={`amb-lamp-${world}`} style={box(L.box)} />
      {/* gdy lampa gaśnie, cały pokój lekko ciemnieje (te same klatki co lampa, maska = kształt pokoju) */}
      <div
        className={`amb-lamp-${world} absolute inset-0`}
        style={{ background: 'rgba(20,10,6,0.22)', WebkitMaskImage: room, maskImage: room, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}
      />
    </>
  )
}

function Leds({ lite }: { lite?: boolean }) {
  // każda dioda w swoim wzorze i tempie (aktywność dysków), co piąta krótko rozbłyskuje
  const on = LEDS.filter((_, i) => !lite || i % 2 === 0)
  const flash = LEDS.filter((_, i) => i % (lite ? 8 : 4) === 2)
  // dwie kolumny szaf, w których aktywność "biegnie" z góry na dół
  const chase = LEDS.filter(([x]) => Math.abs(x - 83) < 1 || Math.abs(x - 90) < 1)
    .slice()
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
  return (
    <>
      {on.map(([x, y], i) => (
        <span
          key={`o${i}`}
          className={`${hash(i + 5) < 0.55 ? 'amb-led-a' : 'amb-led-b'} absolute rounded-full mix-blend-screen`}
          style={{
            left: `${x}%`,
            top: `${y}%`,
            // prawa szafa (niezasłonięta figurką) — większe, wyraźniejsze diody
            width: x > 60 ? '3.4%' : '2.2%',
            aspectRatio: '1',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, rgba(255,236,190,1) 18%, rgba(255,160,70,0.7) 40%, transparent 72%)',
            animationDuration: sec(0.7 + hash(i) * 2.2),
            animationDelay: sec(-hash(i + 40) * 3),
          }}
        />
      ))}
      {!lite &&
        chase.map(([x, y], i) => (
          <span
            key={`c${i}`}
            className="amb-led-chase absolute rounded-full mix-blend-screen"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: '3.4%',
              aspectRatio: '1',
              transform: 'translate(-50%,-50%)',
              background: 'radial-gradient(circle, rgba(255,250,220,1) 14%, rgba(255,190,90,0.6) 38%, transparent 70%)',
              animationDelay: sec(i * 0.11 + (x > 86 ? 1.1 : 0)),
            }}
          />
        ))}
      {/* jedna czerwona dioda alarmu */}
      <span
        className="amb-led-a absolute rounded-full mix-blend-screen"
        style={{
          left: `${LEDS[11][0]}%`,
          top: `${LEDS[11][1]}%`,
          width: '9%',
          aspectRatio: '1',
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(circle, rgba(255,150,140,1) 10%, rgba(255,40,30,0.8) 26%, rgba(255,30,20,0.25) 46%, transparent 70%)',
          animationName: 'amb-beacon',
          animationDuration: '1.4s',
        }}
      />
      {flash.map(([x, y], i) => (
        <span
          key={`f${i}`}
          className="amb-led-flash absolute rounded-full mix-blend-screen"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: '4%',
            aspectRatio: '1',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, rgba(255,226,170,0.95) 12%, rgba(255,150,60,0.4) 36%, transparent 70%)',
            animationDuration: sec(2.2 + hash(i + 90) * 3.4),
            animationDelay: sec(-hash(i + 120) * 5),
          }}
        />
      ))}
    </>
  )
}

function Sparkles({ lite }: { lite?: boolean }) {
  // drobinki unoszące się nad kryształem web3
  const pts = [
    [12.3, 69.5, 3.1, 0],
    [14.2, 67.5, 3.6, -1.1],
    [15.6, 70.5, 3.9, -2.3],
    [11.2, 68.5, 3.4, -0.6],
    [13.4, 70.2, 3.2, -1.8],
    [16.6, 68.8, 3.7, -2.9],
  ].slice(0, lite ? 3 : 6)
  return (
    <>
      {pts.map(([x, y, d, dl], i) => (
        <span
          key={i}
          className="amb-rise absolute rounded-full mix-blend-screen"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: '3.2%',
            aspectRatio: '1',
            background: 'radial-gradient(circle, rgba(240,255,245,1) 18%, rgba(130,255,200,0.7) 42%, transparent 70%)',
            animationDuration: `${d}s`,
            animationDelay: `${dl}s`,
          }}
        />
      ))}
    </>
  )
}

/**
 * Sejf: jeden stan "otwarcia" p ∈ [0,1] (0 = drzwi uchylone jak w grafice, 1 = otwarte na oścież),
 * który zawsze płynnie dąży do celu: cel = otwarty w oknie cyklu (co 19 s) albo gdy kursor jest nad
 * pokojem. Dzięki temu hover i zegar nigdy się nie gryzą, a zamykanie po zjechaniu kursorem
 * zaczyna się z bieżącej fazy (bez przeskoku). Faza 0–0.35: koło robi pełny obrót, od 0.12: drzwi
 * (nakładają się, więc drzwi ruszają szybko). Sam otwiera się co 13 s na ~4.4 s; po interakcji kursorem
 * własny cykl odczekuje 9 s (drzwi nie odbijają z powrotem zaraz po zamknięciu).
 */
const VAULT_EVERY = 13000 // co ile sam się otwiera (ms)
const VAULT_HOLD = 4400 // ile stoi otwarty
const VAULT_QUIET = 9000 // po interakcji kursorem: tyle spokoju, zanim otworzy się sam
const VAULT_SPEED = 1 / 2300 // pełne otwarcie ≈ 2.3 s (cykl)
const VAULT_SPEED_HOT = 1 / 1500 // przy kursorze trochę szybciej (w obie strony), ale z widocznym ruchem drzwi
const vault = { p: 0, t: -1, tw: 0, nextOpen: 6200, openUntil: 0, lastHot: -1e9, subs: new Set<(p: number) => void>() }
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const easeIO = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2)
const vaultDoor = (p: number) => easeIO(clamp01((p - 0.12) / 0.88))
function stepVault(t: number, hot: boolean) {
  const dt = vault.t < 0 ? 0 : Math.min(100, t - vault.t)
  vault.t = t
  if (hot) {
    // kursor przejmuje sejf: własny cykl czeka, aż minie chwila po odjechaniu
    vault.lastHot = t
    vault.openUntil = 0
    vault.nextOpen = Math.max(vault.nextOpen, t + VAULT_QUIET)
  } else if (t >= vault.nextOpen) {
    vault.openUntil = t + VAULT_HOLD
    vault.nextOpen = t + VAULT_EVERY
  }
  const target = hot || t < vault.openUntil ? 1 : 0
  const sp = t - vault.lastHot < 2500 ? VAULT_SPEED_HOT : VAULT_SPEED
  const np = target > vault.p ? Math.min(1, vault.p + dt * sp) : Math.max(0, vault.p - dt * sp)
  // między otwarciami koło co ~3 s "próbuje" się obrócić (krótkie drgnięcie tam i z powrotem)
  const tw = (t % 3250) / 3250
  const twitch = vault.p === 0 && np === 0 && tw < 0.16 ? Math.sin((tw / 0.16) * Math.PI) * 26 : 0
  if (np === vault.p && twitch === vault.tw) return
  vault.p = np
  vault.tw = twitch
  vault.subs.forEach((fn) => fn(np))
}

function VaultArt({ run, hot }: { run: boolean; hot?: boolean }) {
  const v = VAULT
  const doorMask = `url(${A}vault-door.webp)`
  const door = useRef<HTMLDivElement>(null)
  const wheel = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLDivElement>(null)
  const hotRef = useRef(!!hot)
  hotRef.current = !!hot
  useEffect(() => {
    const apply = (p: number) => {
      const d = vaultDoor(p)
      if (door.current) door.current.style.transform = `perspective(320cqw) rotateY(${(-78 * d).toFixed(2)}deg)`
      if (wheel.current) wheel.current.style.transform = `rotate(${(-360 * easeIO(clamp01(p / 0.35)) - vault.tw).toFixed(1)}deg)`
      if (shade.current) shade.current.style.opacity = (0.55 * d).toFixed(3)
    }
    apply(vault.p)
    vault.subs.add(apply)
    const off = run ? subscribe((t) => stepVault(t, hotRef.current)) : undefined
    return () => {
      vault.subs.delete(apply)
      off?.()
      vault.t = -1
    }
  }, [run])
  return (
    <>
      {/* wnętrze sejfu + rama i ściana pod drzwiami */}
      <Img src="vault-plate" style={box(v.plate)} />
      <div ref={door} className="absolute inset-0" style={{ transformOrigin: pt(v.hinge), transform: 'perspective(320cqw) rotateY(0deg)', willChange: 'transform' }}>
        <Img src="vault-door" style={box(v.door)} />
        {/* koło z ramionami kręci się tylko w obrysie drzwi (maska = drzwi) */}
        <div className="absolute inset-0" style={{ WebkitMaskImage: doorMask, maskImage: doorMask, WebkitMaskSize: `${v.door.w}% ${v.door.h}%`, maskSize: `${v.door.w}% ${v.door.h}%`, WebkitMaskPosition: `${(v.door.l / (100 - v.door.w)) * 100}% ${(v.door.t / (100 - v.door.h)) * 100}%`, maskPosition: `${(v.door.l / (100 - v.door.w)) * 100}% ${(v.door.t / (100 - v.door.h)) * 100}%`, WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' }}>
          <div ref={wheel} className="absolute inset-0" style={{ transformOrigin: pt(v.hub) }}>
            <Img src="vault-wheel" style={box(v.wheel)} />
          </div>
        </div>
        {/* drzwi odwracają się od światła: cień w kształcie drzwi */}
        <div
          ref={shade}
          style={{ ...box(v.door), opacity: 0, background: '#1a0d08', WebkitMaskImage: doorMask, maskImage: doorMask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}
        />
      </div>
      {/* postument z kryształem stoi przed drzwiami */}
      <Img src="vault-pedestal" style={box(v.pedestal)} />
    </>
  )
}

function VaultFx() {
  const v = VAULT
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const apply = (p: number) => {
      if (ref.current) ref.current.style.opacity = vaultDoor(p).toFixed(3)
    }
    apply(vault.p)
    vault.subs.add(apply)
    return () => {
      vault.subs.delete(apply)
    }
  }, [])
  return (
    // zielone światło wylewa się z otwartego sejfu na ścianę i podłogę (jasność = stopień otwarcia)
    <div ref={ref} className="absolute inset-0" style={{ opacity: 0 }}>
      <span
        className="absolute rounded-full mix-blend-screen"
        style={{
          left: `${v.c[0]}%`,
          top: `${v.c[1]}%`,
          width: `${v.r[0] * 3.4}%`,
          height: `${v.r[1] * 3.4}%`,
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(ellipse, rgba(120,240,180,0.28) 0%, rgba(90,230,160,0.12) 38%, transparent 64%)',
        }}
      />
      <span
        className="absolute rounded-full mix-blend-screen"
        style={{
          left: `${v.c[0] + 4}%`,
          top: `${v.c[1] + v.r[1] * 1.55}%`,
          width: `${v.r[0] * 3}%`,
          height: `${v.r[1] * 0.9}%`,
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(ellipse, rgba(120,255,180,0.6) 0%, rgba(90,240,160,0.2) 45%, transparent 70%)',
        }}
      />
    </div>
  )
}

function Radar() {
  const r = RADAR
  // echa: kąt od godz. 12 (zgodnie z ruchem wskazówek) i odległość od środka (ułamek promienia)
  // (pozycje policzone z góry — bez Math.sin w renderze, żeby serwer i przeglądarka dały to samo)
  const blips: [number, number, number][] = [
    [128, 61.82, 59.23],
    [215, 32.22, 75.39],
    [310, 31.61, 34.57],
    [52, 77.58, 28.45],
  ]
  return (
    <span
      className="absolute overflow-hidden rounded-full mix-blend-screen"
      style={{ left: `${r.cx - r.rw}%`, top: `${r.cy - r.rh}%`, width: `${r.rw * 2}%`, height: `${r.rh * 2}%` }}
    >
      {/* wiązka: jasna krawędź prowadzi, za nią długi, wyraźny ogon */}
      <span
        className="amb-spin absolute inset-0"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(150,255,120,0) 0deg, rgba(150,255,120,0) 200deg, rgba(160,255,120,0.12) 290deg, rgba(190,255,150,0.38) 345deg, rgba(235,255,210,0.85) 359deg, rgba(150,255,120,0) 360deg)',
        }}
      />
      {blips.map(([a, x, y], i) => (
        <span
          key={i}
          className="amb-blip absolute rounded-full"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: '11%',
            aspectRatio: '1',
            background: 'radial-gradient(circle, rgba(240,255,210,1) 25%, rgba(160,255,120,0.7) 50%, transparent 72%)',
            // echo zapala się dokładnie wtedy, gdy przechodzi przez nie wiązka
            animationDelay: sec((a / 360) * 4),
          }}
        />
      ))}
    </span>
  )
}

/** lewy telefon (coderiv): co 8 s zsuwa się powiadomienie */
function Toast() {
  return (
    <div className="absolute overflow-hidden" style={{ left: '20.6%', top: '54.4%', width: '16%', height: '20%', transform: 'rotate(-4deg)', borderRadius: '8%' }}>
      <div
        className="amb-toast absolute rounded-[18%] flex items-center"
        style={{ left: '6%', top: '4%', width: '88%', height: '22%', background: 'rgba(255,252,246,0.97)', boxShadow: '0 0.3cqw 0.8cqw rgba(0,0,0,0.35)' }}
      >
        <span className="rounded-full" style={{ marginLeft: '7%', width: '16%', aspectRatio: '1', background: 'rgb(242,128,56)' }} />
        <span className="flex flex-col" style={{ marginLeft: '8%', gap: '0.5cqw', width: '58%' }}>
          <span style={{ height: '0.7cqw', width: '85%', background: 'rgb(70,50,50)', borderRadius: 9 }} />
          <span style={{ height: '0.6cqw', width: '60%', background: 'rgb(160,140,140)', borderRadius: 9 }} />
        </span>
      </div>
    </div>
  )
}

/** kursanci: ekrany laptopów po kolei "kompilują" (pomarańczowy błysk ekranu) */
const LAPTOPS: [number, number, number, number][] = [
  [26.3, 68.5, 10.3, 6],
  [52.5, 68.5, 10.3, 5],
  [78.8, 68.2, 9.7, 5.7],
  [20.6, 75, 9.9, 5.2],
  [48.1, 74.7, 11.5, 5.5],
  [75.5, 74.5, 10.9, 5.7],
]
function Laptops() {
  return (
    <>
      {LAPTOPS.map(([x, y, w, h], i) => (
        <span
          key={i}
          className="amb-laptop absolute mix-blend-overlay"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${w}%`,
            height: `${h}%`,
            borderRadius: '6%',
            background: i % 2 ? 'rgba(255,140,50,0.55)' : 'rgba(255,165,70,0.55)',
            boxShadow: '0 0 2cqw 0.6cqw rgba(255,170,90,0.75)',
            animationDelay: sec([0, 3.2, 1.6, 0.05, 3.25, 1.65][i]),
          }}
        />
      ))}
    </>
  )
}

function Phone() {
  const ph = PHONES[0]
  const mask = `url(${A}phone-R-mask.webp)`
  return (
    <div
      style={{
        ...box(ph.mask),
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
      }}
    >
      <div
        className="absolute overflow-hidden"
        // górny pasek z notchem zostaje z grafiki (przewijana treść nie wchodzi pod wycięcie)
        style={{ left: `${ph.cx}%`, top: `${ph.cy}%`, width: `${ph.w}%`, height: `${ph.h}%`, transform: `translate(-50%,-50%) rotate(${ph.rot}deg)`, clipPath: 'inset(10% 0 0 0 round 6%)' }}
      >
        <Img src="phone-strip" className="amb-phone absolute left-0 w-full" style={{ top: `${ph.stripTop}%`, height: `${ph.stripH}%`, maxWidth: 'none' }} />
        <span
          className="amb-tap absolute rounded-full"
          style={{ left: '52%', top: '68%', width: '105%', aspectRatio: '1', border: '0.9cqw solid rgba(255,120,40,1)', boxShadow: '0 0 1cqw rgba(255,140,60,0.9)' }}
        />
        <span
          className="amb-tap absolute rounded-full"
          style={{ left: '52%', top: '68%', width: '60%', aspectRatio: '1', border: '0.7cqw solid rgba(255,150,70,0.9)', animationDelay: '0.12s' }}
        />
        <span
          className="amb-tap absolute rounded-full"
          style={{ left: '52%', top: '68%', width: '24%', aspectRatio: '1', background: 'rgba(255,245,235,0.95)', animationDelay: '-0.05s' }}
        />
      </div>
    </div>
  )
}

/** okna w wieżowcach gasną i zapalają się — sporo z nich, każde w swoim rytmie */
// grupa = piętro budynku (pas ~2 % szerokości × ~1.5 % wysokości) — gaśnie i zapala się razem
// grupa = połowa budynku (górne / dolne piętra) — gaśnie i zapala się razem, więc zmiana jest widoczna z daleka
const BUILDINGS = [45, 51, 59, 72]
const winGroup = (x: number, y: number) => BUILDINGS.filter((b) => x > b).length * 10 + (y < 50 ? 0 : 1)
function Windows({ lite }: { lite?: boolean }) {
  const list = CITY.windows.filter((_, i) => i % (lite ? 4 : 1) === 0)
  return (
    <>
      {list.map(([x, y, w, h, c], i) => {
        const g = winGroup(x, y)
        return (
          <span
            key={i}
            className="amb-win absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${w}%`,
              height: `${h}%`,
              background: `rgb(${c.join(',')})`,
              animationDuration: sec(4 + hash(g + 7) * 4),
              animationDelay: sec(-hash(g + 70) * 8 - (i % 4) * 0.06),
            }}
          />
        )
      })}
    </>
  )
}

/** jaśniejsze "zapalone" okna: ciepła albo chłodna poświata na części okien, grupami */
function WindowGlow({ lite }: { lite?: boolean }) {
  const list = CITY.windows.filter((_, i) => !lite || i % 2 === 1)
  return (
    <>
      {list.map(([x, y, w, h], i) => {
        const g = winGroup(x, y)
        const warm = hash(g + 3) < 0.6
        return (
          <span
            key={i}
            className="amb-winglow absolute mix-blend-screen"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${w}%`,
              height: `${h}%`,
              background: warm ? 'rgb(255,214,140)' : 'rgb(160,200,255)',
              boxShadow: `0 0 0.6cqw 0.15cqw ${warm ? 'rgba(255,200,120,0.6)' : 'rgba(150,190,255,0.55)'}`,
              animationDuration: sec(5 + hash(g + 17) * 5),
              animationDelay: sec(-hash(g + 71) * 10 - 1.7),
            }}
          />
        )
      })}
    </>
  )
}

/** biuro CEO: światło ostrzegawcze na wieżowcu i spadająca gwiazda (tylko w szybach nieba) */
function OfficeSky() {
  const o = OFFICE
  const m = `url(${A}sky-mask.webp)`
  return (
    <>
      <span
        className="amb-beacon absolute rounded-full mix-blend-screen"
        style={{
          left: `${o.beacon[0]}%`,
          top: `${o.beacon[1]}%`,
          width: '11%',
          aspectRatio: '1',
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(circle, rgb(255,160,140) 6%, rgba(255,40,30,0.9) 14%, rgba(255,30,20,0.3) 30%, transparent 64%)',
        }}
      />
      <div className="absolute overflow-hidden" style={{ ...box(o.sky), WebkitMaskImage: m, maskImage: m, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}>
        {/* dwa reflektory z miasta omiatają niebo (wolno, w przeciwnych kierunkach) */}
        {[0, 1].map((k) => (
          <span
            key={k}
            className="amb-searchlight absolute mix-blend-screen"
            style={{
              left: k ? '72%' : '30%',
              top: '96%',
              width: '34%',
              height: '130%',
              transformOrigin: '50% 100%',
              translate: '-50% -100%',
              animationDuration: k ? '9s' : '11s',
              animationDelay: k ? '-4s' : '0s',
              animationDirection: k ? 'alternate-reverse' : 'alternate',
              // miękki stożek światła: jasny u podstawy (między wieżowcami), gaśnie ku górze
              background: 'linear-gradient(0deg, rgba(225,238,255,0.55), rgba(210,226,255,0.3) 50%, rgba(200,220,255,0.08) 90%, transparent)',
              clipPath: 'polygon(46% 100%, 54% 100%, 100% 0, 0 0)',
              filter: 'blur(0.6cqw)',
            }}
          />
        ))}
        <span
          className="amb-meteor absolute mix-blend-screen"
          style={{ left: '70%', top: '6%', width: '55%', height: '10%', background: 'linear-gradient(90deg, rgba(255,255,255,1), rgba(220,235,255,0.7) 20%, rgba(200,220,255,0.25) 55%, transparent)', borderRadius: 9, boxShadow: '0 0 1cqw rgba(220,235,255,0.6)' }}
        />
      </div>
      <Halo c={o.lamp} r={11} color="255,190,110" dur={3.6} lo={0.15} />
    </>
  )
}

/** gwiazdy nad miastem mrugają (tryb screen → warstwa światła) */
function Stars() {
  return (
    <>
      {CITY.stars.map(([x, y], i) => (
        <span
          key={i}
          className="amb-twinkle absolute rounded-full mix-blend-screen"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: '2.2%',
            aspectRatio: '1',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, rgba(255,255,240,1) 12%, rgba(200,220,255,0.45) 36%, transparent 70%)',
            animationDuration: sec(1.8 + hash(i + 3) * 2.2),
            animationDelay: sec(-hash(i + 30) * 4),
          }}
        />
      ))}
    </>
  )
}

/** kropka "danych" płynąca po krawędziach schematu (gdy na ekranie jest schemat), z ogonkiem */
function Flow({ lite }: { lite?: boolean }) {
  const b = ROOM_BOX.ceo[4]
  const aspect = (b.h * 12.24) / (b.w * 24) // wysokość/szerokość pokoju
  const size = 3.6 // % szerokości pokoju
  const tr = ([x, y]: readonly number[] | number[]) => `translate(${(x / size) * 100 - 50}%, ${((y * aspect) / size) * 100 - 50}%)`
  const seg = (path: readonly (readonly number[])[], a: number, z: number) => {
    // czas proporcjonalny do długości odcinków
    const len = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], (p[1] - path[i][1]) * aspect))
    const tot = len.reduce((s, v) => s + v, 0)
    const f = (v: number) => `${v.toFixed(3)}%`
    let acc = 0
    const out = [`${f(a)}{transform:${tr(path[0])};opacity:0}`, `${f(a + 0.4)}{transform:${tr(path[0])};opacity:1}`]
    path.slice(1).forEach((p, i) => {
      acc += len[i]
      out.push(`${f(a + 0.4 + (z - a - 0.8) * (acc / tot))}{transform:${tr(p)};opacity:1}`)
    })
    out.push(`${f(z)}{transform:${tr(path[path.length - 1])};opacity:0}`)
    return out
  }
  const P = FLOW.paths
  // cykl 20 s wspólny ze slajdami: schemat jest na ekranie w 0–25 %
  const css = `@keyframes amb-flow{0%{transform:${tr(P[0][0])};opacity:0}${seg(P[0], 1, 10).join('')}${seg(P[1], 11, 16).join('')}${seg(P[2], 17, 23.5).join('')}100%{transform:${tr(P[2][1])};opacity:0}}`
  const trail = lite ? [0] : [0, 1, 2, 3]
  return (
    <>
      <style>{css}</style>
      {trail.map((k) => (
        // ogonek: te same klatki z lekkim opóźnieniem, coraz mniejszy i bledszy
        <span key={k} className="absolute inset-0 mix-blend-screen" style={{ opacity: 1 - k * 0.22 }}>
          <span
            className="amb-flow absolute left-0 top-0 rounded-full"
            style={{
              width: `${size}%`,
              aspectRatio: '1',
              scale: `${1 - k * 0.16}`,
              animationDelay: `${-k * 0.07}s`,
              background: 'radial-gradient(circle, rgb(255,236,190) 12%, rgba(255,150,60,0.95) 30%, rgba(255,120,40,0.35) 52%, transparent 72%)',
            }}
          />
        </span>
      ))}
    </>
  )
}

/** webinar: slajdy zmieniają się co 5 s (schemat z grafiki → wykres → lista → donut) */
function Slides() {
  const b = SLIDES.box
  return (
    <div style={box(b)}>
      <Img src="slide-bg" className="amb-sbg absolute inset-0 w-full h-full" />
      <Img src="slide-2" className="amb-s2 absolute inset-0 w-full h-full" />
      <Img src="slide-2b" className="amb-s2b absolute inset-0 w-full h-full" style={{ transformOrigin: `50% ${SLIDES.base[0]}%` }} />
      <Img src="slide-3" className="amb-s3 absolute inset-0 w-full h-full" />
      <Img src="slide-3b" className="amb-s3b absolute inset-0 w-full h-full" />
      <Img src="slide-4" className="amb-s4 absolute inset-0 w-full h-full" />
      {/* czerwona kropka wskaźnika laserowego prowadzącego — wędruje po treści slajdu */}
      {[0.12, 0.06].map((d, k) => (
        <span
          key={k}
          className="amb-laser absolute rounded-full mix-blend-screen"
          style={{ left: 0, top: 0, width: '12%', aspectRatio: '1', animationDelay: `${-d}s`, scale: `${0.55 + k * 0.2}`, filter: `opacity(${0.35 + k * 0.25})`, background: 'radial-gradient(circle, rgba(255,60,60,1) 14%, rgba(255,20,20,0.4) 36%, transparent 64%)' }}
        />
      ))}
      <span
        className="amb-laser absolute rounded-full mix-blend-screen"
        style={{ left: 0, top: 0, width: '12%', aspectRatio: '1', background: 'radial-gradient(circle, rgb(255,255,255) 9%, rgb(255,20,20) 20%, rgba(255,20,20,0.55) 34%, rgba(255,20,20,0.18) 52%, transparent 70%)' }}
      />
    </div>
  )
}

/** lampka nagrywania na kamerze */
function Rec({ p }: { p: readonly number[] }) {
  return (
    <span
      className="amb-rec absolute rounded-full mix-blend-screen"
      style={{
        left: `${p[0]}%`,
        top: `${p[1]}%`,
        width: '11%',
        aspectRatio: '1',
        transform: 'translate(-50%,-50%)',
        background: 'radial-gradient(circle, rgb(255,170,150) 5%, rgba(255,60,40,1) 12%, rgba(255,40,20,0.4) 26%, rgba(255,40,20,0.12) 44%, transparent 68%)',
      }}
    />
  )
}

function Duck({ id }: { id: keyof typeof DUCKS }) {
  const d = DUCKS[id]
  return (
    <>
      <Img src={`${id}-plate`} style={box(d.plate)} />
      <div className="amb-duck" style={{ ...box(d.sprite), transformOrigin: pt(d.pivot) }}>
        <Img src={id} className="absolute inset-0 w-full h-full" />
      </div>
    </>
  )
}

export default function RoomAmbient({ world, room, run, show, hot, lite, artClass, artStyle }: Props) {
  const key = `${world}${room}`
  // warstwa "grafiki": płyty, sprite'y, ekrany — dostaje ten sam filtr co obrazek pokoju
  let art: ReactNode = null
  // warstwa "światła": poświaty i migotania (znika przy zgaszonym / przygaszonym pokoju)
  let fx: ReactNode = null
  switch (key) {
    case 'dev0':
      art = (
        <>
          <CodeScreen id="dev0L" run={run} />
          <CodeScreen id="dev0R" run={run} />
        </>
      )
      fx = (
        <>
          {/* monitory rzucają drgające światło na biurko */}
          <span
            className="amb-screenglow absolute rounded-full mix-blend-screen"
            style={{
              left: '60.5%',
              top: '67%',
              width: '44%',
              height: '6%',
              transform: 'translate(-50%,-50%)',
              background: 'radial-gradient(ellipse, rgba(120,255,170,0.6) 0%, rgba(120,255,170,0.2) 45%, transparent 70%)',
            }}
          />
          {!lite && <Steam x={82.6} y={67.9} w={5} h={9} />}
        </>
      )
      break
    case 'dev1':
      art = <Duck id="duck-dev" />
      fx = (
        <>
          <Leds lite={lite} />
          <Lamp world="dev" />
        </>
      )
      break
    case 'dev2':
      art = <VaultArt run={run} hot={hot} />
      fx = (
        <>
          <Glow p={GLOW.crystal} name="glow-crystal" lo={0.25} hi={1} dur={2.6} />
          <Glow p={GLOW.vault} name="glow-vault" lo={0.05} hi={0.75} dur={2.2} delay={-1.1} />
          <VaultFx />
          <Sparkles lite={lite} />
        </>
      )
      break
    case 'dev3':
      art = <Arm lite={lite} />
      if (!lite) fx = <Steam x={76.7} y={72.2} w={5} h={9} speed={1.15} />
      break
    case 'dev4':
      fx = (
        <>
          <Glow p={GLOW.ringDev} name="glow-ring-dev" lo={0.3} hi={1} dur={2.4} delay={-1.2} />
          <Halo c={[GLOW.ringDev.l + GLOW.ringDev.w / 2, GLOW.ringDev.t + GLOW.ringDev.h / 2]} r={14} color="255,236,210" dur={2.4} lo={0.1} hi={1} delay={-1.2} />
          <Halo c={[62.6, 58]} r={12} color="255,190,110" dur={4.3} lo={0.3} />
          <Rec p={REC.dev} />
          {/* tabliczka ON AIR: ciemna płytka na ścianie, co sekundę zapala się na czerwono */}
          <span
            className="absolute"
            style={{ left: '24%', top: '33%', width: '18%', height: '6%', borderRadius: '0.8cqw', background: 'rgb(58,30,26)', boxShadow: '0 0.4cqw 0.6cqw rgba(0,0,0,0.45), inset 0 0 0 0.3cqw rgb(88,52,44)' }}
          />
          <span
            className="amb-rec absolute flex items-center justify-center font-mono font-bold"
            style={{
              left: '24%',
              top: '33%',
              width: '18%',
              height: '6%',
              fontSize: '3.2cqw',
              letterSpacing: '0.1em',
              color: 'rgb(255,240,232)',
              textShadow: '0 0 0.8cqw rgba(255,210,190,0.9)',
              filter: 'blur(0.06cqw)',
              background: 'radial-gradient(ellipse at 50% 40%, rgb(236,64,44), rgb(190,34,24))',
              borderRadius: '0.8cqw',
              boxShadow: '0 0 2.4cqw 0.8cqw rgba(255,60,40,0.6), inset 0 0 0 0.3cqw rgb(255,120,100)',
            }}
          >
            ON AIR
          </span>
        </>
      )
      break
    case 'ceo0':
      art = <Windows lite={lite} />
      fx = (
        <>
          <WindowGlow lite={lite} />
          <Stars />
          <OfficeSky />
        </>
      )
      break
    case 'ceo1':
      art = (
        <>
          <CodeScreen id="ceo1" run={run} />
          <Duck id="duck-ceo" />
        </>
      )
      fx = <Laptops />
      break
    case 'ceo2':
      art = (
        <>
          <Phone />
          <Toast />
        </>
      )
      break
    case 'ceo3':
      art = (
        <>
          <Img src="radar-plate" style={box(RADAR.plate)} />
          <Img src="scope-plate" style={box(SCOPE.plate)} />
          <div className="amb-scope" style={{ ...box(SCOPE.sprite), transformOrigin: pt(SCOPE.pivot) }}>
            <Img src="scope" className="absolute inset-0 w-full h-full" />
          </div>
        </>
      )
      fx = (
        <>
          <Radar />
          <Lamp world="ceo" />
          {!lite && <Steam x={80.4} y={71.3} w={5} h={9} speed={1.1} />}
        </>
      )
      break
    case 'ceo4':
      art = <Slides />
      fx = (
        <>
          <Glow p={GLOW.ringCeo} name="glow-ring-ceo" lo={0.3} hi={1} dur={2.7} delay={-2.3} />
          <Halo c={[GLOW.ringCeo.l + GLOW.ringCeo.w / 2, GLOW.ringCeo.t + GLOW.ringCeo.h / 2]} r={13} color="255,236,210" dur={2.7} lo={0.1} hi={1} delay={-2.3} />
          <Halo c={[65.6, 54.6]} r={11} color="255,190,110" dur={4.7} lo={0.3} />
          <Flow lite={lite} />
          <Rec p={REC.ceo} />
        </>
      )
      break
  }
  if (!art && !fx) return null
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ containerType: 'inline-size' }}>
      {art && (
        <div data-amb-art className={`absolute inset-0 ${artClass ?? ''}`} style={artStyle}>
          {art}
        </div>
      )}
      {fx && (
        <div className="absolute inset-0" style={{ opacity: show ? 1 : 0, transition: 'opacity .45s ease' }}>
          {fx}
        </div>
      )}
    </div>
  )
}
