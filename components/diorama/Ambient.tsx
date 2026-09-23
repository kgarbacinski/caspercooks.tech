'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { ARM, CITY, FLOW, GLOW, LAMP, LEDS, PHONES, RADAR, REC, SCREENS } from './ambientLayout'
import type { Pct } from './ambientLayout'
import { ROOM_BOX } from './layout'
import { clockNow, subscribe } from './ambientClock'
import { draw, getModel } from './codeScreen'
import type { ScreenCfg } from './codeScreen'

/**
 * Żywa miniatura: ciche animacje ambient w pokojach dioramy.
 * Zasady (po audycie "za dużo szumu"):
 *  - wszystko wolne, niezsynchronizowane; w danej chwili wyraźnie rusza się najwyżej 1–2 rzeczy
 *    na świat — epizody (ramię, migotanie lampy, telefon, schemat) mają okna w 24-sekundowym
 *    cyklu świata, które na siebie nie nachodzą,
 *  - animujemy istniejącą grafikę: sprite'y i "czyste płyty" wycięte z tych samych renderów
 *    (casper-room/v2/ambient.py), pozycje w % pokoju → skalują się razem z wyspą,
 *  - warstwa leży WEWNĄTRZ warstwy pokoju, więc składa się z nim przy DEV ⇄ CEO i jedzie z kamerą,
 *  - transform/opacity (kompozytor); jeden wspólny rAF tylko dla ekranów z kodem,
 *  - pauza poza kadrem ([data-paused] zatrzymuje pętle CSS, `run` odpina canvasy),
 *  - bez prefers-reduced-motion (rodzic w ogóle tego nie renderuje).
 */

type World = 'dev' | 'ceo'
type Props = {
  world: World
  room: number
  /** pętle JS mają chodzić (hero w kadrze, światło zapalone) */
  run: boolean
  /** poświaty widoczne (światło zapalone, pokój nieprzygaszony hoverem innego) */
  show: boolean
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

const CFG: Record<keyof typeof SCREENS, ScreenCfg> = {
  // Dev cave, lewy monitor: edytor, ktoś pisze
  dev0L: {
    mode: 'code',
    rows: 13,
    cols: 40,
    left: 0.095,
    top: 0.06,
    gutter: 'line',
    palette: ['rgb(126,205,158)', 'rgb(176,240,200)', 'rgb(74,128,96)', 'rgb(150,222,178)'],
    glow: 'rgba(110,230,160,0.55)',
    seed: 7,
    bar: 0.46,
  },
  // Dev cave, prawy monitor: terminal z logami (rzadkie wpisy)
  dev0R: {
    mode: 'log',
    rows: 13,
    cols: 40,
    left: 0.075,
    top: 0.07,
    gutter: 'line',
    palette: ['rgb(116,196,144)', 'rgb(160,232,186)', 'rgb(70,120,92)', 'rgb(210,250,220)'],
    glow: 'rgba(110,230,160,0.5)',
    seed: 21,
    bar: 0.44,
  },
  // devs-mentoring: ekran z live codingiem (biało-pomarańczowy jak w grafice)
  ceo1: {
    mode: 'code',
    rows: 12,
    cols: 42,
    left: 0.125,
    top: 0.075,
    gutter: 'nums',
    palette: ['rgb(236,226,214)', 'rgb(236,142,64)', 'rgb(222,168,124)', 'rgb(246,176,96)'],
    num: 'rgb(170,98,62)',
    glow: 'rgba(255,170,100,0.35)',
    seed: 3,
    bar: 0.42,
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${A}plate-${id}.webp`} alt="" draggable={false} style={box(s.plate)} />
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

/** ramię robota w AI lab: podnosi kubek, chwila, odstawia (okno 2–8 s cyklu świata) */
function Arm({ lite }: { lite?: boolean }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${A}arm-plate.webp`} alt="" draggable={false} style={box(ARM.plate)} />
      <div className="amb-arm" style={{ ...box(ARM.sprite), transformOrigin: `${ARM.pivot[0]}% ${ARM.pivot[1]}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${A}arm.webp`} alt="" draggable={false} className="absolute inset-0 w-full h-full" />
        {!lite && (
          // para z kubka jedzie razem z ramieniem
          <span className="absolute" style={{ left: `${ARM.cup[0]}%`, top: `${ARM.cup[1]}%`, width: '9%', height: '60%', transform: 'translate(-50%,-100%)' }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="amb-steam absolute bottom-0 rounded-full"
                style={{ left: `${22 + i * 22}%`, width: '34%', height: '55%', animationDelay: `${-i * 1.3}s`, animationDuration: `${3.6 + i * 0.5}s` }}
              />
            ))}
          </span>
        )}
      </div>
    </>
  )
}

