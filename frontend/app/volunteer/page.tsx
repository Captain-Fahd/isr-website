import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BookIcon, CommunityIcon, FaithIcon, ArrowRight } from '@/components/Icons'
import { CAMPUS } from '@/lib/campus'

export const metadata: Metadata = {
  title: 'Volunteer',
  description:
    'Volunteer with the Islamic Society of RMIT — help run events, teach Qur’an, or join the ISR committee. Open to Muslim students at RMIT University, Melbourne.',
  alternates: { canonical: '/volunteer/' },
  openGraph: {
    title: 'Volunteer | Islamic Society of RMIT',
    description:
      'Help run events, teach Qur’an, or join the ISR committee. Volunteer with the Islamic Society of RMIT.',
    url: '/volunteer/',
  },
}

type Role = {
  id: string
  label: string
  title: string
  body: string
  points: string[]
  cta: string
  /** External sign-up form. Falls back to an email to ISR when absent. */
  href?: string
  subject: string
  Icon: ({ className }: { className?: string }) => JSX.Element
}

const roles: Role[] = [
  {
    id: 'volunteer',
    label: 'Flexible • No experience needed',
    title: 'Join as a Volunteer',
    body: 'The simplest way in. Volunteers are the people who make everything actually happen on the day — setting up, welcoming students, handing out food, packing down and everything in between.',
    points: [
      'Help run events, Jumu’ah setup and stalls on campus',
      'Give as little or as much time as your semester allows',
      'Brothers and sisters both welcome',
    ],
    cta: 'Sign up to volunteer',
    href: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=cTYy0b7NF0S01L2yS1ExayRsUk9zIkJEuN2urJtW7blUNDQ0WVc1MlBURkpUVFZET0ZJRUVTOEdGWCQlQCN0PWcu&origin=QRCode',
    subject: 'Volunteering with ISR',
    Icon: CommunityIcon,
  },
  {
    id: 'quran-teacher',
    label: 'Weekly commitment',
    title: 'Join as a Qur’an Teacher',
    body: 'Teach tajweed and Qur’an recitation to fellow students on campus. If you have solid recitation and the patience to sit with a beginner, this is one of the most rewarding things you can give your time to.',
    points: [
      'Small group or one-on-one sessions during the semester',
      'Ijazah is welcome but not required — strong tajweed is',
      'We match brothers with brothers and sisters with sisters',
    ],
    cta: 'Apply to teach',
    href: 'https://forms.cloud.microsoft/pages/responsepage.aspx?id=cTYy0b7NF0S01L2yS1Exa_NW95M-GpVOqvJ9HSkb0pRURVY5U0dBMjRQQUQ3SVpIOVJLUUI4MkZPTC4u&route=shorturl',
    subject: 'Qur’an teaching with ISR',
    Icon: BookIcon,
  },
  {
    id: 'committee',
    label: 'Semester or yearly term',
    title: 'Join the ISR Committee',
    body: 'Run the society. Committee members hold a portfolio — events, media, sponsorship, welfare, operations — and shape what ISR does for Muslim students at RMIT over the year ahead.',
    points: [
      'Own a portfolio and lead a small team of volunteers',
      'Real experience in leadership, events and stakeholder work',
      'Positions open at set points in the year — register your interest anytime',
    ],
    cta: 'Register your interest',
    href: 'https://forms.cloud.microsoft/pages/responsepage.aspx?id=cTYy0b7NF0S01L2yS1ExawGQ5buxbcZOm1cW9tREGppUMFJZWDUxMEJYMjA0VFRRQ1BXMUlZSFRCTi4u&route=shorturl',
    subject: 'ISR committee expression of interest',
    Icon: FaithIcon,
  },
]

export default function VolunteerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />

      <main>
        {/* Page Header */}
        <section className="px-4 pb-12 pt-24 sm:pt-28">
          <div className="container-isr text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
              Get Involved
            </p>
            <h1
              className="mb-5 text-4xl font-bold text-isr-dark-red md:text-5xl"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              Volunteer with ISR
            </h1>
            <div className="mx-auto mb-8 h-1 w-16 bg-isr-bright-red" />
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
              Everything ISR does on campus is run by students who volunteered their time. Pick
              the way you would like to help — we will get back to you and take it from there.
            </p>
          </div>
        </section>

        {/* Role cards */}
        <section className="px-4 pb-16 sm:pb-20">
          <div className="container-isr">
            <div className="grid gap-6 lg:grid-cols-3">
              {roles.map(({ id, label, title, body, points, cta, href, subject, Icon }) => (
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

                  <a
                    href={
                      href ??
                      `mailto:${CAMPUS.email}?subject=${encodeURIComponent(subject)}`
                    }
                    {...(href
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
                  >
                    {cta}
                    <ArrowRight />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Not sure which */}
        <section className="bg-isr-light-blue/10 px-4 py-16 sm:py-20">
          <div className="container-isr text-center">
            <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">
              Not sure which one fits?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-gray-600">
              Message us and tell us roughly how much time you have and what you enjoy doing —
              we will point you to the right team. You do not need to be a member to volunteer,
              though joining helps us keep you in the loop.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/contact/"
                className="rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
              >
                Get in touch
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
