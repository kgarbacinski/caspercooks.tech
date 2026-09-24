'use client'

/**
 * Jedna nawigacja po stronie dla pokoi dioramy, menu, CTA, stopki i wejścia z hashem w adresie.
 *
 * Adres celu: `#sekcja` albo głęboki link `#sekcja/element` (np. `#brands/coderiv`, `#projects/octant`,
 * `#stack/ai`). Cel liczony jest z układu (offsetTop, bez transformów animacji), z uwzględnieniem:
 *  - faktycznej wysokości paska nawigacji ([data-nav-bar]: h-16 / sm:h-20, a nie stałych 72 px),
 *  - przypiętych scen ([data-pin]: About, Projects) — lądujemy na starcie przypięcia, scena ma
 *    własny odstęp pod pasek; poziomy przejazd Projects liczy swój cel sam (registerTarget),
 *  - elementów w poziomych rzędach (mobile: marki, teczki) — rząd przewija się do elementu,
 *  - przesunięć po doładowaniu obrazów/fontów — po dojeździe cel liczony jest ponownie i w razie
 *    potrzeby poprawiany (także przez chwilę po dotarciu, dopóki użytkownik sam nie przewinie).
 * prefers-reduced-motion: skok bez animacji.
 */

export type DeepLink = { id: string; item?: string }
/** Własne wyliczenie celu (pozycja scrolla w px dokumentu) — null = domyślny algorytm. */
type Resolver = (item: string | undefined) => number | null

const resolvers = new Map<string, Resolver>()

/** Sekcja z nietypowym układem (np. przypięty poziomy przejazd) podaje własny cel. */
export function registerTarget(id: string, fn: Resolver) {
  resolvers.set(id, fn)
  return () => {
    if (resolvers.get(id) === fn) resolvers.delete(id)
  }
}

export function parseHash(href: string): DeepLink | null {
  const h = href.replace(/^.*#/, '')
  if (!h || h === 'top') return null
  const [id, item] = h.split('/')
  return { id: decodeURIComponent(id), item: item ? decodeURIComponent(item) : undefined }
}

const visible = (el: Element | null): el is HTMLElement => !!el && (el as HTMLElement).offsetParent !== null

/** Położenie w dokumencie bez transformów (animacje wejścia nie przesuwają celu). */
export function docTop(el: HTMLElement) {
  let t = 0
  let n: HTMLElement | null = el
  while (n) {
    t += n.offsetTop
    n = n.offsetParent as HTMLElement | null
  }
  return t
}

export function navBarHeight() {
  const bar = document.querySelector<HTMLElement>('[data-nav-bar]')
  return bar ? bar.getBoundingClientRect().height : 0
}

const gap = () => (window.innerWidth >= 640 ? 24 : 16)
const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight

/** Element głębokiego linku w sekcji (pierwszy widoczny — np. teczka desktopowa albo mobilna). */
export function findItem(sec: HTMLElement, item: string) {
  return [...sec.querySelectorAll<HTMLElement>(`[data-deep="${CSS.escape(item)}"]`)].find(visible) ?? null
}

/** Pozycja scrolla, przy której nagłówek sekcji (albo start przypiętej sceny) stoi pod paskiem. */
function sectionY(sec: HTMLElement) {
  const pin = [...sec.querySelectorAll<HTMLElement>('[data-pin]')].find(visible)
  if (pin?.parentElement) return docTop(pin.parentElement)
  const head = [...sec.querySelectorAll<HTMLElement>('header')].find(visible)
  return (head ? docTop(head) - gap() : docTop(sec)) - navBarHeight()
}

/** Pozioma oś przewijania elementu (mobile), o ile istnieje. */
function scrollRow(el: HTMLElement) {
  for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
    const o = getComputedStyle(n).overflowX
    if ((o === 'auto' || o === 'scroll') && n.scrollWidth > n.clientWidth + 1) return n
  }
  return null
}

function revealInRow(el: HTMLElement, smooth: boolean) {
  const row = scrollRow(el)
  if (!row) return
  // element przyciągania (snap-start / snap-center) — ten sam, który wybrałaby przeglądarka
  let snap: HTMLElement = el
  for (let n: HTMLElement | null = el; n && n !== row; n = n.parentElement) {
    if (getComputedStyle(n).scrollSnapAlign.split(' ')[0] !== 'none') {
      snap = n
      break
    }
  }
  const rr = row.getBoundingClientRect()
  const sr = snap.getBoundingClientRect()
  const cs = getComputedStyle(row)
  const align = getComputedStyle(snap).scrollSnapAlign.split(' ').pop()
  const x0 = row.scrollLeft + sr.left - rr.left
  const pad = parseFloat(cs.scrollPaddingLeft) || 0
  const left = align === 'center' ? x0 + sr.width / 2 - rr.width / 2 : x0 - pad
  row.scrollTo({ left: Math.max(0, left), behavior: smooth ? 'smooth' : 'auto' })
}

