'use client'

import { useEffect, useRef } from 'react'

/** Iskry unoszące się wokół wyspy (canvas); część w kolorze akcentu. */
export default function Sparks({ accent, reduce }: { accent: string; reduce: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const accentRef = useRef(accent)
  accentRef.current = accent

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduce) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let visible = true
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
    }
    resize()
    const sparks = Array.from({ length: 60 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 1.8,
      v: 0.00012 + Math.random() * 0.00035,
      p: Math.random() * Math.PI * 2,
      c: Math.random() < 0.22,
    }))
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
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
    }
    raf = requestAnimationFrame(tick)
    // poza ekranem nie rysujemy
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [reduce])

  return <canvas ref={canvasRef} className="absolute -inset-[14%] w-[128%] h-[128%] pointer-events-none" aria-hidden="true" />
}
