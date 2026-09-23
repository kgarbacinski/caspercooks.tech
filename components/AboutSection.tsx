'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useSafeReducedMotion'
import { FaGraduationCap, FaMobileAlt, FaBullseye, FaRobot } from 'react-icons/fa'
import type { IconType } from 'react-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { SectionHeader, EASE } from '@/components/ui/Section'
import { KEY, ROOMS, roomSrc } from '@/components/diorama/rooms'
import { FIG, ROOM_BOX } from '@/components/diorama/layout'
import RoomAmbient from '@/components/diorama/Ambient'

/**
 * About = pokój nr 1 z wyspy (Dev cave / CEO office).
 * Desktop: scena przypięta (sticky) — kamera powoli "wjeżdża" w pokój, a obok na tablicy
 * przypinają się kolejne notatki z historią (każda kolejna ląduje na wierzchu stosu).
 * Mobile: pokój na górze, notatki jedna pod drugą. Teksty bez zmian względem poprzedniej wersji.
 */

type Story = 'developer' | 'founder'
type Note = { body: ReactNode; icon?: IconType }

const hi = (t: ReactNode) => <mark className="hl">{t}</mark>
const b = (t: ReactNode) => <strong className="font-semibold text-ink">{t}</strong>

const STORIES: Record<Story, { title: string; notes: Note[]; stats: { value: number; suffix?: string; label: string }[] }> = {
  developer: {
    title: 'Developer Journey',
    notes: [
      {
        body: (
          <>
            {hi('Since 2015')}, I&apos;ve been crafting digital experiences and solving complex problems with code. Started my full-time career
            while still in high school, driven by passion and curiosity.
          </>
        ),
      },
      {
        body: (
          <>
            For me, {b('programming languages are just tools')}. With deep domain knowledge and adaptability, I write efficient code in any stack -
            from C++ and Python to production LLM agents.
          </>
        ),
      },
      {
        body: (
          <>
            Built systems from scratch for companies like {b('Invicta')} (microservices),
            {b(' Nokia')} (5G R&amp;D) and {b(' Red Bull')} (data + backend platform). Led technical teams and architected solutions for top-tier
            brands.
          </>
        ),
      },
      {
        body: (
          <>
            Currently focused on {hi('production AI')} - agentic, LLM-based systems on Temporal and RAG pipelines - alongside Web3 (dApps, Solidity,
            subgraphs). Always pushing boundaries and learning new paradigms.
          </>
        ),
      },
      {
        body: (
          <>
            As a mentor at {b('devs-mentoring.pl')}, I help Mid and Senior backend developers level up, change projects, and achieve their career
            goals.
          </>
        ),
      },
    ],
    stats: [
      { value: 10, suffix: '+', label: 'Years' },
      { value: 9, label: 'Projects' },
      { value: 5, label: 'From Scratch' },
    ],
  },
  founder: {
    title: 'Founder Story',
    notes: [
      {
        body: (
          <>
            Building products is one thing. {hi('Building companies that empower others')} is what drives me.
          </>
        ),
      },
      {
        icon: FaGraduationCap,
        body: (
          <>
            {b('devs-mentoring.pl')} - Assembled a team of 15 expert programming mentors, creating a platform where developers accelerate their
            careers through personalized guidance.
          </>
        ),
      },
      {
        icon: FaMobileAlt,
        body: (
          <>
            {b('coderiv.com')} - Envisioned and building a mobile application that will revolutionize how developers learn and collaborate.
          </>
        ),
      },
      {
        icon: FaBullseye,
        body: (
          <>
            {b('devs-hunting.com')} - Evaluated and coordinated project delivery for clients like Redsoft, connecting top talent with meaningful
            opportunities.
          </>
        ),
      },
      {
        icon: FaRobot,
        body: (
          <>
            {b('Efektywniejsi')} - Co-founded with 2 partners to teach people how to harness AI agents and n8n automation. Delivered numerous
            webinars, sharing knowledge with live audiences.
          </>
        ),
      },
      {
        body: (
          <>
            My mission: {b('Create ecosystems where developers thrive')}, combining technical expertise with business acumen to build sustainable,
            impactful ventures.
          </>
        ),
      },
    ],
    stats: [
      { value: 4, label: 'Brands' },
      { value: 15, suffix: '+', label: 'Mentors' },
      { value: 300, suffix: '+', label: 'Devs Helped' },
    ],
  },
}

