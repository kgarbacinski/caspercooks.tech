/**
 * Jedna wspólna pętla rAF dla wszystkich animacji ambient rysowanych w JS (ekrany z kodem).
 * - działa tylko, gdy ktoś jest zapisany (widoczny, niezatrzymany ekran),
 * - stoi przy ukrytej karcie,
 * - liczy "czas wirtualny": po pauzie świat rusza tam, gdzie stanął (bez skoku o minuty).
 * Dzięki wspólnemu czasowi ten sam ekran w hero i w scenie About pokazuje identyczny stan
 * (podmiana pokoju przy wjeździe kamery jest niewidoczna).
 */
type Sub = (t: number) => void

const subs = new Set<Sub>()
let raf = 0
let last = 0
let virt = 0
let hidden = false

let held = false

function frame(now: number) {
  raf = 0
  if (hidden || held || !subs.size) return
  // krok zegara ograniczony do 100 ms (po zamrożonej klatce nie przeskakujemy do przodu)
  virt += Math.min(100, Math.max(0, now - (last || now)))
  last = now
  subs.forEach((fn) => fn(virt))
  raf = requestAnimationFrame(frame)
}

function start() {
  if (raf || hidden || held || !subs.size) return
  last = 0
  raf = requestAnimationFrame(frame)
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    hidden = document.hidden
    if (hidden && raf) {
      cancelAnimationFrame(raf)
      raf = 0
    } else start()
  })
}

export function subscribe(fn: Sub) {
  subs.add(fn)
  start()
  return () => {
    subs.delete(fn)
    if (!subs.size && raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }
}

export const clockNow = () => virt

/**
 * Wstrzymanie pętli na czas przesuwania panoramy palcem (telefon): ekrany z kodem i sejf nie malują
 * się wtedy co klatkę, więc wątek główny nie konkuruje z przewijaniem. Czas wirtualny stoi —
 * po puszczeniu świat rusza dokładnie tam, gdzie stanął (bez skoku). Pętle CSS chodzą dalej.
 */
export function hold(on: boolean) {
  if (held === on) return
  held = on
  if (on && raf) {
    cancelAnimationFrame(raf)
    raf = 0
  }
  if (!on) start()
}
