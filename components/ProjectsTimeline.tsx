'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useSafeReducedMotion'
import { useTheme } from '@/contexts/ThemeContext'
import { SectionHeader, EASE } from '@/components/ui/Section'

/**
 * Projekty = archiwum teczek (pokój "Infra" / "devs-mentoring").
 * Desktop: sekcja przypięta, a scroll przesuwa poziomy rząd papierowych teczek jak `git log`
 * (każda teczka = commit: hash, data, logo firmy jako pieczątka, impact na żółtej karteczce).
 * Najpierw ścieżka aktywnego trybu, potem druga. Mobile: przewijany palcem rząd teczek.
 * Treść projektów wg CV 2026.
 */

interface Project {
  id: number
  title: string
  company: string
  year: string
  type: 'developer' | 'founder'
  tech: string[]
  description: string
  impact?: string
  role: string
  logo?: string
}

// kolejność = `git log`: w obrębie toru od najnowszego (daty i role wg CV 2026); id stałe, bo liczy się z nich hash
const projects: Project[] = [
  {
    id: 1,
    title: 'Octant - Public Goods Funding',
    company: 'Golem Foundation',
    year: '02.2024-Present',
    type: 'developer',
    tech: ['Python', 'TypeScript', 'LLM / RAG', 'Temporal', 'Solidity', 'React'],
    description:
      'Built Octant V2 from scratch - architecture, agentic AI layer and smart contracts - distributing on-chain public-goods funding across multiple epochs.',
    role: 'Senior AI Engineer',
    logo: '/logos/golem.png',
    impact: 'Durable Temporal agent layer for long-running workflows; LLM spend cut via caching & model routing',
  },
  {
    id: 2,
    title: 'Efektywniejsi AI Automation',
    company: 'Efektywniejsi',
    year: '01.2025-04.2026',
    type: 'founder',
    tech: ['LLMs', 'Temporal', 'Agentic Workflows', 'n8n', 'FastAPI'],
    description:
      "Led AI engineering for an AI-powered automation ecosystem that removes repetitive manual steps from clients' marketing operations. Shipped production agentic automations; taught via live sessions and webinars.",
    impact: '200+ people trained on AI automation; production agentic automations shipped',
    role: 'Co-Founder & Leading AI Engineer',
    logo: '/logos/efektywniejsi.svg',
  },
  {
    id: 10,
    title: 'coderiv Mobile App',
    company: 'coderiv.com',
    year: '2024-Present',
    type: 'founder',
    tech: ['Product Vision', 'Mobile Strategy', 'React Native'],
    description:
      'Envisioned and building a revolutionary mobile application for developers. Focused on creating seamless learning experiences and collaboration tools.',
    impact: 'In development - aiming to serve 10k+ developers',
    role: 'Founder & Product Visionary',
    logo: '/logos/coderiv.png',
  },
  {
    id: 6,
    title: 'Architecture Consultant',
    company: 'Fathom Group',
    year: '08.2022-11.2022',
    type: 'developer',
    tech: ['Architecture', 'Product Strategy', 'Team Management'],
    description:
      'Shaped product vision and architecture from scratch for a UK launch. Organized and facilitated development work and strategy for the new product.',
    role: 'Architecture Consultant',
    logo: '/logos/fathom_logo.jpeg',
    impact: 'Established product vision and architecture from ground zero',
  },
  {
    id: 3,
    title: 'Client Products & DeFi Microservices',
    company: 'DAC Digital',
    year: '01.2022-02.2024',
    type: 'developer',
    tech: ['Python', 'GoLang', 'GraphQL', 'FastAPI', 'Django', 'AWS', 'CI/CD'],
    description:
      'Led a team of 4 (devs + PO) delivering 3 client products from scratch (AllCloud, Amini). Built Go microservices for a DeFi protocol on AWS (EC2, EKS, RDS, S3); drove Event Storming & DDD.',
    role: 'Backend Team Leader',
    logo: '/logos/dac_logo.png',
    impact: '3 client products delivered from scratch; Go microservices for a DeFi protocol on AWS',
  },
  {
    id: 7,
    title: 'Soccer Players Platform',
    company: 'Red Bull',
    year: '06.2021-01.2022',
    type: 'developer',
    tech: ['Python', 'Django', 'PostgreSQL', 'Redis'],
    description:
      'Built a data + backend platform for scouting soccer players. Led and mentored the engineering team, combining data and backend implementations.',
    role: 'Backend Team Leader',
    logo: '/logos/redbull.png',
    impact: 'Delivered a data + backend platform for player scouting; led the engineering team',
  },
  {
    id: 5,
    title: 'devs-mentoring Platform',
    company: 'devs-mentoring.pl',
    year: '03.2021-Present',
    type: 'founder',
    tech: ['Mentorship', 'Code Review', 'Python', 'Team Building'],
    description:
      'Founded and scaled a mentoring company: 15 expert mentors helping Mid and Senior developers advance their careers. Author of the training plan & materials; coaching and code review.',
    impact: '300+ developers mentored, 80+ five-star reviews',
    role: 'Founder, Mentor & Dev Leader',
    logo: '/logos/devs-mentoring.png',
  },
  {
    id: 11,
    title: 'devs-hunting Agency',
    company: 'devs-hunting.com',
    year: '2021-Present',
    type: 'founder',
    tech: ['Project Management', 'Client Relations', 'Team Coordination'],
    description:
      'Evaluated and coordinated delivery of development projects for clients like Redsoft. Connected top talent with meaningful opportunities.',
    impact: 'Delivered 20+ successful projects',
    role: 'Founder & Project Coordinator',
    logo: '/logos/devs-hunting.svg',
  },
  {
    id: 4,
    title: 'Microservices Architecture',
    company: 'Invicta',
    year: '06.2020-06.2021',
    type: 'developer',
    tech: ['Python', 'Flask', 'FastAPI', 'Docker', 'AWS', 'Nginx', 'CI/CD'],
    description:
      'Start-up environment. Led a DevOps transition (CI/CD) and built a microservices architecture from scratch; authored ADRs with direct business ownership.',
    role: 'Senior Software Developer',
    logo: '/logos/invicta.png',
    impact: 'Same-day releases after the DevOps transition; microservices built from scratch',
  },
  {
    id: 9,
    title: 'R&D Software Engineer',
    company: 'Nokia',
    year: '06.2019-06.2020',
    type: 'developer',
    tech: ['Python', 'C++', 'Flask', 'Docker', 'Kubernetes', 'PyTest'],
    description:
      'Delivered features, tests and process improvements in a large R&D organization (5G area): analyzing bugs, designing solutions and coordinating guidelines. Shared best practices through coaching and contributed to SW design decisions.',
    role: 'R&D Software Engineer',
    logo: '/logos/nokia_logo.jpg',
    impact: 'Led team management, established coding standards, mentored developers',
  },
  {
    id: 8,
    title: 'Short-Term Contract',
    company: 'Inter Cars',
    year: '12.2018-06.2019',
    type: 'developer',
    tech: ['Django', 'DRF', 'JavaScript', 'HTML & CSS', 'Celery'],
    description:
      'A 6-month contract during which I developed and contributed engineering value as a Software Engineer in a monolithic application.',
    role: 'Software Engineer',
    logo: '/logos/intercars_logo.webp',
    impact: '6-month successful contract delivery',
  },
  {
    id: 12,
    title: 'C++/Python Software Engineer',
    company: 'DevsHouse',
    year: '12.2015-12.2018',
    type: 'developer',
    tech: ['C++', 'Python', 'Flask', 'REST', 'SQL', 'Docker', 'Keycloak'],
    description:
      'Started professional career while in high school. Supported companies with project estimations, designed software architecture, built and maintained microservices for e-commerce platforms.',
    role: 'C++/Python Software Engineer',
    impact: 'First full-time role at age 16, built foundation in enterprise software development',
  },
]

