'use client'

import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import AboutSection from '@/components/AboutSection'
import ProjectsTimeline from '@/components/ProjectsTimeline'
import TechStack from '@/components/TechStack'
import BrandsShowcase from '@/components/BrandsShowcase'
import TikTokSection from '@/components/TikTokSection'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'
import { CableDivider } from '@/components/ui/Section'
import ThemeWipe from '@/components/ThemeWipe'
import PageEffects from '@/components/PageEffects'
import SparkTrail from '@/components/SparkTrail'
import { MotionConfig } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

/*
 * Motyw papercraft: hero z warstwową dioramą (components/diorama), każda sekcja to
 * jeden "pokój" z wyspy, rozdzielone świecącym kablem. ScrollCinema (wideo w tle)
 * i CustomCursor zostają w repo, ale nie są już używane.
 */
export default function Home() {
  const { theme } = useTheme()

  return (
    // reducedMotion="user": przy prefers-reduced-motion framer pomija ruch (zostaje przenikanie)
    <MotionConfig reducedMotion="user">
      <PageEffects />
      <SparkTrail />
      <ThemeWipe />
      <Navigation />
      <main className="overflow-x-clip">
        <HeroSection />
        <CableDivider />
        <AboutSection />
        <ProjectsTimeline />
        {theme === 'developer' && <TechStack />}
        <BrandsShowcase />
        <TikTokSection />
        <CableDivider />
        <ContactSection />
      </main>
      <Footer />
    </MotionConfig>
  )
}