/** Domyślny cel elementu: nagłówek sekcji, jeśli element mieści się z nim na ekranie; inaczej sam element. */
function itemY(sec: HTMLElement, el: HTMLElement) {
  const nav = navBarHeight()
  const withHead = sectionY(sec)
  const bottom = docTop(el) + el.offsetHeight
  if (bottom <= withHead + window.innerHeight - gap()) return withHead
  return docTop(el) - nav - gap()
}

export function resolveY(link: DeepLink | null): number | null {
  if (!link) return 0
  const sec = document.getElementById(link.id)
  if (!sec) return null
  const custom = resolvers.get(link.id)?.(link.item)
  let y: number | null = custom ?? null
  if (y === null) {
    const el = link.item ? findItem(sec, link.item) : null
    y = el ? itemY(sec, el) : sectionY(sec)
  }
  return Math.round(Math.max(0, Math.min(maxScroll(), y)))
}

type LenisLike = {
  scrollTo: (t: number, o?: { immediate?: boolean; force?: boolean; duration?: number; onComplete?: () => void }) => void
}
const lenisOf = () => (window as unknown as { __lenis?: LenisLike }).__lenis

let token = 0

/** Przejście do celu: `#sekcja`, `#sekcja/element` albo `#` (góra strony). */
export function navigateTo(href: string, opts: { instant?: boolean } = {}) {
  const link = parseHash(href)
  if (link && !document.getElementById(link.id)) return false
  const my = ++token
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const instant = reduce || !!opts.instant
  // start: sekcja może przygotować stan (np. zakładka Stack) zanim policzymy cel
  window.dispatchEvent(new CustomEvent<DeepLink | null>('deeplink:go', { detail: link }))

  const sec = link ? document.getElementById(link.id) : null
  const item = sec && link?.item ? findItem(sec, link.item) : null
  if (item) revealInRow(item, !instant)

  const lenis = lenisOf()
  let tries = 0
  let landed = -1

  const jump = (y: number, first: boolean, done: () => void) => {
    if (lenis) {
      // (Lenis woła onComplete także przy immediate i gdy cel = bieżąca pozycja)
      lenis.scrollTo(y, { immediate: instant, force: true, ...(first ? {} : { duration: 0.45 }), onComplete: done })
    } else {
      window.scrollTo({ top: y, behavior: instant ? 'instant' : 'smooth' })
      if (instant) requestAnimationFrame(done)
      else {
        const t0 = performance.now()
        let last = -1
        const poll = () => {
          if (my !== token) return
          const s = window.scrollY
          if ((Math.abs(s - y) < 2 && s === last) || performance.now() - t0 > 3000) done()
          else {
            last = s
            requestAnimationFrame(poll)
          }
        }
        requestAnimationFrame(poll)
      }
    }
  }

  const arrive = () => {
    if (my !== token) return
    landed = window.scrollY
    if (item) {
      item.removeAttribute('data-flash')
      void item.offsetWidth
      item.setAttribute('data-flash', '')
      window.setTimeout(() => item.removeAttribute('data-flash'), 1800)
    }
    window.dispatchEvent(new CustomEvent<DeepLink | null>('deeplink:arrive', { detail: link }))
    // doładowane obrazy/fonty mogą jeszcze przesunąć cel — korekta, dopóki użytkownik stoi w miejscu
    ;[250, 700, 1400].forEach((ms) =>
      window.setTimeout(() => {
        if (my !== token || Math.abs(window.scrollY - landed) > 2) return
        const y = resolveY(link)
        if (y !== null && Math.abs(y - window.scrollY) > 3) {
          landed = y
          lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo({ top: y, behavior: 'instant' })
          window.setTimeout(() => {
            if (my === token) landed = window.scrollY
          }, 50)
        }
      }, ms),
    )
  }

  const check = () => {
    if (my !== token) return
    const y = resolveY(link)
    if (y !== null && Math.abs(y - window.scrollY) > 3 && tries++ < 3) jump(y, false, check)
    else arrive()
  }

  const y = resolveY(link)
  if (y === null) return false
  jump(y, true, check)
  return true
}
