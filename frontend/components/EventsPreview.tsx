'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { fetchEvents, formatEventDate, type Event } from '@/lib/events'
import { ArrowRight } from '@/components/Icons'

const ACCENT_BARS = ['bg-isr-turquoise', 'bg-isr-bright-red', 'bg-isr-dark-red'] as const

export default function EventsPreview() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchEvents('upcoming')
      setEvents(data.slice(0, 3))
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
          <div className="grid md:grid-cols-3 gap-8 mb-12" aria-live="polite" aria-busy="true">
            {[0, 1, 2].map((index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="h-40 bg-isr-cream" />
                <div className="p-6 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-isr-light-blue/30" />
                  <div className="h-4 w-1/2 rounded bg-isr-light-blue/20" />
                  <div className="h-4 w-full rounded bg-isr-light-blue/20" />
                </div>
              </div>
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
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {events.map((event, index) => {
              const { date, time } = formatEventDate(event.date)

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {event.imageUrl ? (
                    <div className="relative h-40 bg-isr-cream">
                      <Image
                        src={event.imageUrl}
                        alt={`${event.name} poster`}
                        fill
                        className="object-cover transition-transform group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className={`h-2 ${ACCENT_BARS[index % ACCENT_BARS.length]}`} />
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-isr-dark-red mb-2 group-hover:text-isr-turquoise transition-colors">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>{date}</strong> · {time}
                    </p>
                    <p className="text-gray-700 mb-6 line-clamp-3">{event.description}</p>
                    <span className="text-isr-turquoise font-semibold group-hover:text-isr-bright-red transition-colors text-sm inline-flex items-center">
                      Learn More
                      <ArrowRight />
                    </span>
                  </div>
                </Link>
              )
            })}
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
