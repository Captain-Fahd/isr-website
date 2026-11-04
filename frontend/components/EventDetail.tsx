'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from '@/components/Icons'
import LikeButton from '@/components/LikeButton'
import {
  type Event,
  describeSchedule,
  displayOccurrence,
  fetchEventById,
  formatEventSchedule,
  isEventOver,
  parseEventIdFromLocation,
} from '@/lib/events'

const linkClass =
  'inline-flex min-h-11 items-center text-sm font-semibold text-isr-dark-red hover:text-isr-turquoise transition-colors'

function BackLink() {
  return (
    <Link href="/events/" className={`mb-8 ${linkClass}`}>
      ← Back to Events
    </Link>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="py-16 px-4 sm:py-20">
      <div className="container-isr max-w-3xl mx-auto">
        <BackLink />
        {children}
      </div>
    </main>
  )
}

function EventArticle({ event }: { event: Event }) {
  const { date, time } = formatEventSchedule(event)
  const past = isEventOver(event)
  const scheduleNote = describeSchedule(event)
  const occurrence = displayOccurrence(event)

  return (
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
            dateTime={occurrence.start}
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

        {scheduleNote && (
          <p className="mb-6 rounded-lg bg-isr-cream px-4 py-3 text-sm font-medium text-isr-dark-red">
            {scheduleNote}
          </p>
        )}

        <p className="mb-8 text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">{event.description}</p>

        <div className="flex flex-wrap items-center gap-4">
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
          <LikeButton eventId={event.id} eventName={event.name} likeCount={event.likeCount ?? 0} />
        </div>
      </div>
    </article>
  )
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white p-8 text-center shadow-[0_16px_40px_rgba(91,11,5,0.1)] ring-1 ring-black/5 sm:p-12">
      <h1 className="mb-4 text-2xl font-bold text-isr-dark-red sm:text-3xl">{title}</h1>
      <p className="mb-6 text-gray-600">{body}</p>
      <Link
        href="/events/"
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-isr-turquoise px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-isr-dark-red"
      >
        See all events
      </Link>
    </div>
  )
}

function Skeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_rgba(91,11,5,0.1)] ring-1 ring-black/5"
      aria-busy="true"
      aria-label="Loading event"
    >
      <div className="aspect-[4/5] w-full animate-pulse bg-isr-cream" />
      <div className="space-y-4 p-6 sm:p-10">
        <div className="h-4 w-1/3 animate-pulse rounded bg-isr-cream" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-isr-cream" />
        <div className="h-4 w-full animate-pulse rounded bg-isr-cream" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-isr-cream" />
      </div>
    </div>
  )
}

type Status = 'loading' | 'ready' | 'not-found' | 'error'

type Props = {
  /** Build-time snapshot for pre-rendered pages; shown until the live copy arrives. */
  initialEvent?: Event
}

/**
 * Event detail, read live in the browser. The site is a static export, so a page
 * pre-rendered at build time would otherwise keep showing stale details after an
 * admin edit, and an event created after the last build has no page at all. The
 * latter are served the /events/live/ shell (via public/.htaccess, or the 404 page
 * as a fallback on other hosts), which works out the ID from the URL.
 */
export default function EventDetail({ initialEvent }: Props) {
  const [event, setEvent] = useState<Event | null>(initialEvent ?? null)
  const [status, setStatus] = useState<Status>(initialEvent ? 'ready' : 'loading')

  useEffect(() => {
    const id =
      initialEvent?.id ?? parseEventIdFromLocation(window.location.pathname, window.location.search)
    if (id === null) {
      setStatus('not-found')
      return
    }

    let cancelled = false
    fetchEventById(id)
      .then((fresh) => {
        if (cancelled) return
        if (fresh) {
          setEvent(fresh)
          setStatus('ready')
        } else {
          setEvent(null)
          setStatus('not-found')
        }
      })
      .catch(() => {
        // Keep the build-time copy if there is one; otherwise say we couldn't load it.
        if (!cancelled && !initialEvent) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [initialEvent])

  // Pre-rendered pages already have a proper <title>; the shell only has a generic one.
  useEffect(() => {
    if (!initialEvent && event) document.title = `${event.name} | Islamic Society of RMIT`
  }, [event, initialEvent])

  return (
    <Shell>
      {status === 'loading' && <Skeleton />}
      {status === 'ready' && event && <EventArticle event={event} />}
      {status === 'not-found' && (
        <Message
          title="Event not found"
          body="This event may have been removed, or the link might be wrong."
        />
      )}
      {status === 'error' && (
        <Message
          title="Couldn’t load this event"
          body="Something went wrong fetching the event details. Please refresh, or try again shortly."
        />
      )}
    </Shell>
  )
}
