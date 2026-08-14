import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SponsorshipForm from '@/components/SponsorshipForm'

export const metadata: Metadata = {
  title: 'Become a Sponsor',
  description:
    'Partner with the Islamic Society of RMIT. Tell us about your business and we will get back to you with sponsorship options that reach Muslim students at RMIT University, Melbourne.',
  alternates: { canonical: '/support-us/sponsor/' },
  openGraph: {
    title: 'Become a Sponsor | Islamic Society of RMIT',
    description:
      'Partner with ISR — event, program and semester-long sponsorship options for businesses and organisations.',
    url: '/support-us/sponsor/',
  },
}

const benefits = [
  'Event, program and semester-long partnership options',
  'Brand presence at ISR events and across our channels',
  'Reach Muslim students and alumni at RMIT University',
]

export default function SponsorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />

      <main>
        {/* Page Header */}
        <section className="px-4 pb-12 pt-24 sm:pt-28">
          <div className="container-isr text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
              Sponsorship Enquiry
            </p>
            <h1
              className="mb-5 text-4xl font-bold text-isr-dark-red md:text-5xl"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              Partner with ISR
            </h1>
            <div className="mx-auto mb-8 h-1 w-16 bg-isr-bright-red" />
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
              Sponsors help us run bigger events and reach more students. Tell us about your
              business below and we will get back to you with the options that suit you best.
            </p>
          </div>
        </section>

        {/* Form + benefits */}
        <section className="px-4 pb-20">
          <div className="container-isr mx-auto max-w-5xl">
            <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
              <div>
                <h2 className="mb-6 text-2xl font-bold text-isr-dark-red">
                  What sponsors get
                </h2>
                <ul className="mb-8 space-y-3 text-gray-600">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-3">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-isr-bright-red"
                        aria-hidden="true"
                      />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-sm leading-relaxed text-gray-600">
                  Looking to give as an individual instead?{' '}
                  <Link
                    href="/support-us/"
                    className="font-semibold text-isr-dark-red underline underline-offset-2 hover:text-isr-turquoise"
                  >
                    See all the ways to support ISR
                  </Link>
                  .
                </p>
              </div>

              <SponsorshipForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
