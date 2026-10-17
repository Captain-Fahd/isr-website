import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import HomeHero from '@/components/HomeHero'
import type { HeroSlide } from '@/components/HeroCarousel'
import FlagshipHeroSlide from '@/components/flagship/FlagshipHeroSlide'
import { getFeaturedFlagshipEvent } from '@/lib/flagship'
import Mission from '@/components/Mission'
import EventsPreview from '@/components/EventsPreview'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { fetchEvents } from '@/lib/events'

export default async function Home() {
  let upcomingEvents: Awaited<ReturnType<typeof fetchEvents>> = []
  try {
    upcomingEvents = await fetchEvents('upcoming')
  } catch {
    upcomingEvents = []
  }

  const featured = getFeaturedFlagshipEvent()
  // Flagship event leads and stays up longer than the regular hero, once
  // released from the admin panel.
  const flagshipSlides: HeroSlide[] = featured
    ? [{ id: featured.slug, label: featured.name, duration: 12000, content: <FlagshipHeroSlide event={featured} /> }]
    : []
  const defaultSlides: HeroSlide[] = [
    {
      id: 'home',
      label: 'Islamic Society of RMIT',
      duration: 7000,
      content: (
        <div className="h-full bg-gradient-to-br from-isr-cream via-white to-isr-yellow">
          <Hero />
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Pull up under the navbar spacer so the hero fills the screen */}
      <div className="-mt-20">
        <HomeHero flagshipSlides={flagshipSlides} defaultSlides={defaultSlides} />
      </div>
      <EventsPreview initialEvents={upcomingEvents} />
      <Mission />
      <Contact />
      <Footer />
    </div>
  )
}
