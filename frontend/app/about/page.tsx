import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CommunityIcon, FaithIcon, BookIcon, GlobeIcon } from '@/components/Icons'
import MissionContent from '@/components/MissionContent'
import NewsletterSignup from '@/components/NewsletterSignup'

export const metadata: Metadata = {
  title: 'About | Islamic Society of RMIT',
  description:
    'The Islamic Society of RMIT has been serving Muslim students on campus since 1993 — providing prayer, community, education, and advocacy.',
}

const pillars = [
  {
    Icon: FaithIcon,
    title: 'Prayer & Worship',
    description:
      'We facilitate access to on-campus prayer spaces and host weekly Jumu\'ah prayers, so students can uphold their religious obligations throughout the university day.',
  },
  {
    Icon: CommunityIcon,
    title: 'Community & Connection',
    description:
      'From Ramadan iftars to social gatherings, we build genuine bonds between Muslim students so that no one has to navigate university life alone.',
  },
  {
    Icon: BookIcon,
    title: 'Education & Events',
    description:
      'We run talks, workshops, and Islamic knowledge circles that deepen understanding of the faith and encourage meaningful dialogue across the wider campus.',
  },
  {
    Icon: GlobeIcon,
    title: 'Advocacy & Support',
    description:
      'ISR is a voice for Muslim students at RMIT — advocating for halal food options, prayer space access, and the accommodation of religious needs across all campuses.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />

      <main>
        {/* Page Header */}
        <section className="px-4 pb-16 pt-24 sm:pt-28">
          <div className="container-isr text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
              About ISR
            </p>
            <h1 className="mb-5 text-4xl font-bold text-isr-dark-red md:text-5xl" style={{ textWrap: 'balance' } as React.CSSProperties}>
              Serving the Muslims on campus since 1993
            </h1>
            <div className="mx-auto mb-8 h-1 w-16 bg-isr-bright-red" />
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
              For over thirty years, the Islamic Society of RMIT has been a home away from home
              for Muslim students — a place to pray, to belong, and to grow.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="bg-white px-4 py-16 sm:py-20">
          <div className="container-isr">
            <div className="mx-auto max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
                Our Story
              </p>
              <h2 className="mb-6 text-3xl font-bold text-isr-dark-red">Who We Are</h2>
              <div className="space-y-5 leading-relaxed text-gray-600">
                <p>
                  Founded in 1993, the Islamic Society of RMIT (ISR) is one of Melbourne's
                  longest-standing Muslim student associations. What began as a small group of
                  students seeking a place to pray and connect has grown into a vibrant community
                  that welcomes students across RMIT's campuses each year.
                </p>
                <p>
                  Muslim student associations exist to bridge the gap between faith and campus life.
                  University can feel isolating — especially for students who are far from family,
                  navigating a new culture, or simply looking for others who share their values.
                  An MSA provides that anchor: a familiar community, a space for worship, and a
                  network of support that extends well beyond graduation.
                </p>
                <p>
                  At ISR, we believe a student who feels grounded in their faith and connected to
                  their community is a student who thrives. That belief has guided everything we do
                  for over three decades, and it continues to shape every event, initiative, and
                  conversation we have today.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="bg-isr-light-blue/10 px-4 py-16 sm:py-20">
          <div className="container-isr">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
                What We Do
              </p>
              <h2 className="mb-4 text-3xl font-bold text-isr-dark-red">
                Four pillars of campus life
              </h2>
              <div className="mx-auto h-1 w-16 bg-isr-bright-red" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {pillars.map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl bg-white p-8 shadow-[0_12px_32px_rgba(91,11,5,0.08)] ring-1 ring-black/5"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-isr-cream text-isr-turquoise">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-isr-dark-red">{title}</h3>
                  <p className="leading-relaxed text-gray-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section id="mission-and-values" className="bg-white px-4 py-16 sm:py-20">
          <div className="container-isr">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
                Who We Are
              </p>
              <h2 className="mb-4 text-3xl font-bold text-isr-dark-red">Mission & Vision</h2>
              <div className="mx-auto mb-6 h-1 w-16 bg-isr-bright-red" />
              <p className="mx-auto max-w-2xl text-gray-600">
                ISR exists to represent, support, and uplift Muslim students at RMIT — building a
                campus community rooted in faith, brotherhood, and leadership.
              </p>
            </div>
            <MissionContent showCoreValues />
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 sm:py-20">
          <div className="container-isr text-center">
            <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">Want to get involved?</h2>
            <p className="mx-auto mb-8 max-w-xl text-gray-600">
              Whether you're a new student finding your feet or a returning member, there's always
              a place for you at ISR.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
              >
                Get in Touch
              </Link>
              <Link
                href="/events"
                className="rounded-lg border-2 border-isr-bright-red px-6 py-3 text-sm font-semibold text-isr-bright-red transition-colors hover:bg-isr-bright-red hover:text-white"
              >
                See Upcoming Events
              </Link>
            </div>

            <div className="mx-auto mt-12 max-w-xl">
              <NewsletterSignup />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
