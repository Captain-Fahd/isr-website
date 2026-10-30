import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import HomeHero from '@/components/HomeHero'
import type { HeroSlide } from '@/components/HeroCarousel'
import { fetchFlagshipEvents } from '@/lib/flagship'
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

  // Every flagship event is baked here (regardless of featuredOnHome/released) so
  // that flipping either flag live, from the admin panel, doesn't need a rebuild —
  // HomeHero decides at runtime which of these actually show.
  let flagshipEvents: Awaited<ReturnType<typeof fetchFlagshipEvents>> = []
  try {
    flagshipEvents = await fetchFlagshipEvents()
  } catch {
    flagshipEvents = []
  }
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
        <HomeHero flagshipEvents={flagshipEvents} defaultSlides={defaultSlides} />
      </div>
      <EventsPreview initialEvents={upcomingEvents} />
      <Mission />
      <Contact />
      <Footer />
    </div>
  )
}
