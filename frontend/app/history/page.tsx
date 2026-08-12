import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Our History',
  description:
    'A timeline of Muslim student life at RMIT — from the earliest dedicated prayer facility in the 1990s, through the 2008–09 prayer room campaign, to the Islamic Society of RMIT today.',
  alternates: { canonical: '/history/' },
  openGraph: {
    title: 'Our History | Islamic Society of RMIT',
    description:
      'A timeline of Muslim student life at RMIT — from the earliest prayer facilities of the 1990s to the Islamic Society of RMIT today.',
    url: '/history/',
  },
}

type Milestone = {
  period: string
  title: string
  body: string
  source?: { label: string; href: string }
}

const milestones: Milestone[] = [
  {
    period: 'Early 1990s',
    title: 'A dedicated prayer space on campus',
    body: 'Later research into the RMIT prayer room campaign records that the dedicated Muslim prayer facility at the City campus had existed for almost fifteen years before it was demolished in late 2007 — placing its establishment in the early 1990s. It is the earliest firm trace we have of organised Muslim student life at RMIT.',
    source: {
      label: 'Ward & Wood, The RMIT University Muslim Prayer Room Campaign 2008–2009',
      href: 'https://archive.sa.org.au/mi/2/mi2wardwood.pdf',
    },
  },
  {
    period: '1996–1999',
    title: 'A society with a publications arm',
    body: 'Public biographical records from this period name an Editor of the RMIT Islamic Society, and by 1999–2000 an Executive Committee member who chaired its Publication Wing. Together they show a society that was already structured, with office bearers and its own printed output, well before the turn of the century.',
  },
  {
    period: '1997',
    title: 'RMIT documents its Muslim student community',
    body: 'RMIT’s 1997 Annual Report describes an engineering student who "continues to be active in the RMIT Muslim student community" — the earliest official university acknowledgement of a Muslim student community on campus that we have recovered.',
    source: {
      label: 'RMIT 1997 Annual Report',
      href: 'https://www.rmit.edu.au/assets/documents/about/Governance-and-management/annual-reports/1997-annual-report.pdf',
    },
  },
  {
    period: 'February 1998',
    title: 'The society goes online',
    body: 'An international index of Islamic websites, last modified in February 1998, lists "RMIT, Islamic Society" with a link to a page hosted on RMIT’s own servers. The page itself is long gone, but the listing proves the society had a web presence that was being linked to from overseas in the late 1990s.',
  },
  {
    period: '2001',
    title: 'A public voice in Melbourne',
    body: 'Contemporary reporting on a Melbourne rally identifies a speaker as being from the Islamic Society of RMIT — an early record of the society being recognised beyond the campus gates.',
  },
  {
    period: '2003',
    title: 'A mature da’wah and education organisation',
    body: 'Academic research that visited the RMITIS website in August 2003 describes a society providing Islamic resources, running a multimedia centre, and holding public lectures, conferences, video programs and an Islamic Awareness Week. By the early 2000s ISR was no longer just a prayer group — it was a full educational and outreach organisation.',
    source: {
      label: 'Nayeefa Chowdhury, Presenting Islam: The role of Australia-Based Muslim Student Associations',
      href: 'https://www.researchgate.net/publication/233355766_Presenting_Islam_The_role_of_Australia-Based_Muslim_Student_Associations',
    },
  },
  {
    period: 'Mid-2000s',
    title: 'Salaam RMIT — the Muslim students handbook',
    body: 'RMIT Student Union material submitted to a Senate inquiry lists "Salaam RMIT – Muslim students handbook" among its publications, and independent academic fieldwork records the same guide. Handbooks like it covered prayer facilities, halal food, local mosques, medical services and Muslim organisations — a snapshot of everyday Muslim student life. No complete copy has yet been recovered.',
  },
  {
    period: 'Late 2007',
    title: 'The prayer room is demolished',
    body: 'The long-standing dedicated Muslim facility in Building 9 was demolished. Replacement male and female rooms were built within a Spiritual Centre arrangement, and the society disputed both their later multifaith status and the access arrangements that came with them.',
  },
  {
    period: '2008–2009',
    title: 'Right the Wrong, Return the Prayer Room',
    body: 'The best-documented chapter in the society’s history. Students ran a mass boycott, staffed information stalls several times a week, gathered roughly 1,100 petition signatures in a single week, and distributed hundreds of leaflets. From February 2008 to September 2009, hundreds of Muslim men prayed Jumu’ah in the open on Bowen Street. A rally was held on 23 March 2009 and a public forum at the Kaleide Theatre that April. On 18 September 2009 the society announced the campaign had achieved its purpose.',
    source: {
      label: 'Ward & Wood, The RMIT University Muslim Prayer Room Campaign 2008–2009',
      href: 'https://archive.sa.org.au/mi/2/mi2wardwood.pdf',
    },
  },
  {
    period: '2008–2009',
    title: 'Support from across the community',
    body: 'The campaign drew backing from Mufti Fehmi Naji el-Imam, the Australian National Imams Council, the Islamic Council of Victoria, the Islamic Society of Victoria, the Muslim Student Association of Victoria, the Federation of Muslim Students and Youth, the Australian Union of Jewish Students, the Christian Student Union, the National Union of Students and the RMIT NTEU branch. In July 2008 the federal human rights commission cited RMIT’s prayer facilities in a published discussion of structural discrimination.',
  },
  {
    period: '2011 onwards',
    title: 'The social media era',
    body: 'Published research from 2011 identifies RMITIS as a Melbourne Muslim student group organising events and using Facebook to reach students, and the society appears again in peer-reviewed studies of Australian Muslim student organisations in 2018 and 2020. The website and forums of the 2000s gave way to the platforms students actually used.',
  },
  {
    period: '2022',
    title: 'Eid on Bowen Street',
    body: 'RMIT’s own coverage of the 2022 Eid Street Festival on Bowen Street names the society’s president and records Muslim students describing a real sense of belonging on campus. The same street that hosted protest prayers in 2009 hosted an Eid celebration thirteen years later.',
    source: {
      label: 'RMIT News — Eid al-Adha celebrations',
      href: 'https://www.rmit.edu.au/students/news/2022/july/rmits-inclusive-community-on-show-during-eid-al-adha-celebrations',
    },
  },
  {
    period: '2023',
    title: 'The Multifaith and Wellbeing Centre opens',
    body: 'RMIT opened the Multifaith and Wellbeing Centre in Building 47, with dedicated Islamic prayer rooms for brothers and sisters. It is the current home of daily prayer at the City campus.',
  },
  {
    period: '2024',
    title: 'RMITIS becomes ISR',
    body: 'The society publicly announced its transition from the RMIT Islamic Society to the Islamic Society of RMIT — a new name, a new identity, and a new chapter for an organisation that had already been serving Muslim students on campus for decades.',
  },
]

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />

      <main>
        {/* Page Header */}
        <section className="px-4 pb-16 pt-24 sm:pt-28">
          <div className="container-isr text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
              Our History
            </p>
            <h1
              className="mb-5 text-4xl font-bold text-isr-dark-red md:text-5xl"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              Three decades of Muslim student life at RMIT
            </h1>
            <div className="mx-auto mb-8 h-1 w-16 bg-isr-bright-red" />
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
              Prayer rooms built and lost and won back, handbooks, committees, campaigns and Eid
              on Bowen Street. This is what we have been able to document so far — and what we are
              still looking for.
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-isr-cream/40 px-4 py-16 sm:py-20">
          <div className="container-isr">
            <ol className="relative mx-auto max-w-3xl pl-6 sm:pl-12">
              {/* Rail — starts at the centre of the first dot so nothing protrudes above it */}
              <span
                className="absolute bottom-0 left-0 top-[2.625rem] w-0.5 bg-isr-light-blue/50"
                aria-hidden="true"
              />
              {milestones.map(({ period, title, body, source }) => (
                <li key={`${period}-${title}`} className="relative mb-8 last:mb-0">
                  <span
                    className="absolute -left-[1.8125rem] top-9 h-3 w-3 rounded-full bg-isr-bright-red ring-4 ring-white sm:-left-[3.3125rem]"
                    aria-hidden="true"
                  />
                  <span
                    className="absolute -left-12 top-[2.5625rem] hidden h-0.5 w-12 bg-isr-light-blue/50 sm:block"
                    aria-hidden="true"
                  />
                  <div className="rounded-2xl bg-white p-6 shadow-[0_12px_32px_rgba(91,11,5,0.08)] ring-1 ring-black/5 sm:p-8">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-isr-turquoise">
                      {period}
                    </p>
                    <h2 className="mb-3 text-xl font-semibold text-isr-dark-red sm:text-2xl">
                      {title}
                    </h2>
                    <p className="leading-relaxed text-gray-600">{body}</p>
                    {source && (
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm font-semibold text-isr-dark-red underline underline-offset-2 hover:text-isr-turquoise"
                      >
                        Source: {source.label} &rarr;
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* The founding date question */}
        <section className="bg-isr-light-blue/10 px-4 py-16 sm:py-20">
          <div className="container-isr">
            <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-[0_12px_32px_rgba(91,11,5,0.08)] ring-1 ring-black/5 sm:p-10">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
                An open question
              </p>
              <h2 className="mb-5 text-2xl font-bold text-isr-dark-red">
                When exactly did ISR begin?
              </h2>
              <div className="space-y-5 leading-relaxed text-gray-600">
                <p>
                  We have long said the society was founded in 1993, and the evidence we have
                  recovered so far is consistent with a Muslim student body forming at RMIT in the
                  early 1990s — the dedicated prayer facility demolished in 2007 had stood for
                  almost fifteen years. But an exact founding date has not yet been confirmed from
                  an original document.
                </p>
                <p>
                  What we would need is a constitution, an AGM record, a club registration, a
                  Student Union affiliation record, or a contemporary campus publication. Until one
                  of those surfaces, we would rather tell you honestly what is documented and what
                  is still being researched than round the gap off into a clean story.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Help us */}
        <section className="px-4 py-16 sm:py-20">
          <div className="container-isr text-center">
            <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">
              Were you part of this?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-gray-600">
              If you were a student, committee member, chaplain or staff member at RMIT in any of
              these years — or you have old handbooks, photographs, posters, minutes or copies of
              Salaam RMIT sitting in a box somewhere — we would love to hear from you.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/contact/"
                className="rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
              >
                Share what you remember
              </Link>
              <Link
                href="/about/"
                className="rounded-lg border-2 border-isr-bright-red px-6 py-3 text-sm font-semibold text-isr-bright-red transition-colors hover:bg-isr-bright-red hover:text-white"
              >
                Back to About
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
