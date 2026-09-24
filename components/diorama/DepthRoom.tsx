'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, MutableRefObject, RefObject } from 'react'

/**
 * Pokój 2.5D: ta sama grafika pokoju + mapa głębi z AI (Depth Anything V2, casper-room/v3/depth.py)
 * → przesunięcie paralaksy liczone na GPU (WebGL, jeden quad). Bliskie ściany i meble przesuwają się
 * względem tylnej ściany, więc płaski render wygląda jak prawdziwa makieta oglądana pod kątem.
 *
 * Zasady:
 *  - poza chwilą, w której `active`, na stronie jest zwykły <img> (zero kosztu, zero kontekstów GL),
 *  - kontekst GL powstaje przy aktywacji i jest zwalniany, gdy widok wróci do zera,
 *  - pętla rAF chodzi tylko wtedy, gdy widok się rusza (cel ≠ bieżące położenie),
 *  - żywe animacje pokoju (warstwa ambient z Ambient.tsx) leżą na płaskiej warstwie DOM: punkt zerowy
 *    paralaksy to średnia głębia pod ich sprite'ami, a same sprite'y są "zamrożone" (maska w shaderze),
 *    więc nic się nie rozjeżdża,
 *  - opcjonalny kontur (papierowa krawędź przy hoverze) liczony z alfy PRZESUNIĘTEGO obrazu,
 *  - `followers`: elementy DOM stojące przed pokojem (figurka) przesuwane jak obiekty o danej głębi.
 */

export type DepthTarget = { x: number; y: number }

type Props = {
  src: string
  /** warianty rozdzielczości (retina): przeglądarka wybiera plik wg zmierzonej szerokości i DPR,
   *  a tekstura WebGL bierze ten sam plik (img.currentSrc) */
  srcSet?: string
  /** szacunek szerokości przed pierwszym pomiarem (potem liczy się zmierzona szerokość) */
  sizes?: string
  depth: string
  /** cel widoku w [-1, 1] (x: kursor w prawo, y: kursor w dół) — czytany co klatkę */
  target: MutableRefObject<DepthTarget>
  active: boolean
  /** maksymalne przesunięcie (ułamek szerokości pokoju) na jednostkę różnicy głębi */
  amp?: number
  /** warstwa ambient pokoju (z [data-amb-art]) — jej sprite'y zostają nieruchome */
  freeze?: RefObject<HTMLElement | null>
  /** papierowa krawędź po konturze (hover w hero) */
  rim?: boolean
  followers?: { el: RefObject<HTMLElement | null>; depth: number }[]
  /** klasy/styl <img> i canvasa (filtry jasności itp.) */
  className?: string
  style?: CSSProperties
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>
  /** ile miejsca (ułamek boku) canvas ma na kontur poza obrysem pokoju */
  pad?: number
  /** canvas przejął obraz (rodzic może schować własny kontur DOM) */
  onLive?: (live: boolean) => void
}

const VS = `attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}`
const FS = `precision mediump float;
varying vec2 v;
uniform sampler2D uTex,uDep;
uniform vec2 uOff,uPad,uPx;
uniform float uRef,uRim;
uniform vec4 uFz[8];
uniform int uN;
float frz(vec2 q){float f=0.;for(int i=0;i<8;i++){if(i>=uN)break;vec4 r=uFz[i];vec2 d=max(r.xy-q,q-r.zw);f=max(f,1.-smoothstep(0.,.035,max(d.x,d.y)));}return f;}
vec2 src(vec2 q){
  float d=texture2D(uDep,q).r;
  return q-uOff*(d-uRef)*(1.-frz(q));
}
float inb(vec2 q){return step(0.,q.x)*step(q.x,1.)*step(0.,q.y)*step(q.y,1.);}
vec4 col(vec2 q){vec2 u=src(q);return texture2D(uTex,u)*inb(u);}
void main(){
  vec2 q=(v-uPad)/(1.-2.*uPad);
  vec4 c=col(q);
  if(uRim>0.){
    float a=0.;
    for(int i=0;i<8;i++){float t=float(i)*.785398;a=max(a,col(q+vec2(cos(t),sin(t))*uPx*2.).a);}
    float rim=clamp(a-c.a,0.,1.)*uRim;
    vec3 rc=mix(vec3(1.,.886,.722),vec3(1.,.71,.42),clamp(q.y,0.,1.));
    c=vec4(c.rgb+rc*rim*(1.-c.a),c.a+rim*(1.-c.a));
  }
  gl_FragColor=c;
}`

