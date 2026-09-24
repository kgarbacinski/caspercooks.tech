import type { Theme } from '@/contexts/ThemeContext'
import { ROOM_BOX } from './layout'

/** Klucz zestawu grafik dioramy dla motywu. */
export const KEY: Record<Theme, 'dev' | 'ceo'> = { developer: 'dev', founder: 'ceo' }

export type RoomInfo = { label: string; hint: string; href: string }

/** Pokoje wyspy od lewej; każdy prowadzi do sekcji strony (sekcje są "pokojami"). */
export const ROOMS: Record<Theme, RoomInfo[]> = {
  developer: [
    { label: 'Dev cave', hint: 'who I am', href: '#about' },
    { label: 'Infra', hint: 'systems I shipped', href: '#projects' },
    { label: 'Web3 vault', hint: 'Octant, DeFi, Solidity', href: '#projects' },
    { label: 'AI lab', hint: 'my stack', href: '#stack' },
    { label: 'Studio', hint: 'content I make', href: '#studio' },
  ],
  founder: [
    { label: 'CEO office', hint: 'the founder story', href: '#about' },
    { label: 'devs-mentoring', hint: '300+ devs mentored', href: '#projects' },
    { label: 'coderiv', hint: 'the app studio', href: '#brands' },
    { label: 'devs-hunting', hint: 'talent scouting', href: '#brands' },
    { label: 'Efektywniejsi', hint: 'AI automation & training', href: '#studio' },
  ],
}

/** Ścieżka wyciętego pokoju (dokładny kształt, przezroczyste tło). */
export const roomSrc = (theme: Theme, i: number, small = false) => roomSrcOf(KEY[theme], i, small)
/** To samo, ale z jawnie wskazanego świata (sekcja, której treść nie zależy od trybu). */
export const roomSrcOf = (world: 'dev' | 'ceo', i: number, small = false) => `/diorama/v2/room-${world}-${i}${small ? '-sm' : ''}.webp`

/** Przewinięcie do sekcji przez Lenis (albo natywnie, gdy Lenis wyłączony). */
export function scrollToHash(href: string) {
  const el = document.querySelector(href) as HTMLElement | null
  if (!el) return
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).__lenis
  if (lenis) lenis.scrollTo(el, { offset: -72 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Warianty rozdzielczości pokoju do srcSet: -sm (½), bazowy (kadr 2400 px), -lg (2×, retina). */
export const roomSrcSet = (world: 'dev' | 'ceo', i: number) => {
  const px = ROOM_BOX[world][i].px
  const b = `/diorama/v2/room-${world}-${i}`
  return `${b}-sm.webp ${Math.floor(px / 2)}w, ${b}.webp ${px}w, ${b}-lg.webp ${px * 2}w`
}

/** Figurka (i sprite skoku) w dwóch rozdzielczościach — te same kadry, -lg = 2.5×. */
export const FIG_SET = (k: 'dev' | 'ceo', kind: 'fig' | 'jump' = 'fig') => {
  const w = { fig: { dev: 172, ceo: 178 }, jump: { dev: 361, ceo: 376 } }[kind][k]
  return `/diorama/v2/${kind}-${k}.webp ${w}w, /diorama/v2/${kind}-${k}-lg.webp ${Math.round(w * 2.5)}w`
}
