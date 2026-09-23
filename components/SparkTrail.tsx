'use client'

import { useEffect, useRef } from 'react'

/**
 * Ślad iskier za kursorem (tylko mysz, bez prefers-reduced-motion): kilka żarzących się
 * drobinek, które opadają i gasną — jak iskry wokół wyspy. Kursor systemowy zostaje.
 */
export default function SparkTrail() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
    }
    resize()
    type P = { x: number; y: number; vx: number; vy: number; life: number; r: number; c: boolean }
    const ps: P[] = []
    let last = { x: 0, y: 0 }
    let raf = 0
    let running = false
    const accent = () => getComputedStyle(document.body).getPropertyValue('--accent-rgb').trim().replace(/ /g, ',')
    let acc = accent()
    const obs = new MutationObserver(() => (acc = accent()))
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.life -= 0.022
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.035
        if (p.life <= 0) {
          ps.splice(i, 1)
          continue
        }
        const r = p.r * dpr * (0.5 + p.life)
        const g = ctx.createRadialGradient(p.x * dpr, p.y * dpr, 0, p.x * dpr, p.y * dpr, r * 3)
        g.addColorStop(0, p.c ? `rgba(${acc},${p.life})` : `rgba(255,180,100,${p.life})`)
        g.addColorStop(1, 'rgba(255,120,40,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x * dpr, p.y * dpr, r * 3, 0, Math.PI * 2)
        ctx.fill()
      }
      if (ps.length) raf = requestAnimationFrame(tick)
      else running = false
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const d = Math.hypot(e.clientX - last.x, e.clientY - last.y)
      last = { x: e.clientX, y: e.clientY }
      if (d < 6) return
      const n = Math.min(2, Math.floor(d / 14) + 1)
      for (let i = 0; i < n; i++)
        ps.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.4 - Math.random() * 0.6,
          life: 0.7 + Math.random() * 0.3,
          r: 0.8 + Math.random() * 1.2,
          c: Math.random() < 0.35,
        })
      if (ps.length > 60) ps.splice(0, ps.length - 60)
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      obs.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="fixed inset-0 w-full h-full pointer-events-none z-[90]" />
}
