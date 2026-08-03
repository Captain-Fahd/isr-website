'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { fetchEvents, formatEventDate, type Event } from '@/lib/events'
import { ArrowRight } from '@/components/Icons'

const ACCENT_BARS = ['bg-isr-turquoise', 'bg-isr-bright-red', 'bg-isr-dark-red'] as const
const EVENT_CARD_WIDTH = 273

function EventPreviewCard({
  event,
  index,
}: {
  event: Event
  index: number
}) {
  const { date, time } = formatEventDate(event.date)

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex h-[540px] w-[273px] max-w-full shrink-0 flex-col overflow-hidden rounded-xl bg-isr-cream shadow-[0_1px_5px_rgba(91,11,5,0.1)] transition-shadow hover:shadow-[0_2px_7px_rgba(91,11,5,0.14)]"
    >
      <div className="shrink-0 p-2">
        {event.imageUrl ? (
          <div className="overflow-hidden rounded-lg bg-isr-cream">
            <Image
              src={event.imageUrl}
              alt={`${event.name} poster`}
              width={0}
              height={0}
              sizes={`${EVENT_CARD_WIDTH}px`}
              className="block h-auto max-h-[320px] w-full"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        ) : (
          <div className="relative h-20 overflow-hidden rounded-lg bg-isr-yellow">
            <div className={`absolute inset-x-0 top-0 h-1.5 ${ACCENT_BARS[index % ACCENT_BARS.length]}`} />
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4 pt-2">
        <h3 className="mb-1.5 line-clamp-2 shrink-0 text-base font-bold leading-snug text-isr-dark-red transition-colors group-hover:text-isr-bright-red">
          {event.name}
        </h3>
        <p className="mb-2 shrink-0 text-xs text-gray-600">
          <strong>{date}</strong> · {time}
        </p>
        <p className="min-h-0 flex-1 overflow-hidden text-sm leading-relaxed text-gray-700">
          {event.description}
        </p>
        <span className="mt-3 inline-flex shrink-0 items-center text-xs font-semibold text-isr-dark-red underline decoration-isr-dark-red/30 underline-offset-2 transition-colors group-hover:text-isr-bright-red group-hover:decoration-isr-bright-red/50">
          Learn More
          <ArrowRight />
        </span>
      </div>
    </Link>
  )
}

function EventPreviewCardSkeleton() {
  return (
    <div className="flex h-[540px] w-[273px] max-w-full shrink-0 flex-col overflow-hidden rounded-xl bg-isr-cream shadow-[0_1px_5px_rgba(91,11,5,0.1)] animate-pulse">
      <div className="shrink-0 p-2">
        <div className="h-48 rounded-lg bg-isr-yellow" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col space-y-2 p-4 pt-2">
        <div className="h-4 w-3/4 shrink-0 rounded bg-isr-light-blue/30" />
        <div className="h-3 w-1/2 shrink-0 rounded bg-isr-light-blue/20" />
        <div className="min-h-0 flex-1 space-y-2">
          <div className="h-3 w-full rounded bg-isr-light-blue/20" />
          <div className="h-3 w-full rounded bg-isr-light-blue/20" />
          <div className="h-3 w-5/6 rounded bg-isr-light-blue/20" />
        </div>
      </div>
    </div>
  )
}

export default function EventsPreview() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchEvents('upcoming')
      setEvents(data.slice(0, 5))
    } catch {
      setEvents([])
      setError('Unable to load upcoming events.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadEvents()
  }, [loadEvents])

  return (
    <section className="py-20 px-4 bg-isr-light-blue bg-opacity-10">
      <div className="container-isr max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-isr-dark-red">
          Events & Activities
        </h2>

        <div className="w-16 h-1 bg-isr-bright-red mx-auto mb-12" />

        {loading && (
          <div className="mb-12 flex flex-wrap justify-center gap-6" aria-live="polite" aria-busy="true">
            {[0, 1, 2, 3, 4].map((index) => (
              <EventPreviewCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mb-12 rounded-lg border border-isr-bright-red/20 bg-isr-yellow/60 px-6 py-8 text-center">
            <p className="text-sm text-isr-dark-red">{error}</p>
            <button
              type="button"
              onClick={() => void loadEvents()}
              className="mt-4 text-sm font-semibold text-isr-turquoise underline-offset-2 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <p className="mb-12 text-center text-gray-600">
            No upcoming events right now. Check back soon!
          </p>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="mb-12 flex flex-wrap items-stretch justify-center gap-6">
            {events.map((event, index) => (
              <EventPreviewCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/events"
            className="inline-block px-8 py-3 bg-isr-turquoise text-white font-semibold rounded-lg hover:bg-isr-dark-red transition-colors"
          >
            View All Events
          </Link>
        </div>
      </div>
    </section>
  )
}
