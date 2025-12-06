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
import CustomCursor from '@/components/CustomCursor'
import { useTheme } from '@/contexts/ThemeContext'

export default function Home() {
  const { theme } = useTheme()

  return (
    <>
      <CustomCursor />
      <Navigation />
      <main className="overflow-x-hidden">
        <HeroSection />
        <AboutSection />
        <ProjectsTimeline />
        {theme === 'developer' && <TechStack />}
        <BrandsShowcase />
        <TikTokSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
