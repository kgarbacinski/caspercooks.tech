'use client'

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { motion, useAnimate } from 'framer-motion'
import type { Theme } from '@/contexts/ThemeContext'
import { FIG, FRAME } from './layout'
import { KEY } from './rooms'

/**
 * Figurka Kacpra jako osobna warstwa nad wyspą (wycięta z renderu, wyspa pod spodem
 * ma w tym miejscu dopełnione tło). Dwie klatki: stoi / skacze (poza z Gemini).
 *
 * Animacje (sekwencje awaitowanych tweenów — pewniejsze niż długie keyframe'y):
 *   leave()  — kuca (squash), wybija się łukiem i odlatuje poza wyspę,
 *   arrive() — spada z góry w pozie skoku, ląduje z odbiciem i pyłem z papieru,
 *   hop()    — mały podskok na hover.
 */
export type FigureHandle = {
  leave: () => Promise<void>
  arrive: () => Promise<void>
  hop: () => Promise<void>
  hide: () => void
  show: () => void
}

const ASPECT = FRAME.h / FRAME.w

const Figure = forwardRef<FigureHandle, { theme: Theme; dim: boolean; reduce: boolean }>(function Figure(
  { theme, dim, reduce },
  ref,
) {
  const [scope, animate] = useAnimate()
  const [pose, setPose] = useState<'stand' | 'jump'>('stand')
  const [dust, setDust] = useState(0)
  const [busy, setBusy] = useState(false)
  const [present, setPresent] = useState(false) // czy figurka jest na wyspie (cień kontaktowy)
  // numer bieżącej sekwencji — starsza sekwencja przerywa się po najbliższym await
  const gen = useRef(0)
  const k = KEY[theme]
  const f = FIG[k]
  // klatka skoku ma inne proporcje: ta sama wysokość, szerokość z proporcji, stopy w tym samym punkcie
  const jumpW = f.h * ASPECT * f.jumpAspect

  const leave = useCallback(async () => {
    const run = ++gen.current
    setBusy(true)
    await animate(scope.current, { scaleY: 0.84, scaleX: 1.1, y: '3%' }, { duration: 0.16, ease: 'easeOut' })
    if (gen.current !== run) return
    setPose('jump')
    await animate(scope.current, { scaleY: 1.08, scaleX: 0.95, y: '-115%', x: '60%', rotate: 14 }, { duration: 0.32, ease: [0.2, 0.8, 0.4, 1] })
    if (gen.current !== run) return
    // łukiem w górę i w prawo, nad pokojami, z dala od tekstu (nie przez skałę)
    setPresent(false)
    await animate(scope.current, { y: '-150%', x: '320%', rotate: 60, scaleY: 0.9, scaleX: 0.9, opacity: 0 }, { duration: 0.6, ease: [0.3, 0, 0.7, 1] })
  }, [animate, scope])

  const hide = useCallback(() => {
    gen.current++
    setPresent(false)
    if (scope.current) animate(scope.current, { opacity: 0 }, { duration: 0 })
  }, [animate, scope])

  const show = useCallback(() => {
    gen.current++
    setPresent(true)
    setPose('stand')
    if (scope.current) animate(scope.current, { opacity: 1, x: '0%', y: '0%', rotate: 0, scaleX: 1, scaleY: 1 }, { duration: 0 })
  }, [animate, scope])

  const arrive = useCallback(async () => {
    const run = ++gen.current
    setBusy(true)
    setPose('jump')
    setPresent(true)
    // jawne klatki startowe: niezależnie od tego, gdzie skończyła poprzednia sekwencja
    await animate(
      scope.current,
      { opacity: [0, 1, 1], y: ['-170%', '-120%', '0%'], x: ['-25%', '-18%', '0%'], rotate: [-14, -10, 0], scaleX: [0.94, 0.94, 0.94], scaleY: [1.06, 1.06, 1.06] },
      { duration: 0.5, ease: [0.45, 0, 0.95, 0.55], times: [0, 0.15, 1] },
    )
    if (gen.current !== run) return
    setPose('stand')
    setDust((d) => d + 1)
    await animate(scope.current, { scaleY: 0.78, scaleX: 1.2 }, { duration: 0.09, ease: 'easeOut' })
    if (gen.current !== run) return
    await animate(scope.current, { scaleY: 1.07, scaleX: 0.95, y: '-6%' }, { duration: 0.16, ease: 'easeOut' })
    if (gen.current !== run) return
    await animate(scope.current, { scaleY: 1, scaleX: 1, y: '0%' }, { type: 'spring', stiffness: 420, damping: 14 })
    if (gen.current !== run) return
    setBusy(false)
  }, [animate, scope])

  const hop = useCallback(async () => {
    if (busy || reduce) return
    const run = ++gen.current
    setBusy(true)
    await animate(scope.current, { scaleY: 0.9, scaleX: 1.06 }, { duration: 0.1 })
    if (gen.current !== run) return
    setPose('jump')
    await animate(scope.current, { scaleY: 1, scaleX: 1, y: '-16%' }, { duration: 0.2, ease: 'easeOut' })
    if (gen.current !== run) return
    await animate(scope.current, { y: '0%' }, { duration: 0.18, ease: 'easeIn' })
    if (gen.current !== run) return
    setPose('stand')
    await animate(scope.current, { scaleY: 0.92, scaleX: 1.05 }, { duration: 0.07 })
    if (gen.current !== run) return
    await animate(scope.current, { scaleY: 1, scaleX: 1 }, { type: 'spring', stiffness: 500, damping: 16 })
    setBusy(false)
  }, [animate, scope, busy, reduce])

  useImperativeHandle(ref, () => ({ leave, arrive, hop, hide, show }), [leave, arrive, hop, hide, show])

  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: `${f.l}%`, top: `${f.t}%`, width: `${f.w}%`, height: `${f.h}%`, zIndex: 20 }}
    >
      {/* cień kontaktowy pod stopami — zmniejsza się, gdy figurka jest w powietrzu */}
      <motion.div
        aria-hidden="true"
        className="absolute left-[-10%] right-[-10%] bottom-[-2.5%] h-[5%] rounded-[50%] bg-black/60 blur-[3px]"
        animate={{ opacity: !present ? 0 : pose === 'jump' ? 0.25 : 0.9, scaleX: pose === 'jump' ? 0.6 : 1 }}
        transition={{ duration: 0.2 }}
      />
      <div
        ref={scope}
        className="absolute inset-0 will-change-transform"
        style={{ opacity: 0, transformOrigin: '50% 100%', filter: dim ? 'brightness(0.45) saturate(0.7)' : 'none', transition: 'filter .35s ease' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/diorama/v2/fig-${k}.webp`}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: pose === 'stand' ? 1 : 0 }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/diorama/v2/jump-${k}.webp`}
          alt=""
          draggable={false}
          className="absolute bottom-0 h-full max-w-none"
          style={{
            opacity: pose === 'jump' ? 1 : 0,
            width: `${(jumpW / f.w) * 100}%`,
            left: `${50 - (jumpW / f.w) * 50}%`,
          }}
        />
      </div>
      {/* papierowy pył przy lądowaniu */}
      {dust > 0 && (
        <div key={dust} aria-hidden="true" className="absolute left-1/2 bottom-0">
          {Array.from({ length: 14 }).map((_, i) => {
            const side = i % 2 ? 1 : -1
            const dx = side * (18 + ((i * 37) % 60))
            const dy = -(10 + ((i * 53) % 34))
            return (
              <motion.span
                key={i}
                className="absolute block w-[5px] h-[3px] rounded-[1px]"
                style={{ background: i % 3 ? '#e9d3b0' : '#c98a55' }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{ x: dx, y: [0, dy, 8], opacity: [1, 1, 0], rotate: side * 200 }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
})

export default Figure
