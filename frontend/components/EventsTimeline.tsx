'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchEvents,
  formatEventDate,
  isEventPast,
  sortEventsForDisplay,
  type Event,
  type EventsFilter,
} from '@/lib/events'
import { ArrowRight } from '@/components/Icons'
import LikeButton from '@/components/LikeButton'
import { getClientId } from '@/lib/likes'

const FILTERS: { value: EventsFilter; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'all', label: 'All' },
  { value: 'past', label: 'Past' },
]

const FETCH_TIMEOUT_MS = 15_000

function EventCard({
  event,
  isLast,
  priorityImage = false,
}: {
  event: Event
  isLast: boolean
  priorityImage?: boolean
}) {
  const { date, time } = formatEventDate(event.date)
  const past = isEventPast(event.date)

  return (
    <article className="relative flex gap-6 md:gap-10">
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

      <div
        className={`mb-12 flex-1 overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_rgba(91,11,5,0.08)] ring-1 ring-black/5 transition-shadow hover:shadow-[0_16px_40px_rgba(91,11,5,0.12)] ${
          past ? 'opacity-85' : ''
        }`}
      >
        {event.imageUrl && (
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm bg-isr-cream">
            <Image
              src={event.imageUrl}
              alt={`${event.name} poster`}
              fill
              className="h-full w-full object-cover object-center"
              sizes="(max-width: 768px) 100vw, 720px"
              priority={priorityImage}
              loading={priorityImage ? 'eager' : 'lazy'}
            />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-3">
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

          <h3 className="mb-3 text-2xl font-bold text-isr-dark-red sm:text-3xl">
            <Link
              href={`/events/${event.id}/`}
              className="hover:text-isr-turquoise transition-colors"
            >
              {event.name}
            </Link>
          </h3>

          <p className="mb-6 leading-relaxed text-gray-700 line-clamp-3">{event.description}</p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/events/${event.id}/`}
              className="inline-flex min-h-11 items-center rounded-lg border-2 border-isr-turquoise px-6 py-3 text-sm font-semibold text-isr-dark-red transition-colors hover:bg-isr-turquoise hover:text-white"
            >
              View Details
              <ArrowRight />
            </Link>
            {event.ticketUrl && (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
              >
                Get Tickets
                <ArrowRight />
              </a>
            )}
            <LikeButton
              eventId={event.id}
              eventName={event.name}
              likeCount={event.likeCount ?? 0}
              likedByMe={event.likedByMe ?? false}
              // The timeline refreshes every card's likes in one request.
              refreshOnMount={false}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

type EventsTimelineProps = {
  initialEvents: Event[]
}

export default function EventsTimeline({ initialEvents }: EventsTimelineProps) {
  const [filter, setFilter] = useState<EventsFilter>('all')
  const [events, setEvents] = useState<Event[]>(() => sortEventsForDisplay(initialEvents))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const hasMountedRef = useRef(false)

  const loadEvents = useCallback(async (selectedFilter: EventsFilter) => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      const data = await fetchEvents(
        selectedFilter,
        { signal: controller.signal },
        getClientId(),
      )
      if (requestId !== requestIdRef.current) return
      setEvents(sortEventsForDisplay(data))
    } catch {
      if (requestId !== requestIdRef.current) return
      setEvents([])
      setError('Unable to load events right now.')
    } finally {
      window.clearTimeout(timeoutId)
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    // First paint uses server-rendered events so crawlers see real titles/dates.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    void loadEvents(filter)
  }, [filter, loadEvents])

  useEffect(() => {
    // Counts baked in at build time are stale, so refresh them once on mount —
    // one request for every card. Only the like fields are merged in, leaving the
    // server-rendered content on screen untouched.
    const clientId = getClientId()
    if (!clientId) return

    let active = true
    fetchEvents('all', undefined, clientId)
      .then((fresh) => {
        if (!active) return
        const likes = new Map(
          fresh.map((e) => [e.id, { likeCount: e.likeCount ?? 0, likedByMe: e.likedByMe ?? false }]),
        )
        setEvents((current) =>
          current.map((event) => {
            const like = likes.get(event.id)
            return like ? { ...event, ...like } : event
          }),
        )
      })
      // Likes are a nice-to-have; a stale count must never break the events list.
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

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
              className={`min-h-11 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-isr-turquoise text-white'
                  : 'bg-white text-gray-700 ring-1 ring-isr-light-blue/40 hover:text-isr-dark-red'
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
            className="mt-4 min-h-11 text-sm font-semibold text-isr-dark-red underline-offset-2 hover:underline"
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
            <EventCard
              key={event.id}
              event={event}
              isLast={index === events.length - 1}
              priorityImage={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
