import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import NewsletterSignup from '@/components/NewsletterSignup'
import { CAMPUS } from '@/lib/campus'
import { absoluteUrl, eventJsonLd, truncateMetaDescription } from '@/lib/seo'
import { FLAGSHIP_EVENTS, getFlagshipEvent } from '@/lib/flagship'
import { googleCalendarUrl, icsDataUri } from '@/lib/flagship/calendar'
import { themeVars } from '@/lib/flagship/theme'
import Countdown from '@/components/flagship/Countdown'
import PrimaryCta from './_components/PrimaryCta'
import StickyCtaBar from './_components/StickyCtaBar'
import GeometricPattern from '@/components/flagship/GeometricPattern'
import FlagshipReleaseGate from '@/components/flagship/FlagshipReleaseGate'

type Params = { slug: string }

// Static export: only registered flagship slugs are built; anything else 404s.
export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return FLAGSHIP_EVENTS.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const event = getFlagshipEvent(slug)
  if (!event) return {}

  const pagePath = `/${event.slug}/`
  const description = truncateMetaDescription(event.description)
  return {
    title: event.name,
    description,
    alternates: { canonical: pagePath },
    openGraph: {
      title: `${event.name} | Islamic Society of RMIT`,
      description,
      url: pagePath,
      images: [{ url: event.ogImage, width: 1200, height: 630, alt: event.name }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [event.ogImage],
    },
  }
}

const secondaryBtn =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-current px-5 py-3 text-sm font-semibold transition hover:bg-current/10'

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10 text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-(--su-accent)">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-bold md:text-4xl" style={{ textWrap: 'balance' } as React.CSSProperties}>
        {title}
      </h2>
      <div className="mx-auto mt-5 h-1 w-16 bg-(--su-primary)" />
    </div>
  )
}

