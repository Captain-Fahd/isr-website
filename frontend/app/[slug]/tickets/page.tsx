import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CAMPUS } from '@/lib/campus'
import { fetchFlagshipEvents, fetchFlagshipEventBySlug } from '@/lib/flagship'
import { googleCalendarUrl, icsDataUri } from '@/lib/flagship/calendar'
import { themeVars } from '@/lib/flagship/theme'
import HeroBackdrop from '@/components/flagship/HeroBackdrop'
import FlagshipReleaseGate from '@/components/flagship/FlagshipReleaseGate'
import PrimaryCta from '../_components/PrimaryCta'
import TryBookingWidget from '../_components/TryBookingWidget'

type Params = { slug: string }

// Static export: only registered flagship slugs are built; anything else 404s.
export const dynamicParams = false

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const events = await fetchFlagshipEvents()
    return events.map(({ slug }) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await fetchFlagshipEventBySlug(slug)
  if (!event) return {}

  const pagePath = `/${event.slug}/tickets/`
  const description = `Book your tickets for ${event.name} — ${event.dateLabel} at ${event.venue.name}.`
  return {
    title: `Tickets — ${event.name}`,
    description,
    alternates: { canonical: pagePath },
    // Keep the page out of search results until the booking widget is live.
    robots: event.ticketEventId ? undefined : { index: false },
    openGraph: {
      title: `Tickets — ${event.name} | Islamic Society of RMIT`,
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

export default async function FlagshipTicketsPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const event = await fetchFlagshipEventBySlug(slug)
  if (!event) notFound()

  const eventPath = `/${event.slug}/`

  return (
    <FlagshipReleaseGate slug={event.slug}>
    <div style={themeVars(event)} className="min-h-screen bg-(--su-light) text-(--su-on-light)">
      <Navbar />

      <main>
        {/* ── Header ──────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden bg-(--su-light) bg-(image:--su-hero-bg) px-4 pb-16 pt-28 text-(--su-hero-text) sm:pt-32">
          <HeroBackdrop hero={event.theme.hero} />

          <div className="container-isr">
            <div className="mx-auto max-w-3xl rounded-2xl bg-(--su-light)/75 p-6 text-center shadow-xl ring-1 ring-current/10 backdrop-blur-md sm:p-8">
              <Link
                href={eventPath}
                className="mb-4 inline-block text-sm font-semibold underline-offset-4 opacity-80 hover:underline"
              >
                ← Back to {event.name}
              </Link>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-(--su-accent)">
                Tickets
              </p>
              <h1
                className="mb-4 text-4xl font-bold leading-tight text-(--su-hero-heading) sm:text-5xl"
                style={{ textWrap: 'balance' } as React.CSSProperties}
              >
                {event.name}
              </h1>
              <p className="font-semibold">{event.dateLabel}</p>
              <p className="opacity-85">{event.timeLabel}</p>
              <p className="opacity-85">
                {event.venue.name} · {event.venue.address}
              </p>
            </div>
          </div>
        </section>

        {/* ── Booking widget ──────────────────────────────────────── */}
        <section id="booking" className="px-4 py-16 sm:py-20">
          <div className="container-isr max-w-4xl">
            {event.ticketEventId ? (
              // Full-bleed on phones: the section and container gutters leave
              // TryBooking's form too narrow and it gets clipped at the sides.
              <div className="-mx-8 bg-white sm:mx-0 sm:overflow-hidden sm:rounded-2xl sm:p-4 sm:shadow-sm sm:ring-1 sm:ring-(--su-on-light)/10">
                <TryBookingWidget eventId={event.ticketEventId} />
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-(--su-on-light)/20 bg-white/60 px-6 py-16 text-center">
                <h2 className="mb-3 text-2xl font-bold md:text-3xl">Tickets aren’t on sale yet</h2>
                <p className="mb-8 max-w-xl text-lg opacity-80">
                  Booking will open here through TryBooking. Register your interest and we’ll let you
                  know the moment tickets go live.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <PrimaryCta phase={event.phase} ticketUrl={event.ticketUrl} />
                  <a href={CAMPUS.whatsappUrl} target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
                    Message us on WhatsApp
                  </a>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row">
              {event.ticketUrl && (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-4 opacity-80 hover:opacity-100"
                >
                  Trouble booking? Open TryBooking in a new tab
                </a>
              )}
              <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
                Add to Google Calendar
              </a>
              <a href={icsDataUri(event)} download={`${event.slug}.ics`} className={secondaryBtn}>
                Add to Apple Calendar
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </FlagshipReleaseGate>
  )
}
