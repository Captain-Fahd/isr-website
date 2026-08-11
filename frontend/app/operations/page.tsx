import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CommunityIcon, CoinIcon, GlobeIcon, BookIcon } from '@/components/Icons'

export const metadata: Metadata = {
  title: 'How We Do Things',
  description:
    'How the Islamic Society of RMIT operates — responsible leadership, financial transparency, accountability, and the records that keep the society running year after year.',
  alternates: { canonical: '/operations/' },
  openGraph: {
    title: 'How We Do Things | Islamic Society of RMIT',
    description:
      'How the Islamic Society of RMIT operates — responsible leadership, financial transparency, accountability, and continuity.',
    url: '/operations/',
  },
}

const principles = [
  {
    Icon: CommunityIcon,
    title: 'Responsible leadership',
    description:
      'Committee roles are held by elected students who serve the society, not themselves. Responsibilities are defined, decisions are made together, and every position is handed over openly at the end of each term.',
  },
  {
    Icon: CoinIcon,
    title: 'Financial transparency',
    description:
      'Every dollar raised belongs to the students we serve. Income and spending are tracked, reviewed by the committee, and reported to members so it is always clear where funds come from and where they go.',
  },
  {
    Icon: GlobeIcon,
    title: 'Actions and Accountability',
    description:
      'We follow through on what we commit to, and we own it when we fall short. Members can raise concerns with the committee directly, and we take that feedback seriously in how we plan and run our activities.',
  },
  {
    Icon: BookIcon,
    title: 'Records and continuity',
    description:
      'Meeting minutes, event plans, and financial records are documented and passed on. Each committee inherits the work of the last, so the society keeps improving instead of starting from scratch every year.',
  },
]

export default function OperationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />

      <main>
        {/* Page Header */}
        <section className="px-4 pb-16 pt-24 sm:pt-28">
          <div className="container-isr text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
              Operations
            </p>
            <h1
              className="mb-5 text-4xl font-bold text-isr-dark-red md:text-5xl"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              How we do things
            </h1>
            <div className="mx-auto mb-8 h-1 w-16 bg-isr-bright-red" />
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
              The principles that guide how ISR is run — so that members, students, and the wider
              RMIT community know what to expect from us.
            </p>
          </div>
        </section>

        {/* Principles */}
        <section className="bg-white px-4 py-16 sm:py-20">
          <div className="container-isr">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {principles.map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl bg-white p-8 shadow-[0_12px_32px_rgba(91,11,5,0.08)] ring-1 ring-black/5"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-isr-cream text-isr-turquoise">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mb-3 text-xl font-semibold text-isr-dark-red">{title}</h2>
                  <p className="leading-relaxed text-gray-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
