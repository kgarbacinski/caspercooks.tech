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
    flash: 'rgb(255,232,205)',
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
      <Halo c={L.shade} r={world === 'dev' ? 11 : 13} color="255,196,120" />
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
  const chase = LEDS.filter(([x]) => Math.abs(x - 39) < 1 || Math.abs(x - 83) < 1)
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
            width: '2.2%',
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
              animationDelay: sec(i * 0.11 + (x > 60 ? 1.1 : 0)),
            }}
          />
        ))}
      {/* jedna czerwona dioda alarmu */}
      <span
        className="amb-led-a absolute rounded-full mix-blend-screen"
        style={{
          left: `${LEDS[27][0]}%`,
          top: `${LEDS[27][1]}%`,
          width: '6%',
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
            width: '2%',
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

/** sejf: koło się kręci, drzwi wychylają się na zawiasie, wnętrze świeci; zamyka się (19 s) */
function VaultArt() {
  const v = VAULT
  const doorMask = `url(${A}vault-door.webp)`
  return (
    <>
      {/* wnętrze sejfu + rama i ściana pod drzwiami */}
      <Img src="vault-plate" style={box(v.plate)} />
      <Pivot o={v.hinge} className="amb-vault-door">
        <Img src="vault-door" style={box(v.door)} />
        {/* koło z ramionami kręci się tylko w obrysie drzwi (maska = drzwi) */}
        <div className="absolute inset-0" style={{ WebkitMaskImage: doorMask, maskImage: doorMask, WebkitMaskSize: `${v.door.w}% ${v.door.h}%`, maskSize: `${v.door.w}% ${v.door.h}%`, WebkitMaskPosition: `${(v.door.l / (100 - v.door.w)) * 100}% ${(v.door.t / (100 - v.door.h)) * 100}%`, maskPosition: `${(v.door.l / (100 - v.door.w)) * 100}% ${(v.door.t / (100 - v.door.h)) * 100}%`, WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' }}>
          <Pivot o={v.hub} className="amb-vault-wheel">
            <Img src="vault-wheel" style={box(v.wheel)} />
          </Pivot>
        </div>
        {/* drzwi odwracają się od światła: cień w kształcie drzwi */}
        <div
          className="amb-vault-shade"
          style={{ ...box(v.door), background: '#1a0d08', WebkitMaskImage: doorMask, maskImage: doorMask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}
        />
      </Pivot>
      {/* postument z kryształem stoi przed drzwiami */}
      <Img src="vault-pedestal" style={box(v.pedestal)} />
    </>
  )
}

function VaultFx() {
  const v = VAULT
  return (
    <>
      {/* zielone światło wylewa się z otwartego sejfu na ścianę i podłogę */}
      <span
        className="amb-vault-spill absolute rounded-full mix-blend-screen"
        style={{
          left: `${v.c[0]}%`,
          top: `${v.c[1]}%`,
          width: `${v.r[0] * 3.4}%`,
          height: `${v.r[1] * 3.4}%`,
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(ellipse, rgba(150,255,200,0.4) 0%, rgba(90,240,160,0.16) 38%, transparent 64%)',
        }}
      />
      <span
        className="amb-vault-spill absolute rounded-full mix-blend-screen"
        style={{
          left: `${v.c[0] + 4}%`,
          top: `${v.c[1] + v.r[1] * 1.55}%`,
          width: `${v.r[0] * 3}%`,
          height: `${v.r[1] * 0.9}%`,
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(ellipse, rgba(120,255,180,0.6) 0%, rgba(90,240,160,0.2) 45%, transparent 70%)',
        }}
      />
    </>
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
          className="amb-laptop absolute mix-blend-screen"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${w}%`,
            height: `${h}%`,
            borderRadius: '6%',
            background: i % 2 ? 'rgba(255,150,70,0.8)' : 'rgba(200,225,255,0.7)',
            animationDelay: sec([0, 3.1, 1.4, 4.6, 2.2, 5.3][i]),
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
        style={{ left: `${ph.cx}%`, top: `${ph.cy}%`, width: `${ph.w}%`, height: `${ph.h}%`, transform: `translate(-50%,-50%) rotate(${ph.rot}deg)` }}
      >
        <Img src="phone-strip" className="amb-phone absolute left-0 w-full" style={{ top: `${ph.stripTop}%`, height: `${ph.stripH}%`, maxWidth: 'none' }} />
        <span
          className="amb-tap absolute rounded-full"
          style={{ left: '52%', top: '68%', width: '58%', aspectRatio: '1', border: '0.35cqw solid rgba(255,150,70,0.95)', background: 'rgba(255,200,150,0.45)' }}
        />
      </div>
    </div>
  )
}

/** okna w wieżowcach gasną i zapalają się — sporo z nich, każde w swoim rytmie */
// grupa = piętro budynku (pas ~2 % szerokości × ~1.5 % wysokości) — gaśnie i zapala się razem
const winGroup = (x: number, y: number) => Math.floor(x / 2.2) * 100 + Math.floor(y / 1.6)
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
              animationDuration: sec(5 + hash(g + 7) * 8),
              animationDelay: sec(-hash(g + 70) * 13 - (i % 3) * 0.12),
            }}
          />
        )
      })}
    </>
  )
}

/** jaśniejsze "zapalone" okna: ciepła albo chłodna poświata na części okien, grupami */
function WindowGlow({ lite }: { lite?: boolean }) {
  const list = CITY.windows.filter((_, i) => i % (lite ? 6 : 3) === 1)
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
              animationDuration: sec(4 + hash(g + 17) * 6),
              animationDelay: sec(-hash(g + 71) * 10),
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
          width: '7%',
          aspectRatio: '1',
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(circle, rgb(255,160,140) 6%, rgba(255,40,30,0.9) 14%, rgba(255,30,20,0.3) 30%, transparent 64%)',
        }}
      />
      <div className="absolute overflow-hidden" style={{ ...box(o.sky), WebkitMaskImage: m, maskImage: m, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}>
        <span
          className="amb-meteor absolute mix-blend-screen"
          style={{ left: '78%', top: '8%', width: '26%', height: '5%', background: 'linear-gradient(90deg, rgba(255,255,255,1), rgba(200,220,255,0.5) 30%, transparent)', borderRadius: 9 }}
        />
      </div>
      <Halo c={o.lamp} r={9} color="255,190,110" dur={3.6} lo={0.3} />
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
              top: '70%',
              width: '52%',
              height: '11%',
              transform: 'translate(-50%,-50%)',
              background: 'radial-gradient(ellipse, rgba(120,255,170,0.42) 0%, rgba(120,255,170,0.14) 45%, transparent 70%)',
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
      art = <VaultArt />
      fx = (
        <>
          <Glow p={GLOW.crystal} name="glow-crystal" lo={0.25} hi={1} dur={2.6} />
          <Glow p={GLOW.vault} name="glow-vault" lo={0.1} hi={0.5} dur={3.4} delay={-1.1} />
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
          <span
            className="amb-rec absolute flex items-center justify-center font-mono font-bold"
            style={{
              left: '26%',
              top: '34%',
              width: '13%',
              height: '4.2%',
              fontSize: '2.3cqw',
              letterSpacing: '0.1em',
              color: 'rgb(255,235,225)',
              background: 'rgb(200,40,30)',
              borderRadius: '0.6cqw',
              boxShadow: '0 0 1.6cqw 0.4cqw rgba(255,60,40,0.55)',
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
    <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${hot ? 'amb-hot' : ''}`} style={{ containerType: 'inline-size' }}>
      {art && (
        <div className={`absolute inset-0 ${artClass ?? ''}`} style={artStyle}>
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
