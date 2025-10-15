import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import AboutSection from '@/components/AboutSection'
import ProjectsTimeline from '@/components/ProjectsTimeline'
import TechStack from '@/components/TechStack'
import BrandsShowcase from '@/components/BrandsShowcase'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'
import CustomCursor from '@/components/CustomCursor'

export default function Home() {
  return (
    <>
      <CustomCursor />
      <Navigation />
      <main className="overflow-x-hidden">
        <HeroSection />
        <AboutSection />
        <ProjectsTimeline />
        <TechStack />
        <BrandsShowcase />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
