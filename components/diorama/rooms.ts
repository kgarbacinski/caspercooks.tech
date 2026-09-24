import type { Theme } from '@/contexts/ThemeContext'
import { ROOM_BOX } from './layout'

/** Klucz zestawu grafik dioramy dla motywu. */
export const KEY: Record<Theme, 'dev' | 'ceo'> = { developer: 'dev', founder: 'ceo' }

export type RoomInfo = { label: string; hint: string; href: string }

/**
 * Pokoje wyspy od lewej; każdy prowadzi do najbliższej mu treści (głęboki link `#sekcja/element`,
 * patrz components/scrollNav.ts): konkretna teczka w Projects, szyld marki w Brands, zakładka w Stack.
 */
export const ROOMS: Record<Theme, RoomInfo[]> = {
  developer: [
    { label: 'Dev cave', hint: 'who I am', href: '#about' },
    // szafy serwerowe → mikroserwisy Go na AWS (EKS) w DAC Digital
    { label: 'Infra', hint: 'Go microservices on AWS', href: '#projects/dac' },
    { label: 'Web3 vault', hint: 'Octant, DeFi, Solidity', href: '#projects/octant' },
    // ramię robota i graf agentów → zakładka AI & Agents na tablicy Stack
    { label: 'AI lab', hint: 'AI & agents stack', href: '#stack/ai' },
    { label: 'Studio', hint: 'content I make', href: '#studio' },
  ],
  founder: [
    { label: 'CEO office', hint: 'the founder story', href: '#about' },
    { label: 'devs-mentoring', hint: '300+ devs mentored', href: '#brands/devs-mentoring' },
    { label: 'coderiv', hint: 'mobile learning app', href: '#brands/coderiv' },
    { label: 'devs-hunting', hint: 'talent scouting', href: '#brands/devs-hunting' },
    // sala webinarowa (ring light, krzesła, schemat automatyzacji) → szyld Efektywniejsi
    { label: 'Efektywniejsi', hint: 'AI automation & training', href: '#brands/efektywniejsi' },
  ],
}

/** Ścieżka wyciętego pokoju (dokładny kształt, przezroczyste tło). */
export const roomSrc = (theme: Theme, i: number, small = false) => roomSrcOf(KEY[theme], i, small)
/** To samo, ale z jawnie wskazanego świata (sekcja, której treść nie zależy od trybu). */
export const roomSrcOf = (world: 'dev' | 'ceo', i: number, small = false) => `/diorama/v2/room-${world}-${i}${small ? '-sm' : ''}.webp`

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
