'use client'

import { useEffect, useRef } from 'react'

/**
 * Iskry unoszące się wokół wyspy (canvas); część w kolorze akcentu.
 * Pętla rAF działa tylko, gdy hero jest widoczne (paused z Dioramy) i karta jest na wierzchu.
 */
export default function Sparks({ accent, reduce, paused = false }: { accent: string; reduce: boolean; paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const accentRef = useRef(accent)
  accentRef.current = accent

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduce || paused) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
    }
    resize()
    const sparks = Array.from({ length: 24 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 1.8,
      v: 0.00012 + Math.random() * 0.00035,
      p: Math.random() * Math.PI * 2,
      c: Math.random() < 0.22,
    }))
    // jeden gotowy "duszek" iskry na kolor (gradient liczony raz, nie co klatkę)
    const sprite = (rgb: string) => {
      const c = document.createElement('canvas')
      c.width = c.height = 64
      const g = c.getContext('2d')!
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32)
      gr.addColorStop(0, `rgba(${rgb},1)`)
      gr.addColorStop(1, 'rgba(255,120,40,0)')
      g.fillStyle = gr
      g.fillRect(0, 0, 64, 64)
      return c
    }
    const warm = sprite('255,170,90')
    const acc = sprite(accentRef.current)
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
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
        ctx.globalAlpha = a
        ctx.drawImage(s.c ? acc : warm, x - rad, y - rad, rad * 2, rad * 2)
      }
    }
    const start = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) raf = requestAnimationFrame(tick)
    }
    start()
    // ukryta karta: zatrzymujemy pętlę całkiem (nie tylko rysowanie)
    const onVis = () => (document.hidden ? cancelAnimationFrame(raf) : start())
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', resize)
    }
  }, [reduce, paused, accent])

  return <canvas ref={canvasRef} className="absolute -inset-[14%] w-[128%] h-[128%] pointer-events-none" aria-hidden="true" />
}
