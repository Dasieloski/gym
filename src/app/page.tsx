"use client"
import SmoothScrollWrapper from '@/components/landing/SmoothScrollWrapper'
import Atmosphere from '@/components/landing/Atmosphere'
import Navbar from '@/components/landing/Navbar'
import HeroPortal from '@/components/landing/HeroPortal'
import Manifesto from '@/components/landing/Manifesto'
import ExperienceGallery from '@/components/landing/ExperienceGallery'
import Methodology from '@/components/landing/Methodology'
import MembershipArquitecture from '@/components/landing/MembershipArquitecture'
import Testimonials from '@/components/landing/Testimonials'
import SocialFeed from '@/components/landing/SocialFeed'
import FAQ from '@/components/landing/FAQ'
import LocationMap from '@/components/landing/LocationMap'
import SignatureFooter from '@/components/landing/SignatureFooter'

export default function LandingPage() {
  return (
    <SmoothScrollWrapper>
      <Atmosphere />
      <Navbar />

      <main className="relative z-10 selection:bg-white selection:text-black">
        <HeroPortal />
        <Manifesto />
        <ExperienceGallery />
        <Methodology />
        <MembershipArquitecture />
        <Testimonials />
        <SocialFeed />
        <FAQ />
        <LocationMap />
        <SignatureFooter />
      </main>
    </SmoothScrollWrapper>
  )
}