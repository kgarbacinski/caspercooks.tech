'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useSafeReducedMotion'
import { useLayoutEffect, useRef, useState } from 'react'
import { SectionHeader, RoomCutout, EASE } from '@/components/ui/Section'
import {
  SiPython, SiJavascript, SiTypescript, SiCplusplus, SiSolidity, SiGo,
  SiDjango, SiFastapi, SiFlask, SiNodedotjs, SiNextdotjs, SiReact, SiGraphql, SiCelery, SiRabbitmq,
  SiDocker, SiKubernetes, SiArgo, SiAmazon, SiTerraform, SiNginx, SiGrafana,
  SiPostgresql, SiMongodb, SiRedis, SiSnowflake, SiDbt, SiApacheairflow,
  SiLangchain, SiTemporal, SiAnthropic, SiGoogle, SiKeycloak, SiPytest,
  SiGit, SiWeb3Dotjs
} from 'react-icons/si'
import {
  FaNetworkWired, FaRocket, FaLock, FaCubes, FaRunning, FaChartBar, FaFileContract, FaCoins,
  FaLink, FaPlug, FaCodeBranch, FaRobot, FaDatabase, FaProjectDiagram, FaCogs, FaSearch,
  FaBolt, FaSitemap, FaDraftingCompass
} from 'react-icons/fa'
import type { IconType } from 'react-icons'

type Category = 'languages' | 'ai' | 'web' | 'data' | 'cloud' | 'web3' | 'practices'

interface Technology {
  name: string
  category: Category
  icon: IconType
  projects: string[]
}

