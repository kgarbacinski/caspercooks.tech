'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useInView } from 'framer-motion'
import { Section } from '@/components/ui/Section'
import { FaLaptopCode, FaRocket } from 'react-icons/fa'

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
    description: 'Built Octant V2 from scratch - architecture, agentic AI layer (LLM/RAG on Temporal) and smart-contract integration for on-chain public-goods funding on Golem\'s GLM token.',
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
    description: 'Co-founded platform teaching people to leverage AI agents and n8n automation. Conducted multiple webinars and live sessions sharing knowledge.',
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
    description: 'Led a team of 4 building microservices for a leading DeFi protocol (private ledger blockchain). Drove Event Storming & DDD; delivered 3 projects for different customers as a contractor.',
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
    description: 'Working in a start-up environment. Led a DevOps transition and built microservices architecture from scratch. Hands-on with Domain-Driven Design (DDD) and direct business ownership.',
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
    description: 'Built and scaled a team of 15 expert programming mentors. Created a mentorship platform helping Mid and Senior developers advance their careers.',
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
    description: 'Helped company build product vision from scratch. Organized and facilitated development work and strategy for new product launch in the UK.',
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
    description: 'Built a data + backend platform for scouting soccer players. Led and mentored the engineering team, combining data and backend implementations.',
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
    description: 'A 6-month contract during which I developed and contributed engineering value to the project as a Software Engineer in the monolithic application.',
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
    description: 'Responsible for improving processes, implementing features, analyzing bugs, designing solutions, and coordinating guidelines in the 5G area. Shared best practices through coaching and contributed to SW design decisions.',
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
    description: 'Envisioned and building a revolutionary mobile application for developers. Focused on creating seamless learning experiences and collaboration tools.',
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
    description: 'Evaluated and coordinated delivery of development projects for clients like Redsoft. Connected top talent with meaningful opportunities.',
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
    description: 'Started professional career while in high school. Supported companies with project estimations, designed software architecture, built and maintained microservices for e-commerce platforms.',
    role: 'C++/Python Software Engineer',
    impact: 'First full-time role at age 16, built foundation in enterprise software development',
  },
]

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const { theme } = useTheme()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isActive =
    (theme === 'developer' && project.type === 'developer') ||
    (theme === 'founder' && project.type === 'founder')

  const isDev = project.type === 'developer'

  return (
    <motion.div
      ref={ref}
      initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={isMobile ? {} : {
        duration: 0.6,
        delay: index * 0.08,
        ease: 'easeOut'
      }}
      className={`relative pl-8 ${isDev ? 'md:pl-0 md:pr-10 md:text-right' : 'md:pl-10'}`}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        onClick={() => setIsFlipped(!isFlipped)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsFlipped(!isFlipped)
          }
        }}
        className={`
          paper-card p-6 sm:p-8 cursor-pointer transition duration-300
          min-h-[320px] sm:min-h-[380px]
          focus:outline-none focus-visible:border-accent
          ${isActive
            ? 'hover:border-accent/50 hover:-translate-y-1'
            : 'opacity-50 hover:opacity-70'}
        `}
      >
        {!isFlipped ? (
          // Front of card
          <div className="flex flex-col h-full">
            <div className={`flex items-center justify-between gap-4 mb-5 ${isDev ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-2">
                {isDev
                  ? <FaLaptopCode className="w-4 h-4 text-paper-muted" />
                  : <FaRocket className="w-4 h-4 text-paper-muted" />
                }
                <span className={`font-mono text-xs ${isActive ? 'text-accent' : 'text-paper-dim'}`}>
                  {project.year}
                </span>
              </div>
              {project.logo && (
                <div className={`
                  relative w-11 h-11 shrink-0 flex items-center justify-center rounded-full overflow-hidden
                  border border-cocoa-500/60
                  ${project.company === 'Efektywniejsi' ? 'bg-cocoa-900 p-0.5' : 'bg-paper'}
                  ${project.company === 'coderiv.com' ? 'p-0.5' : project.company === 'Efektywniejsi' ? '' : 'p-1'}
                `}>
                  <Image
                    src={project.logo}
                    alt={`${project.company} logo`}
                    width={48}
                    height={48}
                    className="object-contain rounded-full"
                  />
                </div>
              )}
            </div>

            <h3 className="font-display text-2xl leading-tight text-paper mb-2">{project.title}</h3>
            <p className="font-mono text-xs text-paper-dim mb-4">
              {project.company} • {project.role}
            </p>

            <p className="text-sm text-paper-muted leading-relaxed mb-5">
              {project.description}
            </p>

            <div className={`flex flex-wrap gap-2 ${isDev ? 'md:justify-end' : ''}`}>
              {project.tech.map((tech, i) => (
                <span
                  key={i}
                  className="font-mono text-[11px] px-2 py-1 border border-cocoa-500/60 text-paper-muted"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className={`mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-paper-dim flex items-center gap-1.5 ${isDev ? 'md:justify-end' : ''}`}>
              <span>Click to see impact</span>
              <span className="text-accent">↻</span>
            </div>
          </div>
        ) : (
          // Back of card - Impact
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="h-full flex flex-col justify-center py-8"
          >
            <div>
              <p className="eyebrow mb-3">{project.company}</p>
              <h4 className="font-display text-2xl text-paper mb-4">Impact & Results</h4>
              <p className="text-base text-paper-muted leading-relaxed">
                {project.impact || 'Successfully delivered complex solution with high code quality and performance. Collaborated with cross-functional teams to exceed client expectations.'}
              </p>

              <div className={`mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-paper-dim flex items-center gap-1.5 ${isDev ? 'md:justify-end' : ''}`}>
                <span>Click to see details</span>
                <span className="text-accent">↻</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Timeline dot */}
      <div
        aria-hidden="true"
        className={`
          absolute top-9 w-2.5 h-2.5 rounded-full ring-4 ring-night
          left-0 -translate-x-1/2
          ${isDev ? 'md:left-auto md:right-0 md:translate-x-1/2' : 'md:left-0 md:-translate-x-1/2'}
          ${isActive ? 'bg-accent' : 'bg-cocoa-500'}
        `}
        style={isActive ? { boxShadow: '0 0 12px rgb(var(--accent-rgb) / 0.6)' } : undefined}
      />
    </motion.div>
  )
}

export default function ProjectsTimeline() {
  const { theme } = useTheme()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [showAll, setShowAll] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if desktop on mount and window resize
  useEffect(() => {
    const checkScreen = () => {
      setIsDesktop(window.innerWidth >= 768)
      setIsMobile(window.innerWidth < 768)
    }

    checkScreen()
    window.addEventListener('resize', checkScreen)
    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  const developerProjects = projects.filter(p => p.type === 'developer')
  const founderProjects = projects.filter(p => p.type === 'founder')

  const visibleDeveloperProjects = showAll ? developerProjects : developerProjects.slice(0, 4)
  const visibleFounderProjects = showAll ? founderProjects : founderProjects.slice(0, 3)

  return (
    <Section
      id="projects"
      index="02"
      eyebrow="Projects"
      title={<span className="font-mono text-3xl sm:text-4xl md:text-5xl tracking-normal">git log --all --oneline</span>}
      lead={
        <>
          Dual-track journey: technical excellence + entrepreneurial ventures
          <br />
          <span className="text-paper-dim text-base">Click cards to flip and see impact metrics</span>
        </>
      }
    >
      <div ref={ref} className="relative">
        {/* Timeline line: left on mobile, centered on desktop */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-0 w-px bg-cocoa-500/60 md:left-1/2 md:-translate-x-1/2"
        />

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-0">
          {/* Developer Column - always render on desktop, conditionally on mobile */}
          {(theme === 'developer' || isDesktop) && (
            <div className="space-y-8">
              {visibleDeveloperProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          )}

          {/* Founder Column - always render on desktop, conditionally on mobile */}
          {(theme === 'founder' || isDesktop) && (
            <div className="space-y-8 md:pt-24">
              {visibleFounderProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Show More/Less Button */}
        {(developerProjects.length > 4 || founderProjects.length > 3) && (
          <motion.div
            initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={isMobile ? {} : {
              duration: 0.6,
              delay: 0.6,
              ease: 'easeOut'
            }}
            className="relative flex justify-center mt-14 bg-night py-2"
          >
            <button onClick={() => setShowAll(!showAll)} className="btn-ghost bg-night">
              {showAll ? '↑ Show Less' : '↓ Show More Projects'}
            </button>
          </motion.div>
        )}
      </div>
    </Section>
  )
}
