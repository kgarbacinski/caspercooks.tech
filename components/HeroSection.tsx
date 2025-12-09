'use client'

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function HeroSection() {
  const { theme } = useTheme()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useTransform(mouseY, [-300, 300], [10, -10])
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10])

  const springConfig = { damping: 20, stiffness: 100 }
  const rotateXSpring = useSpring(rotateX, springConfig)
  const rotateYSpring = useSpring(rotateY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      mouseX.set(e.clientX - centerX)
      mouseY.set(e.clientY - centerY)
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: theme === 'developer'
              ? 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)'
              : 'linear-gradient(#ff6b35 1px, transparent 1px), linear-gradient(90deg, #ff6b35 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Split Screen Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 grid md:grid-cols-2 gap-12 md:gap-8 items-center">
        {/* Developer Side */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{
            opacity: theme === 'developer' ? 1 : 0.3,
            x: 0,
            scale: theme === 'developer' ? 1 : 0.95,
          }}
          transition={{ duration: 0.5 }}
          className={`space-y-4 sm:space-y-6 ${theme === 'founder' ? 'hidden md:block' : ''}`}
          style={{
            perspective: '1000px',
          }}
        >
          <motion.div
            style={{
              rotateX: theme === 'developer' ? rotateXSpring : 0,
              rotateY: theme === 'developer' ? rotateYSpring : 0,
            }}
          >
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-developer-accent/10 border-2 border-developer-accent mb-3 sm:mb-4 font-mono">
              <span className="text-developer-accent text-xs sm:text-sm">{'$ whoami'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 font-mono">
              Full-Stack
              <br />
              <span className="text-developer-accent">{'<Engineer />'}</span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-md font-mono">
              {'> Building scalable systems since 2015'}
              <br />
              {'> From microservices to Web3 dApps'}
              <br />
              {'> Complex problems → elegant solutions'}
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 sm:mt-6">
              <motion.div
                className="text-xs sm:text-sm font-mono border-2 border-developer-accent/30 px-2 py-1.5 sm:px-3 sm:py-2"
                whileHover={{ scale: 1.05, borderColor: '#00ff88' }}
              >
                <div className="text-developer-accent">0x08+ years</div>
                <div className="text-gray-500 text-[10px] sm:text-xs">// experience</div>
              </motion.div>
              <motion.div
                className="text-xs sm:text-sm font-mono border-2 border-developer-accent/30 px-2 py-1.5 sm:px-3 sm:py-2"
                whileHover={{ scale: 1.05, borderColor: '#00ff88' }}
              >
                <div className="text-developer-accent">0x09 projects</div>
                <div className="text-gray-500 text-[10px] sm:text-xs">// delivered</div>
              </motion.div>
              <motion.div
                className="text-xs sm:text-sm font-mono border-2 border-developer-accent/30 px-2 py-1.5 sm:px-3 sm:py-2"
                whileHover={{ scale: 1.05, borderColor: '#00ff88' }}
              >
                <div className="text-developer-accent">Web2 + Web3</div>
                <div className="text-gray-500 text-[10px] sm:text-xs">// full stack</div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Central Avatar - centered on mobile, between columns on desktop */}
        <div className="md:hidden flex justify-center order-first md:order-none col-span-full mb-8">
          <motion.div
            className="w-24 h-24 sm:w-32 sm:h-32"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ perspective: '1000px' }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{
                rotateY: theme === 'developer' ? 0 : 180
              }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden border-4 border-developer-accent"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <Image
                  src="/logos/nft_avatar_dev.png"
                  alt="Casper - Developer Avatar"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                  priority
                />
              </motion.div>
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden border-4 border-founder-accent"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <Image
                  src="/logos/nft_avatar_bussiness.png"
                  alt="Casper - CEO Avatar"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                  priority
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <motion.div
            className="w-32 h-32"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ perspective: '1000px' }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{
                rotateY: theme === 'developer' ? 0 : 180
              }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden border-4 border-developer-accent"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <Image
                  src="/logos/nft_avatar_dev.png"
                  alt="Casper - Developer Avatar"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                  priority
                />
              </motion.div>
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden border-4 border-founder-accent"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <Image
                  src="/logos/nft_avatar_bussiness.png"
                  alt="Casper - CEO Avatar"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                  priority
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Founder Side */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{
            opacity: theme === 'founder' ? 1 : 0.3,
            x: 0,
            scale: theme === 'founder' ? 1 : 0.95,
          }}
          transition={{ duration: 0.5 }}
          className={`space-y-4 sm:space-y-6 text-left md:text-right ${theme === 'developer' ? 'hidden md:block' : ''}`}
          style={{
            perspective: '1000px',
          }}
        >
          <motion.div
            style={{
              rotateX: theme === 'founder' ? rotateXSpring : 0,
              rotateY: theme === 'founder' ? rotateYSpring : 0,
            }}
          >
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-founder-accent/10 border-2 border-founder-accent mb-3 sm:mb-4 font-mono">
              <span className="text-founder-accent text-xs sm:text-sm">{'# portfolio'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 font-mono">
              Serial
              <br />
              <span className="text-founder-accent">{'[Founder]'}</span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg opacity-70 max-w-md md:ml-auto font-mono">
              {'# Building companies that empower devs'}
              <br />
              {'# From mentorship to AI automation'}
              <br />
              {'# Creating ecosystems of growth'}
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 sm:mt-6 md:justify-end">
              <motion.div
                className="text-xs sm:text-sm font-mono border-2 border-founder-accent/30 px-2 py-1.5 sm:px-3 sm:py-2"
                whileHover={{ scale: 1.05, borderColor: '#ff6b35' }}
              >
                <div className="text-founder-accent">4 brands</div>
                <div className="opacity-50 text-[10px] sm:text-xs">// founded</div>
              </motion.div>
              <motion.div
                className="text-xs sm:text-sm font-mono border-2 border-founder-accent/30 px-2 py-1.5 sm:px-3 sm:py-2"
                whileHover={{ scale: 1.05, borderColor: '#ff6b35' }}
              >
                <div className="text-founder-accent">15+ mentors</div>
                <div className="opacity-50 text-[10px] sm:text-xs">// team</div>
              </motion.div>
              <motion.div
                className="text-xs sm:text-sm font-mono border-2 border-founder-accent/30 px-2 py-1.5 sm:px-3 sm:py-2"
                whileHover={{ scale: 1.05, borderColor: '#ff6b35' }}
              >
                <div className="text-founder-accent">300+ devs</div>
                <div className="opacity-50 text-[10px] sm:text-xs">// impact</div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className={`w-6 h-10 border-2 rounded-full flex justify-center pt-2 ${
          theme === 'developer' ? 'border-developer-accent' : 'border-founder-accent'
        }`}>
          <motion.div
            className={`w-1.5 h-1.5 rounded-full ${
              theme === 'developer' ? 'bg-developer-accent' : 'bg-founder-accent'
            }`}
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}
