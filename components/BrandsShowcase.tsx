'use client'

import { motion } from 'framer-motion'
import { Section } from '@/components/ui/Section'
import { FaGraduationCap, FaMobileAlt, FaBullseye, FaRobot } from 'react-icons/fa'
import type { IconType } from 'react-icons'

interface Brand {
  name: string
  url: string
  tagline: string
  description: string
  stats: { label: string; value: string }[]
  icon: IconType
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
      { label: 'Developers Helped', value: '300+' },
      { label: 'Success Rate', value: '90%' },
    ],
    icon: FaGraduationCap,
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
    icon: FaMobileAlt,
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
    icon: FaBullseye,
    logo: '/logos/devs-hunting.svg',
    color: 'from-orange-500 to-red-500',
  },
  {
    name: 'Efektywniejsi',
    url: 'https://www.efektywniejsi.pl/',
    tagline: 'AI Automation & Productivity',
    description: 'Co-founded with 2 partners to teach people how to leverage AI agents and n8n automation. Conducted numerous webinars, sharing knowledge with live audiences and empowering professionals.',
    stats: [
      { label: 'Students', value: '200+' },
      { label: 'Webinars', value: '20+' },
      { label: 'Focus', value: 'AI & n8n' },
    ],
    icon: FaRobot,
    logo: '/logos/efektywniejsi.svg',
    color: 'from-green-500 to-emerald-500',
  },
]

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
}

const ExternalIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  const hasUrl = brand.url && brand.url !== '#'
  const smallLogo = brand.name === 'coderiv' || brand.name === 'Efektywniejsi'

  return (
    <motion.article
      {...reveal}
      transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
      className="group paper-card p-6 sm:p-8 flex flex-col transition duration-300 hover:border-accent/50 hover:-translate-y-1"
    >
      {/* Logo & Title */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
          <div
            className={`
              w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center overflow-hidden shrink-0 border
              ${brand.logo
                ? brand.name === 'Efektywniejsi'
                  ? 'bg-cocoa-900 border-cocoa-500/60'
                  : 'bg-paper border-cocoa-500/60'
                : 'bg-cocoa-900 border-cocoa-500/60 text-paper-muted'}
            `}
          >
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={`${brand.name} logo`}
                className="object-contain"
                style={{
                  width: smallLogo ? '80%' : '90%',
                  height: smallLogo ? '80%' : '90%',
                  imageRendering: '-webkit-optimize-contrast',
                }}
              />
            ) : (
              <brand.icon className="w-10 h-10 sm:w-12 sm:h-12" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-2xl text-paper mb-1 break-words">{brand.name}</h3>
            <p className="font-mono text-xs text-paper-dim">{brand.tagline}</p>
          </div>
        </div>

        {hasUrl && (
          <a
            href={brand.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${brand.name} website`}
            className="text-paper-muted hover:text-accent transition-colors"
          >
            <ExternalIcon className="w-5 h-5" />
          </a>
        )}
      </div>

      {/* Description */}
      <p className="text-paper-muted leading-relaxed text-sm sm:text-base mb-5">{brand.description}</p>

      {/* Visit Website Link */}
      {hasUrl && (
        <a
          href={brand.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-start font-mono text-xs uppercase tracking-[0.14em] text-paper hover:text-accent transition-colors"
        >
          Visit Website
          <ExternalIcon className="w-3.5 h-3.5" />
        </a>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-cocoa-500/40">
        {brand.stats.map((stat, i) => (
          <div key={i}>
            <div className="font-display text-xl sm:text-2xl text-accent mb-1">{stat.value}</div>
            <div className="font-mono text-[11px] text-paper-dim">{stat.label}</div>
          </div>
        ))}
      </div>
    </motion.article>
  )
}

export default function BrandsShowcase() {
  return (
    <Section
      id="brands"
      index="04"
      eyebrow="/brands"
      title="Building companies that empower developers"
      lead={
        <>
          From mentorship → AI automation.
          <br />
          Each venture solves real problems.
        </>
      }
    >
      {/* Brands Grid */}
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        {brands.map((brand, index) => (
          <BrandCard key={brand.name} brand={brand} index={index} />
        ))}
      </div>

      {/* CTA Section */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="paper-card ridge-top mt-16 sm:mt-20 p-8 sm:p-12 pt-14 sm:pt-16 text-center"
      >
        <h3 className="font-display text-3xl sm:text-4xl text-paper mb-4">Interested in Collaboration?</h3>
        <p className="text-paper-muted text-base sm:text-lg mb-8 max-w-2xl mx-auto">
          I'm always open to discussing new projects, partnerships, or opportunities
          to create value for the developer community.
        </p>
        <a href="#contact" className="btn-accent">
          Let's Talk
        </a>
      </motion.div>
    </Section>
  )
}
