import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MissionContent from '@/components/MissionContent'

export const metadata: Metadata = {
  title: 'Mission & Vision | Islamic Society of RMIT',
  description:
    'Learn about the Islamic Society of RMIT’s mission and vision to serve Muslim students on campus.',
}

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />

      <main className="py-16 px-4 sm:py-20">
        <div className="container-isr max-w-4xl mx-auto">
          <header className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
              Who We Are
            </p>
            <h1 className="mb-4 text-4xl font-bold text-isr-dark-red md:text-5xl">
              Mission & Vision
            </h1>
            <div className="mx-auto mb-6 h-1 w-16 bg-isr-bright-red" />
            <p className="mx-auto max-w-2xl text-gray-700">
              ISR exists to represent, support, and uplift Muslim students at RMIT — building a
              campus community rooted in faith, brotherhood, and leadership.
            </p>
          </header>

          <MissionContent showCoreValues />
        </div>
      </main>

      <Footer />
    </div>
  )
}
