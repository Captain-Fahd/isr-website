import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CAMPUS } from '@/lib/campus'
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo'

const PAGE_TITLE = "Jumu'ah Prayers at RMIT"
const PAGE_DESCRIPTION =
  "Jumu'ah (Friday prayer) at RMIT City Building 47, 8 Orr St Carlton at 1:30pm, and RMIT Bundoora Building 202. Organised by the Islamic Society of RMIT (ISR)."
const OG_IMAGE = `${SITE_URL}/images/jumah.jpeg`

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "Jumu'ah RMIT",
    'Jumah RMIT',
    'Friday prayer RMIT',
    'Jumuah Melbourne',
    'Islamic Society of RMIT',
    'RMIT City musallah',
    'RMIT Bundoora Jumuah',
  ],
  alternates: { canonical: '/jumah/' },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: '/jumah/',
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

function jumahJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: absoluteUrl('/jumah/'),
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
        addressLocality:
          location.id === 'city' ? 'Carlton' : 'Bundoora',
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

export default function JumahPage() {
  const jsonLd = jumahJsonLd()

  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main>
        <section className="px-4 pb-10 pt-24 sm:pt-28">
          <div className="container-isr mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
              Friday Prayer
            </p>
            <h1 className="mb-5 text-4xl font-bold text-isr-dark-red md:text-5xl">
              Jumu&apos;ah Prayers at RMIT
            </h1>
            <div className="mx-auto mb-8 h-1 w-16 bg-isr-bright-red" />
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
              {CAMPUS.jumuah.summary} Find times, buildings, and musallah access for
              City and Bundoora below.
            </p>
          </div>
        </section>

        <section className="px-4 pb-12">
          <div className="container-isr mx-auto max-w-lg">
            <figure>
              <Image
                src={CAMPUS.jumuah.flyerImage}
                alt="ISR Jumu'ah prayers flyer showing RMIT City Building 47 at 1:30pm and RMIT Bundoora Building 202 times and rooms"
                width={1242}
                height={1600}
                priority
                className="h-auto w-full rounded-2xl shadow-[0_16px_40px_rgba(91,11,5,0.12)] ring-1 ring-black/5"
                sizes="(max-width: 640px) 100vw, 512px"
              />
              <figcaption className="mt-4 text-center text-sm text-gray-600">
                Official ISR Jumu&apos;ah flyer — City and Bundoora details
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:py-20">
          <div className="container-isr mx-auto max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-isr-dark-red">
              Locations &amp; Times
            </p>
            <h2 className="mb-8 text-3xl font-bold text-isr-dark-red">
              Where to pray Jumu&apos;ah
            </h2>

            <div className="space-y-10">
              {CAMPUS.jumuah.locations.map((location) => (
                <article
                  key={location.id}
                  className="rounded-2xl bg-isr-cream/50 p-6 ring-1 ring-black/5 sm:p-8"
                >
                  <h3 className="mb-4 text-2xl font-bold text-isr-dark-red">
                    {location.name}
                  </h3>
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

        <section className="px-4 py-16 sm:py-20">
          <div className="container-isr mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-isr-dark-red">
              Daily prayer times
            </h2>
            <p className="mb-8 text-gray-600">
              Looking for Fajr, Dhuhr, Asr, Maghrib, and Isha in Melbourne?
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/prayer-times/"
                className="inline-flex min-h-11 items-center rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
              >
                View prayer times
              </Link>
              <Link
                href="/contact/"
                className="inline-flex min-h-11 items-center rounded-lg border-2 border-isr-bright-red px-6 py-3 text-sm font-semibold text-isr-bright-red transition-colors hover:bg-isr-bright-red hover:text-white"
              >
                Contact ISR
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
