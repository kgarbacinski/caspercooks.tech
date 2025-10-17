'use client'

import { motion, useInView } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useRef, useEffect, useState } from 'react'

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
    <div ref={ref} className="text-4xl font-bold">
      {count}{suffix}
    </div>
  )
}

export default function AboutSection() {
  const { theme } = useTheme()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <section id="about" className="py-16 sm:py-24 md:py-32 px-4 sm:px-8" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={isMobile ? {} : { duration: 0.5 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 md:mb-20 font-mono"
        >
          <span className={theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'}>
            {'$ cat '}
          </span>
          about.txt
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
          {/* Developer Bio */}
          <motion.div
            initial={isMobile ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={isMobile ? {} : { duration: 0.6, delay: 0.2 }}
            className={`
              p-8 rounded-2xl transition-all duration-500
              ${theme === 'developer'
                ? 'bg-developer-secondary border-2 border-developer-accent'
                : 'bg-white/5 border-2 border-transparent'}
              ${theme === 'founder' ? 'hidden md:block' : ''}
            `}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                theme === 'developer' ? 'bg-developer-accent text-developer-bg' : 'bg-gray-700'
              }`}>
                💻
              </div>
              <h3 className="text-2xl font-bold">Developer Journey</h3>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-gray-300">
              <p>
                <strong className="text-developer-accent">Since 2017</strong>, I've been crafting
                digital experiences and solving complex problems with code. Started my full-time
                career while still in high school, driven by passion and curiosity.
              </p>

              <p>
                For me, <strong>programming languages are just tools</strong>. With deep domain
                knowledge and adaptability, I write efficient code in any stack - from C++ and
                Python to Node.js and gRPC.
              </p>

              <p>
                Built systems from scratch for companies like <strong>Invicta</strong> (microservices),
                <strong> Infomotion</strong> and <strong> Red Bull</strong> (monoliths).
                Led technical teams and architected solutions for top-tier brands.
              </p>

              <p>
                Currently exploring <strong className="text-developer-accent">Web3</strong>,
                working with dApps, Smart Contracts in Solidity, and subgraphs. Always pushing
                boundaries and learning new paradigms.
              </p>

              <p>
                As a mentor at <strong>devs-mentoring.pl</strong>, I help Mid and Senior backend
                developers level up, change projects, and achieve their career goals.
              </p>
            </div>

            {/* Developer Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-700">
              <div className="text-center">
                <div className="text-developer-accent">
                  <AnimatedCounter value={8} suffix="+" />
                </div>
                <div className="text-sm text-gray-500 mt-1">Years</div>
              </div>
              <div className="text-center">
                <div className="text-developer-accent">
                  <AnimatedCounter value={9} />
                </div>
                <div className="text-sm text-gray-500 mt-1">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-developer-accent">
                  <AnimatedCounter value={5} />
                </div>
                <div className="text-sm text-gray-500 mt-1">From Scratch</div>
              </div>
            </div>
          </motion.div>

          {/* Founder Bio */}
          <motion.div
            initial={isMobile ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={isMobile ? {} : { duration: 0.6, delay: 0.4 }}
            className={`
              p-8 rounded-2xl transition-all duration-500
              ${theme === 'founder'
                ? 'bg-gray-900/40 border-2 border-founder-accent shadow-xl'
                : 'bg-white/5 border-2 border-transparent'}
              ${theme === 'developer' ? 'hidden md:block' : ''}
            `}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                theme === 'founder' ? 'bg-founder-accent text-white' : 'bg-gray-700'
              }`}>
                🚀
              </div>
              <h3 className="text-2xl font-bold">Founder Story</h3>
            </div>

            <div className={`space-y-4 text-sm sm:text-base ${theme === 'founder' ? 'text-gray-200' : 'text-gray-300'}`}>
              <p>
                Building products is one thing. <strong className="text-founder-accent">Building
                companies that empower others</strong> is what drives me.
              </p>

              <p>
                🎓 <strong>devs-mentoring.pl</strong> - Assembled a team of 15 expert programming
                mentors, creating a platform where developers accelerate their careers through
                personalized guidance.
              </p>

              <p>
                📱 <strong>coderiv.com</strong> - Envisioned and building a mobile application that
                will revolutionize how developers learn and collaborate.
              </p>

              <p>
                🎯 <strong>devs-hunting.com</strong> - Evaluated and coordinated project delivery
                for clients like Redsoft, connecting top talent with meaningful opportunities.
              </p>

              <p>
                🤖 <strong>Efektywniejsi</strong> - Co-founded with
                2 partners to teach people how to harness AI agents and n8n automation. Delivered
                numerous webinars, sharing knowledge with live audiences.
              </p>

              <p>
                My mission: <strong>Create ecosystems where developers thrive</strong>, combining
                technical expertise with business acumen to build sustainable, impactful ventures.
              </p>
            </div>

            {/* Founder Stats */}
            <div className={`grid grid-cols-3 gap-4 mt-8 pt-8 border-t ${theme === 'founder' ? 'border-gray-700' : 'border-gray-300'}`}>
              <div className="text-center">
                <div className="text-founder-accent">
                  <AnimatedCounter value={4} />
                </div>
                <div className={`text-sm mt-1 ${theme === 'founder' ? 'text-gray-500' : 'text-gray-500'}`}>Brands</div>
              </div>
              <div className="text-center">
                <div className="text-founder-accent">
                  <AnimatedCounter value={15} suffix="+" />
                </div>
                <div className={`text-sm mt-1 ${theme === 'founder' ? 'text-gray-500' : 'text-gray-500'}`}>Mentors</div>
              </div>
              <div className="text-center">
                <div className="text-founder-accent">
                  <AnimatedCounter value={100} suffix="+" />
                </div>
                <div className={`text-sm mt-1 ${theme === 'founder' ? 'text-gray-500' : 'text-gray-500'}`}>Devs Helped</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
