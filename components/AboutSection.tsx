'use client'

import { motion, useInView } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useRef, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { FaLaptopCode, FaRocket, FaGraduationCap, FaMobileAlt, FaBullseye, FaRobot } from 'react-icons/fa'
import { Section } from '@/components/ui/Section'

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let start = 0
      const duration = 2000
      const increment = value / (duration / 16)

      const timer = setInterval(() => {
        start += increment
        if (start >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <div ref={ref} className="font-display text-3xl sm:text-4xl text-accent tabular-nums">
      {count}{suffix}
    </div>
  )
}

function Stats({ items }: { items: { value: number; suffix?: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-cocoa-500/40">
      {items.map((s) => (
        <div key={s.label} className="text-center">
          <AnimatedCounter value={s.value} suffix={s.suffix} />
          <div className="font-mono text-[11px] uppercase tracking-wider text-paper-dim mt-2">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function CardHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-11 h-11 grid place-items-center border border-cocoa-500/60 bg-cocoa-800 text-accent">
        {icon}
      </div>
      <h3 className="font-display text-2xl text-paper">{title}</h3>
    </div>
  )
}

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
}

export default function AboutSection() {
  const { theme } = useTheme()

  const cardBase = 'paper-card p-6 sm:p-8 transition duration-300 hover:border-accent/50 hover:-translate-y-1'
  const strong = 'text-paper font-medium'

  return (
    <Section id="about" index="01" eyebrow="about.txt" title="About">
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        {/* Developer Bio */}
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`${cardBase} ${theme === 'developer' ? 'border-accent/40' : ''} ${
            theme === 'founder' ? 'hidden md:block' : ''
          }`}
        >
          <CardHeader icon={<FaLaptopCode className="w-5 h-5" />} title="Developer Journey" />

          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-paper-muted">
            <p>
              <strong className="text-accent font-medium">Since 2015</strong>, I&apos;ve been crafting
              digital experiences and solving complex problems with code. Started my full-time
              career while still in high school, driven by passion and curiosity.
            </p>

            <p>
              For me, <strong className={strong}>programming languages are just tools</strong>. With deep domain
              knowledge and adaptability, I write efficient code in any stack - from C++ and
              Python to production LLM agents.
            </p>

            <p>
              Built systems from scratch for companies like <strong className={strong}>Invicta</strong> (microservices),
              <strong className={strong}> Nokia</strong> (5G R&amp;D) and <strong className={strong}> Red Bull</strong> (data + backend platform).
              Led technical teams and architected solutions for top-tier brands.
            </p>

            <p>
              Currently focused on <strong className="text-accent font-medium">production AI</strong> -
              agentic, LLM-based systems on Temporal and RAG pipelines - alongside Web3 (dApps,
              Solidity, subgraphs). Always pushing boundaries and learning new paradigms.
            </p>

            <p>
              As a mentor at <strong className={strong}>devs-mentoring.pl</strong>, I help Mid and Senior backend
              developers level up, change projects, and achieve their career goals.
            </p>
          </div>

          <Stats
            items={[
              { value: 10, suffix: '+', label: 'Years' },
              { value: 9, label: 'Projects' },
              { value: 5, label: 'From Scratch' },
            ]}
          />
        </motion.div>

        {/* Founder Bio */}
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`${cardBase} ${theme === 'founder' ? 'border-accent/40' : ''} ${
            theme === 'developer' ? 'hidden md:block' : ''
          }`}
        >
          <CardHeader icon={<FaRocket className="w-5 h-5" />} title="Founder Story" />

          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-paper-muted">
            <p>
              Building products is one thing. <strong className="text-accent font-medium">Building
              companies that empower others</strong> is what drives me.
            </p>

            <p className="flex items-start gap-3">
              <FaGraduationCap className="w-4 h-4 mt-1 shrink-0 text-ember" />
              <span><strong className={strong}>devs-mentoring.pl</strong> - Assembled a team of 15 expert programming
              mentors, creating a platform where developers accelerate their careers through
              personalized guidance.</span>
            </p>

            <p className="flex items-start gap-3">
              <FaMobileAlt className="w-4 h-4 mt-1 shrink-0 text-ember" />
              <span><strong className={strong}>coderiv.com</strong> - Envisioned and building a mobile application that
              will revolutionize how developers learn and collaborate.</span>
            </p>

            <p className="flex items-start gap-3">
              <FaBullseye className="w-4 h-4 mt-1 shrink-0 text-ember" />
              <span><strong className={strong}>devs-hunting.com</strong> - Evaluated and coordinated project delivery
              for clients like Redsoft, connecting top talent with meaningful opportunities.</span>
            </p>

            <p className="flex items-start gap-3">
              <FaRobot className="w-4 h-4 mt-1 shrink-0 text-ember" />
              <span><strong className={strong}>Efektywniejsi</strong> - Co-founded with
              2 partners to teach people how to harness AI agents and n8n automation. Delivered
              numerous webinars, sharing knowledge with live audiences.</span>
            </p>

            <p>
              My mission: <strong className={strong}>Create ecosystems where developers thrive</strong>, combining
              technical expertise with business acumen to build sustainable, impactful ventures.
            </p>
          </div>

          <Stats
            items={[
              { value: 4, label: 'Brands' },
              { value: 15, suffix: '+', label: 'Mentors' },
              { value: 300, suffix: '+', label: 'Devs Helped' },
            ]}
          />
        </motion.div>
      </div>
    </Section>
  )
}
