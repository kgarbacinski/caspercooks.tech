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
    title: 'Octant - Public Goods Funding',
    company: 'Golem Foundation',
    year: '2024-Present',
    type: 'developer',
    tech: ['Solidity', 'The Graph', 'tRPC', 'React'],
    description: 'Building Octant - an experiment in participatory public goods funding utilizing Golem\'s GLM token. Built V2 from scratch working with subgraph, smart contracts, tRPC, and React.js.',
    role: 'Senior Software / Web3 Engineer',
    logo: '/logos/golem.png',
    impact: 'Rebuilt entire platform V2, enabling decentralized funding for public goods projects',
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
    title: 'Many projects as an outsourcer',
    company: 'DAC.Digital',
    year: '2022-2025',
    type: 'developer',
    tech: ['Python', 'GoLang', 'Node.js', 'Kubernetes', 'Solidity'],
    description: 'Working with microservices and blockchain (private ledger). Built and maintained backend services for a leading DeFi protocol. Delivered 3 projects for different customers as an outsourcer.',
    role: 'Senior Software / Web3 Developer',
    logo: '/logos/dac_logo.png',
    impact: 'Built critical infrastructure for DeFi protocol, delivered 3 customer projects',
  },
  {
    id: 4,
    title: 'Microservices Architecture',
    company: 'Invicta',
    year: '2022-2023',
    type: 'developer',
    tech: ['Node.js', 'gRPC', 'Docker', 'Kubernetes'],
    description: 'Working in a start-up environment. Facilitated DevOps and architecture processes. Hands-on experience in microservices and Domain-Driven Design (DDD).',
    role: 'Software Developer',
    logo: '/logos/invicta.png',
    impact: 'Built scalable microservices from scratch, established DevOps best practices',
  },
  {
    id: 5,
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
    id: 6,
    title: 'Architect Consultant & Mentor',
    company: 'Fathom Group',
    year: 'Sep-Dec 2022',
    type: 'developer',
    tech: ['Architecture', 'Product Strategy', 'Team Management'],
    description: 'Helped company build product vision from scratch. Organized and facilitated development work and strategy for new product launch.',
    role: 'Architect Consultant & Mentor',
    logo: '/logos/fathom_logo.jpeg',
    impact: 'Established product vision and development strategy from ground zero',
  },
  {
    id: 7,
    title: 'Campaign Management Platform',
    company: 'Red Bull',
    year: '2022-2024',
    type: 'developer',
    tech: ['Python', 'Django', 'PostgreSQL', 'Redis'],
    description: 'Built enterprise monolithic application for campaign management. Led technical team, designed architecture, and delivered robust solution handling high-traffic events for major brand campaigns.',
    role: 'Tech Leader',
    logo: '/logos/redbull.png',
    impact: 'Led team delivering critical campaign infrastructure for global brand events',
  },
  {
    id: 8,
    title: 'Software Engineering Project',
    company: 'Inter Cars',
    year: 'Apr-Nov 2021',
    type: 'developer',
    tech: ['Software Engineering', 'Full-stack Development'],
    description: 'A 6-month contract during which I developed and contributed engineering value to the project as a Software Engineer.',
    role: 'Software Engineer',
    logo: '/logos/intercars_logo.webp',
    impact: '6-month successful contract delivery',
  },
  {
    id: 9,
    title: 'R&D Software Engineer',
    company: 'Nokia',
    year: '2020-2022',
    type: 'developer',
    tech: ['Python', 'Testing', 'Code Review', 'Team Management'],
    description: 'Responsible for improving processes, implementing features, analyzing bugs, designing solutions, and coordinating guidelines. Shared best practices through coaching and contributed to SW design decisions.',
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
    company: 'DevsH',
    year: '2017-2020',
    type: 'developer',
    tech: ['C++', 'Python', 'REST', 'Microservices', 'Unit Testing'],
    description: 'Started professional career while in high school. Supported companies with project estimations, designed software architecture, built and maintained microservices. Worked with databases and unit testing.',
    role: 'C++/Python Software Engineer',
    logo: '/logos/devsh.png',
    impact: 'First full-time role at age 16, built foundation in enterprise software development',
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
              : 'bg-gray-900/40 border-2 border-founder-accent shadow-lg shadow-founder-accent/20'
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
                <div className={`
                  relative w-12 h-12 flex items-center justify-center rounded-full overflow-hidden
                  ${project.company === 'Efektywniejsi' ? 'bg-gray-800 p-0.5' : 'bg-gray-100'}
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

            <h3 className="text-xl font-bold mb-1">{project.title}</h3>
            <p className={`text-sm mb-3 ${theme === 'founder' && isActive ? 'text-gray-300' : 'text-gray-400'}`}>
              {project.company} • {project.role}
            </p>

            <p className={`text-sm mb-4 ${theme === 'founder' && isActive ? 'text-gray-200' : 'text-gray-300'}`}>
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
            <p className={`text-sm ${theme === 'founder' && isActive ? 'text-gray-200' : 'text-gray-300'}`}>
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
  const [showAll, setShowAll] = useState(false)

  const developerProjects = projects.filter(p => p.type === 'developer')
  const founderProjects = projects.filter(p => p.type === 'founder')

  const visibleDeveloperProjects = showAll ? developerProjects : developerProjects.slice(0, 4)
  const visibleFounderProjects = showAll ? founderProjects : founderProjects.slice(0, 3)

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
              {visibleDeveloperProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>

            {/* Founder Column */}
            <div className="space-y-8">
              {visibleFounderProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </div>

          {/* Show More/Less Button */}
          {(developerProjects.length > 4 || founderProjects.length > 3) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="flex justify-center mt-12"
            >
              <button
                onClick={() => setShowAll(!showAll)}
                className={`
                  px-8 py-4 rounded-full font-mono font-medium transition-all duration-300
                  ${theme === 'developer'
                    ? 'bg-developer-accent text-developer-bg hover:bg-developer-accent/90'
                    : 'bg-founder-accent text-white hover:bg-founder-accent/90'}
                  shadow-lg hover:scale-105 transform
                `}
              >
                {showAll ? '↑ Show Less' : '↓ Show More Projects'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
