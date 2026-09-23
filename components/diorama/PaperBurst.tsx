'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

/**
 * Wybuch papierowych ścinków z podłogi wyspy przy zmianie świata (DEV ⇄ CEO):
 * kawałki kraftu, kremu i akcentu wylatują łukiem, obracają się w 3D i opadają.
 */
export default function PaperBurst({ accent }: { accent: string }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 38 }, (_, i) => {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25
        const v = 120 + Math.random() * 220
        return {
          x0: 8 + (i / 38) * 84, // start wzdłuż podłogi pokoi (% szerokości)
          dx: Math.cos(a) * v,
          dy: Math.sin(a) * v,
          fall: 140 + Math.random() * 160,
          w: 5 + Math.random() * 9,
          h: 3 + Math.random() * 6,
          rx: (Math.random() - 0.5) * 900,
          ry: (Math.random() - 0.5) * 900,
          c: [`rgb(${accent})`, '#efe2c7', '#c9a882', '#b8663f', `rgb(${accent})`][i % 5],
          d: Math.random() * 0.18,
        }
      }),
    [accent],
  )
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-30" style={{ perspective: 600 }}>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute block rounded-[1px]"
          style={{ left: `${b.x0}%`, top: '58%', width: b.w, height: b.h, background: b.c, boxShadow: '0 2px 3px rgba(0,0,0,0.35)' }}
          initial={{ x: 0, y: 0, opacity: 1, rotateX: 0, rotateY: 0 }}
          animate={{ x: [0, b.dx, b.dx * 1.25], y: [0, b.dy, b.dy + b.fall], opacity: [1, 1, 0], rotateX: b.rx, rotateY: b.ry }}
          transition={{ duration: 1.5, delay: b.d, ease: 'easeOut', times: [0, 0.4, 1] }}
        />
      ))}
    </div>
  )
}