// "Used in": pierwsza pozycja jest też podpisem na zawieszce (krótka); powiązania z projektami wg CV 2026
const technologies: Technology[] = [
  // Languages
  { name: 'Python', category: 'languages', icon: SiPython, projects: ['Octant V2 · Golem', 'Efektywniejsi automations', 'DAC, Red Bull, Invicta, Nokia'] },
  { name: 'Go', category: 'languages', icon: SiGo, projects: ['DeFi microservices · DAC', 'Services on AWS (EKS)', 'Performance-critical backends'] },
  { name: 'TypeScript', category: 'languages', icon: SiTypescript, projects: ['Octant V2 · Golem', 'Full-stack web apps', 'Type-safe systems'] },
  { name: 'JavaScript', category: 'languages', icon: SiJavascript, projects: ['Web apps · Inter Cars', 'Full-stack web apps', 'Web3 dApps'] },
  { name: 'C++', category: 'languages', icon: SiCplusplus, projects: ['R&D · Nokia', 'Software · DevsHouse', 'Performance-critical code'] },
  { name: 'Solidity', category: 'languages', icon: SiSolidity, projects: ['Octant V2 smart contracts', 'On-chain public-goods funding', 'DeFi protocols'] },

  // AI & Agents
  { name: 'LLMs & GenAI', category: 'ai', icon: FaRobot, projects: ['Octant V2 AI layer', 'Efektywniejsi automations', 'Caching & model routing'] },
  { name: 'RAG', category: 'ai', icon: FaDatabase, projects: ['RAG pipelines · Golem', 'Embeddings & retrieval', 'Response caching'] },
  { name: 'Agentic Workflows', category: 'ai', icon: FaProjectDiagram, projects: ['Multi-agent systems', 'Agents in production 1.5+ yrs', 'Tool use & function calling'] },
  { name: 'Temporal', category: 'ai', icon: SiTemporal, projects: ['Durable agent execution', 'Retries, checkpoints, budgets', 'Octant V2 · Efektywniejsi'] },
  { name: 'LangChain / LangGraph', category: 'ai', icon: SiLangchain, projects: ['Agent frameworks', 'Graph-based agent flows', 'Memory & retrieval'] },
  { name: 'Google ADK', category: 'ai', icon: SiGoogle, projects: ['Agent Development Kit', 'Multi-agent orchestration', 'Tool-using agents'] },
  { name: 'OpenAI / Anthropic', category: 'ai', icon: SiAnthropic, projects: ['GPT & Claude APIs', 'Model routing', 'Tool calling & streaming'] },
  { name: 'MCP', category: 'ai', icon: FaPlug, projects: ['Model Context Protocol', 'Tools for AI agents', 'Agent ↔ system integrations'] },
  { name: 'Qdrant', category: 'ai', icon: FaSearch, projects: ['Vector search', 'Semantic retrieval for RAG', 'Embedding storage'] },
  { name: 'n8n', category: 'ai', icon: FaCogs, projects: ['Automations · Efektywniejsi', 'AI workflow automation', 'Integration pipelines'] },

  // Full-stack web
  { name: 'Django / DRF', category: 'web', icon: SiDjango, projects: ['Red Bull, Inter Cars, DAC', 'Octant V2 · Golem', 'REST APIs'] },
  { name: 'FastAPI', category: 'web', icon: SiFastapi, projects: ['Octant V2 · Golem', 'DAC, Invicta, Efektywniejsi', 'Async services'] },
  { name: 'Flask', category: 'web', icon: SiFlask, projects: ['Nokia, Invicta, DevsHouse', 'Microservices', 'REST APIs'] },
  { name: 'Node.js', category: 'web', icon: SiNodedotjs, projects: ['Backend services', 'Full-stack JS / TS', 'Tooling & scripts'] },
  { name: 'React', category: 'web', icon: SiReact, projects: ['Octant V2 · Golem', 'Interactive UIs', 'Component architecture'] },
  { name: 'Next.js', category: 'web', icon: SiNextdotjs, projects: ['This website', 'SSR & full-stack apps', 'React meta-framework'] },
  { name: 'REST API', category: 'web', icon: FaLink, projects: ['Nokia, DevsHouse, Devs-Mentoring', 'API design', 'Swagger / OpenAPI'] },
  { name: 'GraphQL', category: 'web', icon: SiGraphql, projects: ['APIs · DAC Digital', 'Devs-Mentoring projects', 'Client-driven queries'] },
  { name: 'gRPC', category: 'web', icon: FaNetworkWired, projects: ['Service-to-service calls', 'Microservices communication', 'Protocol Buffers'] },
  { name: 'WebSockets', category: 'web', icon: FaBolt, projects: ['Real-time communication', 'Live updates', 'Bidirectional data'] },
  { name: 'Celery', category: 'web', icon: SiCelery, projects: ['Background jobs · Inter Cars', 'Async task queues', 'Scheduled tasks'] },
  { name: 'RabbitMQ', category: 'web', icon: SiRabbitmq, projects: ['Message queuing', 'Async tasks', 'Event-driven architecture'] },

  // Data
  { name: 'PostgreSQL', category: 'data', icon: SiPostgresql, projects: ['SQL & ORM', 'Scouting platform · Red Bull', 'Relational data modeling'] },
  { name: 'MongoDB', category: 'data', icon: SiMongodb, projects: ['NoSQL documents', 'Flexible schemas', 'Scalable data'] },
  { name: 'Redis', category: 'data', icon: SiRedis, projects: ['Caching', 'Queues & sessions', 'Real-time data'] },
  { name: 'Snowflake', category: 'data', icon: SiSnowflake, projects: ['Data warehouse · Golem', 'Analytics SQL', 'Data pipelines'] },
  { name: 'dbt', category: 'data', icon: SiDbt, projects: ['Data transformations', 'Tested SQL models', 'Analytics engineering'] },
  { name: 'Airflow', category: 'data', icon: SiApacheairflow, projects: ['Pipelines · Golem', 'Scheduled DAGs', 'Data orchestration'] },

  // Cloud & DevOps
  { name: 'Docker', category: 'cloud', icon: SiDocker, projects: ['Invicta, Nokia, DevsHouse', 'Docker Compose', 'Dev environments'] },
  { name: 'Kubernetes', category: 'cloud', icon: SiKubernetes, projects: ['EKS · DAC Digital', 'R&D · Nokia', 'Production scaling'] },
  { name: 'Argo Workflows', category: 'cloud', icon: SiArgo, projects: ['Workflows on Kubernetes', 'Pipeline orchestration', 'Batch jobs'] },
  { name: 'AWS', category: 'cloud', icon: SiAmazon, projects: ['EC2, EKS, RDS, S3', 'DAC Digital, Invicta', 'Devs-Mentoring projects'] },
  { name: 'Terraform', category: 'cloud', icon: SiTerraform, projects: ['Infra as code · Golem', 'Reproducible environments', 'Cloud provisioning'] },
  { name: 'CI/CD', category: 'cloud', icon: FaCodeBranch, projects: ['Same-day releases · Invicta', 'GitLab CI', 'Automated testing'] },
  { name: 'Nginx', category: 'cloud', icon: SiNginx, projects: ['Reverse proxy · Invicta', 'Load balancing', 'Web server'] },
  { name: 'Grafana & Prometheus', category: 'cloud', icon: SiGrafana, projects: ['Monitoring & alerting', 'Metrics dashboards', 'Kibana logs'] },

  // Web3
  { name: 'Smart Contracts', category: 'web3', icon: FaFileContract, projects: ['Octant V2 · Golem', 'Token standards', 'On-chain systems'] },
  { name: 'DeFi', category: 'web3', icon: FaCoins, projects: ['DeFi protocol · DAC', 'Decentralized finance', 'Liquidity pools'] },
  { name: 'dApps', category: 'web3', icon: FaRocket, projects: ['Decentralized UI', 'Web3 frontend', 'User experience'] },
  { name: 'The Graph', category: 'web3', icon: FaChartBar, projects: ['Blockchain indexing', 'Subgraph development', 'Data querying'] },
  { name: 'Web3.js', category: 'web3', icon: SiWeb3Dotjs, projects: ['dApp integration', 'Wallet connections', 'Blockchain interactions'] },
  { name: 'Safe Global', category: 'web3', icon: FaLock, projects: ['Multi-sig wallets', 'Smart accounts', 'Secure asset management'] },

  // Practices
  { name: 'Architecture & ADRs', category: 'practices', icon: FaDraftingCompass, projects: ['Invicta, Golem, Fathom', 'Systems from scratch', 'Decision records'] },
  { name: 'Microservices', category: 'practices', icon: FaSitemap, projects: ['From scratch · Invicta', 'DAC Digital, DevsHouse', 'Service boundaries'] },
  { name: 'DDD & Event Storming', category: 'practices', icon: FaCubes, projects: ['Drove it at DAC Digital', 'Bounded contexts', 'Domain modeling'] },
  { name: 'TDD / BDD', category: 'practices', icon: SiPytest, projects: ['PyTest, unittest, Jest', 'Test-driven development', 'Quality assurance'] },
  { name: 'OAuth / OIDC', category: 'practices', icon: SiKeycloak, projects: ['Keycloak · DevsHouse', 'Authentication', 'Authorization'] },
  { name: 'Scrum / Agile', category: 'practices', icon: FaRunning, projects: ['Leading dev teams', 'Sprint planning', 'Team collaboration'] },
  { name: 'Git', category: 'practices', icon: SiGit, projects: ['GitLab, Bitbucket', 'Code review', 'Version control'] },
]

