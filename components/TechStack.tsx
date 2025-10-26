'use client'

import { motion, useInView } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useRef, useState, useEffect } from 'react'
import {
  SiPython, SiJavascript, SiTypescript, SiCplusplus, SiSolidity, SiGo,
  SiDjango, SiFastapi, SiNextdotjs, SiDocker, SiKubernetes, SiPostgresql,
  SiMongodb, SiRedis, SiRabbitmq, SiGraphql, SiAmazonaws, SiReact,
  SiGit, SiNginx, SiGrafana, SiSwagger, SiWeb3Dotjs
} from 'react-icons/si'
import {
  FaNetworkWired, FaRocket, FaLock, FaShieldAlt, FaVial,
  FaCubes, FaRunning, FaChartBar, FaFileContract, FaCoins,
  FaLink, FaPlug, FaCodeBranch
} from 'react-icons/fa'
import type { IconType } from 'react-icons'

interface Technology {
  name: string
  category: 'web2' | 'web3' | 'languages' | 'tools'
  icon: IconType
  projects: string[]
}

const technologies: Technology[] = [
  // Languages
  { name: 'Python', category: 'languages', icon: SiPython, projects: ['Enterprise Web Apps', 'Backend Services', 'System Programming'] },
  { name: 'Javascript', category: 'languages', icon: SiJavascript, projects: ['Web2 Applications', 'Web3 dApps', 'Fullstack Applications'] },
  { name: 'TypeScript', category: 'languages', icon: SiTypescript, projects: ['Web3 dApps', 'Fullstack Applications', 'Type-safe Systems'] },
  { name: 'C++', category: 'languages', icon: SiCplusplus, projects: ['Low-level Systems', 'Performance-critical Apps', 'System Architecture'] },
  { name: 'Solidity', category: 'languages', icon: SiSolidity, projects: ['Smart Contracts', 'DeFi Protocols', 'Blockchain Development'] },
  { name: 'GoLang', category: 'languages', icon: SiGo, projects: ['Backend Services', 'Microservices Architecture', 'Performance-critical Applications'] },

  // Web2
  { name: 'Django', category: 'web2', icon: SiDjango, projects: ['Enterprise Web Platforms', 'REST APIs', 'DRF'] },
  { name: 'FastAPI', category: 'web2', icon: SiFastapi, projects: ['High-performance APIs', 'Modern Python', 'Async Services'] },
  { name: 'Next.js', category: 'web2', icon: SiNextdotjs, projects: ['SSR Applications', 'Full-stack Framework', 'React Meta-framework'] },
  { name: 'Docker', category: 'web2', icon: SiDocker, projects: ['Container Orchestration', 'Development Environments', 'CI/CD Pipelines'] },
  { name: 'Kubernetes', category: 'web2', icon: SiKubernetes, projects: ['Microservices Deployment', 'Production Scaling', 'Infrastructure Management'] },
  { name: 'PostgreSQL', category: 'web2', icon: SiPostgresql, projects: ['Enterprise Data Solutions', 'SQL', 'ORM'] },
  { name: 'MongoDB', category: 'web2', icon: SiMongodb, projects: ['NoSQL Solutions', 'Document Storage', 'Scalable Data'] },
  { name: 'Redis', category: 'web2', icon: SiRedis, projects: ['High-performance Caching', 'Session Management', 'Real-time Data'] },
  { name: 'RabbitMQ', category: 'web2', icon: SiRabbitmq, projects: ['Message Queuing', 'Async Tasks', 'Event-driven Architecture'] },
  { name: 'gRPC', category: 'web2', icon: FaNetworkWired, projects: ['Microservices Communication', 'High-performance APIs', 'Protocol Buffers'] },
  { name: 'GraphQL', category: 'web2', icon: SiGraphql, projects: ['Flexible APIs', 'Data Fetching', 'Client-driven Queries'] },
  { name: 'AWS', category: 'web2', icon: SiAmazonaws, projects: ['Cloud Infrastructure', 'EC2, S3, RDS', 'ECS, Elasticsearch'] },
  { name: 'CI/CD', category: 'web2', icon: FaCodeBranch, projects: ['Automated Testing', 'Deployment Pipelines', 'GitLab CI'] },
  { name: 'React', category: 'web2', icon: SiReact, projects: ['Component Architecture', 'State Management', 'Interactive UIs'] },

  // Web3
  { name: 'The Graph', category: 'web3', icon: FaChartBar, projects: ['Blockchain Indexing', 'Subgraph Development', 'Data Querying'] },
  { name: 'Web3.js', category: 'web3', icon: SiWeb3Dotjs, projects: ['dApp Integration', 'Wallet Connections', 'Blockchain Interactions'] },
  { name: 'Smart Contracts', category: 'web3', icon: FaFileContract, projects: ['DeFi Logic', 'Token Standards', 'On-chain Systems'] },
  { name: 'DeFi', category: 'web3', icon: FaCoins, projects: ['Decentralized Finance', 'DeFi Protocols', 'Liquidity Pools'] },
  { name: 'Safe Global', category: 'web3', icon: FaLock, projects: ['Multi-sig Wallets', 'Smart Account', 'Secure Asset Management'] },
  { name: 'dApps', category: 'web3', icon: FaRocket, projects: ['Decentralized UI', 'Web3 Frontend', 'User Experience'] },

  // Tools
  { name: 'Git', category: 'tools', icon: SiGit, projects: ['Version Control', 'GitLab, Bitbucket', 'Code Review'] },
  { name: 'REST API', category: 'tools', icon: FaLink, projects: ['RESTful Services', 'HTTP Methods', 'API Design'] },
  { name: 'WebSockets', category: 'tools', icon: FaPlug, projects: ['Real-time Communication', 'Bidirectional Data', 'Live Updates'] },
  { name: 'OAuth/OIDC', category: 'tools', icon: FaShieldAlt, projects: ['Authentication', 'Authorization', 'Keycloak, Auth0'] },
  { name: 'TDD/BDD', category: 'tools', icon: FaVial, projects: ['Test-Driven Development', 'Behavior-Driven', 'Quality Assurance'] },
  { name: 'DDD', category: 'tools', icon: FaCubes, projects: ['Domain-Driven Design', 'Event Storming', 'Microservices Architecture'] },
  { name: 'Scrum/Agile', category: 'tools', icon: FaRunning, projects: ['Agile Methodology', 'Sprint Planning', 'Team Collaboration'] },
  { name: 'Nginx', category: 'tools', icon: SiNginx, projects: ['Reverse Proxy', 'Load Balancing', 'Web Server'] },
  { name: 'Grafana', category: 'tools', icon: SiGrafana, projects: ['Monitoring', 'Prometheus', 'Kibana, Elasticsearch'] },
  { name: 'Swagger', category: 'tools', icon: SiSwagger, projects: ['API Documentation', 'OpenAPI Spec', 'Developer Tools'] },
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const filteredTechs = activeCategory
    ? technologies.filter(t => t.category === activeCategory)
    : []

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-8 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={isMobile ? {} : { duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-mono">
            <span className="text-developer-accent">
              {'$ ls -la '}
            </span>
            /usr/bin/skills
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto mb-8 font-mono px-4">
            {'// Languages = tools | Domain knowledge = power'}
            <br />
            {'// Adaptability allows writing efficient code in any stack'}
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={isMobile ? {} : { 
            duration: 0.6, 
            delay: 0.2,
            ease: 'easeOut' 
          }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 sm:mb-16 px-4"
        >
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`
                px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium text-sm sm:text-base transition-all duration-300
                ${activeCategory === key
                  ? 'bg-developer-accent text-developer-bg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
              `}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredTechs.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={isMobile ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
              animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={isMobile ? {} : { 
                duration: 0.4, 
                delay: index * 0.05,
                ease: 'easeOut' 
              }}
              whileHover={isMobile ? {} : {
                scale: 1.05,
                rotate: [0, -2, 2, 0],
                transition: { duration: 0.3 }
              }}
              className="relative group p-4 sm:p-6 rounded-2xl cursor-pointer transition-all duration-300 bg-developer-secondary border-2 border-developer-accent/20 hover:border-developer-accent"
            >
              {/* Category Badge */}
              <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs flex items-center justify-center bg-developer-accent text-developer-bg">
                {tech.category === 'web2' ? '2' : tech.category === 'web3' ? '3' : '•'}
              </div>

              <div className="text-center">
                <div className="text-3xl sm:text-5xl mb-2 sm:mb-3 flex items-center justify-center">
                  <tech.icon className="w-8 h-8 sm:w-12 sm:h-12" />
                </div>
                <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2">{tech.name}</h3>
                <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-1">
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
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={isMobile ? {} : { 
            duration: 0.6, 
            delay: 0.6,
            ease: 'easeOut' 
          }}
          className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center"
        >
          <div>
            <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 text-developer-accent">
              5+
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              Programming Languages
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 text-developer-accent">
              10+
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              Frameworks & Tools
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 text-developer-accent">
              Web2 + Web3
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              Full Spectrum
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 text-developer-accent">
              8+
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              Years Experience
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
