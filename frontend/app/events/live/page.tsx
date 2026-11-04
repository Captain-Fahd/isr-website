import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EventDetail from '@/components/EventDetail'

// Generic shell for /events/<id>/ URLs that weren't pre-rendered — i.e. events added
// in the admin panel since the last build. public/.htaccess serves this file for
// those URLs; EventDetail reads the ID from the address bar and loads it live.
// The next build pre-renders the event properly (with its own title/OG tags).
export const metadata: Metadata = {
  title: 'Event',
  description: 'Event details from the Islamic Society of RMIT.',
}

export default function LiveEventPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />
      <EventDetail />
      <Footer />
    </div>
  )
}
