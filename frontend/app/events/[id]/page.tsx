import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight } from '@/components/Icons'
import { fetchEventById, fetchEvents, formatEventDate, isEventPast } from '@/lib/events'
import {
  DEFAULT_OG_IMAGE,
  absoluteUrl,
  eventJsonLd,
  truncateMetaDescription,
} from '@/lib/seo'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  try {
    const events = await fetchEvents()
    return events.map((event) => ({ id: String(event.id) }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const eventId = Number(id)

  if (!Number.isInteger(eventId)) {
    return { title: 'Event Not Found' }
  }

  try {
    const event = await fetchEventById(eventId)
    if (!event) {
      return { title: 'Event Not Found' }
    }

    const description = truncateMetaDescription(event.description)
    const canonical = `/events/${event.id}/`
    const image = event.imageUrl || DEFAULT_OG_IMAGE

    return {
      title: event.name,
      description,
      alternates: { canonical },
      openGraph: {
        title: `${event.name} | Islamic Society of RMIT`,
        description,
        url: canonical,
        type: 'website',
        images: [{ url: image, alt: `${event.name} poster` }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${event.name} | Islamic Society of RMIT`,
        description,
        images: [image],
      },
    }
  } catch {
    return { title: 'Events' }
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params
  const eventId = Number(id)

  if (!Number.isInteger(eventId)) {
    notFound()
  }

  let event
  try {
    event = await fetchEventById(eventId)
  } catch {
    throw new Error('Failed to load event')
  }

  if (!event) {
    notFound()
  }

  const { date, time } = formatEventDate(event.date)
  const past = isEventPast(event.date)
  const jsonLd = eventJsonLd({
    name: event.name,
    description: event.description,
    startDate: event.date,
    imageUrl: event.imageUrl,
    url: absoluteUrl(`/events/${event.id}/`),
    ticketUrl: event.ticketUrl,
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="py-16 px-4 sm:py-20">
        <div className="container-isr max-w-3xl mx-auto">
          <Link
            href="/events/"
            className="mb-8 inline-flex min-h-11 items-center text-sm font-semibold text-isr-dark-red hover:text-isr-turquoise transition-colors"
          >
            ← Back to Events
          </Link>

          <article className="overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_rgba(91,11,5,0.1)] ring-1 ring-black/5">
            {event.imageUrl && (
              <div className="w-full bg-isr-cream">
                <Image
                  src={event.imageUrl}
                  alt={`${event.name} poster`}
                  width={0}
                  height={0}
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="h-auto w-full"
                  style={{ width: '100%', height: 'auto' }}
                  priority
                />
              </div>
            )}

            <div className="p-6 sm:p-10">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <time
                  dateTime={event.date}
                  className="text-sm font-semibold uppercase tracking-[0.14em] text-isr-dark-red"
                >
                  {date}
                </time>
                <span className="text-sm text-gray-500">{time}</span>
                {past && (
                  <span className="rounded-full bg-isr-light-blue/25 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-isr-dark-red">
                    Past
                  </span>
                )}
              </div>

              <h1 className="mb-6 text-3xl font-bold text-isr-dark-red sm:text-4xl">{event.name}</h1>

              <p className="mb-8 text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">{event.description}</p>

              {event.ticketUrl && (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-lg bg-isr-turquoise px-8 py-3 font-semibold text-white transition-colors hover:bg-isr-dark-red"
                >
                  Get Tickets
                  <ArrowRight />
                </a>
              )}
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
