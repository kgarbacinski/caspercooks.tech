'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useSafeReducedMotion'
import { SectionHeader, RoomCutout, EASE } from '@/components/ui/Section'
import { useTheme } from '@/contexts/ThemeContext'
import { FaGraduationCap, FaMobileAlt, FaBullseye, FaRobot } from 'react-icons/fa'
import type { IconType } from 'react-icons'

/**
 * Marki = papierowa uliczka ze sklepami. Pokój przy nagłówku to zawsze "coderiv" (studio aplikacji
 * z wyspy CEO) — marki są te same w obu trybach, a pokoje DEV (np. Web3 vault) nie pasują do firm.
 * Każda marka to fasada z Gemini (ta sama grafika, markiza przebarwiona na kolor marki),
 * logo na szyldzie, tagline jak neon w witrynie. Hover zapala latarnie i neon.
 * Pod fasadą papierowa tabliczka z opisem i statystykami. Treść bez zmian.
 */

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
      { label: '5★ Reviews', value: '80+' },
    ],
    icon: FaGraduationCap,
    logo: '/logos/devs-mentoring.png',
    color: '#3f7fd6',
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
    color: '#9b5bd6',
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
    color: '#e0672d',
  },
  {
    name: 'Efektywniejsi',
    url: 'https://www.efektywniejsi.pl/',
    tagline: 'AI Automation & Productivity',
    description: 'Co-founded with 2 partners to teach people how to leverage AI agents and n8n automation. Conducted numerous webinars, sharing knowledge with live audiences and empowering professionals.',
    stats: [
      { label: 'People Trained', value: '200+' },
      { label: 'Webinars', value: '20+' },
      { label: 'Focus', value: 'AI & n8n' },
    ],
    icon: FaRobot,
    logo: '/logos/efektywniejsi.svg',
    color: '#1fae7a',
  },
]


const ExternalIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