// głębia pod elementami (średnia) — czytana z małej kopii mapy na CPU
const depthCache = new Map<string, Promise<{ data: Uint8ClampedArray; w: number; h: number } | null>>()
function depthPixels(src: string) {
  let p = depthCache.get(src)
  if (!p) {
    p = new Promise((res) => {
      const img = new Image()
      img.onload = () => {
        const w = 96
        const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w))
        const c = document.createElement('canvas')
        c.width = w
        c.height = h
        const ctx = c.getContext('2d', { willReadFrequently: true })
        if (!ctx) return res(null)
        ctx.drawImage(img, 0, 0, w, h)
        res({ data: ctx.getImageData(0, 0, w, h).data, w, h })
      }
      img.onerror = () => res(null)
      img.src = src
    })
    depthCache.set(src, p)
  }
  return p
}
function meanDepth(px: { data: Uint8ClampedArray; w: number; h: number }, rects: number[][]) {
  let s = 0
  let n = 0
  const all = rects.length ? rects : [[0, 0, 1, 1]]
  for (const [x0, y0, x1, y1] of all)
    for (let y = Math.max(0, Math.floor(y0 * px.h)); y < Math.min(px.h, Math.ceil(y1 * px.h)); y++)
      for (let x = Math.max(0, Math.floor(x0 * px.w)); x < Math.min(px.w, Math.ceil(x1 * px.w)); x++) {
        s += px.data[(y * px.w + x) * 4]
        n++
      }
  return n ? s / n / 255 : 0.5
}

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image()
    im.decoding = 'async'
    im.onload = () => res(im)
    im.onerror = rej
    im.src = src
  })
}

