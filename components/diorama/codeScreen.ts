/**
 * Ekrany z kodem w dioramie: model "ktoś tu pracuje" + rysowanie na canvasie w układzie ekranu.
 * Tekst rysujemy jak w grafice — świecące belki słów (przy tej skali glify i tak są nieczytelne).
 * Model jest współdzielony (jeden na ekran), więc dwie instancje tego samego pokoju
 * (hero i scena About) pokazują dokładnie to samo.
 */

type Tok = { n: number; c: number } // n znaków, c = indeks koloru (-1 = spacja)
type Line = { ind: number; toks: Tok[]; len: number }

export type ScreenCfg = {
  mode: 'code' | 'log'
  rows: number // widoczne wiersze
  cols: number // znaki na szerokość ekranu
  left: number // lewy margines tekstu (ułamek szerokości)
  top: number // górny margines (ułamek wysokości)
  gutter?: 'line' | 'nums' // pionowa kreska (edytor) albo numery linii
  palette: string[] // [zwykły, słowo kluczowe, komentarz/przygaszony, interpunkcja/akcent]
  num?: string // kolor numerów linii (inny niż komentarz, żeby nie udawały tekstu)
  glow: string
  seed: number
  bar: number // grubość belki względem odstępu wierszy
}

// deterministyczny generator (mulberry32) — ten sam przebieg na serwerze i w każdej instancji
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

class Model {
  cfg: ScreenCfg
  r: () => number
  lines: Line[] = []
  depth = 0
  typed = 0 // wpisane znaki bieżącego wiersza (tryb code)
  next = 0 // czas kolejnego zdarzenia
  phase: 'type' | 'eol' | 'back' = 'type'
  backLeft = 0
  lastKey = -1e9
  scrollFrom = 0
  scrollAt = -1e9
  version = 0
  t = -1
  blink = 0

  constructor(cfg: ScreenCfg) {
    this.cfg = cfg
    this.r = rng(cfg.seed)
    // ekran startuje zapełniony (jak w grafice), kursor na ostatnim wierszu
    const fill = cfg.rows - (cfg.mode === 'code' ? 2 : 1)
    for (let i = 0; i < fill; i++) this.lines.push(this.gen())
    if (cfg.mode === 'code') this.lines.push(this.gen())
    this.scrollFrom = this.top()
  }

  rand(a: number, b: number) {
    return a + (b - a) * this.r()
  }
  int(a: number, b: number) {
    return Math.floor(this.rand(a, b + 1))
  }

  /** wiersz pseudokodu z zachowaniem wcięć i domknięć bloków */
  gen(): Line {
    const { cols, mode } = this.cfg
    const toks: Tok[] = []
    const push = (n: number, c: number) => {
      if (toks.length) toks.push({ n: 1, c: -1 })
      toks.push({ n, c })
    }
    if (mode === 'log') {
      push(8, 2) // znacznik czasu
      push(this.r() < 0.18 ? 4 : 3, this.r() < 0.18 ? 3 : 1) // poziom (czasem akcent)
      let left = this.int(Math.round(cols * 0.35), Math.round(cols * 0.8)) - 13
      while (left > 2) {
        const w = Math.min(left, this.int(2, 9))
        push(w, 0)
        left -= w + 1
      }
      return this.line(0, toks)
    }
    const d = this.depth
    const x = this.r()
    let ind = d
    if (d > 0 && (x < 0.16 + d * 0.07 || d >= 3)) {
      // domknięcie bloku
      this.depth--
      ind = this.depth
      push(1, 3)
      if (this.r() < 0.3) toks.push({ n: 1, c: 3 })
    } else if (x < 0.3 || d === 0) {
      // otwarcie: słowo kluczowe + nazwa + (...) {
      push(this.int(3, 6), 1)
      push(this.int(4, 11), 0)
      toks.push({ n: this.int(2, 7), c: 3 })
      push(1, 3)
      this.depth++
    } else if (x < 0.4) {
      push(this.int(8, Math.round(cols * 0.42)), 2) // komentarz (nie dłuższy niż linie w grafice)
    } else if (x < 0.46) {
      return this.line(ind, []) // pusty wiersz
    } else {
      if (this.r() < 0.55) push(this.int(3, 5), 1)
      push(this.int(3, 9), 0)
      if (this.r() < 0.7) {
        push(1, 3)
        push(this.int(4, 14), 0)
        if (this.r() < 0.5) toks.push({ n: this.int(2, 8), c: 3 })
      }
    }
    // przytnij do szerokości ekranu
    const max = cols - ind * 2 - 1
    let len = 0
    const out: Tok[] = []
    for (const t of toks) {
      if (len + t.n > max) break
      out.push(t)
      len += t.n
    }
    return this.line(ind, out)
  }