function Shop({ brand, index }: { brand: Brand; index: number }) {
  const reduce = useReducedMotion()
  const [lit, setLit] = useState(false)
  const hasUrl = brand.url && brand.url !== '#'
  const darkLogo = brand.name === 'Efektywniejsi'
  return (
    <motion.article
      className="group relative flex flex-col snap-center shrink-0 w-[78vw] sm:w-auto"
      initial={reduce ? false : { opacity: 0, y: 60, rotateX: -25 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease: EASE, delay: index * 0.1 }}
      style={{ transformPerspective: 900, transformOrigin: '50% 100%' }}
      onMouseEnter={() => setLit(true)}
      onMouseLeave={() => setLit(false)}
      onFocus={() => setLit(true)}
      onBlur={() => setLit(false)}
    >
      {/* fasada */}
      {/* container query: napisy na szyldzie i w witrynie skalują się z szerokością fasady (a nie ekranu) */}
      <div className={`relative transition-transform duration-500 ${lit ? '-translate-y-2' : ''}`} style={{ aspectRatio: '720 / 795', containerType: 'inline-size' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sections/facade.webp" srcSet="/sections/facade.webp 720w, /sections/facade-lg.webp 1440w" sizes="(min-width: 1921px) and (min-aspect-ratio: 4/5) 15vw, (min-width: 1280px) 290px, (min-width: 1024px) and (min-aspect-ratio: 4/5) 23vw, (min-width: 640px) 45vw, 78vw" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full drop-shadow-[0_24px_24px_rgba(0,0,0,0.7)]" loading="lazy" />
        {/* markiza w kolorze marki (tryb "hue": krem zostaje kremowy, pasy zmieniają barwę) */}
        <div
          aria-hidden="true"
          className="absolute mix-blend-hue opacity-90"
          style={{ left: '11%', top: '24%', width: '78%', height: '21%', background: brand.color }}
        />
        {/* latarnie — zapalają się przy hoverze */}
        {[8.6, 91.4].map((x) => (
          <span
            key={x}
            aria-hidden="true"
            className="absolute w-[34%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-500 pointer-events-none"
            style={{
              left: `${x}%`,
              top: '29%',
              background: 'radial-gradient(circle, rgba(255,190,110,0.55), rgba(255,140,60,0.18) 40%, transparent 70%)',
              opacity: lit ? 1 : 0.35,
            }}
          />
        ))}
        {/* szyld z logo */}
        <div className="absolute flex items-center justify-center gap-3 px-3" style={{ left: '8%', top: '4.6%', width: '84%', height: '17%' }}>
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logo}
              alt={`${brand.name} logo`}
              className={`h-[58%] w-auto max-w-[32%] shrink-0 object-contain ${darkLogo ? 'rounded-md bg-cocoa-900 p-1' : 'mix-blend-multiply'}`}
            />
          ) : (
            <brand.icon className="h-1/2 w-auto text-ink/70" />
          )}
          <span className="font-display text-[clamp(0.875rem,6cqw,1.25rem)] leading-none text-ink whitespace-nowrap">{brand.name}</span>
        </div>
        {/* witryna z neonem */}
        <div
          className="absolute flex items-center justify-center p-[2.5%] text-center overflow-hidden"
          style={{ left: '15.6%', top: '48.2%', width: '45%', height: '31.4%' }}
        >
          <span
            className="font-mono text-[clamp(0.75rem,4.3cqw,0.875rem)] leading-snug uppercase tracking-[0.02em] transition-all duration-500"
            style={{
              color: lit ? '#fff4e0' : 'rgba(241,228,207,0.45)',
              textShadow: lit ? `0 0 6px ${brand.color}, 0 0 16px ${brand.color}, 0 0 30px ${brand.color}` : 'none',
            }}
          >
            {brand.tagline}
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-0 transition-opacity duration-500"
            style={{ background: `radial-gradient(ellipse at 50% 60%, ${brand.color}40, transparent 70%)`, opacity: lit ? 1 : 0 }}
          />
        </div>
      </div>

      {/* tabliczka z opisem */}
      <div className="plaque relative -mt-2 mx-[4%] flex-1 flex flex-col">
        <p className="text-paper-muted leading-relaxed text-[14.5px] mb-5">{brand.description}</p>
        <dl className="pt-3 mt-auto border-t border-dashed border-cocoa-500/60 space-y-1">
          {brand.stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline justify-between gap-3">
              <dt className="font-mono text-xs uppercase tracking-[0.12em] text-paper-dim">{stat.label}</dt>
              <dd className="font-display text-base text-accent leading-tight text-right">{stat.value}</dd>
            </div>
          ))}
        </dl>
        {hasUrl && (
          <a
            href={brand.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-arrow mt-3 -mb-2 self-start"
          >
            Visit Website
            <ExternalIcon className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </motion.article>
  )
}

export default function BrandsShowcase() {
  const reduce = useReducedMotion()
  const { theme } = useTheme()
  return (
    <section id="brands" className="relative py-16 sm:py-24 scroll-mt-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex items-end justify-between gap-8 mb-14 sm:mb-16">
          <SectionHeader
            index={theme === 'developer' ? '04' : '03'}
            eyebrow="/brands"
            title="Building companies that empower developers"
            lead={
              <>
                From mentorship → AI automation.
                <br />
                Each venture solves real problems.
              </>
            }
          />
          <RoomCutout world="ceo" room={2} className="hidden md:block w-56 lg:w-72 shrink-0 -mb-6" />
        </div>
      </div>

      {/* uliczka */}
      <div className="relative max-w-7xl mx-auto">
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 items-stretch gap-6 sm:gap-8 lg:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory px-4 sm:px-8 pb-6 no-scrollbar">
          {brands.map((brand, index) => (
            <Shop key={brand.name} brand={brand} index={index} />
          ))}
        </div>
        <p className="sm:hidden px-4 font-mono text-xs uppercase tracking-[0.18em] text-paper-dim text-center">swipe → 4 shops</p>
        {/* chodnik pod sklepami */}
        <div aria-hidden="true" className="hidden lg:block mx-8 -mt-[1px] h-2 rounded-full bg-gradient-to-r from-transparent via-kraft/25 to-transparent" />
      </div>

      {/* wiszący szyld CTA */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <motion.div
          className="relative mx-auto mt-24 sm:mt-28 max-w-3xl"
          initial={reduce ? false : { rotate: -6, y: -40, opacity: 0 }}
          whileInView={{ rotate: [-6, 3, -1.5, 0.5, 0], y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          style={{ transformOrigin: '50% -60px' }}
        >
          {/* drążek, na którym wisi szyld */}
          <span aria-hidden="true" className="absolute left-[10%] right-[10%] -top-[84px] h-2 rounded-full bg-gradient-to-b from-[#8d6a45] to-[#5a3e28] shadow-[0_6px_10px_rgba(0,0,0,0.6)]" />
          {/* sznurki */}
          <span aria-hidden="true" className="absolute left-[18%] -top-20 h-20 w-[2px] bg-kraft/70" />
          <span aria-hidden="true" className="absolute right-[18%] -top-20 h-20 w-[2px] bg-kraft/70" />
          <div className="hanging-sign text-center px-6 py-10 sm:px-12 sm:py-12">
            <h3 className="font-display text-3xl sm:text-4xl text-ink mb-4">Interested in Collaboration?</h3>
            <p className="text-ink/70 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
              I&apos;m always open to discussing new projects, partnerships, or opportunities to create value for the developer community.
            </p>
            <a href="#contact" className="btn-accent">
              Let&apos;s Talk <span aria-hidden="true">→</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