function Glow({ p, name, lo, hi, dur, delay = 0 }: { p: Pct; name: string; lo: number; hi: number; dur: number; delay?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${A}${name}.webp`}
      alt=""
      draggable={false}
      className="amb-pulse mix-blend-screen"
      style={{ ...box(p), ['--lo' as string]: lo, ['--hi' as string]: hi, animationDuration: `${dur}s`, animationDelay: `${delay}s` } as CSSProperties}
    />
  )
}

/** okazjonalne migotanie lampy: ciepły półmrok w kształcie klosza i plamy światła */
function LampFlicker({ p, world }: { p: Pct; world: World }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`${A}lamp-${world}.webp`} alt="" draggable={false} className="amb-flicker" style={box(p)} />
}

function Leds({ lite }: { lite?: boolean }) {
  // część diod na chwilę gaśnie (aktywność dysków), kilka krótko rozbłyska — każda w swoim rytmie
  const off = LEDS.filter((_, i) => i % (lite ? 6 : 3) === 1)
  const flash = LEDS.filter((_, i) => i % (lite ? 10 : 5) === 3)
  return (
    <>
      {off.map(([x, y, c], i) => (
        <span
          key={`o${i}`}
          className="amb-led absolute rounded-full"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: '1.8%',
            aspectRatio: '1',
            transform: 'translate(-50%,-50%)',
            background: `radial-gradient(circle, rgb(${c.join(',')}) 40%, rgba(${c.join(',')},0.8) 58%, transparent 76%)`,
            animationDuration: sec(2.4 + hash(i) * 5.5),
            animationDelay: sec(-hash(i + 40) * 8),
          }}
        />
      ))}
      {flash.map(([x, y], i) => (
        <span
          key={`f${i}`}
          className="amb-led-flash absolute rounded-full mix-blend-screen"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: '2%',
            aspectRatio: '1',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, rgba(255,214,150,0.95) 16%, rgba(255,150,60,0.45) 40%, transparent 70%)',
            animationDuration: sec(3.1 + hash(i + 90) * 4.2),
            animationDelay: sec(-hash(i + 120) * 7),
          }}
        />
      ))}
    </>
  )
}

function Sparkles() {
  // drobinki unoszące się nad kryształem web3
  const pts = [
    [12.3, 69.5, 4.6, 0],
    [14.2, 67.5, 5.4, -1.9],
    [15.6, 70.5, 6.1, -3.7],
  ]
  return (
    <>
      {pts.map(([x, y, d, dl], i) => (
        <span
          key={i}
          className="amb-rise absolute rounded-full mix-blend-screen"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: '1.7%',
            aspectRatio: '1',
            background: 'radial-gradient(circle, rgba(240,255,245,1) 18%, rgba(130,255,200,0.6) 42%, transparent 70%)',
            animationDuration: `${d}s`,
            animationDelay: `${dl}s`,
          }}
        />
      ))}
    </>
  )
}

function Radar() {
  const r = RADAR
  return (
    <span
      className="absolute overflow-hidden rounded-full mix-blend-screen"
      style={{ left: `${r.cx - r.rw}%`, top: `${r.cy - r.rh}%`, width: `${r.rw * 2}%`, height: `${r.rh * 2}%` }}
    >
      {/* wiązka: jasna krawędź prowadzi, za nią gasnący ogon */}
      <span
        className="amb-spin absolute inset-0"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(150,255,120,0) 0deg, rgba(150,255,120,0) 250deg, rgba(160,255,120,0.07) 320deg, rgba(200,255,160,0.25) 357deg, rgba(235,255,210,0.55) 359.5deg, rgba(150,255,120,0) 360deg)',
        }}
      />
      {/* echo: kropka zapala się, gdy wiązka przez nią przechodzi (co drugi obrót) */}
      <span
        className="amb-blip absolute rounded-full"
        style={{
          left: '73.64%', // 30% promienia pod kątem 128° od godz. 12
          top: '68.47%',
          width: '9%',
          aspectRatio: '1',
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(circle, rgba(230,255,200,1) 25%, rgba(160,255,120,0.6) 50%, transparent 72%)',
        }}
      />
    </span>
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${A}phone-strip.webp`}
          alt=""
          draggable={false}
          className="amb-phone absolute left-0 w-full"
          style={{ top: `${ph.stripTop}%`, height: `${ph.stripH}%`, maxWidth: 'none' }}
        />
      </div>
    </div>
  )
}

