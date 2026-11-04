import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EventDetail from '@/components/EventDetail'
import { fetchEventById, fetchEvents } from '@/lib/events'
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

  const jsonLd = eventJsonLd({
    name: event.name,
    description: event.description,
    startDate: event.date,
    endDate: event.endDate,
    recurrenceFrequency: event.recurrenceFrequency,
    recurrenceInterval: event.recurrenceInterval,
    recurrenceEndDate: event.recurrenceEndDate,
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
      {/* Re-fetches live on mount, so admin edits show without a rebuild. */}
      <EventDetail initialEvent={event} />
      <Footer />
    </div>
  )
}
