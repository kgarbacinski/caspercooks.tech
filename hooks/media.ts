/**
 * Układ "desktop" (przypięte sceny, wjazd kamery, dwie kolumny) = szeroki ekran, który NIE jest pionowy.
 * Pionowy tablet ≥ 1024 px (np. iPad Pro 12.9" 1024×1366) dostaje układ tabletowy — w desktopowym
 * treść zajmowała górne 40% ekranu, a reszta stała pusta.
 * Ta sama definicja steruje breakpointami Tailwinda (lg/xl/2xl) i warunkami w JS.
 */
const LANDSCAPE = '(min-aspect-ratio: 4/5)'
export const MQ = {
  lg: `(min-width: 1024px) and ${LANDSCAPE}`,
  xl: `(min-width: 1280px) and ${LANDSCAPE}`,
  '2xl': `(min-width: 1536px) and ${LANDSCAPE}`,
}
/** zaprzeczenie `lg` (mobile + tablet, także pionowy ≥ 1024 px) */
export const MQ_BELOW_LG = `not all and (min-width: 1024px) and ${LANDSCAPE}`
