'use client'

import { motion, useInView } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useRef, useState, useEffect } from 'react'

interface Brand {
  name: string
  url: string
  tagline: string
  description: string
  stats: { label: string; value: string }[]
  icon: string
  logo?: string
  color: string
}

const brands: Brand[] = [
  {
    name: 'devs-mentoring.pl',
    url: 'https://devs-mentoring.pl/',
    tagline: 'Empowering Developers Through Mentorship',
    description: 'Built a thriving community of 15 expert programming mentors helping Mid and Senior backend developers advance their careers, switch projects, and level up their skills.',
    stats: [
      { label: 'Mentors', value: '15+' },
      { label: 'Developers Helped', value: '100+' },
      { label: 'Success Rate', value: '80%' },
    ],
    icon: '🎓',
    logo: '/logos/devs-mentoring.png',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'coderiv',
    url: 'https://coderiv.com/',
    tagline: 'Revolutionary Mobile Learning Platform',
    description: 'Envisioning and building a mobile application that will transform how developers learn, collaborate, and grow. Creating seamless experiences for the next generation of coders.',
    stats: [
      { label: 'Platform', value: 'Mobile' },
      { label: 'Target Users', value: '10k+' },
      { label: 'Status', value: 'Building' },
    ],
    icon: '📱',
    logo: '/logos/coderiv.png',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'devs-hunting',
    url: 'http://devs-hunting.com/',
    tagline: 'Connecting Talent with Opportunities',
    description: 'Evaluating and coordinating delivery of development projects for clients like Redsoft. Bridging the gap between top-tier talent and meaningful work.',
    stats: [
      { label: 'Projects Delivered', value: '20+' },
      { label: 'Clients', value: 'Enterprise' },
      { label: 'Quality', value: 'Premium' },
    ],
    icon: '🎯',
    logo: '/logos/devs-hunting.svg',
    color: 'from-orange-500 to-red-500',
  },
  {
    name: 'Efektywniejsi',
    url: 'https://www.efektywniejsi.pl/',
    tagline: 'AI Automation & Productivity',
    description: 'Co-founded with 2 partners to teach people how to leverage AI agents and n8n automation. Conducted numerous webinars, sharing knowledge with live audiences and empowering professionals.',
    stats: [
      { label: 'Students', value: '500+' },
      { label: 'Webinars', value: '20+' },
      { label: 'Focus', value: 'AI & n8n' },
    ],
    icon: '🤖',
    logo: '/logos/efektywniejsi.svg',
    color: 'from-green-500 to-emerald-500',
  },
]

function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  const { theme } = useTheme()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
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
    <motion.div
      ref={ref}
      initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={isMobile ? {} : { 
        duration: 0.6, 
        delay: index * 0.1,
        ease: 'easeOut' 
      }}
      whileHover={isMobile ? {} : { y: -10 }}
      className={`
        relative group overflow-hidden rounded-2xl
        transition-all duration-500
        ${theme === 'founder'
          ? 'bg-gray-900/40 border-2 border-founder-accent shadow-xl'
          : 'bg-developer-secondary border-2 border-developer-accent/30'}
      `}
    >
      {/* Gradient Background */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${brand.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500
      `} />

      <div className="relative p-4 sm:p-6 md:p-8">
        {/* Logo & Title */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
            <div className={`
              w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl flex items-center justify-center overflow-hidden shrink-0
              ${brand.logo
                ? brand.name === 'Efektywniejsi'
                  ? 'bg-gray-800 border-2 border-gray-600 shadow-md'
                  : 'bg-white border-2 border-gray-200 shadow-md'
                : `bg-gradient-to-br ${brand.color} border-2 border-transparent`}
            `}>
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className="object-contain"
                  style={{
                    width: brand.name === 'coderiv' || brand.name === 'Efektywniejsi' ? '80%' : '90%',
                    height: brand.name === 'coderiv' || brand.name === 'Efektywniejsi' ? '80%' : '90%',
                    imageRendering: '-webkit-optimize-contrast'
                  }}
                />
              ) : (
                <span className="text-2xl sm:text-3xl md:text-4xl">{brand.icon}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 font-mono break-words">{brand.name}</h3>
              <p className={`text-xs sm:text-sm font-mono ${theme === 'founder' ? 'text-gray-300' : 'text-gray-400'}`}>
                {brand.tagline}
              </p>
            </div>
          </div>

          {brand.url && brand.url !== '#' && (
            <a
              href={brand.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                opacity-0 group-hover:opacity-100 transition-opacity
                ${theme === 'founder' ? 'text-founder-accent' : 'text-developer-accent'}
              `}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        {/* Description */}
        <p className={`mb-4 leading-relaxed text-sm sm:text-base ${theme === 'founder' ? 'text-gray-200' : 'text-gray-300'}`}>
          {brand.description}
        </p>

        {/* Visit Website Link */}
        {brand.url && brand.url !== '#' && (
          <a
            href={brand.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              inline-flex items-center gap-2 text-sm font-medium transition-all duration-300
              ${theme === 'founder' ? 'text-founder-accent hover:underline' : 'text-developer-accent hover:underline'}
            `}
          >
            Visit Website
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}

        {/* Stats */}
        <div className={`grid grid-cols-3 gap-4 pt-6 mt-4 border-t ${theme === 'founder' ? 'border-gray-700' : 'border-gray-700'}`}>
          {brand.stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className={`text-xl font-bold mb-1 ${
                theme === 'founder' ? 'text-founder-accent' : 'text-developer-accent'
              }`}>
                {stat.value}
              </div>
              <div className={`text-xs ${theme === 'founder' ? 'text-gray-500' : 'text-gray-500'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Hover Effect Border */}
        <div className={`
          absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${brand.color}
          transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500
        `} />
      </div>
    </motion.div>
  )
}

export default function BrandsShowcase() {
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

  return (
    <section id="brands" className="py-16 sm:py-24 md:py-32 px-4 sm:px-8 relative overflow-hidden" ref={ref}>
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={isMobile ? {} : { duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-mono">
            <span className={theme === 'developer' ? 'text-developer-accent' : 'text-founder-accent'}>
              {'$ tree '}
            </span>
            /brands
          </h2>
          <p className={`max-w-2xl mx-auto font-mono ${theme === 'founder' ? 'text-gray-300' : 'text-gray-400'}`}>
            {'// Building companies that empower developers'}
            <br />
            {'// From mentorship → AI automation'}
            <br />
            {'// Each venture solves real problems'}
          </p>
        </motion.div>

        {/* Brands Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {brands.map((brand, index) => (
            <BrandCard key={brand.name} brand={brand} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={isMobile ? {} : { 
            duration: 0.6, 
            delay: 0.6,
            ease: 'easeOut' 
          }}
          className={`
            mt-20 p-8 md:p-12 rounded-2xl text-center
            ${theme === 'founder'
              ? 'bg-gradient-to-r from-founder-accent to-orange-500 text-white'
              : 'bg-gradient-to-r from-developer-accent to-cyan-500 text-developer-bg'}
          `}
        >
          <h3 className="text-3xl font-bold mb-4">
            Interested in Collaboration?
          </h3>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            I'm always open to discussing new projects, partnerships, or opportunities
            to create value for the developer community.
          </p>
          <a
            href="#contact"
            className={`
              inline-block px-8 py-4 rounded-full font-bold transition-all duration-300
              ${theme === 'founder'
                ? 'bg-gray-900 text-white border-2 border-white hover:scale-105'
                : 'bg-developer-bg text-developer-accent hover:scale-105'}
            `}
          >
            Let's Talk
          </a>
        </motion.div>
      </div>
    </section>
  )
}