  line(ind: number, toks: Tok[]): Line {
    return { ind, toks, len: toks.reduce((s, t) => s + t.n, 0) }
  }

  top() {
    // pierwszy widoczny wiersz; w logu ostatni wiersz ekranu to znak zachęty
    const vis = this.cfg.mode === 'log' ? this.cfg.rows - 1 : this.cfg.rows
    return Math.max(0, this.lines.length - vis)
  }

  newLine(t: number, l: Line) {
    this.scrollFrom = this.scrollNow(t)
    this.lines.push(l)
    this.scrollAt = t
    // pamięć: trzymamy tylko to, co może być widoczne
    if (this.lines.length > this.cfg.rows * 3) {
      const cut = this.lines.length - this.cfg.rows * 2
      this.lines.splice(0, cut)
      this.scrollFrom -= cut
    }
  }

  scrollNow(t: number) {
    const k = Math.min(1, (t - this.scrollAt) / 320)
    const e = k < 1 ? 1 - Math.pow(1 - k, 3) : 1
    return this.scrollFrom + (this.top() - this.scrollFrom) * e
  }

  step(t: number) {
    if (t === this.t) return
    this.t = t
    let changed = false
    let guard = 0
    while (t >= this.next && guard++ < 40) {
      changed = true
      this.event()
    }
    if (t - this.scrollAt < 340) changed = true
    const b = Math.floor(t / 530) % 2
    if (b !== this.blink) {
      this.blink = b
      changed = true
    }
    if (changed) this.version++
  }

  event() {
    const t = this.next
    if (this.cfg.mode === 'log') {
      this.newLine(t, this.gen())
      // czasem seria (wynik builda), zwykle spokojnie
      const burst = this.r() < 0.22
      this.next = t + (burst ? this.rand(90, 170) : this.rand(1400, 4200))
      if (burst && this.r() < 0.35) this.next += this.rand(900, 1400)
      return
    }
    const cur = this.lines[this.lines.length - 1]
    if (this.phase === 'back') {
      this.typed = Math.max(0, this.typed - 1)
      this.lastKey = t
      if (--this.backLeft <= 0) this.phase = 'type'
      this.next = t + this.rand(45, 75)
      return
    }
    if (this.phase === 'eol') {
      this.newLine(t, this.gen())
      this.typed = 0
      this.phase = 'type'
      this.next = t + this.rand(60, 160)
      return
    }
    if (this.typed >= cur.len) {
      // koniec wiersza: krótka pauza, czasem dłuższe "myślenie"
      this.phase = 'eol'
      // pisanie seriami: co kilka wierszy dłuższa przerwa (ekran stoi, miga tylko kursor)
      const think = this.r() < 0.3
      this.next = t + (think ? this.rand(2800, 6500) : this.rand(160, 560))
      return
    }
    this.typed++
    this.lastKey = t
    // literówka: kilka znaków w tył i ponownie
    if (this.typed > 4 && this.r() < 0.018) {
      this.phase = 'back'
      this.backLeft = this.int(2, 4)
      this.next = t + this.rand(220, 380)
      return
    }
    const sp = this.charAt(cur, this.typed) === -1
    this.next = t + (sp ? this.rand(35, 70) : this.rand(55, 125)) * (this.r() < 0.06 ? 3 : 1)
  }

