import type { Theme } from '@/contexts/ThemeContext'

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
    { label: 'Efektywniejsi', hint: 'AI webinars', href: '#studio' },
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