/** skrót "commita" dla teczki — ozdobnik w stylu git log (stały dla projektu) */
const hash = (p: Project) => ((p.id * 2654435761) >>> 0).toString(16).slice(0, 7)
const TILTS = [-1.2, 0.8, -0.6, 1.1, -0.9, 0.5]

function Folder({ p, i, active }: { p: Project; i: number; active: boolean }) {
  const isDev = p.type === 'developer'
  return (
    <article
      className={`folder group relative shrink-0 w-[82vw] max-w-[26.25rem] sm:w-[26.25rem] lg:w-[25rem] xl:w-[26.875rem] ${isDev ? 'folder-dev' : 'folder-ceo'} ${active ? '' : 'folder-other'}`}
      style={{ rotate: `${TILTS[i % TILTS.length]}deg` }}
    >
      {/* zakładka teczki: hash commita + data */}
      <div className="folder-tab">
        <span className="text-accent">{hash(p)}</span>
        <span className="text-paper-dim">·</span>
        <span>{p.year}</span>
      </div>
      <div className="folder-body">
        <div className="flex items-start justify-between gap-4 mb-5">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] px-2 py-1 border border-ink/30 text-ink/75">
            <span className={`w-1.5 h-1.5 rounded-full ${isDev ? 'bg-[#0f9f5c]' : 'bg-[#d4541f]'}`} />
            {isDev ? 'dev track' : 'ceo track'}
          </span>
          {/* logo firmy jako pieczątka */}
          <div className="stamp-logo" aria-hidden={!p.logo}>
            {p.logo ? (
              <Image
                src={p.logo}
                alt={`${p.company} logo`}
                width={60}
                height={60}
                className={`object-contain ${p.company === 'Efektywniejsi' ? 'w-[92%] h-[92%] rounded-full bg-cocoa-900 p-1' : 'w-[70%] h-[70%]'}`}
              />
            ) : (
              <span className="font-display text-xl text-ink/70">{p.company.slice(0, 2)}</span>
            )}
          </div>
        </div>
        <h3 className="font-display text-[26px] leading-[1.1] text-paper mb-2">{p.title}</h3>
        <p className="font-mono text-xs text-paper-dim mb-4">
          {p.company} • {p.role}
        </p>
        <p className="text-[15px] text-paper-muted leading-relaxed mb-5">{p.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-16">
          {p.tech.map((t) => (
            <span key={t} className="label-chip">
              {t}
            </span>
          ))}
        </div>
      </div>
      {/* impact na żółtej karteczce przyklejonej do teczki */}
      <div className="sticky-note">
        <span className="block font-mono text-xs uppercase tracking-[0.2em] text-ink/55 mb-1">Impact &amp; Results</span>
        <span className="block text-[13.5px] leading-snug text-ink">
          {p.impact ||
            'Successfully delivered complex solution with high code quality and performance. Collaborated with cross-functional teams to exceed client expectations.'}
        </span>
      </div>
    </article>
  )
}

