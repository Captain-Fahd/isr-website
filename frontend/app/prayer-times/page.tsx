import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PrayerTimesTable from '@/components/PrayerTimesTable'
import { CAMPUS } from '@/lib/campus'

export const metadata: Metadata = {
  title: 'Prayer Times & Jumu\'ah',
  description:
    'Daily prayer times for Melbourne and weekly Jumu\'ah information for Muslim students at RMIT University City Campus.',
  alternates: { canonical: '/prayer-times/' },
  openGraph: {
    title: 'Prayer Times & Jumu\'ah | Islamic Society of RMIT',
    description:
      'Daily prayer times for Melbourne and weekly Jumu\'ah information for Muslim students at RMIT University City Campus.',
    url: '/prayer-times/',
  },
}

export default function PrayerTimesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />

      <main>
        <section className="px-4 pb-12 pt-24 sm:pt-28">
          <div className="container-isr mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
              Worship on Campus
            </p>
            <h1 className="mb-5 text-4xl font-bold text-isr-dark-red md:text-5xl">
              Prayer Times &amp; Jumu&apos;ah at RMIT
            </h1>
            <div className="mx-auto mb-8 h-1 w-16 bg-isr-bright-red" />
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
              Daily prayer times for Melbourne, plus how to find Jumu&apos;ah and on-campus prayer
              spaces with the Islamic Society of RMIT.
            </p>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:py-20">
          <div className="container-isr mx-auto max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
              Friday Prayer
            </p>
            <h2 className="mb-4 text-3xl font-bold text-isr-dark-red">Jumu&apos;ah at RMIT</h2>
            <div className="space-y-4 leading-relaxed text-gray-700">
              <p>
                <strong>Day:</strong> {CAMPUS.jumuah.day}
              </p>
              <p>{CAMPUS.jumuah.summary}</p>
              <p>
                <strong>RMIT City:</strong> Building 47, 8 Orr St, Carlton —{' '}
                <strong>1:30pm</strong> all year round. Brothers on Levels 2–3,
                sisters on Level 1. Student ID required for musallah access.
              </p>
              <p>
                <strong>RMIT Bundoora:</strong> Building 202, Plenty Rd — starts
                between 12:30pm and 1:30pm (announced weekly). Brothers Room
                202.03.30, sisters Room 202.04.01.
              </p>
              <p>
                Full flyer, room details, and access notes are on our{' '}
                <Link
                  href="/jumah/"
                  className="font-semibold text-isr-dark-red underline underline-offset-2 hover:text-isr-turquoise"
                >
                  Jumu&apos;ah page
                </Link>
                .
              </p>
              <p>
                <a
                  href={CAMPUS.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-isr-dark-red underline underline-offset-2 hover:text-isr-turquoise"
                >
                  Message ISR on WhatsApp
                </a>
                {' '}
                or email{' '}
                <a
                  href={`mailto:${CAMPUS.email}`}
                  className="font-semibold text-isr-dark-red underline underline-offset-2 hover:text-isr-turquoise"
                >
                  {CAMPUS.email}
                </a>
                {' '}
                if you need help finding the musallah.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-isr-light-blue/10 px-4 py-16 sm:py-20">
          <div className="container-isr mx-auto max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
              Location
            </p>
            <h2 className="mb-4 text-3xl font-bold text-isr-dark-red">Campus prayer spaces</h2>
            <div className="space-y-4 leading-relaxed text-gray-700">
              <p>
                <strong>Campus:</strong> {CAMPUS.localityLabel}
              </p>
              <p>{CAMPUS.prayerSpaceSummary}</p>
              <p>
                ISR helps Muslim students access on-campus prayer facilities and will point you to
                the current standing room when you reach out.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:py-20">
          <div className="container-isr mx-auto max-w-md">
            <div className="mb-8 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
                Today
              </p>
              <h2 className="mb-4 text-3xl font-bold text-isr-dark-red">Daily prayer times</h2>
              <p className="text-gray-600">
                Melbourne timings for Fajr, Dhuhr, Asr, Maghrib, and Isha.
              </p>
            </div>
            <PrayerTimesTable />
            <p className="mt-8 text-center text-sm text-gray-600">
              Looking for events instead?{' '}
              <Link
                href="/events/"
                className="font-semibold text-isr-dark-red underline underline-offset-2 hover:text-isr-turquoise"
              >
                See the ISR events calendar
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
