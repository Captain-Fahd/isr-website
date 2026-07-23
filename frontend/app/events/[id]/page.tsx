import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight } from '@/components/Icons'
import { fetchEventById, formatEventDate, isEventPast } from '@/lib/events'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const eventId = Number(id)

  if (!Number.isInteger(eventId)) {
    return { title: 'Event Not Found | Islamic Society of RMIT' }
  }

  try {
    const event = await fetchEventById(eventId)
    if (!event) {
      return { title: 'Event Not Found | Islamic Society of RMIT' }
    }

    return {
      title: `${event.name} | Islamic Society of RMIT`,
      description: event.description,
    }
  } catch {
    return { title: 'Events | Islamic Society of RMIT' }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-isr-cream via-white to-isr-yellow/30">
      <Navbar />

      <main className="py-16 px-4 sm:py-20">
        <div className="container-isr max-w-3xl mx-auto">
          <Link
            href="/events"
            className="mb-8 inline-flex items-center text-sm font-semibold text-isr-turquoise hover:text-isr-dark-red transition-colors"
          >
            ← Back to Events
          </Link>

          <article className="overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_rgba(91,11,5,0.1)] ring-1 ring-black/5">
            {event.imageUrl && (
              <div className="relative aspect-[16/9] w-full bg-isr-cream">
                <Image
                  src={event.imageUrl}
                  alt={`${event.name} poster`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
            )}

            <div className="p-6 sm:p-10">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <time
                  dateTime={event.date}
                  className="text-sm font-semibold uppercase tracking-[0.14em] text-isr-turquoise"
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

              <p className="mb-8 text-lg leading-relaxed text-gray-700">{event.description}</p>

              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-isr-turquoise px-8 py-3 font-semibold text-white transition-colors hover:bg-isr-dark-red"
              >
                Get Tickets
                <ArrowRight />
              </a>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
