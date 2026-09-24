'use client'

import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

/**
 * Wskaźnik położenia w poziomym rzędzie przewijanym palcem (teczki, sklepy na telefonie):
 * kropka na element, aktywna wydłużona w kolorze akcentu — widać, że rząd jedzie w bok
 * i ile jeszcze zostało. Aktywny = element najbliżej środka kadru rzędu (na końcu rzędu: ostatni).
 * Tylko ozdoba (aria-hidden) — elementy rzędu są osiągalne klawiaturą i czytnikiem same.
 */
export default function RowDots({ rowRef, count, className = '' }: { rowRef: RefObject<HTMLElement | null>; count: number; className?: string }) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    let raf = 0
    const compute = () => {
      raf = 0
      const items = [...row.children].filter((c) => (c as HTMLElement).offsetWidth > 0) as HTMLElement[]
      if (!items.length) return
      if (row.scrollLeft >= row.scrollWidth - row.clientWidth - 4) return setActive(items.length - 1)
      const rr = row.getBoundingClientRect()
      const mid = rr.left + rr.width / 2
      let best = 0
      let d = Infinity
      items.forEach((el, i) => {
        const r = el.getBoundingClientRect()
        const dd = Math.abs(r.left + r.width / 2 - mid)
        if (dd < d) {
          d = dd
          best = i
        }
      })
      // pierwsza teczka przyciągana do lewej krawędzi — na starcie zawsze 1.
      setActive(row.scrollLeft <= 4 ? 0 : best)
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(compute)
    }
    compute()
    row.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      row.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [rowRef, count])

  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-2 mb-3 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-[width,background-color] duration-300 ${i === active ? 'w-6 bg-accent shadow-glow' : 'w-2 bg-paper-dim/70'}`}
        />
      ))}
      <span className="ml-2 font-mono text-xs tabular-nums text-paper-muted">
        {String(active + 1).padStart(2, '0')}/{String(count).padStart(2, '0')}
      </span>
    </div>
  )
}