export default async function FlagshipEventPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const event = getFlagshipEvent(slug)
  if (!event) notFound()

  const pagePath = `/${event.slug}/`
  const isBooking = event.phase === 'booking' && Boolean(event.ticketUrl)

  const jsonLd = eventJsonLd({
    name: event.name,
    description: event.description,
    startDate: event.start,
    endDate: event.end,
    imageUrl: absoluteUrl(event.banner.src),
    url: absoluteUrl(pagePath),
    ticketUrl: isBooking ? event.ticketUrl : null,
  })

  return (
    <FlagshipReleaseGate>
    <div style={themeVars(event)} className="min-h-screen bg-(--su-light) text-(--su-on-light)">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section
          id="hero"
          className="relative isolate overflow-hidden bg-(--su-light) bg-(image:--su-hero-bg) px-4 pb-24 pt-28 text-(--su-hero-text) sm:pt-32"
        >
          <Image src={event.theme.hero.backdrop} alt="" fill priority className="-z-20 object-cover" />

          <div className="container-isr grid items-center gap-10 lg:items-stretch lg:grid-cols-[1.6fr_1.05fr]">
            <div className="lg:flex lg:items-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
              <Image
                src={event.banner.src}
                alt={event.banner.alt}
                width={event.banner.width}
                height={event.banner.height}
                priority
                className="h-auto w-full rounded-2xl shadow-2xl ring-1 ring-current/15"
              />
            </div>

            {/* Frosted panel keeps text legible over the backdrop's dark lower half */}
            <div className="rounded-2xl bg-(--su-light)/75 p-6 shadow-xl ring-1 ring-current/10 backdrop-blur-md sm:p-8 lg:flex lg:flex-col lg:justify-center lg:p-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:delay-150">
              <p className="mb-4 text-xl font-semibold uppercase tracking-[0.2em] text-(--su-hero-heading) sm:hidden">
                {isBooking ? 'Tickets on sale' : 'Save the date'}
              </p>
              <h1
                className="mb-4 text-4xl font-bold leading-tight text-(--su-hero-heading) sm:text-5xl lg:mb-2 lg:text-4xl"
                style={{ textWrap: 'balance' } as React.CSSProperties}
              >
                {event.name}
              </h1>
              <p className="mb-6 text-lg opacity-85 lg:mb-3 lg:text-base">{event.tagline}</p>

              <dl className="mb-8 space-y-1 text-base lg:mb-3 lg:space-y-0 lg:text-sm">
                <div className="flex gap-2">
                  <dt className="sr-only">Date</dt>
                  <dd className="font-semibold">{event.dateLabel}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="sr-only">Time</dt>
                  <dd className="opacity-85">{event.timeLabel}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="sr-only">Venue</dt>
                  <dd className="opacity-85">
                    {event.venue.name} · {event.venue.address}
                  </dd>
                </div>
              </dl>

              <div className="mb-8 lg:mb-4">
                <Countdown start={event.start} end={event.end} />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:gap-2">
                <PrimaryCta phase={event.phase} ticketUrl={event.ticketUrl} />
                <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={`${secondaryBtn} lg:min-h-9 lg:px-3 lg:py-2 lg:text-xs`}>
                  Add to Google Calendar
                </a>
                <a href={icsDataUri(event)} download={`${event.slug}.ics`} className={`${secondaryBtn} lg:min-h-9 lg:px-3 lg:py-2 lg:text-xs`}>
                  Apple / Outlook (.ics)
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── About ───────────────────────────────────────────────── */}
        <section className="px-4 py-16 sm:py-20">
          <div className="container-isr">
            <SectionHeading eyebrow="About the event" title={`What is ${event.name}?`} />
            <p className="mx-auto mb-12 max-w-2xl text-center text-lg leading-relaxed opacity-85">
              {event.description}
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {event.highlights.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-(--su-on-light)/10"
                >
                  <div className="mb-4 h-1 w-10 rounded-full bg-(--su-accent)" />
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="leading-relaxed opacity-80">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {event.speakers.length > 0 && (
          <section className="bg-white/50 px-4 py-16 sm:py-20">
            <div className="container-isr">
              <SectionHeading eyebrow="Speakers" title="Who you’ll hear from" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {event.speakers.map((speaker) => (
                  <article key={speaker.name} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-(--su-on-light)/10">
                    <Image src={speaker.image} alt={speaker.name} width={600} height={600} className="aspect-square w-full object-cover" />
                    <div className="p-5">
                      <h3 className="text-lg font-semibold">{speaker.name}</h3>
                      <p className="text-sm opacity-75">{speaker.title}</p>
                      {speaker.topic && <p className="mt-2 text-sm font-medium text-(--su-accent)">{speaker.topic}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {event.programme.length > 0 && (
          <section className="px-4 py-16 sm:py-20">
            <div className="container-isr max-w-3xl">
              <SectionHeading eyebrow="Programme" title="On the night" />
              <ol className="relative space-y-8 border-l-2 border-(--su-accent)/40 pl-8">
                {event.programme.map((item) => (
                  <li key={`${item.time}-${item.title}`} className="relative">
                    <span className="absolute -left-[2.55rem] top-1.5 h-4 w-4 rounded-full border-4 border-(--su-light) bg-(--su-accent)" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-(--su-accent)">{item.time}</p>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    {item.detail && <p className="opacity-80">{item.detail}</p>}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* ── Venue ───────────────────────────────────────────────── */}
        <section className="bg-white/50 px-4 py-16 sm:py-20">
          <div className="container-isr grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-(--su-accent)">Venue</p>
              <h2 className="mb-2 text-3xl font-bold">{event.venue.name}</h2>
              <p className="mb-6 text-lg opacity-85">{event.venue.address}</p>
              <ul className="mb-8 space-y-2 opacity-85">
                {event.venue.notes.map((note) => (
                  <li key={note} className="flex gap-3">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--su-primary)" aria-hidden="true" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
              {event.venue.mapUrl && (
                <a
                  href={event.venue.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-lg bg-(--su-primary) px-6 py-3 text-sm font-semibold text-(--su-on-primary) transition hover:brightness-110"
                >
                  Open in Google Maps
                </a>
              )}
            </div>
            {event.venue.image ? (
              <Image
                src={event.venue.image.src}
                alt={event.venue.image.alt}
                width={event.venue.image.width}
                height={event.venue.image.height}
                className="aspect-[4/3] h-auto w-full rounded-2xl object-cover shadow-sm ring-1 ring-(--su-on-light)/10"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border-2 border-dashed border-(--su-on-light)/20 bg-(--su-on-light)/5 text-sm opacity-60">
                Venue photo
              </div>
            )}
          </div>
        </section>

        {/* ── Sponsors ────────────────────────────────────────────── */}
        <section className="px-4 py-16 sm:py-20">
          <div className="container-isr text-center">
            <SectionHeading eyebrow="Our partners" title="Supported by" />
            {event.sponsors.length ? (
              <div className="flex flex-wrap items-center justify-center gap-10">
                {event.sponsors.map((sponsor) => (
                  <Image key={sponsor.name} src={sponsor.logo} alt={sponsor.name} width={160} height={80} className="h-16 w-auto object-contain" />
                ))}
              </div>
            ) : (
              <div className="mx-auto mb-6 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <div
                    key={i}
                    className="flex h-20 items-center justify-center rounded-xl border-2 border-dashed border-(--su-on-light)/20 text-xs opacity-60"
                  >
                    Sponsor logo
                  </div>
                ))}
              </div>
            )}
            <Link href="/support-us/sponsor/" className="mt-6 inline-block font-semibold text-(--su-primary) underline-offset-4 hover:underline">
              Interested in sponsoring {event.name}? →
            </Link>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────── */}
        <section className="bg-white/50 px-4 py-16 sm:py-20">
          <div className="container-isr max-w-3xl">
            <SectionHeading eyebrow="FAQ" title="Good to know" />
            <div className="space-y-3">
              {event.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-(--su-on-light)/10"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span className="text-xl text-(--su-accent) transition-transform group-open:rotate-45" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 leading-relaxed opacity-80">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA / notify ──────────────────────────────────── */}
        <section
          id="notify"
          className="relative isolate scroll-mt-24 overflow-hidden bg-(--su-dark) px-4 py-16 text-(--su-on-dark) sm:py-20"
        >
          <GeometricPattern className="absolute inset-0 -z-10 h-full w-full text-(--su-accent) opacity-10" />
          <div className="container-isr grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-(--su-accent)">
                {isBooking ? 'Don’t miss out' : 'Be first to know'}
              </p>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                {isBooking ? 'Secure your seat' : 'Tickets open soon on TryBooking'}
              </h2>
              <p className="mb-6 text-lg opacity-85">
                {isBooking
                  ? 'Seats are limited — book through TryBooking today.'
                  : 'Join our WhatsApp community or mailing list and we’ll message you the moment booking opens.'}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                {isBooking && <PrimaryCta phase={event.phase} ticketUrl={event.ticketUrl} />}
                <a href={CAMPUS.whatsappUrl} target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
                  Message us on WhatsApp
                </a>
                <a
                  href="https://www.instagram.com/islamicsocietyofrmit/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={secondaryBtn}
                >
                  Follow on Instagram
                </a>
              </div>
            </div>
            <NewsletterSignup
              title={`${event.name} updates`}
              description="Get an email when tickets go on sale and speakers are announced."
            />
          </div>
        </section>
      </main>

      <Footer />
      <StickyCtaBar phase={event.phase} ticketUrl={event.ticketUrl} name={event.name} dateLabel={event.dateLabel} />
    </div>
    </FlagshipReleaseGate>
  )
}
