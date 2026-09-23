'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useState } from 'react'
import { Section } from '@/components/ui/Section'
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


const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
}

export default function TechStack() {
  // motyw przełącza tylko kolor akcentu (przez zmienne CSS), wygląd jest wspólny
  useTheme()
  const [activeCategory, setActiveCategory] = useState<string | null>('languages')

  const filteredTechs = activeCategory
    ? technologies.filter(t => t.category === activeCategory)
    : []

  return (
    <Section
      id="stack"
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
    >
      {/* Category Filter */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-wrap gap-2 mb-10 sm:mb-12"
        role="tablist"
      >
        {Object.entries(categories).map(([key, cat]) => {
          const active = activeCategory === key
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveCategory(key)}
              className={`px-3 sm:px-4 py-2 font-mono text-xs sm:text-sm border transition-colors duration-200 ${
                active
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-cocoa-500/60 text-paper-muted hover:border-accent/50 hover:text-paper'
              }`}
            >
              {cat.name}
            </button>
          )
        })}
      </motion.div>

      {/* Tech Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {filteredTechs.map((tech, index) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.04, ease: 'easeOut' }}
            tabIndex={0}
            className="paper-card group p-4 sm:p-6 cursor-default transition duration-300 hover:border-accent/50 hover:-translate-y-1 focus:outline-none focus-visible:border-accent/60"
          >
            {/* Category marker */}
            <span className="absolute top-3 right-3 font-mono text-[10px] text-paper-dim group-hover:text-accent transition-colors">
              {tech.category === 'web2' ? '2' : tech.category === 'web3' ? '3' : tech.category === 'ai' ? 'AI' : '•'}
            </span>

            <tech.icon className="w-7 h-7 sm:w-9 sm:h-9 mb-4 text-paper-muted group-hover:text-accent transition-colors" />
            <h3 className="font-display text-lg sm:text-xl text-paper mb-1 leading-tight">{tech.name}</h3>
            <p className="font-mono text-[10px] sm:text-xs text-paper-dim line-clamp-1">
              {tech.projects[0]}
            </p>

            {/* Hover Info */}
            <div className="absolute inset-0 bg-cocoa-900/95 p-4 sm:p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
              <p className="eyebrow !text-[10px] mb-2">
                <strong className="font-normal text-accent">Used in:</strong>
              </p>
              <ul className="text-xs text-paper-muted space-y-1">
                {tech.projects.map((project, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-ember">•</span>
                    <span>{project}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className="mt-14 sm:mt-20 grid grid-cols-2 md:grid-cols-4 border-t border-cocoa-500/40"
      >
        {[
          { value: '5+', label: 'Programming Languages' },
          { value: '10+', label: 'Frameworks & Tools' },
          { value: 'Web2 + Web3', label: 'Full Spectrum' },
          { value: '10+', label: 'Years Experience' },
        ].map((stat) => (
          <div key={stat.label} className="pt-6 sm:pt-8 pb-2 pr-4">
            <div className="font-display text-3xl sm:text-4xl text-accent mb-2 leading-none">
              {stat.value}
            </div>
            <div className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-paper-dim">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>
    </Section>
  )
}