// lekko losowe (ale stałe) przechylenia notatek
const TILT = [-2.2, 1.6, -1.1, 2.4, -1.8, 1.2]

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1400)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])
  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  )
}

function Stats({ items }: { items: { value: number; suffix?: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((s, i) => (
        <div key={s.label} className="stamp-ticket" style={{ rotate: `${[-2, 1.5, -1][i]}deg` }}>
          <div className="font-display text-3xl sm:text-4xl text-accent leading-none">
            <Counter value={s.value} suffix={s.suffix} />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-muted mt-2">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function StoryTabs({ story, setStory, lid }: { story: Story; setStory: (s: Story) => void; lid: string }) {
  return (
    <div role="tablist" aria-label="Story" className="inline-flex p-1 border border-cocoa-500/70 bg-cocoa-900/70 font-mono text-xs">
      {(['developer', 'founder'] as const).map((s) => (
        <button
          key={s}
          role="tab"
          aria-selected={story === s}
          onClick={() => setStory(s)}
          className={`relative px-3 sm:px-4 py-2 transition-colors ${story === s ? 'text-night' : 'text-paper-muted hover:text-paper'}`}
        >
          {story === s && <motion.span layoutId={lid} className="absolute inset-0 bg-accent" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
          <span className="relative">{STORIES[s].title}</span>
        </button>
      ))}
    </div>
  )
}

function NoteCard({ note, i, total, under = false }: { note: Note; i: number; total: number; under?: boolean }) {
  return (
    <div className="note-paper" style={{ rotate: `${TILT[i % TILT.length]}deg` }}>
      <span className="pin" aria-hidden="true" />
      <div className="flex items-baseline justify-between mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50">
        <span>note {String(i + 1).padStart(2, '0')}</span>
        <span>
          {i + 1}/{total}
        </span>
      </div>
      {/* notatka pod spodem stosu: sam papier, bez prześwitującego tekstu */}
      <p className="text-[15px] sm:text-base leading-relaxed text-ink/85 transition-opacity duration-300" style={under ? { opacity: 0 } : undefined}>
        {note.icon && <note.icon className="inline-block w-4 h-4 mr-2 -mt-0.5 text-terracotta" aria-hidden="true" />}
        {note.body}
      </p>
    </div>
  )
}

export default function AboutSection() {
  const { theme } = useTheme()
  const reduce = useReducedMotion()
  const [story, setStory] = useState<Story>(theme)
  useEffect(() => setStory(theme), [theme])
  const s = STORIES[story]
  const room = ROOMS[theme][0]

  // scena przypięta: postęp scrolla → aktywna notatka + zoom kamery w pokój
  const sceneRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ['start start', 'end end'] })
  // animacje w pokoju chodzą tylko, gdy scena jest w kadrze
  const sceneInView = useInView(sceneRef)
  // start dokładnie w skali 1 i bez przesunięcia: w tym miejscu kończy się wjazd kamery z hero
  const zoom = useSpring(useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.92]), { stiffness: 80, damping: 22 })
  const panY = useSpring(useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 14]), { stiffness: 80, damping: 22 })
  // pokój, figurka i poświata pojawiają się w chwili przypięcia sceny — do tego momentu
  // ten sam pokój pokazuje powiększona wyspa z hero (podmiana 1:1, bez skoku)
  const { scrollYProgress: pinIn } = useScroll({ target: sceneRef, offset: ['start end', 'start start'] })
  const shown = useTransform(pinIn, (v): number => (reduce ? 1 : v >= 0.985 ? 1 : 0))
  // położenie kolumny = 100vh·(1−q)^1.8 zamiast 100vh·(1−q): monotonicznie, szybciej na starcie,
  // z miękkim dojazdem do przypięcia (q = postęp wjazdu sceny od dołu ekranu do góry)
  const colY = useTransform(pinIn, (v) => (reduce ? '0vh' : `${(Math.pow(1 - v, 1.8) - (1 - v)) * 100}vh`))
  const glowBase = useTransform(scrollYProgress, [0, 0.5, 1], [0.35, 0.8, 0.55])
  const glow = useTransform([glowBase, shown], ([g, v]: number[]) => g * v)
  // figurka w tym samym miejscu względem pokoju co na wyspie
  const rb = ROOM_BOX[KEY[theme]][0]
  const fb = FIG[KEY[theme]]
  const figPos = {
    left: `${((fb.l - rb.l) / rb.w) * 100}%`,
    top: `${((fb.t - rb.t) / rb.h) * 100}%`,
    width: `${(fb.w / rb.w) * 100}%`,
    height: `${(fb.h / rb.h) * 100}%`,
  }
  const [active, setActive] = useState(0)
  const steps = s.notes.length + 1 // ostatni krok = statystyki
  useMotionValueEvent(scrollYProgress, 'change', (v) => setActive(Math.min(steps - 1, Math.floor(v * steps * 1.02))))

  return (
    // desktop z ruchem: sekcja nachodzi na ostatni ekran przypiętego hero (patrz HeroSection)
    <section id="about" className="relative z-20 scroll-mt-20 motion-safe:lg:-mt-[100vh]">
      <div className="lg:hidden max-w-6xl mx-auto px-4 sm:px-8 pt-20 sm:pt-28">
        <SectionHeader index="01" eyebrow="about.txt" title="About" />
      </div>

      {/* ——— desktop: przypięta scena ——— */}
      <div ref={sceneRef} className="relative hidden lg:block" style={{ height: `${steps * 62 + 60}vh` }}>
        <div data-dive-stage data-paused={sceneInView ? undefined : true} className="sticky top-0 h-screen overflow-x-clip">
          <div className="max-w-6xl mx-auto px-8 h-full grid grid-cols-[1.05fr_1fr] gap-10 items-center">
            {/* pokój, w który wjeżdża kamera */}
            <div className="relative h-[80vh] flex items-center justify-center">
              <motion.div
                aria-hidden="true"
                className="absolute inset-x-[8%] bottom-[6%] h-[40%] rounded-[50%] blur-3xl"
                style={{ background: 'rgb(var(--accent-rgb) / 0.22)', opacity: glow }}
              />
              <motion.div data-dive-target className="relative w-[74%] max-w-[430px] mr-[16%]" style={{ scale: zoom, y: panY, opacity: shown, transformOrigin: '50% 70%' }}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {/* pokój + jego żywe animacje składają się razem przy przełączeniu świata */}
                  <motion.div
                    key={theme}
                    className="relative"
                    style={{ transformOrigin: '50% 100%' }}
                    initial={{ rotateX: 86 }}
                    animate={{ rotateX: 0 }}
                    exit={{ rotateX: 86, transition: { duration: 0.3 } }}
                    transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.3 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={roomSrc(theme, 0)}
                      alt={`${room.label} — a papercraft room from the diorama`}
                      className="block w-full h-auto drop-shadow-[0_40px_40px_rgba(0,0,0,0.7)]"
                      // proporcje znane przed załadowaniem (pomiar celu kamery w hero)
                      style={{ aspectRatio: `${rb.w * 24} / ${rb.h * 12.24}` }}
                    />
                    {/* ten sam stan ekranów co w hero (wspólny model) — podmiana przy wjeździe kamery jest niewidoczna */}
                    {!reduce && <RoomAmbient world={KEY[theme]} room={0} run={sceneInView} show />}
                  </motion.div>
                </AnimatePresence>
                {/* figurka stoi w progu pokoju — dokładnie tam, gdzie na wyspie */}
                <div aria-hidden="true" className="absolute" style={figPos}>
                  <div className="absolute left-[-10%] right-[-10%] bottom-[-2.5%] h-[5%] rounded-[50%] bg-black/60 blur-[3px]" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/diorama/v2/fig-${KEY[theme]}.webp`} alt="" className="absolute inset-0 w-full h-full" />
                </div>
                {/* podpis przypięty do podstawy pokoju (pojawia się razem z pokojem) */}
                <div className="absolute -left-[6%] -bottom-[7%] z-10 paper-tag !text-left -rotate-2">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ink/70">room 01</span>
                  <span className="block font-display text-lg text-ink">{room.label}</span>
                </div>
              </motion.div>
            </div>

            {/* tablica z notatkami — przed przypięciem wjeżdża szybciej niż scroll, żeby prawa połowa
                kadru nie stała pusta, gdy kamera z hero dojeżdża do pokoju */}
            <motion.div className="relative" style={{ y: colY }}>
              <SectionHeader index="01" eyebrow="about.txt" title="About" className="mb-8" />
              <div className="flex items-center justify-between gap-4 mb-10">
                <StoryTabs story={story} setStory={setStory} lid="story-tab-d" />
                <span className="font-mono text-[11px] text-paper-dim tabular-nums">
                  {String(Math.min(active + 1, s.notes.length)).padStart(2, '0')} / {String(s.notes.length).padStart(2, '0')}
                </span>
              </div>
              {/* stos notatek jako siatka jednokomórkowa: wysokość = najdłuższa notatka + miejsce na przesunięcia
                  stosu (bez sztywnego 34vh, które zostawiało pustą dziurę nad biletami) */}
              <div className="relative grid pb-14">
                {s.notes.map((n, i) => {
                  const depth = Math.min(active, s.notes.length - 1) - i // 0 = na wierzchu
                  const shown = i <= active
                  return (
                    <motion.div
                      key={`${story}-${i}`}
                      className="[grid-area:1/1] self-start"
                      initial={false}
                      animate={
                        reduce
                          ? { opacity: depth === 0 ? 1 : 0 }
                          : shown
                            ? { opacity: depth > 2 ? 0 : 1, y: depth * 16, scale: 1 - depth * 0.045, rotateX: 0, filter: `brightness(${1 - depth * 0.16})` }
                            : { opacity: 0, y: 90, scale: 1.04, rotateX: -35, filter: 'brightness(1)' }
                      }
                      transition={{ duration: 0.6, ease: EASE }}
                      style={{ zIndex: 10 + i, transformOrigin: '50% 0%', transformPerspective: 900 }}
                    >
                      <NoteCard note={n} i={i} total={s.notes.length} under={!reduce && depth > 0} />
                    </motion.div>
                  )
                })}
              </div>
              <Stats key={story} items={s.stats} />
              {/* pasek postępu jak kabel */}
              <div className="mt-8 h-px bg-cocoa-500/50 relative overflow-hidden" aria-hidden="true">
                <motion.div className="absolute inset-y-0 left-0 w-full bg-accent shadow-glow origin-left" style={{ scaleX: scrollYProgress }} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ——— mobile / tablet: pokój + notatki w pionie ——— */}
      <div className="lg:hidden max-w-2xl mx-auto px-4 sm:px-8 pb-8">
        <div className="relative mx-auto w-[74%] max-w-[380px] mt-10 mb-16">
          <div aria-hidden="true" className="absolute inset-x-[5%] bottom-0 h-1/3 rounded-[50%] blur-3xl" style={{ background: 'rgb(var(--accent-rgb) / 0.22)' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={roomSrc(theme, 0, true)} alt={`${room.label} — a papercraft room from the diorama`} className="relative w-full h-auto drop-shadow-[0_30px_30px_rgba(0,0,0,0.7)]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/diorama/v2/fig-${KEY[theme]}.webp`} alt="" aria-hidden="true" className="absolute bottom-0 right-[-10%] h-[72%] w-auto" />
        </div>
        <div className="mb-8 flex justify-center">
          <StoryTabs story={story} setStory={setStory} lid="story-tab-m" />
        </div>
        <div className="space-y-6">
          {s.notes.map((n, i) => (
            <motion.div
              key={`${story}-m-${i}`}
              initial={reduce ? false : { opacity: 0, y: 30, rotateX: -30 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: EASE }}
              style={{ transformPerspective: 800, transformOrigin: '50% 0%' }}
            >
              <NoteCard note={n} i={i} total={s.notes.length} />
            </motion.div>
          ))}
        </div>
        <div className="mt-10">
          <Stats key={story} items={s.stats} />
        </div>
      </div>
    </section>
  )
}
