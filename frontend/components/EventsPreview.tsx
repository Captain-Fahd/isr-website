'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchEvents, formatEventDate, type Event } from '@/lib/events'
import { ArrowRight } from '@/components/Icons'

const ACCENT_BARS = ['bg-isr-turquoise', 'bg-isr-bright-red', 'bg-isr-dark-red'] as const
const EVENT_CARD_WIDTH = 273
const EVENT_CARD_HEIGHT = 540
const EVENT_IMAGE_MAX_HEIGHT = 320
const MAX_PREVIEW_EVENTS = 5
const FETCH_TIMEOUT_MS = 15_000

function EventPreviewCard({
  event,
  index,
  priorityImage = false,
}: {
  event: Event
  index: number
  priorityImage?: boolean
}) {
  const { date, time } = formatEventDate(event.date)

  return (
    <Link
      href={`/events/${event.id}/`}
      className="group flex shrink-0 flex-col overflow-hidden rounded-xl bg-isr-cream shadow-[0_1px_5px_rgba(91,11,5,0.1)] transition-shadow hover:shadow-[0_2px_7px_rgba(91,11,5,0.14)]"
      style={{ width: EVENT_CARD_WIDTH, height: EVENT_CARD_HEIGHT }}
    >
      <div className="shrink-0 px-2 pt-2">
        {event.imageUrl ? (
          <div className="overflow-hidden rounded-lg bg-isr-cream">
            <Image
              src={event.imageUrl}
              alt={`${event.name} poster`}
              width={0}
              height={0}
              sizes={`${EVENT_CARD_WIDTH}px`}
              className="block h-auto w-full"
              style={{ width: '100%', height: 'auto', maxHeight: EVENT_IMAGE_MAX_HEIGHT }}
              priority={priorityImage}
              loading={priorityImage ? 'eager' : 'lazy'}
            />
          </div>
        ) : (
          <div className="relative h-20 overflow-hidden rounded-lg bg-isr-yellow">
            <div className={`absolute inset-x-0 top-0 h-1.5 ${ACCENT_BARS[index % ACCENT_BARS.length]}`} />
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
        <h3 className="mb-1.5 line-clamp-2 shrink-0 text-base font-bold leading-snug text-isr-dark-red transition-colors group-hover:text-isr-bright-red">
          {event.name}
        </h3>
        <p className="mb-2 shrink-0 text-xs text-gray-600">
          <strong>{date}</strong> · {time}
        </p>
        <div className="min-h-0 flex-1 overflow-hidden">
          <p className="text-sm leading-relaxed text-gray-700">{event.description}</p>
        </div>
        <span className="mt-3 inline-flex shrink-0 items-center text-xs font-semibold text-isr-dark-red underline decoration-isr-dark-red/30 underline-offset-2 transition-colors group-hover:text-isr-bright-red group-hover:decoration-isr-bright-red/50">
          Learn More
          <ArrowRight />
        </span>
      </div>
    </Link>
  )
}

type EventsPreviewProps = {
  initialEvents: Event[]
}

export default function EventsPreview({ initialEvents }: EventsPreviewProps) {
  const [events, setEvents] = useState<Event[]>(() => initialEvents.slice(0, MAX_PREVIEW_EVENTS))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const eventsRef = useRef(events)

  useEffect(() => {
    eventsRef.current = events
  }, [events])

  const loadEvents = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      const data = await fetchEvents('upcoming', { signal: controller.signal })
      if (requestId !== requestIdRef.current) return
      setEvents(data.slice(0, MAX_PREVIEW_EVENTS))
    } catch {
      if (requestId !== requestIdRef.current) return
      // Keep the build-time events on screen if the refresh fails; only
      // surface an error when there is nothing to show.
      if (eventsRef.current.length === 0) {
        setError('Unable to load upcoming events.')
      }
    } finally {
      window.clearTimeout(timeoutId)
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  // The page is statically exported, so `initialEvents` is frozen at build
  // time. Refresh from the API on mount so events added after the last deploy
  // still appear (and so a failed build-time fetch heals in the browser).
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

        {loading && events.length === 0 && (
          <p className="mb-12 text-center text-sm text-gray-600" aria-live="polite" aria-busy="true">
            Refreshing events…
          </p>
        )}

        {!loading && error && events.length === 0 && (
          <div className="mb-12 rounded-lg border border-isr-bright-red/20 bg-isr-yellow/60 px-6 py-8 text-center">
            <p className="text-sm text-isr-dark-red">{error}</p>
            <button
              type="button"
              onClick={() => void loadEvents()}
              className="mt-4 min-h-11 text-sm font-semibold text-isr-dark-red underline-offset-2 hover:underline"
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

        {events.length > 0 && (
          <div className="mb-12 flex flex-wrap items-stretch justify-center gap-6">
            {events.map((event, index) => (
              <EventPreviewCard
                key={event.id}
                event={event}
                index={index}
                priorityImage={index === 0}
              />
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/events/"
            className="inline-block min-h-11 px-8 py-3 bg-isr-turquoise text-white font-semibold rounded-lg hover:bg-isr-dark-red transition-colors"
          >
            View All Events
          </Link>
        </div>
      </div>
    </section>
  )
}