export default function ProjectsTimeline() {
  const { theme } = useTheme()
  const reduce = useReducedMotion()
  const mine = projects.filter((p) => p.type === theme)
  const other = projects.filter((p) => p.type !== theme)
  const ordered = [...mine, ...other]

  // przypięta sekcja: pionowy scroll → poziomy przejazd rzędu teczek
  const wrapRef = useRef<HTMLDivElement>(null)
  // mobile: po zmianie trybu kolejność teczek się zmienia — rząd wraca na początek
  // (inaczej przeglądarka trzyma w kadrze poprzednią pierwszą teczkę, np. Octant w trybie CEO)
  const rowRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (rowRef.current) rowRef.current.scrollLeft = 0
  }, [theme])
  const trackRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  // niski ekran (laptop 1280×720, tablet poziomo 1024×768): rząd teczek zmniejsza się tak, żeby
  // nagłówek, teczki z karteczkami i linia czasu zmieściły się między paskiem nawigacji a dołem ekranu
  const [fit, setFit] = useState({ s: 1, h: 0 })
  useEffect(() => {
    const measure = () => {
      const t = trackRef.current
      if (!t) return
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      const vh = window.innerHeight
      const head = headRef.current?.offsetHeight ?? 0
      const line = lineRef.current?.offsetHeight ?? 0
      // pasek nawigacji + odstęp pod nagłówkiem + wystająca karteczka + margines linii czasu i dołu
      const room = vh - 5 * rem - head - 2 * rem - line - 2.5 * rem - 2 * rem
      const natural = t.offsetHeight + 12 // karteczka jest w przepływie; zapas na jej obrót
      const s = Math.max(0.6, Math.min(1, room / natural))
      setFit({ s, h: t.offsetHeight * s })
      // koniec przejazdu: prawa krawędź ostatniej teczki równo z prawą krawędzią kolumny treści
      const last = t.lastElementChild as HTMLElement | null
      if (!last) return
      const pad = Math.max(2 * rem, (window.innerWidth - 72 * rem) / 2 + 2 * rem)
      setDist(Math.max(0, pad + (last.offsetLeft + last.offsetWidth) * s + pad - window.innerWidth))
    }
    measure()
    // czcionki (Fraunces) zmieniają wysokość nagłówka po załadowaniu
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [theme])
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })
  // bez dodatkowej sprężyny: scroll wygładza już Lenis (podwójne wygładzanie = opóźnienie)
  const x = useTransform(scrollYProgress, [0.08, 0.96], [0, -dist])
  const [idx, setIdx] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setIdx(Math.min(ordered.length - 1, Math.floor(v * ordered.length))))

  // compact = przypięta scena na desktopie: na niskim ekranie mniejszy tytuł i bez drugiego wiersza leadu
  const header = (compact: boolean) => (
    <SectionHeader
      index="02"
      eyebrow="Projects"
      title={
        <span
          className={`font-mono tracking-normal whitespace-nowrap ${
            compact ? 'text-5xl [@media(max-height:820px)]:text-4xl' : 'text-[clamp(1.125rem,6.4vw,1.625rem)] sm:text-4xl md:text-5xl'
          }`}
        >
          git log --all --oneline
        </span>
      }
      lead={
        <>
          Dual-track journey: technical excellence + entrepreneurial ventures
          <br className={compact ? '[@media(max-height:820px)]:hidden' : ''} />
          <span className={`text-paper-dim text-base ${compact ? '[@media(max-height:820px)]:hidden' : ''}`}>
            Scroll through the archive — impact is on the sticky notes
          </span>
        </>
      }
    />
  )

  return (
    <section id="projects" className="relative scroll-mt-20">
      {/* desktop: przypięty poziomy przejazd */}
      <div ref={wrapRef} className="relative hidden lg:block" style={{ height: `calc(100vh + ${dist}px)` }}>
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col [justify-content:safe_center] pt-20">
          <div ref={headRef} className="max-w-6xl w-full mx-auto px-8 mb-8 flex items-end justify-between gap-8">
            {header(true)}
            <div className="shrink-0 text-right font-mono text-xs text-paper-dim pb-2">
              <div className="text-accent text-2xl font-display tabular-nums">
                {String(idx + 1).padStart(2, '0')}
                <span className="text-paper-dim text-base"> / {String(ordered.length).padStart(2, '0')}</span>
              </div>
              <div className="mt-1 uppercase tracking-[0.18em]">{ordered[idx].type === theme ? 'current track' : 'the other track'}</div>
            </div>
          </div>
          <div data-rwd-carousel className="pl-[max(2rem,calc((100vw-72rem)/2+2rem))] pt-6" style={fit.h ? { height: fit.h + 24 } : undefined}>
          {/* przesunięcie idzie 1:1 za scrollem (także przy reduced motion — inaczej teczki za kadrem byłyby nieosiągalne) */}
          <motion.div ref={trackRef} className="flex items-start gap-10 w-max" style={{ x, scale: fit.s, transformOrigin: '0 0' }}>
            {ordered.map((p, i) => (
              <div key={p.id} className="flex items-start gap-10">
                {i === mine.length && (
                  <div className="shrink-0 self-stretch w-24 grid place-items-center">
                    <span className="[writing-mode:vertical-rl] rotate-180 px-3 py-5 bg-cream text-ink font-mono text-xs uppercase tracking-[0.24em] shadow-[0_18px_30px_-12px_rgba(0,0,0,0.9)]">
                      the other track →
                    </span>
                  </div>
                )}
                <Folder p={p} i={i} active={p.type === theme} />
              </div>
            ))}
          </motion.div>
          </div>
          {/* linia czasu jak kabel z impulsem = postęp */}
          <div ref={lineRef} className="max-w-6xl w-full mx-auto px-8 pt-10" aria-hidden="true">
            <div className="relative h-px bg-cocoa-500/50">
              <motion.div className="absolute inset-y-0 left-0 w-full bg-accent shadow-glow origin-left" style={{ scaleX: scrollYProgress }} />
              {ordered.map((p, i) => (
                <span
                  key={p.id}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full ring-4 ring-night transition-colors ${i <= idx ? 'bg-accent' : 'bg-cocoa-500'}`}
                  style={{ left: `${(i / (ordered.length - 1)) * 100}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* mobile / tablet: rząd teczek przewijany palcem */}
      <div className="lg:hidden pt-20 sm:pt-28 pb-2">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 mb-10">{header(false)}</div>
        <div ref={rowRef} data-rwd-carousel className="flex gap-5 overflow-x-auto snap-x snap-mandatory px-4 sm:px-8 pt-8 pb-10 no-scrollbar" style={{ scrollPaddingInline: '1rem' }}>
          {ordered.map((p, i) => (
            <motion.div
              key={p.id}
              className="snap-start"
              initial={reduce ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE, delay: Math.min(i, 3) * 0.06 }}
            >
              <Folder p={p} i={i} active={p.type === theme} />
            </motion.div>
          ))}
        </div>
        <p className="px-4 font-mono text-xs uppercase tracking-[0.18em] text-paper-dim text-center">swipe → {ordered.length} commits</p>
      </div>
    </section>
  )
}
