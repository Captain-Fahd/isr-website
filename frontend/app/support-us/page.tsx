import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CoinIcon, CommunityIcon, ArrowRight } from '@/components/Icons'
import { CAMPUS } from '@/lib/campus'

export const metadata: Metadata = {
  title: 'Support Us',
  description:
    'Support the Islamic Society of RMIT — donate to fund our on-campus programs, or partner with us as a sponsor. Every contribution goes back to Muslim students at RMIT University, Melbourne.',
  alternates: { canonical: '/support-us/' },
  openGraph: {
    title: 'Support Us | Islamic Society of RMIT',
    description:
      'Donate or become a sponsor and help fund ISR programs for Muslim students at RMIT.',
    url: '/support-us/',
  },
}

const DONATION_URL =
  'https://www.trybooking.com/au/donate/isrdonations?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAb21jcATr-yZwZG9mAmV4dG4DYWVtAjExAHNydGMGYXBwX2lkDzU2NzA2NzM0MzM1MjQyNwABp3VRU6EumjNboDtRwC4TUNoEhfpUERekmTsbrprb2XKfCWqlghV8oEzOEi9N_aem_oiAqHTGSGge7_49zLpDiKA'

const ctaClass =
  'mt-auto inline-flex min-h-11 items-center justify-center rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red'

type Way = {
  id: string
  label: string
  title: string
  body: string
  points: string[]
  cta: string
  /** External link. Falls back to an email to ISR when absent. */
  href?: string
  /** Internal route, e.g. the sponsorship form page. Takes precedence over `href`. */
  route?: string
  subject: string
  Icon: ({ className }: { className?: string }) => JSX.Element
}

const ways: Way[] = [
  {
    id: 'donation',
    label: 'One-off or recurring',
    title: 'Support via Donation',
    body: 'Donations pay for the things students actually see — Jumu’ah setup, iftars, food at events, prayer space supplies and da’wah materials on campus. Give whatever you can, whenever you can.',
    points: [
      'Secure payments handled through TryBooking',
      'Give once or set up a recurring contribution',
      'Every dollar goes straight back into ISR programs',
    ],
    cta: 'Donate now',
    href: DONATION_URL,
    subject: 'Donating to ISR',
    Icon: CoinIcon,
  },
  {
    id: 'sponsorship',
    label: 'Businesses & organisations',
    title: 'Support via Sponsorship',
    body: 'Partner with ISR for the semester or the year. Sponsors help us run bigger events and reach more students, and in return get visibility with an engaged Muslim student community at RMIT.',
    points: [
      'Event, program and semester-long partnership options',
      'Brand presence at ISR events and across our channels',
      'Reach Muslim students and alumni at RMIT University',
    ],
    cta: 'Become a sponsor',
    route: '/support-us/sponsor/',
    subject: 'Sponsorship with ISR',
    Icon: CommunityIcon,
  },
]

export default function SupportUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />

      <main>
        {/* Page Header */}
        <section className="px-4 pb-12 pt-24 sm:pt-28">
          <div className="container-isr text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
              Support ISR
            </p>
            <h1
              className="mb-5 text-4xl font-bold text-isr-dark-red md:text-5xl"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              Support Us
            </h1>
            <div className="mx-auto mb-8 h-1 w-16 bg-isr-bright-red" />
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
              ISR runs on the generosity of students, families and local businesses. Choose the
              way you would like to support us — both go directly into what we do on campus.
            </p>
          </div>
        </section>

        {/* Support cards */}
        <section className="px-4 pb-16 sm:pb-20">
          <div className="container-isr">
            <div className="grid gap-6 md:grid-cols-2">
              {ways.map(({ id, label, title, body, points, cta, href, route, subject, Icon }) => (
                <article
                  key={id}
                  className="flex flex-col rounded-2xl bg-white p-6 shadow-[0_12px_32px_rgba(91,11,5,0.08)] ring-1 ring-black/5 sm:p-8"
                >
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-isr-cream text-isr-dark-red">
                    <Icon className="h-7 w-7" />
                  </div>

                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
                    {label}
                  </p>
                  <h2 className="mb-3 text-xl font-semibold text-isr-dark-red sm:text-2xl">
                    {title}
                  </h2>
                  <p className="mb-5 leading-relaxed text-gray-600">{body}</p>

                  <ul className="mb-8 space-y-2 text-sm text-gray-600">
                    {points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-isr-bright-red"
                          aria-hidden="true"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  {route ? (
                    <Link href={route} className={ctaClass}>
                      {cta}
                      <ArrowRight />
                    </Link>
                  ) : (
                    <a
                      href={
                        href ??
                        `mailto:${CAMPUS.email}?subject=${encodeURIComponent(subject)}`
                      }
                      {...(href ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className={ctaClass}
                    >
                      {cta}
                      <ArrowRight />
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Other ways to help */}
        <section className="bg-isr-light-blue/10 px-4 py-16 sm:py-20">
          <div className="container-isr text-center">
            <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">
              Cannot give right now?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-gray-600">
              Your time counts just as much. Volunteer with us on campus, or become a member so
              we can keep you in the loop about what is coming up.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/volunteer/"
                className="rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
              >
                Volunteer with ISR
              </Link>
              <a
                href="https://campus.hellorubric.com/?s=10733"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border-2 border-isr-bright-red px-6 py-3 text-sm font-semibold text-isr-bright-red transition-colors hover:bg-isr-bright-red hover:text-white"
              >
                Become a Member
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
