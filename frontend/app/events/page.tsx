import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EventsTimeline from '@/components/EventsTimeline'

export const metadata: Metadata = {
  title: 'Events | Islamic Society of RMIT',
  description: 'Upcoming and past events from the Islamic Society of RMIT.',
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />

      <main className="py-16 px-4 sm:py-20">
        <div className="container-isr max-w-5xl mx-auto">
          <header className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
              Community & Activities
            </p>
            <h1 className="mb-4 text-4xl font-bold text-isr-dark-red md:text-5xl">Events</h1>
            <div className="mx-auto mb-6 h-1 w-16 bg-isr-bright-red" />
            <p className="mx-auto max-w-2xl text-gray-700">
              Follow the timeline below to see what&apos;s coming up and what we&apos;ve hosted
              together as a community.
            </p>
          </header>

          <EventsTimeline />
        </div>
      </main>

      <Footer />
    </div>
  )
}
