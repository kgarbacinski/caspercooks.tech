'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useSafeReducedMotion'
import { useTheme } from '@/contexts/ThemeContext'
import { SectionHeader, EASE } from '@/components/ui/Section'

/**
 * Projekty = archiwum teczek (pokój "Infra" / "devs-mentoring").
 * Desktop: sekcja przypięta, a scroll przesuwa poziomy rząd papierowych teczek jak `git log`
 * (każda teczka = commit: hash, data, logo firmy jako pieczątka, impact na żółtej karteczce).
 * Najpierw ścieżka aktywnego trybu, potem druga. Mobile: przewijany palcem rząd teczek.
 * Treść projektów bez zmian.
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

const projects: Project[] = [
  {
    id: 1,
    title: 'Octant - Public Goods Funding',
    company: 'Golem Foundation',
    year: '02.2024-Present',
    type: 'developer',
    tech: ['Python', 'LLM / RAG', 'Temporal', 'Solidity', 'tRPC', 'React'],
    description:
      "Built Octant V2 from scratch - architecture, agentic AI layer (LLM/RAG on Temporal) and smart-contract integration for on-chain public-goods funding on Golem's GLM token.",
    role: 'Senior AI Engineer',
    logo: '/logos/golem.png',
    impact: 'Rebuilt entire platform V2, enabling decentralized funding for public goods projects',
  },
  {
    id: 2,
    title: 'Efektywniejsi AI Platform',
    company: 'Efektywniejsi',
    year: '2025-Present',
    type: 'founder',
    tech: ['AI Agents', 'n8n', 'Automation', 'Education'],
    description:
      'Co-founded platform teaching people to leverage AI agents and n8n automation. Conducted multiple webinars and live sessions sharing knowledge.',
    impact: '200+ people educated on AI automation',
    role: 'Co-Founder & Educator',
    logo: '/logos/efektywniejsi.svg',
  },
  {
    id: 3,
    title: 'Many projects as an outsourcer',
    company: 'DAC.Digital',
    year: '01.2022-02.2024',
    type: 'developer',
    tech: ['Python', 'GoLang', 'GraphQL', 'FastAPI', 'Kubernetes', 'CI/CD'],
    description:
      'Led a team of 4 building microservices for a leading DeFi protocol (private ledger blockchain). Drove Event Storming & DDD; delivered 3 projects for different customers as a contractor.',
    role: 'Backend Team Leader',
    logo: '/logos/dac_logo.png',
    impact: 'Built critical infrastructure for DeFi protocol, delivered 3 customer projects',
  },
  {
    id: 4,
    title: 'Microservices Architecture',
    company: 'Invicta',
    year: '06.2020-06.2021',
    type: 'developer',
    tech: ['Python', 'Flask', 'FastAPI', 'Docker', 'AWS', 'CI/CD'],
    description:
      'Working in a start-up environment. Led a DevOps transition and built microservices architecture from scratch. Hands-on with Domain-Driven Design (DDD) and direct business ownership.',
    role: 'Senior Software Developer',
    logo: '/logos/invicta.png',
    impact: 'Built scalable microservices from scratch, established DevOps best practices',
  },
  {
    id: 5,
    title: 'devs-mentoring Platform',
    company: 'devs-mentoring.pl',
    year: '03.2021-Present',
    type: 'founder',
    tech: ['Team Building', 'Mentorship', 'Education'],
    description:
      'Built and scaled a team of 15 expert programming mentors. Created a mentorship platform helping Mid and Senior developers advance their careers.',
    impact: '300+ developers mentored, 90% career advancement rate',
    role: 'Founder & Lead Organizer',
    logo: '/logos/devs-mentoring.png',
  },
  {
    id: 6,
    title: 'Architect Consultant & Mentor',
    company: 'Fathom Group',
    year: '08.2022-11.2022',
    type: 'developer',
    tech: ['Architecture', 'Product Strategy', 'Team Management'],
    description:
      'Helped company build product vision from scratch. Organized and facilitated development work and strategy for new product launch in the UK.',
    role: 'Architect Consultant & Mentor',
    logo: '/logos/fathom_logo.jpeg',
    impact: 'Established product vision and development strategy from ground zero',
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
    id: 8,
    title: 'Software Engineering Project',
    company: 'Inter Cars',
    year: '12.2018-06.2019',
    type: 'developer',
    tech: ['Software Engineering', 'Full-stack Development'],
    description:
      'A 6-month contract during which I developed and contributed engineering value to the project as a Software Engineer in the monolithic application.',
    role: 'Software Engineer',
    logo: '/logos/intercars_logo.webp',
    impact: '6-month successful contract delivery',
  },
  {
    id: 9,
    title: 'R&D Software Engineer',
    company: 'Nokia',
    year: '06.2019-06.2020',
    type: 'developer',
    tech: ['Python', 'Testing', 'Code Review', 'Team Management'],
    description:
      'Responsible for improving processes, implementing features, analyzing bugs, designing solutions, and coordinating guidelines in the 5G area. Shared best practices through coaching and contributed to SW design decisions.',
    role: 'R&D Software Engineer',
    logo: '/logos/nokia_logo.jpg',
    impact: 'Led team management, established coding standards, mentored developers',
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
    id: 12,
    title: 'C++/Python Software Engineer',
    company: 'DevsHouse',
    year: '12.2015-12.2018',
    type: 'developer',
    tech: ['C++', 'Python', 'REST', 'Microservices', 'Unit Testing'],
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
      className={`folder group relative shrink-0 w-[82vw] sm:w-[420px] lg:w-[400px] xl:w-[430px] ${isDev ? 'folder-dev' : 'folder-ceo'} ${active ? '' : 'folder-other'}`}
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
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-1 border border-ink/30 text-ink/75">
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
        <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-ink/55 mb-1">Impact &amp; Results</span>
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
  const trackRef = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  useEffect(() => {
    const measure = () => {
      const t = trackRef.current
      if (!t) return
      setDist(Math.max(0, t.scrollWidth - window.innerWidth + 64))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [theme])
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })
  const x = useSpring(useTransform(scrollYProgress, [0.08, 0.96], [0, -dist]), { stiffness: 90, damping: 24, mass: 0.6 })
  const [idx, setIdx] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setIdx(Math.min(ordered.length - 1, Math.floor(v * ordered.length))))

  const header = (
    <SectionHeader
      index="02"
      eyebrow="Projects"
      title={<span className="font-mono text-3xl sm:text-4xl md:text-5xl tracking-normal">git log --all --oneline</span>}
      lead={
        <>
          Dual-track journey: technical excellence + entrepreneurial ventures
          <br />
          <span className="text-paper-dim text-base">Scroll through the archive — impact is on the sticky notes</span>
        </>
      }
    />
  )

  return (
    <section id="projects" className="relative scroll-mt-20">
      {/* desktop: przypięty poziomy przejazd */}
      <div ref={wrapRef} className="relative hidden lg:block" style={{ height: `calc(100vh + ${dist}px)` }}>
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
          <div className="max-w-6xl w-full mx-auto px-8 mb-10 flex items-end justify-between gap-8">
            {header}
            <div className="shrink-0 text-right font-mono text-xs text-paper-dim pb-2">
              <div className="text-accent text-2xl font-display tabular-nums">
                {String(idx + 1).padStart(2, '0')}
                <span className="text-paper-dim text-base"> / {String(ordered.length).padStart(2, '0')}</span>
              </div>
              <div className="mt-1 uppercase tracking-[0.18em]">{ordered[idx].type === theme ? 'current track' : 'the other track'}</div>
            </div>
          </div>
          <motion.div ref={trackRef} className="flex items-start gap-10 pl-[max(2rem,calc((100vw-72rem)/2+2rem))] pr-16 pt-6" style={{ x: reduce ? 0 : x }}>
            {ordered.map((p, i) => (
              <div key={p.id} className="flex items-start gap-10">
                {i === mine.length && (
                  <div className="shrink-0 self-center w-40 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-paper-dim">
                    <div className="h-px bg-cocoa-500/60 mb-3" />
                    the other track →
                    <div className="h-px bg-cocoa-500/60 mt-3" />
                  </div>
                )}
                <Folder p={p} i={i} active={p.type === theme} />
              </div>
            ))}
          </motion.div>
          {/* linia czasu jak kabel z impulsem = postęp */}
          <div className="max-w-6xl w-full mx-auto px-8 mt-14" aria-hidden="true">
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
      <div className="lg:hidden pt-24 sm:pt-32 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 mb-10">{header}</div>
        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory px-4 sm:px-8 pt-8 pb-14 no-scrollbar" style={{ scrollPaddingInline: '1rem' }}>
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
        <p className="px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-paper-dim text-center">swipe → {ordered.length} commits</p>
      </div>
    </section>
  )
}
