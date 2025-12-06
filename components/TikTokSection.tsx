'use client'

import { motion, useInView } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useRef, useState, useEffect } from 'react'
import { FaTiktok, FaGraduationCap, FaRocket, FaCode, FaBookOpen } from 'react-icons/fa'
import Image from 'next/image'

export default function TikTokSection() {
  const { theme } = useTheme()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const contentTypes = [
    { icon: FaGraduationCap, text: 'Mentor insights' },
    { icon: FaRocket, text: 'Tips & tricks' },
    { icon: FaCode, text: 'Code reviews' },
    { icon: FaBookOpen, text: 'Quick tutorials' },
  ]

  return (
    <section id="tiktok" className="py-16 sm:py-24 md:py-32 px-4 sm:px-8 relative overflow-hidden" ref={ref}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Terminal Header */}
        <motion.div
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={isMobile ? {} : { duration: 0.5 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-mono">
            <span className={theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'}>
              {'$ tiktok '}
            </span>
            --lang=pl --content=dev
          </h2>
          <p className={`max-w-2xl mx-auto font-mono text-sm sm:text-base px-4 ${theme === 'founder' ? 'text-gray-300' : 'text-gray-400'}`}>
            {'// Programming content in Polish'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Phone Mockup with Thumbnail */}
          <motion.div
            initial={isMobile ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={isMobile ? {} : { duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <motion.a
              href="https://www.tiktok.com/@kacper.senior.dev"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={isMobile ? {} : { scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group cursor-pointer"
            >
              {/* Phone Frame */}
              <div className={`
                relative w-[240px] sm:w-[280px] h-[480px] sm:h-[560px] rounded-[40px] p-2
                ${theme === 'developer'
                  ? 'bg-gradient-to-b from-gray-800 to-gray-900 shadow-[0_0_60px_rgba(0,255,136,0.2)]'
                  : 'bg-gradient-to-b from-gray-700 to-gray-800 shadow-[0_0_60px_rgba(255,107,53,0.2)]'}
              `}>
                {/* Screen */}
                <div className={`
                  relative w-full h-full rounded-[32px] overflow-hidden
                  ${theme === 'developer' ? 'bg-developer-bg' : 'bg-gray-900'}
                `}>
                  {/* Thumbnail */}
                  <Image
                    src="/tiktok-thumbnail.png"
                    alt="TikTok content preview"
                    fill
                    className="object-cover"
                  />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-all duration-300">
                    <motion.div
                      className={`
                        w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center
                        ${theme === 'developer'
                          ? 'bg-developer-accent/90'
                          : 'bg-founder-accent/90'}
                      `}
                      whileHover={{ scale: 1.1 }}
                    >
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* TikTok Logo Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                      ${theme === 'developer' ? 'bg-developer-accent' : 'bg-founder-accent'}
                    `}>
                      <FaTiktok className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                      <p className="text-white font-bold text-sm sm:text-base">@kacper.senior.dev</p>
                      <p className="text-gray-300 text-xs">Polish dev community</p>
                    </div>
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full" />
              </div>
            </motion.a>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={isMobile ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={isMobile ? {} : { duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Main Card */}
            <div className={`
              p-6 sm:p-8 rounded-2xl
              ${theme === 'founder'
                ? 'bg-gray-900/40 border-2 border-founder-accent'
                : 'bg-developer-secondary border-2 border-developer-accent/20'}
            `}>
              {/* Polish Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`
                  px-3 py-1 rounded-full text-xs font-bold
                  ${theme === 'developer'
                    ? 'bg-developer-accent/20 text-developer-accent'
                    : 'bg-founder-accent/20 text-founder-accent'}
                `}>
                  🇵🇱 Polish Content
                </span>
              </div>

              {/* Theme-aware Title & Description */}
              <h3 className="text-xl sm:text-2xl font-bold mb-3">
                {theme === 'developer'
                  ? 'Programming Mentor on TikTok'
                  : 'Devs-Mentoring on TikTok'}
              </h3>
              <p className={`mb-6 text-sm sm:text-base ${theme === 'founder' ? 'text-gray-300' : 'text-gray-400'}`}>
                {theme === 'developer'
                  ? 'Sharing knowledge and experience with the Polish dev community. Short, practical content for learning.'
                  : 'We promote programming mentorship through valuable content. TikTok is our platform for sharing knowledge.'}
              </p>

              {/* Content Types */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {contentTypes.map((item, index) => (
                  <motion.div
                    key={item.text}
                    initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={isMobile ? {} : { delay: 0.6 + index * 0.1 }}
                    className={`
                      flex items-center gap-2 p-2 rounded-lg
                      ${theme === 'founder' ? 'bg-gray-800/50' : 'bg-gray-700/30'}
                    `}
                  >
                    <item.icon className={`w-4 h-4 ${theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'}`} />
                    <span className="text-xs sm:text-sm font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.a
                href="https://www.tiktok.com/@kacper.senior.dev"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold text-sm sm:text-base
                  flex items-center justify-center gap-2 transition-all duration-300
                  ${theme === 'developer'
                    ? 'bg-developer-accent text-developer-bg hover:bg-developer-accent/90'
                    : 'bg-founder-accent text-white hover:bg-founder-accent/90'}
                `}
              >
                <FaTiktok className="w-5 h-5" />
                Follow on TikTok
              </motion.a>
            </div>

            {/* Bottom link - different for each mode */}
            <motion.a
              href={theme === 'founder' ? 'https://devs-mentoring.pl/' : 'https://www.tiktok.com/@kacper.senior.dev'}
              target="_blank"
              rel="noopener noreferrer"
              initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={isMobile ? {} : { delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              className={`
                block p-4 rounded-xl text-center transition-all duration-300
                ${theme === 'founder'
                  ? 'bg-gradient-to-r from-founder-accent/20 to-orange-500/20 border border-founder-accent/30 hover:border-founder-accent/50'
                  : 'bg-gradient-to-r from-developer-accent/20 to-cyan-500/20 border border-developer-accent/30 hover:border-developer-accent/50'}
              `}
            >
              <p className={`text-sm ${theme === 'founder' ? 'text-gray-300' : 'text-gray-400'}`}>
                {theme === 'founder' ? (
                  <>
                    Want more? Visit{' '}
                    <span className="text-founder-accent font-bold">devs-mentoring.pl</span>
                  </>
                ) : (
                  <>
                    Join the{' '}
                    <span className="text-developer-accent font-bold">Polish dev community</span>
                  </>
                )}
              </p>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
