'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { SectionHeader, RoomCutout, EASE } from '@/components/ui/Section'
import {
  SiPython, SiJavascript, SiTypescript, SiCplusplus, SiSolidity, SiGo,
  SiDjango, SiFastapi, SiNextdotjs, SiDocker, SiKubernetes, SiPostgresql,
  SiMongodb, SiRedis, SiRabbitmq, SiGraphql, SiAmazon, SiReact,
  SiGit, SiNginx, SiGrafana, SiSwagger, SiWeb3Dotjs
} from 'react-icons/si'
import {
  FaNetworkWired, FaRocket, FaLock, FaShieldAlt, FaVial,
  FaCubes, FaRunning, FaChartBar, FaFileContract, FaCoins,
  FaLink, FaPlug, FaCodeBranch, FaRobot, FaBrain, FaDatabase,
  FaProjectDiagram, FaCogs, FaSearch
} from 'react-icons/fa'
import type { IconType } from 'react-icons'

interface Technology {
  name: string
  category: 'web2' | 'web3' | 'languages' | 'tools' | 'ai'
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
  { name: 'AWS', category: 'web2', icon: SiAmazon, projects: ['Cloud Infrastructure', 'EC2, S3, RDS', 'ECS, Elasticsearch'] },
  { name: 'CI/CD', category: 'web2', icon: FaCodeBranch, projects: ['Automated Testing', 'Deployment Pipelines', 'GitLab CI'] },
  { name: 'React', category: 'web2', icon: SiReact, projects: ['Component Architecture', 'State Management', 'Interactive UIs'] },

  // Web3
  { name: 'The Graph', category: 'web3', icon: FaChartBar, projects: ['Blockchain Indexing', 'Subgraph Development', 'Data Querying'] },
  { name: 'Web3.js', category: 'web3', icon: SiWeb3Dotjs, projects: ['dApp Integration', 'Wallet Connections', 'Blockchain Interactions'] },
  { name: 'Smart Contracts', category: 'web3', icon: FaFileContract, projects: ['DeFi Logic', 'Token Standards', 'On-chain Systems'] },
  { name: 'DeFi', category: 'web3', icon: FaCoins, projects: ['Decentralized Finance', 'DeFi Protocols', 'Liquidity Pools'] },
  { name: 'Safe Global', category: 'web3', icon: FaLock, projects: ['Multi-sig Wallets', 'Smart Account', 'Secure Asset Management'] },
  { name: 'dApps', category: 'web3', icon: FaRocket, projects: ['Decentralized UI', 'Web3 Frontend', 'User Experience'] },

  // AI & ML
  { name: 'LLMs', category: 'ai', icon: FaRobot, projects: ['GPT, Claude, Gemini', 'Fine-tuning & Evaluation', 'Production Deployments'] },
  { name: 'Prompt Engineering', category: 'ai', icon: FaBrain, projects: ['Chain-of-Thought', 'Few-shot & Zero-shot', 'System Prompt Design'] },
  { name: 'RAG', category: 'ai', icon: FaDatabase, projects: ['Vector Databases', 'Embedding Models', 'Retrieval Pipelines'] },
  { name: 'AI Agents', category: 'ai', icon: FaProjectDiagram, projects: ['Multi-agent Systems', 'Tool Use & Function Calling', 'Autonomous Workflows'] },
  { name: 'n8n / Automation', category: 'ai', icon: FaCogs, projects: ['AI Workflow Automation', 'Integration Pipelines', 'No-code AI Solutions'] },
  { name: 'LangChain', category: 'ai', icon: FaLink, projects: ['Agent Frameworks', 'Chain Composition', 'Memory & Retrieval'] },
  { name: 'Vector DBs', category: 'ai', icon: FaSearch, projects: ['Pinecone, Qdrant', 'Similarity Search', 'Semantic Retrieval'] },
  { name: 'AI APIs', category: 'ai', icon: FaPlug, projects: ['OpenAI, Anthropic', 'Hugging Face', 'API Orchestration'] },

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
  ai: { name: 'AI & ML', color: 'pink' },
  tools: { name: 'Tools & Frameworks', color: 'orange' },
}


// stałe "losowe" przechylenie zawieszek na haczykach
const SWAY = [-4, 3, -2, 5, -3, 2, -5, 4]

/**
 * Stack = pokój "AI lab": tablica perforowana (pegboard) z narzędziami.
 * Każda technologia to papierowa zawieszka na haczyku; hover/fokus/tap zdejmuje ją z haczyka
 * i pokazuje "Used in". Kategorie to naklejki z taśmy nad tablicą. Treść bez zmian.
 */
