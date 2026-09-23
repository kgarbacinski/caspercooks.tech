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
      Array.from({ length: 32 }, (_, i) => {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25
        const v = 90 + Math.random() * 150 // ścinki zostają w obrębie wyspy
        return {
          x0: 6 + Math.random() * 88, // start wzdłuż podłogi pokoi (% szerokości)
          dx: Math.cos(a) * v,
          dy: Math.sin(a) * v,
          fall: 140 + Math.random() * 160,
          w: 9 + Math.random() * 12,
          h: 6 + Math.random() * 9,
          rx: (Math.random() - 0.5) * 900,
          ry: (Math.random() - 0.5) * 900,
          c: ['#efe2c7', '#e2cda8', '#c9a882', '#b8663f', '#efe2c7', `rgb(${accent})`][i % 6],
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