  charAt(l: Line, i: number) {
    let s = 0
    for (const tk of l.toks) {
      s += tk.n
      if (i <= s) return tk.c
    }
    return 0
  }
}

const models = new Map<string, Model>()
export function getModel(id: string, cfg: ScreenCfg) {
  let m = models.get(id)
  if (!m) {
    m = new Model(cfg)
    models.set(id, m)
  }
  return m
}
export type ScreenModel = Model

/** rysowanie w układzie ekranu (canvas już przekształcony CSS-em na czworokąt ekranu) */
export function draw(ctx: CanvasRenderingContext2D, m: Model, W: number, H: number) {
  const c = m.cfg
  const t = m.t
  ctx.clearRect(0, 0, W, H)
  const pitch = (H * (1 - c.top * 2)) / c.rows
  const cw = (W * (1 - c.left - 0.03)) / c.cols
  const th = Math.max(1, pitch * c.bar)
  const x0 = W * c.left
  const y0 = H * c.top
  const sc = m.scrollNow(t)
  const first = Math.floor(sc)
  const frac = sc - first
  ctx.save()
  // wiersze wjeżdżające i wyjeżdżające przy przewijaniu są przycinane do stałego marginesu
  ctx.beginPath()
  ctx.rect(0, y0 * 0.55, W, H - y0 * 1.1)
  ctx.clip()
  ctx.shadowColor = c.glow
  ctx.shadowBlur = pitch * 0.45

  if (c.gutter === 'line') {
    ctx.fillStyle = c.palette[2]
    ctx.globalAlpha = 0.55
    ctx.fillRect(W * c.left * 0.42, y0 * 0.6, Math.max(1, cw * 0.35), H - y0 * 1.2)
    ctx.globalAlpha = 1
  }
  const isLog = c.mode === 'log'
  const n = m.lines.length
  const last = isLog ? n : n - 1 // indeks wiersza z kursorem
  for (let row = 0; row <= c.rows; row++) {
    const li = first + row
    if (li > last) break
    const y = y0 + (row - frac) * pitch + (pitch - th) / 2
    if (y < y0 * 0.55 - pitch || y > H) continue
    // wiersz wyjeżdżający górą gaśnie zamiast być ścinany pod belką okna
    ctx.globalAlpha = Math.max(0, Math.min(1, (y - y0 * 0.8) / (pitch * 0.35)))
    if (c.gutter === 'nums') {
      const ga = ctx.globalAlpha
      ctx.fillStyle = c.num ?? c.palette[2]
      ctx.globalAlpha = ga * 0.8
      ctx.fillRect(W * c.left * 0.3, y, cw * (li % 10 === 9 ? 2 : 1.3), th)
      ctx.globalAlpha = ga
    }
    let x = x0
    let limit = Infinity
    let caretX = -1
    if (isLog && li === n) {
      // znak zachęty terminala
      ctx.fillStyle = c.palette[3]
      ctx.fillRect(x, y, cw * 1.2, th)
      caretX = x + cw * 2
    } else {
      const l = m.lines[li]
      if (!l) continue
      x += l.ind * 2 * cw
      if (!isLog && li === last) limit = m.typed
      let used = 0
      for (const tk of l.toks) {
        if (used >= limit) break
        const k = Math.min(tk.n, limit - used)
        if (tk.c >= 0) {
          ctx.fillStyle = c.palette[tk.c]
          ctx.fillRect(x, y, k * cw - cw * 0.18, th)
        }
        x += k * cw
        used += k
      }
      if (li === last) caretX = x + cw * 0.15
    }
    if (caretX >= 0) {
      const typing = t - m.lastKey < 450
      if (typing || m.blink === 0) {
        ctx.fillStyle = c.palette[0]
        ctx.fillRect(caretX, y - th * 0.35, cw * 0.75, th * 1.7)
      }
    }
  }
  ctx.globalAlpha = 1
  ctx.restore()
}
