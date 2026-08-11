import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PrayerTimesTable from '@/components/PrayerTimesTable'
import { CAMPUS } from '@/lib/campus'
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo'

const PAGE_TITLE = "Prayer Times & Jumu'ah"
const PAGE_DESCRIPTION =
  "Daily prayer times for Melbourne and weekly Jumu'ah at RMIT City Building 47 (1:30pm) and RMIT Bundoora Building 202, organised by the Islamic Society of RMIT."
const OG_IMAGE = `${SITE_URL}/images/jumah.jpeg`

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'prayer times Melbourne',
    "Jumu'ah RMIT",
    'Jumah RMIT',
    'Friday prayer RMIT',
    'Jumuah Melbourne',
    'Islamic Society of RMIT',
    'RMIT City musallah',
    'RMIT Bundoora Jumuah',
  ],
  alternates: { canonical: '/prayer-times/' },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: '/prayer-times/',
    type: 'website',
    images: [
      {
        url: OG_IMAGE,
        width: 1242,
        height: 1600,
        alt: "ISR Jumu'ah prayers flyer for RMIT City and Bundoora campuses",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE],
  },
}

function pageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: absoluteUrl('/prayer-times/'),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: CAMPUS.jumuah.locations.map((location) => ({
      '@type': 'Place',
      name: `${location.name} Jumu'ah — ${location.building}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: `${location.building}, ${location.address}`,
        addressLocality: location.id === 'city' ? 'Carlton' : 'Bundoora',
        addressRegion: 'VIC',
        postalCode: location.id === 'city' ? '3053' : '3082',
        addressCountry: 'AU',
      },
    })),
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: OG_IMAGE,
      width: 1242,
      height: 1600,
    },
  }
}

export default function PrayerTimesPage() {
  const jsonLd = pageJsonLd()

  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
              Daily prayer times for Melbourne, plus Jumu&apos;ah times, buildings, and musallah
              access at RMIT City and Bundoora.
            </p>
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
          </div>
        </section>

        <section id="jumah" className="scroll-mt-28 bg-white px-4 py-16 sm:py-20">
          <div className="container-isr mx-auto max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
              Friday Prayer
            </p>
            <h2 className="mb-4 text-3xl font-bold text-isr-dark-red">Jumu&apos;ah at RMIT</h2>
            <p className="mb-10 leading-relaxed text-gray-700">
              {CAMPUS.jumuah.summary} Find times, buildings, and musallah access for City and
              Bundoora below.
            </p>

            <figure className="mx-auto mb-12 max-w-lg">
              <Image
                src={CAMPUS.jumuah.flyerImage}
                alt="ISR Jumu'ah prayers flyer showing RMIT City Building 47 at 1:30pm and RMIT Bundoora Building 202 times and rooms"
                width={1242}
                height={1600}
                className="h-auto w-full rounded-2xl shadow-[0_16px_40px_rgba(91,11,5,0.12)] ring-1 ring-black/5"
                sizes="(max-width: 640px) 100vw, 512px"
              />
              <figcaption className="mt-4 text-center text-sm text-gray-600">
                Official ISR Jumu&apos;ah flyer — City and Bundoora details
              </figcaption>
            </figure>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
              Locations &amp; Times
            </p>
            <h3 className="mb-8 text-2xl font-bold text-isr-dark-red">
              Where to pray Jumu&apos;ah
            </h3>

            <div className="space-y-10">
              {CAMPUS.jumuah.locations.map((location) => (
                <article
                  key={location.id}
                  className="rounded-2xl bg-isr-cream/50 p-6 ring-1 ring-black/5 sm:p-8"
                >
                  <h4 className="mb-4 text-2xl font-bold text-isr-dark-red">{location.name}</h4>
                  <dl className="space-y-3 text-gray-700">
                    <div>
                      <dt className="text-sm font-semibold uppercase tracking-wide text-isr-dark-red">
                        Venue
                      </dt>
                      <dd className="mt-1">
                        RMIT {location.building}, {location.address}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold uppercase tracking-wide text-isr-dark-red">
                        Time ({CAMPUS.jumuah.day})
                      </dt>
                      <dd className="mt-1">
                        <strong>{location.timing}</strong>
                        {location.timingNote ? ` — ${location.timingNote}` : null}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold uppercase tracking-wide text-isr-dark-red">
                        Brothers
                      </dt>
                      <dd className="mt-1">{location.brothers}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-semibold uppercase tracking-wide text-isr-dark-red">
                        Sisters
                      </dt>
                      <dd className="mt-1">{location.sisters}</dd>
                    </div>
                    {location.accessNote && (
                      <div>
                        <dt className="text-sm font-semibold uppercase tracking-wide text-isr-dark-red">
                          Access
                        </dt>
                        <dd className="mt-1">{location.accessNote}</dd>
                      </div>
                    )}
                  </dl>
                </article>
              ))}
            </div>

            <p className="mt-10 leading-relaxed text-gray-700">{CAMPUS.jumuah.hedge}</p>
            <p className="mt-4 leading-relaxed text-gray-700">
              Questions?{' '}
              <a
                href={CAMPUS.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-isr-dark-red underline underline-offset-2 hover:text-isr-turquoise"
              >
                Message ISR on WhatsApp
              </a>{' '}
              or email{' '}
              <a
                href={`mailto:${CAMPUS.email}`}
                className="font-semibold text-isr-dark-red underline underline-offset-2 hover:text-isr-turquoise"
              >
                {CAMPUS.email}
              </a>
              .
            </p>
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
          <div className="container-isr mx-auto max-w-3xl text-center">
            <p className="text-gray-600">
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