const categories: Record<Category, { name: string }> = {
  languages: { name: 'Languages' },
  ai: { name: 'AI & Agents' },
  web: { name: 'Full-stack Web' },
  data: { name: 'Data' },
  cloud: { name: 'Cloud & DevOps' },
  web3: { name: 'Web3' },
  practices: { name: 'Practices' },
}


/**
 * "Used in" — karteczka wysuwana spod zawieszki. Na wąskim ekranie zawieszka w prawej kolumnie
 * wypychała karteczkę poza ekran — po zamontowaniu przesuwamy ją w poziomie do granic okna (16 px marginesu).
 */
function UsedIn({ projects }: { projects: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [dx, setDx] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const m = 16
    setDx(r.left < m ? m - r.left : r.right > window.innerWidth - m ? window.innerWidth - m - r.right : 0)
  }, [])
  return (
    <motion.div
      ref={ref}
      className="absolute top-full left-1/2 z-30 mt-2 w-[min(15rem,calc(100vw-2rem))] tag-card !text-left after:!top-[-6px] after:!bottom-auto after:!rotate-[225deg]"
      style={{ marginLeft: `calc(min(15rem, 100vw - 2rem) / -2 + ${dx}px)`, ['--dx' as string]: `${-dx}px` }}
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
      transition={{ duration: 0.22, ease: EASE }}
    >
      <p className="eyebrow !text-xs mb-2">
        <strong className="font-normal text-accent">Used in:</strong>
      </p>
      <ul className="text-xs text-paper-muted space-y-1">
        {projects.map((project) => (
          <li key={project} className="flex gap-2">
            <span className="text-ember">•</span>
            <span>{project}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

// stałe "losowe" przechylenie zawieszek na haczykach
const SWAY = [-4, 3, -2, 5, -3, 2, -5, 4]

/**
 * Stack = pokój "AI lab": tablica perforowana (pegboard) z narzędziami.
 * Każda technologia to papierowa zawieszka na haczyku; hover/fokus/tap zdejmuje ją z haczyka
 * i pokazuje "Used in". Kategorie to naklejki z taśmy nad tablicą. Treść wg CV 2026.
 */
export default function TechStack() {
  const reduce = useReducedMotion()
  const [activeCategory, setActiveCategory] = useState<keyof typeof categories>('languages')
  const [open, setOpen] = useState<string | null>(null)
  const filteredTechs = technologies.filter((t) => t.category === activeCategory)

  return (
    <section id="stack" className="relative py-16 sm:py-24 scroll-mt-20">
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
          <RoomCutout room={3} className="hidden md:block w-56 lg:w-72 shrink-0 -mb-6" />
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
                style={{ rotate: `${[-1.5, 1, -0.5, 1.5, -1, 0.8, -1.2][i % 7]}deg` }}
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
                      <span className="block font-mono text-xs text-ink/70 mt-1 line-clamp-1">{tech.projects[0]}</span>
                    </button>
                    {/* "used in" — karteczka wysuwana spod zawieszki */}
                    <AnimatePresence>{isOpen && <UsedIn projects={tech.projects} />}</AnimatePresence>
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
            { value: 'Web2 + Web3', label: 'Full Spectrum' },
            { value: '1.5+ yrs', label: 'AI Agents in Production' },
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
              <div className="font-mono text-xs uppercase tracking-wider text-paper-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
