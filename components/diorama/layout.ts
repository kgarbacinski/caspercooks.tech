// Wygenerowane z casper-room/v2/export.py — pozycje warstw dioramy w % kadru (2400×1224).
// Pokoje: dokładne kształty z segmentacji SAM; figurki wycięte z oryginalnych renderów Gemini.
export const FRAME = { w: 2400, h: 1224 }
export type Box = { l: number; t: number; w: number; h: number; px: number }
export const ROOM_BOX: Record<'dev' | 'ceo', Box[]> = {
  dev: [
    { l: 1.735, t: 5.219, w: 24.605, h: 56.505, px: 591 },
    { l: 22.484, t: 7.413, w: 20.324, h: 54.236, px: 488 },
    { l: 41.805, t: 3.177, w: 18.704, h: 58.396, px: 449 },
    { l: 59.236, t: 7.716, w: 19.707, h: 54.009, px: 473 },
    { l: 75.858, t: 5.295, w: 22.638, h: 56.43, px: 543 },
  ],
  ceo: [
    { l: 1.658, t: 5.144, w: 24.875, h: 56.732, px: 597 },
    { l: 22.522, t: 7.262, w: 20.247, h: 54.539, px: 486 },
    { l: 41.034, t: 2.95, w: 19.553, h: 59.002, px: 469 },
    { l: 58.504, t: 7.64, w: 20.44, h: 54.312, px: 491 },
    { l: 75.704, t: 5.068, w: 23.178, h: 56.884, px: 556 },
  ],
}
export const FIG = {
  dev: { l: 22.792, t: 21.634, w: 7.906, h: 43.116, jumpAspect: 0.698 },
  ceo: { l: 22.831, t: 21.331, w: 7.944, h: 43.419, jumpAspect: 0.71 },
}
