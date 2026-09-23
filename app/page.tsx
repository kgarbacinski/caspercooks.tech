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
import { useTheme } from '@/contexts/ThemeContext'

/*
 * Motyw papercraft: hero z lewitującą dioramą (FloatingDiorama), sekcje jako
 * "pokoje" rozdzielone świecącym kablem. ScrollCinema (wideo w tle) i CustomCursor
 * zostają w repo, ale nie są już używane.
 */
export default function Home() {
  const { theme } = useTheme()

  return (
    <>
      <PageEffects />
      <ThemeWipe />
      <Navigation />
      <main className="overflow-x-clip">
        <HeroSection />
        <CableDivider />
        <AboutSection />
        <CableDivider />
        <ProjectsTimeline />
        {theme === 'developer' && (
          <>
            <CableDivider />
            <TechStack />
          </>
        )}
        <CableDivider />
        <BrandsShowcase />
        <CableDivider />
        <TikTokSection />
        <CableDivider />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
