'use client'

import { motion, useInView } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useRef, useState } from 'react'

interface Technology {
  name: string
  category: 'web2' | 'web3' | 'languages' | 'tools'
  icon: string
  projects: string[]
}

const technologies: Technology[] = [
  // Languages
  { name: 'TypeScript', category: 'languages', icon: '🔷', projects: ['Web3 dApps', 'Fullstack Applications', 'Type-safe Systems'] },
  { name: 'Python', category: 'languages', icon: '🐍', projects: ['Enterprise Web Apps', 'Backend Services', 'System Programming'] },
  { name: 'Node.js', category: 'languages', icon: '💚', projects: ['Microservices Architecture', 'Real-time Systems', 'API Development'] },
  { name: 'C++', category: 'languages', icon: '⚡', projects: ['Low-level Systems', 'Performance-critical Apps', 'System Architecture'] },
  { name: 'Solidity', category: 'languages', icon: '💎', projects: ['Smart Contracts', 'DeFi Protocols', 'Blockchain Development'] },

  // Web2
  { name: 'gRPC', category: 'web2', icon: '🔌', projects: ['Microservices Communication', 'High-performance APIs'] },
  { name: 'Docker', category: 'web2', icon: '🐳', projects: ['Container Orchestration', 'Development Environments', 'CI/CD Pipelines'] },
  { name: 'Kubernetes', category: 'web2', icon: '☸️', projects: ['Microservices Deployment', 'Production Scaling', 'Infrastructure Management'] },
  { name: 'PostgreSQL', category: 'web2', icon: '🐘', projects: ['Enterprise Data Solutions', 'Complex Queries', 'Data Modeling'] },
  { name: 'Redis', category: 'web2', icon: '🔴', projects: ['High-performance Caching', 'Session Management', 'Real-time Data'] },
  { name: 'Django', category: 'web2', icon: '🎸', projects: ['Enterprise Web Platforms', 'Admin Dashboards', 'REST APIs'] },

  // Web3
  { name: 'The Graph', category: 'web3', icon: '📊', projects: ['Blockchain Indexing', 'Subgraph Development', 'Data Querying'] },
  { name: 'Web3.js', category: 'web3', icon: '🌐', projects: ['dApp Integration', 'Wallet Connections', 'Blockchain Interactions'] },
  { name: 'Smart Contracts', category: 'web3', icon: '📝', projects: ['DeFi Logic', 'Token Standards', 'On-chain Systems'] },
  { name: 'dApps', category: 'web3', icon: '🚀', projects: ['Decentralized UI', 'Web3 Frontend', 'User Experience'] },

  // Tools
  { name: 'React', category: 'tools', icon: '⚛️', projects: ['Component Architecture', 'State Management', 'Interactive UIs'] },
  { name: 'Next.js', category: 'tools', icon: '▲', projects: ['SSR Applications', 'Static Generation', 'Full-stack Apps'] },
  { name: 'Git', category: 'tools', icon: '🌿', projects: ['Version Control', 'Team Collaboration', 'Code Review'] },
  { name: 'CI/CD', category: 'tools', icon: '🔄', projects: ['Automated Testing', 'Deployment Pipelines', 'DevOps Automation'] },
]

const categories = {
  languages: { name: 'Languages', color: 'blue' },
  web2: { name: 'Web2 Stack', color: 'green' },
  web3: { name: 'Web3 Stack', color: 'purple' },
  tools: { name: 'Tools & Frameworks', color: 'orange' },
}

export default function TechStack() {
  const { theme } = useTheme()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [activeCategory, setActiveCategory] = useState<string | null>('languages')

  const filteredTechs = activeCategory
    ? technologies.filter(t => t.category === activeCategory)
    : []

  return (
    <section className="py-32 px-8 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-mono">
            <span className={theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'}>
              {'$ ls -la '}
            </span>
            /usr/bin/skills
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8 font-mono">
            {'// Languages = tools | Domain knowledge = power'}
            <br />
            {'// Adaptability allows writing efficient code in any stack'}
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`
                px-6 py-3 rounded-full font-medium transition-all duration-300
                ${activeCategory === key
                  ? theme === 'developer'
                    ? 'bg-developer-accent text-developer-bg'
                    : 'bg-founder-accent text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
              `}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTechs.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{
                scale: 1.05,
                rotate: [0, -2, 2, 0],
                transition: { duration: 0.3 }
              }}
              className={`
                relative group p-6 rounded-2xl cursor-pointer
                transition-all duration-300
                ${theme === 'developer'
                  ? 'bg-developer-secondary border-2 border-developer-accent/20 hover:border-developer-accent'
                  : 'bg-gray-900/40 border-2 border-founder-accent/20 hover:border-founder-accent'}
              `}
            >
              {/* Category Badge */}
              <div className={`
                absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs flex items-center justify-center
                ${theme === 'developer' ? 'bg-developer-accent text-developer-bg' : 'bg-founder-accent text-white'}
              `}>
                {tech.category === 'web2' ? '2' : tech.category === 'web3' ? '3' : '•'}
              </div>

              <div className="text-center">
                <div className="text-5xl mb-3">{tech.icon}</div>
                <h3 className="font-bold text-lg mb-2">{tech.name}</h3>
                <p className={`text-xs ${theme === 'founder' ? 'text-gray-300' : 'text-gray-400'}`}>
                  {tech.projects[0]}
                </p>
              </div>

              {/* Hover Info */}
              <div className={`
                absolute inset-0 bg-gradient-to-t from-black/90 to-transparent
                rounded-2xl p-4 flex flex-col justify-end
                opacity-0 group-hover:opacity-100 transition-opacity duration-300
              `}>
                <p className="text-xs text-white">
                  <strong>Used in:</strong>
                </p>
                <ul className="text-xs text-gray-300 mt-1 space-y-1">
                  {tech.projects.map((project, i) => (
                    <li key={i}>• {project}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div>
            <div className={`text-4xl font-bold mb-2 ${
              theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'
            }`}>
              5+
            </div>
            <div className={`text-sm ${theme === 'founder' ? 'text-gray-600' : 'text-gray-400'}`}>
              Programming Languages
            </div>
          </div>
          <div>
            <div className={`text-4xl font-bold mb-2 ${
              theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'
            }`}>
              10+
            </div>
            <div className={`text-sm ${theme === 'founder' ? 'text-gray-600' : 'text-gray-400'}`}>
              Frameworks & Tools
            </div>
          </div>
          <div>
            <div className={`text-4xl font-bold mb-2 ${
              theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'
            }`}>
              Web2 + Web3
            </div>
            <div className={`text-sm ${theme === 'founder' ? 'text-gray-600' : 'text-gray-400'}`}>
              Full Spectrum
            </div>
          </div>
          <div>
            <div className={`text-4xl font-bold mb-2 ${
              theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'
            }`}>
              8+
            </div>
            <div className={`text-sm ${theme === 'founder' ? 'text-gray-600' : 'text-gray-400'}`}>
              Years Experience
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
