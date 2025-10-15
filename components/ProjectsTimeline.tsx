'use client'

import { motion, useInView } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useRef, useState } from 'react'
import Image from 'next/image'

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
    title: 'Web3 dApp & Smart Contracts',
    company: 'Golem Foundation',
    year: '2023-Present',
    type: 'developer',
    tech: ['Solidity', 'The Graph', 'React', 'Web3.js'],
    description: 'Full-stack Web3 development at Golem Foundation including smart contracts, subgraph implementation, and dApp frontend. Working with cutting-edge blockchain technologies in decentralized computing infrastructure.',
    role: 'Full-Stack Web3 Developer',
    logo: '/logos/golem.png',
  },
  {
    id: 2,
    title: 'Efektywniejsi AI Platform',
    company: 'Efektywniejsi',
    year: '2023-Present',
    type: 'founder',
    tech: ['AI Agents', 'n8n', 'Automation', 'Education'],
    description: 'Co-founded platform teaching people to leverage AI agents and n8n automation. Conducted multiple webinars and live sessions sharing knowledge.',
    impact: '500+ people educated on AI automation',
    role: 'Co-Founder & Educator',
    logo: '/logos/efektywniejsi.svg',
  },
  {
    id: 3,
    title: 'Microservices Architecture',
    company: 'Invicta',
    year: '2022-2023',
    type: 'developer',
    tech: ['Node.js', 'gRPC', 'Docker', 'Kubernetes'],
    description: 'Designed and built scalable microservices architecture from scratch. Implemented inter-service communication using gRPC, containerization with Docker, and orchestration with Kubernetes.',
    role: 'Senior Backend Developer & Architect',
    logo: '/logos/invicta.png',
  },
  {
    id: 4,
    title: 'devs-mentoring Platform',
    company: 'devs-mentoring.pl',
    year: '2021-Present',
    type: 'founder',
    tech: ['Team Building', 'Mentorship', 'Education'],
    description: 'Built and scaled a team of 15 expert programming mentors. Created a mentorship platform helping Mid and Senior developers advance their careers.',
    impact: '100+ developers mentored, 80% career advancement rate',
    role: 'Founder & Lead Organizer',
    logo: '/logos/devs-mentoring.png',
  },
  {
    id: 5,
    title: 'Campaign Management System',
    company: 'Red Bull',
    year: '2021-2022',
    type: 'developer',
    tech: ['Python', 'Django', 'PostgreSQL', 'Redis'],
    description: 'Built enterprise monolithic application for campaign management. Led technical team, designed architecture, and delivered robust solution handling high-traffic events.',
    role: 'Tech Lead',
    logo: '/logos/redbull.png',
  },
  {
    id: 6,
    title: 'coderiv Mobile App',
    company: 'coderiv.com',
    year: '2020-Present',
    type: 'founder',
    tech: ['Product Vision', 'Mobile Strategy', 'React Native'],
    description: 'Envisioned and building a revolutionary mobile application for developers. Focused on creating seamless learning experiences and collaboration tools.',
    impact: 'In development - aiming to serve 10k+ developers',
    role: 'Founder & Product Visionary',
    logo: '/logos/coderiv.png',
  },
  {
    id: 7,
    title: 'devs-hunting Agency',
    company: 'devs-hunting.com',
    year: '2020-Present',
    type: 'founder',
    tech: ['Project Management', 'Client Relations', 'Team Coordination'],
    description: 'Evaluated and coordinated delivery of development projects for clients like Redsoft. Connected top talent with meaningful opportunities.',
    impact: 'Delivered 20+ successful projects',
    role: 'Founder & Project Coordinator',
    logo: '/logos/devs-hunting.svg',
  },
  {
    id: 8,
    title: 'InfoMotion Platform',
    company: 'InfoMotion',
    year: '2019-2020',
    type: 'developer',
    tech: ['C++', 'Python', 'System Architecture'],
    description: 'Built complex system from ground up, handling data processing and visualization. Architected solution for enterprise-scale requirements.',
    role: 'Senior Developer & Architect',
    logo: '/logos/infomotion.png',
  },
  {
    id: 9,
    title: 'First Professional Experience',
    company: 'Early Career',
    year: '2017-2019',
    type: 'developer',
    tech: ['Full-stack Development', 'Learning & Growth'],
    description: 'Started professional career as full-time developer while still in high school. Built foundation in software development and gained real-world experience.',
    role: 'Junior Developer',
  },
]

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const { theme } = useTheme()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const isActive =
    (theme === 'developer' && project.type === 'developer') ||
    (theme === 'founder' && project.type === 'founder')

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative ${project.type === 'developer' ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}
      style={{ gridColumn: project.type === 'developer' ? '1' : '2' }}
    >
      <motion.div
        className={`
          p-6 rounded-xl cursor-pointer transition-all duration-500
          ${isActive
            ? project.type === 'developer'
              ? 'bg-developer-secondary border-2 border-developer-accent shadow-lg shadow-developer-accent/20'
              : 'bg-white border-2 border-founder-accent shadow-lg shadow-founder-accent/20'
            : 'bg-gray-800/30 border-2 border-gray-700 opacity-50'}
        `}
        whileHover={{ scale: isActive ? 1.02 : 1, opacity: isActive ? 1 : 0.7 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {!isFlipped ? (
          // Front of card
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-2xl ${project.type === 'developer' ? '💻' : '🚀'}`}>
                  {project.type === 'developer' ? '💻' : '🚀'}
                </span>
                <span className={`text-sm font-mono ${
                  project.type === 'developer' ? 'text-developer-accent' : 'text-founder-accent'
                }`}>
                  {project.year}
                </span>
              </div>
              {project.logo && (
                <div className="relative w-12 h-12 flex items-center justify-center rounded-full overflow-hidden bg-white p-1">
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

            <h3 className="text-xl font-bold mb-1">{project.title}</h3>
            <p className={`text-sm mb-3 ${theme === 'founder' && isActive ? 'text-gray-600' : 'text-gray-400'}`}>
              {project.company} • {project.role}
            </p>

            <p className={`text-sm mb-4 ${theme === 'founder' && isActive ? 'text-gray-700' : 'text-gray-300'}`}>
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.tech.map((tech, i) => (
                <span
                  key={i}
                  className={`
                    text-xs px-2 py-1 rounded-full
                    ${project.type === 'developer'
                      ? 'bg-developer-accent/20 text-developer-accent'
                      : 'bg-founder-accent/20 text-founder-accent'}
                  `}
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
              <span>Click to see impact</span>
              <span>↻</span>
            </div>
          </div>
        ) : (
          // Back of card - Impact
          <motion.div
            initial={{ rotateY: 180 }}
            animate={{ rotateY: 0 }}
            className="min-h-[200px] flex flex-col justify-center"
          >
            <h4 className="text-lg font-bold mb-4">Impact & Results</h4>
            <p className={`text-sm ${theme === 'founder' && isActive ? 'text-gray-700' : 'text-gray-300'}`}>
              {project.impact || 'Successfully delivered complex solution with high code quality and performance. Collaborated with cross-functional teams to exceed client expectations.'}
            </p>

            <div className="mt-6 text-xs text-gray-500 flex items-center gap-1">
              <span>Click to see details</span>
              <span>↻</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Timeline dot */}
      <div
        className={`
          hidden md:block absolute top-8 w-4 h-4 rounded-full border-4
          ${project.type === 'developer' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'}
          ${isActive
            ? project.type === 'developer'
              ? 'bg-developer-accent border-developer-bg'
              : 'bg-founder-accent border-founder-bg'
            : 'bg-gray-700 border-gray-900'}
        `}
      />
    </motion.div>
  )
}

export default function ProjectsTimeline() {
  const { theme } = useTheme()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const developerProjects = projects.filter(p => p.type === 'developer')
  const founderProjects = projects.filter(p => p.type === 'founder')

  return (
    <section id="projects" className="py-32 px-8 relative overflow-hidden" ref={ref}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-mono">
            <span className={theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'}>
              {'$ git log '}
            </span>
            --all --oneline
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-mono">
            {'// Dual-track journey: technical excellence + entrepreneurial ventures'}
            <br />
            {'// Click cards to flip and see impact metrics'}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Central line */}
          <div className={`
            hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2
            ${theme === 'developer' ? 'bg-developer-accent/30' : 'bg-founder-accent/30'}
          `} />

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            {/* Developer Column */}
            <div className="space-y-8">
              {developerProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>

            {/* Founder Column */}
            <div className="space-y-8">
              {founderProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