/** okna w wieżowcach gasną i zapalają się rzadko, każde w swoim rytmie (podmiana pikseli → warstwa grafiki) */
function Windows() {
  return (
    <>
      {CITY.windows.map(([x, y, w, h, c], i) => (
        <span
          key={i}
          className="amb-win absolute"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${w}%`,
            height: `${h}%`,
            background: `rgb(${c.join(',')})`,
            animationDuration: sec(26 + hash(i + 7) * 40),
            animationDelay: sec(-hash(i + 70) * 60),
          }}
        />
      ))}
    </>
  )
}

/** gwiazdy nad miastem: ledwie widoczne mruganie (tryb screen → warstwa światła) */
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
            width: '1.6%',
            aspectRatio: '1',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, rgba(255,255,240,0.9) 12%, rgba(200,220,255,0.35) 38%, transparent 70%)',
            animationDuration: sec(3.8 + hash(i + 3) * 4),
            animationDelay: sec(-hash(i + 30) * 6),
          }}
        />
      ))}
    </>
  )
}

/** kropka "danych" płynąca po krawędziach schematu na ekranie webinaru (dwa okna w cyklu) */
function Flow() {
  const b = ROOM_BOX.ceo[4]
  const aspect = (b.h * 12.24) / (b.w * 24) // wysokość/szerokość pokoju
  const size = 2.8 // % szerokości pokoju
  const tr = ([x, y]: readonly number[] | number[]) => `translate(${(x / size) * 100 - 50}%, ${((y * aspect) / size) * 100 - 50}%)`
  const seg = (path: readonly (readonly number[])[], a: number, z: number) => {
    // czas proporcjonalny do długości odcinków
    const len = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], (p[1] - path[i][1]) * aspect))
    const tot = len.reduce((s, v) => s + v, 0)
    const f = (v: number) => `${v.toFixed(3)}%`
    let acc = 0
    const out = [`${f(a)}{transform:${tr(path[0])};opacity:0}`, `${f(a + 0.6)}{transform:${tr(path[0])};opacity:1}`]
    path.slice(1).forEach((p, i) => {
      acc += len[i]
      out.push(`${f(a + 0.6 + (z - a - 1.2) * (acc / tot))}{transform:${tr(p)};opacity:1}`)
    })
    out.push(`${f(z)}{transform:${tr(path[path.length - 1])};opacity:0}`)
    return out
  }
  const P = FLOW.paths
  const css = `@keyframes amb-flow{0%{transform:${tr(P[0][0])};opacity:0}${seg(P[0], 50, 58).join('')}${seg(P[1], 88, 92).join('')}100%{transform:${tr(P[1][1])};opacity:0}}`
  return (
    <>
      <style>{css}</style>
      <span
        className="amb-flow absolute left-0 top-0 rounded-full mix-blend-screen"
        style={{
          width: `${size}%`,
          aspectRatio: '1',
          background: 'radial-gradient(circle, rgb(255,176,96) 14%, rgba(255,138,61,0.85) 30%, rgba(255,120,40,0.3) 50%, transparent 72%)',
        }}
      />
    </>
  )
}

export default function RoomAmbient({ world, room, run, show, lite, artClass, artStyle }: Props) {
  const key = `${world}${room}`
  // warstwa "grafiki": płyty, sprite'y, ekrany — dostaje ten sam filtr co obrazek pokoju
  let art: React.ReactNode = null
  // warstwa "światła": poświaty i migotania (znika przy zgaszonym / przygaszonym pokoju)
  let fx: React.ReactNode = null
  switch (key) {
    case 'dev0':
      art = (
        <>
          <CodeScreen id="dev0L" run={run} />
          <CodeScreen id="dev0R" run={run} />
        </>
      )
      break
    case 'dev1':
      fx = (
        <>
          <Leds lite={lite} />
          <LampFlicker p={LAMP.dev.box} world="dev" />
        </>
      )
      break
    case 'dev2':
      fx = (
        <>
          <Glow p={GLOW.crystal} name="glow-crystal" lo={0.12} hi={0.6} dur={5.2} />
          <Glow p={GLOW.vault} name="glow-vault" lo={0.05} hi={0.4} dur={7.4} delay={-2.1} />
          {!lite && <Sparkles />}
        </>
      )
      break
    case 'dev3':
      art = <Arm lite={lite} />
      break
    case 'dev4':
      fx = (
        <>
          <Glow p={GLOW.ringDev} name="glow-ring-dev" lo={0.04} hi={0.24} dur={7.8} delay={-1.2} />
          <span
            className="amb-rec absolute rounded-full"
            style={{
              left: `${REC.dev[0]}%`,
              top: `${REC.dev[1]}%`,
              width: '1.3%',
              aspectRatio: '1',
              transform: 'translate(-50%,-50%)',
              background: 'radial-gradient(circle, rgb(255,70,50) 32%, rgba(255,60,40,0.55) 50%, transparent 72%)',
            }}
          />
        </>
      )
      break
    case 'ceo0':
      art = <Windows />
      if (!lite) fx = <Stars />
      break
    case 'ceo1':
      art = <CodeScreen id="ceo1" run={run} />
      break
    case 'ceo2':
      art = <Phone />
      break
    case 'ceo3':
      art = (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`${A}radar-plate.webp`} alt="" draggable={false} style={box(RADAR.plate)} />
      )
      fx = (
        <>
          <Radar />
          <LampFlicker p={LAMP.ceo.box} world="ceo" />
        </>
      )
      break
    case 'ceo4':
      fx = (
        <>
          <Glow p={GLOW.ringCeo} name="glow-ring-ceo" lo={0.04} hi={0.22} dur={8.6} delay={-3.3} />
          {!lite && <Flow />}
        </>
      )
      break
  }
  if (!art && !fx) return null
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
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
