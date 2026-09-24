'use client'

import type { CSSProperties } from 'react'

/**
 * Prąd w kablach pod wyspą. Maska = same świecące kable wycięte z renderu bazy
 * (casper-room/v3/cables.py), więc światło biegnie dokładnie po nich.
 *  - spokój: co ~6.5 s jeden impuls wychodzi od pieczęci KG w obie strony,
 *  - `surge` (licznik): mocny impuls + rozbłysk całych kabli — przy zapalaniu świateł
 *    (intro, DEV ⇄ CEO) i po kliknięciu pieczęci,
 * Wszystko to transform/opacity wewnątrz warstwy z maską (kompozytor); pauza przez [data-paused].
 */

// obrys kabli w % kadru wyspy (2400×1224) — wypisane przez cables.py
export const CABLE_BOX = {
  dev: { l: 12.167, t: 72.304, w: 74.875, h: 24.755 },
  ceo: { l: 12.25, t: 69.281, w: 74.792, h: 28.023 },
} as const
// rozbłysk w odcieniu kabli (czysty akcent dodany do zieleni kabli dawał cyjan)
const FLASH = { dev: '40,255,70', ceo: '255,110,20' } as const
// pieczęć KG = źródło prądu (środek w % szerokości obrysu kabli)
const MID = 50.5

type Props = {
  world: 'dev' | 'ceo'
  /** kolor akcentu "r,g,b" */
  accent: string
  /** spokojne impulsy widoczne (światła zapalone, żaden pokój nie jest podświetlany) */
  on: boolean
  surge: number
  reduce: boolean
}

export default function Cables({ world, accent, on, surge, reduce }: Props) {
  if (reduce) return null
  const b = CABLE_BOX[world]
  const src = `/diorama/v2/cables-${world}.webp`
  const mask: CSSProperties = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
  }
  // jasny czubek impulsu z ogonem w kolorze akcentu
  // czubek = akcent rozjaśniony w 60% do bieli (czysta biel wyglądała jak błąd), przy mocnym impulsie 75%
  const tint = (k: number, a: number) => `rgba(${accent.split(',').map((c) => Math.round(+c + (255 - +c) * k)).join(',')},${a})`
  const band = `linear-gradient(90deg, transparent 0%, rgba(${accent},0.3) 40%, rgba(${accent},0.85) 72%, ${tint(0.6, 0.85)} 88%, ${tint(0.6, 0.6)} 95%, transparent 100%)`
  const bandHot = `linear-gradient(90deg, transparent 0%, rgba(${accent},0.35) 40%, rgba(${accent},0.9) 72%, ${tint(0.75, 0.95)} 88%, ${tint(0.75, 0.7)} 95%, transparent 100%)`
  const half = (side: 'l' | 'r') => (
    // połówka: od pieczęci na zewnątrz; lewa to lustro prawej (maska zostaje nieodbita)
    <div
      key={side}
      className="absolute inset-0"
      style={{ clipPath: side === 'l' ? `inset(0 ${100 - MID}% 0 0)` : `inset(0 0 0 ${MID}%)` }}
    >
      <div
        className="absolute top-0 bottom-0"
        style={
          side === 'r'
            ? { left: `${MID}%`, right: 0 }
            : { left: 0, right: `${100 - MID}%`, transform: 'scaleX(-1)' }
        }
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{ opacity: on ? 1 : 0, transition: 'opacity .6s ease' }}>
            <span
              className="absolute inset-y-0 left-0 w-[40%]"
              style={{ background: band, animation: 'cable-pulse 6.5s cubic-bezier(.35,.1,.45,1) 1.5s infinite both' }}
            />
          </div>
          {surge > 0 && (
            <span
              key={surge}
              className="absolute inset-y-0 left-0 w-[70%]"
              style={{ background: bandHot, animation: 'cable-surge .75s cubic-bezier(.2,.6,.4,1) both' }}
            />
          )}
        </div>
      </div>
    </div>
  )
  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={{
        left: `${b.l}%`,
        top: `${b.t}%`,
        width: `${b.w}%`,
        height: `${b.h}%`,
      }}
    >
      {/* kable lekko przygaszone (normalny tryb mieszania), żeby impuls miał dokąd się rozjaśnić */}
      <div className="absolute inset-0" style={{ ...mask, background: 'rgba(0,0,0,0.26)', mixBlendMode: 'normal', opacity: on ? 1 : 0, transition: 'opacity .6s ease' }} />
      <div className="absolute inset-0 will-change-transform" style={{ ...mask, mixBlendMode: 'plus-lighter' }}>
        {half('l')}
        {half('r')}
        {/* rozbłysk całych kabli przy mocnym impulsie */}
        {surge > 0 && (
          <span key={`f${surge}`} className="absolute inset-0" style={{ background: `rgba(${FLASH[world]},0.55)`, animation: 'cable-flash 1s ease-out both' }} />
        )}
      </div>
    </div>
  )
}
