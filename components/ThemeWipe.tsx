'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useTheme, SWITCH } from '@/contexts/ThemeContext'

/**
 * Kurtyna przełączenia DEV ⇄ CEO: arkusz jasnego papieru kraft (włókna z feTurbulence,
 * postrzępione krawędzie, cień pod krawędzią natarcia) przesuwa się przez ekran;
 * w środku wbija się woskowa pieczęć KG — z lekkim drżeniem przy uderzeniu i
 * rozpryskiem drobinek wosku. Oś czasu: SWITCH.curtain w ThemeContext. Używana tylko,
 * gdy przełączenie zaczyna się poniżej hero (przy hero wszystko dzieje się na dioramie).
 */

// włókna papieru — tekstura bez dodatkowego pliku
const FIBRE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9 0.035' numOctaves='3' seed='4'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.22 0 0 0 0 0.12 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23f)'/%3E%3C/svg%3E\")"
const EDGE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 240' preserveAspectRatio='none'%3E%3Cpath d='M40 0 L16 0 L27 22 L9 48 L24 74 L6 101 L21 128 L3 152 L19 181 L7 209 L20 240 L40 240Z' fill='%23b4865b'/%3E%3C/svg%3E\")"
// nieregularny kształt woskowej pieczęci
const SEAL_PATH =
  'M50 3 C62 2 70 9 80 12 C91 16 97 27 96 39 C95 48 99 55 97 64 C94 77 85 84 76 90 C66 97 55 98 45 97 C33 96 24 91 16 83 C7 74 2 63 4 51 C5 42 1 34 5 26 C11 13 24 9 34 6 C40 4 45 3 50 3Z'

const C = SWITCH.curtain
const T = C.sheetOut / 1000 + 0.55 // czas życia kurtyny [s]
const k = (ms: number) => Math.min(1, ms / 1000 / T) // ms → ułamek osi kurtyny

export default function ThemeWipe() {
  const { phase, mode, target } = useTheme()

  return (
    <AnimatePresence>
      {phase !== 'idle' && mode === 'curtain' && (
        <motion.div
          key="wipe"
          className={`fixed inset-0 z-[100] overflow-hidden ${phase === 'covered' ? 'pointer-events-auto' : 'pointer-events-none'}`}
          aria-hidden="true"
        >
          <motion.div
            className="absolute inset-y-0 -left-[70px] w-[calc(100%+140px)]"
            style={{
              backgroundColor: '#b4865b',
              backgroundImage: `radial-gradient(ellipse at 50% 45%, rgba(255,230,190,0.35), transparent 65%), ${FIBRE}`,
              boxShadow: '0 0 80px 20px rgba(0,0,0,0.55)',
            }}
            initial={{ x: '-115%' }}
            animate={{ x: ['-115%', '-115%', '0%', '0%', '115%'] }}
            transition={{
              duration: T,
              times: [0, k(C.sheetIn), k(C.covered - 60), k(C.sheetOut), 1],
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            {/* postrzępione krawędzie + cień krawędzi natarcia */}
            <div className="absolute inset-y-0 -left-[39px] w-10" style={{ background: EDGE, backgroundSize: '100% 240px', transform: 'scaleX(-1)' }} />
            <div
              className="absolute inset-y-0 -right-[39px] w-10"
              style={{ background: EDGE, backgroundSize: '100% 240px', filter: 'drop-shadow(18px 0 18px rgba(0,0,0,0.45))' }}
            />

            {/* pieczęć — uderzenie z góry, drżenie, drobinki wosku */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
              <motion.div
                className="relative w-32 h-32"
                // uderzenie pieczęci: spada z góry tuż po zakryciu ekranu, lekko odbija i drży;
                // znika razem z arkuszem (jest jego dzieckiem), więc bez osobnego zanikania
                initial={{ opacity: 0, scale: 2.5, rotate: -22 }}
                animate={{ opacity: 1, scale: [2.5, 0.9, 1.05, 1], rotate: [-22, 3, -1, 0], x: [0, 0, -3, 0] }}
                transition={{ delay: C.covered / 1000 - 0.22, duration: 0.42, times: [0, 0.5, 0.75, 1], ease: 'easeOut', opacity: { delay: C.covered / 1000 - 0.22, duration: 0.12 } }}
              >
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_14px_18px_rgba(40,12,4,0.55)]">
                  <defs>
                    <radialGradient id="wax" cx="38%" cy="32%" r="75%">
                      <stop offset="0" stopColor="#c25a2e" />
                      <stop offset="0.55" stopColor="#8a3316" />
                      <stop offset="1" stopColor="#4f1a08" />
                    </radialGradient>
                  </defs>
                  <path d={SEAL_PATH} fill="url(#wax)" />
                  <circle cx="50" cy="50" r="31" fill="none" stroke="#7a3014" strokeWidth="2.5" opacity="0.7" />
                  <circle cx="49.2" cy="49.2" r="31" fill="none" stroke="#e79a6a" strokeWidth="1" opacity="0.5" />
                </svg>
                {/* wytłoczone KG: światło od góry, cień od dołu */}
                <span
                  className="absolute inset-0 grid place-items-center font-display text-4xl text-[#5e1f0a]"
                  style={{ textShadow: '0 -1px 0 rgba(255,190,150,0.55), 0 1.5px 1px rgba(40,10,0,0.7)' }}
                >
                  KG
                </span>
                {Array.from({ length: 10 }).map((_, i) => {
                  const a = (i / 10) * Math.PI * 2 + 0.3
                  const d = 72 + (i % 3) * 24
                  return (
                    <motion.span
                      key={i}
                      className="absolute left-1/2 top-1/2 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[#a44a26]"
                      initial={{ opacity: 0, x: 0, y: 0 }}
                      animate={{ opacity: [1, 1, 0], x: Math.cos(a) * d, y: Math.sin(a) * d + 18 }}
                      transition={{ delay: C.covered / 1000 - 0.02, duration: 0.45, ease: 'easeOut' }}
                    />
                  )
                })}
              </motion.div>
              <motion.span
                className="font-mono text-sm sm:text-base tracking-[0.3em] uppercase text-[#3b2212] whitespace-nowrap"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: C.covered / 1000 - 0.05, duration: 0.25 }}
              >
                entering <span className="text-[#6d2a12] font-bold">{target === 'founder' ? 'founder' : 'developer'}</span> mode
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
