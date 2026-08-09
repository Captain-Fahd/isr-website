import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
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

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="-mt-20 bg-gradient-to-br from-isr-cream via-white to-isr-yellow pt-20">
        <Hero />
      </div>
      <EventsPreview initialEvents={upcomingEvents} />
      <Mission />
      <Contact />
      <Footer />
    </div>
  )
}