export default function TechStack() {
  const reduce = useReducedMotion()
  const [activeCategory, setActiveCategory] = useState<keyof typeof categories>('languages')
  const [open, setOpen] = useState<string | null>(null)
  const filteredTechs = technologies.filter((t) => t.category === activeCategory)

  return (
    <section id="stack" className="relative py-24 sm:py-32 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between gap-8 mb-12 sm:mb-14">
          <SectionHeader
            index="03"
            eyebrow="ls -la /usr/bin/skills"
            title={
              <>
                Languages = tools.
                <br />
                <span className="text-paper-muted">Domain knowledge = power.</span>
              </>
            }
            lead="Adaptability allows writing efficient code in any stack"
          />
          <RoomCutout room={3} className="hidden md:block w-40 lg:w-52 shrink-0" />
        </div>

        {/* naklejki kategorii */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6" role="tablist" aria-label="Skill categories">
          {(Object.keys(categories) as (keyof typeof categories)[]).map((key, i) => {
            const active = activeCategory === key
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setActiveCategory(key)
                  setOpen(null)
                }}
                className={`tape-label ${active ? 'tape-active' : ''}`}
                style={{ rotate: `${[-1.5, 1, -0.5, 1.5, -1][i]}deg` }}
              >
                {categories[key].name}
              </button>
            )
          })}
        </div>

        {/* tablica perforowana */}
        <div className="pegboard">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-12">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredTechs.map((tech, index) => {
                const isOpen = open === tech.name
                return (
                  <motion.div
                    key={tech.name}
                    layout
                    className="relative flex flex-col items-center"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: -40, rotate: SWAY[index % SWAY.length] * 3 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: 60, rotate: SWAY[index % SWAY.length] * 4, transition: { duration: 0.3 } }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16, delay: index * 0.035 }}
                  >
                    {/* haczyk */}
                    <span className="peg-hook" aria-hidden="true" />
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onMouseEnter={() => setOpen(tech.name)}
                      onMouseLeave={() => setOpen((o) => (o === tech.name ? null : o))}
                      onFocus={() => setOpen(tech.name)}
                      onBlur={() => setOpen((o) => (o === tech.name ? null : o))}
                      onClick={() => setOpen((o) => (o === tech.name ? null : tech.name))}
                      className={`peg-tag group ${isOpen ? 'peg-tag-open' : ''}`}
                      style={{ ['--sway' as string]: `${SWAY[index % SWAY.length]}deg` }}
                    >
                      <span className="peg-hole" aria-hidden="true" />
                      <tech.icon className="w-7 h-7 sm:w-8 sm:h-8 mb-2 text-ink/70 group-hover:text-ink transition-colors" />
                      <span className="block font-display text-[17px] sm:text-lg leading-tight text-ink">{tech.name}</span>
                      <span className="block font-mono text-[10px] text-ink/55 mt-1 line-clamp-1">{tech.projects[0]}</span>
                    </button>
                    {/* "used in" — karteczka wysuwana spod zawieszki */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          className="absolute top-full z-30 mt-2 w-[min(15rem,80vw)] tag-card !text-left after:!top-[-6px] after:!bottom-auto after:!rotate-[225deg]"
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                          transition={{ duration: 0.22, ease: EASE }}
                        >
                          <p className="eyebrow !text-[10px] mb-2">
                            <strong className="font-normal text-accent">Used in:</strong>
                          </p>
                          <ul className="text-xs text-paper-muted space-y-1">
                            {tech.projects.map((project) => (
                              <li key={project} className="flex gap-2">
                                <span className="text-ember">•</span>
                                <span>{project}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* statystyki jako bilety z pieczątką */}
        <div className="mt-14 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { value: '5+', label: 'Programming Languages' },
            { value: '10+', label: 'Frameworks & Tools' },
            { value: 'Web2 + Web3', label: 'Full Spectrum' },
            { value: '10+', label: 'Years Experience' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="stamp-ticket"
              initial={reduce ? false : { opacity: 0, scale: 1.3, rotate: -8 }}
              whileInView={{ opacity: 1, scale: 1, rotate: [-1.5, 1, -0.5, 1.5][i] }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ type: 'spring', stiffness: 380, damping: 18, delay: i * 0.08 }}
            >
              <div className="font-display text-3xl sm:text-4xl text-accent mb-2 leading-none">{stat.value}</div>
              <div className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-paper-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
