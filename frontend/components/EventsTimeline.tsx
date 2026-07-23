'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  fetchEvents,
  formatEventDate,
  isEventPast,
  sortEventsForDisplay,
  type Event,
  type EventsFilter,
} from '@/lib/events'
import { ArrowRight } from '@/components/Icons'

const FILTERS: { value: EventsFilter; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'all', label: 'All' },
  { value: 'past', label: 'Past' },
]

function EventCard({ event, isLast }: { event: Event; isLast: boolean }) {
  const { date, time } = formatEventDate(event.date)
  const past = isEventPast(event.date)

  return (
    <article className="relative flex gap-6 md:gap-10">
      {/* Chain node + connector line */}
      <div className="relative flex shrink-0 flex-col items-center">
        <div
          className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-isr-cream ${
            past ? 'bg-isr-light-blue' : 'bg-isr-turquoise'
          }`}
          aria-hidden
        >
          <div className={`h-2 w-2 rounded-full ${past ? 'bg-white/80' : 'bg-white'}`} />
        </div>
        {!isLast && (
          <div
            className="absolute top-5 h-[calc(100%+2rem)] w-0.5 bg-gradient-to-b from-isr-turquoise/70 via-isr-light-blue/60 to-isr-turquoise/40"
            aria-hidden
          />
        )}
      </div>

      {/* Event content */}
      <div
        className={`mb-12 flex-1 overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_rgba(91,11,5,0.08)] ring-1 ring-black/5 transition-shadow hover:shadow-[0_16px_40px_rgba(91,11,5,0.12)] ${
          past ? 'opacity-85' : ''
        }`}
      >
        {event.imageUrl && (
          <div className="relative aspect-[16/9] w-full bg-isr-cream">
            <Image
              src={event.imageUrl}
              alt={`${event.name} poster`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-3">
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

          <h3 className="mb-3 text-2xl font-bold text-isr-dark-red sm:text-3xl">
            <Link href={`/events/${event.id}`} className="hover:text-isr-turquoise transition-colors">
              {event.name}
            </Link>
          </h3>

          <p className="mb-6 leading-relaxed text-gray-700 line-clamp-3">{event.description}</p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center rounded-lg border-2 border-isr-turquoise px-6 py-3 text-sm font-semibold text-isr-turquoise transition-colors hover:bg-isr-turquoise hover:text-white"
            >
              View Details
              <ArrowRight />
            </Link>
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
            >
              Get Tickets
              <ArrowRight />
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function EventsTimeline() {
  const [filter, setFilter] = useState<EventsFilter>('all')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = useCallback(async (selectedFilter: EventsFilter) => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchEvents(selectedFilter)
      setEvents(sortEventsForDisplay(data))
    } catch {
      setEvents([])
      setError('Unable to load events right now.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadEvents(filter)
  }, [filter, loadEvents])

  return (
    <div>
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {FILTERS.map(({ value, label }) => {
          const active = filter === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-isr-turquoise text-white'
                  : 'bg-white text-gray-700 ring-1 ring-isr-light-blue/40 hover:text-isr-turquoise'
              }`}
              aria-pressed={active}
            >
              {label}
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="mx-auto max-w-3xl space-y-8" aria-live="polite" aria-busy="true">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex gap-6">
              <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-isr-light-blue/40" />
              <div className="flex-1 animate-pulse rounded-2xl bg-isr-cream/80 p-8">
                <div className="mb-4 h-4 w-40 rounded bg-isr-light-blue/30" />
                <div className="mb-3 h-8 w-3/4 rounded bg-isr-light-blue/30" />
                <div className="mb-2 h-4 w-full rounded bg-isr-light-blue/20" />
                <div className="h-4 w-5/6 rounded bg-isr-light-blue/20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mx-auto max-w-xl rounded-2xl border border-isr-bright-red/20 bg-isr-yellow/60 px-6 py-8 text-center">
          <p className="text-sm text-isr-dark-red">{error}</p>
          <button
            type="button"
            onClick={() => void loadEvents(filter)}
            className="mt-4 text-sm font-semibold text-isr-turquoise underline-offset-2 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="mx-auto max-w-xl rounded-2xl border border-isr-light-blue/30 bg-white px-6 py-12 text-center">
          <p className="text-lg font-semibold text-isr-dark-red">No events yet</p>
          <p className="mt-2 text-sm text-gray-600">
            {filter === 'upcoming'
              ? 'Check back soon for upcoming ISR events and activities.'
              : filter === 'past'
                ? 'No past events to show.'
                : 'Events will appear here once they are added.'}
          </p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="mx-auto max-w-3xl">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} isLast={index === events.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}
