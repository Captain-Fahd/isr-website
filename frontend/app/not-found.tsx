import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description:
    'We could not find the page you were looking for. Head back to the Islamic Society of RMIT homepage or try one of the links below.',
}

const primaryCtaClass =
  'inline-flex min-h-11 items-center justify-center rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red'

const secondaryCtaClass =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-isr-dark-red/20 bg-white px-6 py-3 text-sm font-semibold text-isr-dark-red transition-colors hover:border-isr-dark-red hover:bg-isr-cream'

const SUGGESTED_LINKS = [
  { href: '/prayer-times/', label: 'Prayer Times', blurb: 'Daily prayer and iqamah times' },
  { href: '/events/', label: 'Events', blurb: 'What is coming up on campus' },
  { href: '/announcements/', label: 'Announcements', blurb: 'The latest from the committee' },
  { href: '/contact/', label: 'Contact', blurb: 'Get in touch with ISR' },
]

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />

      <main>
        {/* Page Header */}
        <section className="px-4 pb-16 pt-24 sm:pt-28">
          <div className="container-isr text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
              Error 404
            </p>
            <h1
              className="mb-5 text-4xl font-bold text-isr-dark-red md:text-5xl"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              We couldn&rsquo;t find that page
            </h1>
            <div className="mx-auto mb-8 h-1 w-16 bg-isr-bright-red" />
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
              The page you were after may have moved, been renamed, or never existed. Let&rsquo;s
              get you back on track.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/" className={primaryCtaClass}>
                Back to home
              </Link>
              <Link href="/contact/" className={secondaryCtaClass}>
                Report a broken link
              </Link>
            </div>
          </div>
        </section>

        {/* Suggested Pages */}
        <section className="bg-white px-4 py-16 sm:py-20">
          <div className="container-isr">
            <div className="mx-auto max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
                Popular pages
              </p>
              <h2 className="mb-8 text-2xl font-bold text-isr-dark-red">
                You might be looking for
              </h2>

              <ul className="grid gap-4 sm:grid-cols-2">
                {SUGGESTED_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex h-full flex-col rounded-lg border border-isr-light-blue/40 bg-isr-cream/30 p-5 transition-colors hover:border-isr-turquoise hover:bg-isr-cream"
                    >
                      <span className="mb-1 font-semibold text-isr-dark-red">{link.label}</span>
                      <span className="text-sm leading-relaxed text-gray-600">{link.blurb}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