export default function DepthRoom({ src, srcSet, sizes: sizesHint, depth, target, active, amp = 0.05, freeze, rim, followers, className = '', style, imgProps, pad = 0, onLive }: Props) {
  const [gl, setGl] = useState(false) // canvas zamontowany
  const imgRef = useRef<HTMLImageElement>(null)
  // sizes = faktyczna szerokość <img> w px (tylko rośnie — bez podmiany na mniejszy plik)
  const [sizes, setSizes] = useState<string | undefined>(sizesHint)
  // rodzic może podnieść szacunek (np. przed zbliżeniem kamery) — wtedy przeglądarka dobiera większy plik
  useEffect(() => {
    if (sizesHint && !sizesHint.includes('(')) setSizes(sizesHint)
  }, [sizesHint])
  useEffect(() => {
    const im = imgRef.current
    if (!srcSet || !im) return
    const ro = new ResizeObserver(() => {
      const w = Math.ceil(im.offsetWidth)
      if (w > 0) setSizes((s) => (s && s.endsWith('px') && parseInt(s) >= w ? s : `${w}px`))
    })
    ro.observe(im)
    return () => ro.disconnect()
  }, [srcSet])
  // tekstura WebGL = ten sam plik, który wybrała przeglądarka; zmiana wariantu podmienia teksturę w locie
  const swapTex = useRef<(im: HTMLImageElement) => void>(() => {})
  const texSrc = useRef('')
  const pickSrc = () => {
    // currentSrc tylko, jeśli to wariant tego samego pokoju (po zmianie motywu nowy plik może się jeszcze ładować)
    const cs = imgRef.current?.currentSrc
    return cs && cs.includes(src.replace(/\.\w+$/, '')) ? cs : src
  }
  const [live, setLive] = useState(false) // canvas pokazuje obraz (img ukryty)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)
  activeRef.current = active
  const kick = useRef<() => void>(() => {})
  const onLiveRef = useRef(onLive)
  onLiveRef.current = onLive
  useEffect(() => onLiveRef.current?.(live), [live])

  useEffect(() => {
    if (active) {
      setGl(true)
      kick.current()
    }
  }, [active])

  useEffect(() => {
    if (!gl) return
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false })
    if (!ctx) {
      setGl(false)
      return
    }
    const g = ctx
    let raf = 0
    let dead = false
    const cur = { x: 0, y: 0 }
    const drawn = { x: 0, y: 0 }
    let rimCur = 0 // kontur gaśnie razem z hoverem (jak kontur DOM), a nie dopiero po powrocie widoku
    let rimDrawn = -1
    let ready = false
    let uRef = 0.5
    let fz: number[][] = []
    const fol = (followers ?? []).map((f) => ({ ...f, px: 0 }))

    const sh = (type: number, s: string) => {
      const o = g.createShader(type)!
      g.shaderSource(o, s)
      g.compileShader(o)
      return o
    }
    const prog = g.createProgram()!
    g.attachShader(prog, sh(g.VERTEX_SHADER, VS))
    g.attachShader(prog, sh(g.FRAGMENT_SHADER, FS))
    g.linkProgram(prog)
    g.useProgram(prog)
    const buf = g.createBuffer()
    g.bindBuffer(g.ARRAY_BUFFER, buf)
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW)
    const loc = g.getAttribLocation(prog, 'p')
    g.enableVertexAttribArray(loc)
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0)
    const U = (n: string) => g.getUniformLocation(prog, n)
    const uOff = U('uOff')
    const uRefL = U('uRef')
    const uRimL = U('uRim')
    const uPad = U('uPad')
    const uPx = U('uPx')
    const uN = U('uN')
    const uFz = U('uFz')
    g.uniform1i(U('uTex'), 0)
    g.uniform1i(U('uDep'), 1)

    const tex = (unit: number, im: HTMLImageElement, premul: boolean) => {
      const t = g.createTexture()
      g.activeTexture(g.TEXTURE0 + unit)
      g.bindTexture(g.TEXTURE_2D, t)
      g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premul)
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, im)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)
    }

    const size = () => {
      const r = cv.getBoundingClientRect()
      const dpr = Math.min(3, window.devicePixelRatio || 1) // 3× (telefony): tekstura -lg ma tę rozdzielczość
      // rozmiar bez transformu rodzica (hover skaluje pokój) — offsetWidth
      const w = Math.max(1, Math.round(cv.offsetWidth * dpr))
      const h = Math.max(1, Math.round(cv.offsetHeight * dpr))
      if (cv.width !== w || cv.height !== h) {
        cv.width = w
        cv.height = h
      }
      g.viewport(0, 0, w, h)
      g.uniform2f(uPx, 1 / Math.max(1, cv.offsetWidth * (1 - 2 * pad)), 1 / Math.max(1, cv.offsetHeight * (1 - 2 * pad)))
      return r
    }

    const measureFreeze = async () => {
      const root = freeze?.current?.querySelector<HTMLElement>('[data-amb-art]')
      const cr = cv.getBoundingClientRect()
      const iw = cr.width * (1 - 2 * pad)
      const ih = cr.height * (1 - 2 * pad)
      const ix = cr.left + cr.width * pad
      const iy = cr.top + cr.height * pad
      let rects: number[][] = []
      if (root && iw > 0) {
        rects = Array.from(root.children).map((el) => {
          const r = el.getBoundingClientRect()
          return [(r.left - ix) / iw, (r.top - iy) / ih, (r.right - ix) / iw, (r.bottom - iy) / ih]
        })
        rects = rects.filter((r) => r[2] > r[0] && r[3] > r[1])
        if (rects.length > 8) {
          // dużo drobnych elementów (okna miasta) → jeden wspólny prostokąt
          rects = [[Math.min(...rects.map((r) => r[0])), Math.min(...rects.map((r) => r[1])), Math.max(...rects.map((r) => r[2])), Math.max(...rects.map((r) => r[3]))]]
        }
      }
      fz = rects
      const px = await depthPixels(depth)
      uRef = px ? meanDepth(px, rects) : 0.5
    }

    const draw = () => {
      g.uniform2f(uOff, cur.x * amp, cur.y * amp * (cv.offsetWidth / Math.max(1, cv.offsetHeight)))
      g.uniform1f(uRefL, uRef)
      g.uniform1f(uRimL, rim ? rimCur : 0)
      g.uniform2f(uPad, pad, pad)
      g.uniform1i(uN, fz.length)
      if (fz.length) g.uniform4fv(uFz, new Float32Array(fz.flat().concat(Array(32 - fz.length * 4).fill(0))))
      g.clearColor(0, 0, 0, 0)
      g.clear(g.COLOR_BUFFER_BIT)
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4)
      // obiekty przed pokojem: przesunięcie w px jak punkt o danej głębi
      const wpx = cv.offsetWidth * (1 - 2 * pad)
      const hpx = cv.offsetHeight * (1 - 2 * pad)
      for (const f of fol) {
        const el = f.el.current
        if (!el) continue
        const dx = -cur.x * amp * (f.depth - uRef) * wpx
        const dy = -cur.y * amp * (f.depth - uRef) * (cv.offsetWidth / Math.max(1, cv.offsetHeight)) * hpx
        el.style.transform = Math.abs(dx) + Math.abs(dy) < 0.01 ? '' : `translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0)`
      }
    }

    const tick = () => {
      raf = 0
      if (dead || !ready) return
      const t = activeRef.current ? target.current : { x: 0, y: 0 }
      cur.x += (t.x - cur.x) * 0.09
      cur.y += (t.y - cur.y) * 0.09
      const still = Math.abs(t.x - cur.x) < 0.002 && Math.abs(t.y - cur.y) < 0.002 && (activeRef.current || rimCur === 0)
      if (still) {
        cur.x = t.x
        cur.y = t.y
      }
      // stoi w miejscu → bez rysowania (pętla tylko sprawdza cel, koszt pomijalny)
      const rt = activeRef.current ? 0.9 : 0
      rimCur += (rt - rimCur) * 0.35
      if (Math.abs(rt - rimCur) < 0.01) rimCur = rt
      if (cur.x !== drawn.x || cur.y !== drawn.y || rimCur !== rimDrawn) {
        draw()
        drawn.x = cur.x
        drawn.y = cur.y
        rimDrawn = rimCur
      }
      if (!activeRef.current && still) {
        // widok wrócił do zera: najpierw z powrotem zwykły <img> (canvas niewidoczny),
        // dopiero dwie klatki później zdejmujemy canvas i zwalniamy kontekst GL (bez mignięcia)
        setLive(false)
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (!activeRef.current) setGl(false)
            else {
              setLive(true)
              start()
            }
          }),
        )
        return
      }
      raf = requestAnimationFrame(tick)
    }
    const start = () => {
      if (!raf && !dead) raf = requestAnimationFrame(tick)
    }
    kick.current = start
    const ro = new ResizeObserver(() => {
      if (!ready) return
      size()
      draw()
    })
    ro.observe(cv)

    const first = pickSrc()
    swapTex.current = (im) => {
      if (dead || !ready) return
      g.activeTexture(g.TEXTURE0)
      const old = g.getParameter(g.TEXTURE_BINDING_2D)
      tex(0, im, true)
      if (old) g.deleteTexture(old)
      draw()
    }
    Promise.all([loadImg(first), loadImg(depth), measureFreeze()])
      .then(([im, dm]) => {
        if (dead) return
        texSrc.current = first
        tex(0, im, true)
        tex(1, dm, false)
        size()
        ready = true
        draw()
        // pierwsza klatka narysowana → podmiana img na canvas w następnej klatce (bez mignięcia)
        requestAnimationFrame(() => {
          if (!dead) setLive(true)
        })
        start()
      })
      .catch(() => setGl(false))

    return () => {
      dead = true
      kick.current = () => {}
      cancelAnimationFrame(raf)
      ro.disconnect()
      for (const f of fol) if (f.el.current) f.el.current.style.transform = ''
      g.getExtension('WEBGL_lose_context')?.loseContext()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, src, depth])

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img
        {...imgProps}
        ref={imgRef}
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        onLoad={(e) => {
          imgProps?.onLoad?.(e)
          // przeglądarka dobrała większy wariant → ta sama rozdzielczość w teksturze
          const cs = e.currentTarget.currentSrc
          if (texSrc.current && cs && cs !== texSrc.current) {
            texSrc.current = cs
            loadImg(cs).then((im) => swapTex.current(im)).catch(() => {})
          }
        }}
        draggable={false} className={className} style={{ ...style, ...(live ? { opacity: 0 } : null) }} />
      {gl && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={className}
          style={{
            ...style,
            animation: 'none',
            position: 'absolute',
            left: `${-pad * 100 / (1 - 2 * pad)}%`,
            top: `${-pad * 100 / (1 - 2 * pad)}%`,
            width: `${100 / (1 - 2 * pad)}%`,
            height: `${100 / (1 - 2 * pad)}%`,
            opacity: live ? 1 : 0,
            background: 'transparent',
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  )
}
