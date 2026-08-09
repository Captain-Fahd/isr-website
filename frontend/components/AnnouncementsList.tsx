'use client'

import Image from 'next/image'
import { useCallback, useState } from 'react'
import { fetchAnnouncements, formatAnnouncementDate, type Announcement } from '@/lib/announcements'
import { PinIcon } from '@/components/Icons'

const FETCH_TIMEOUT_MS = 15_000

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const { pinned, imageUrl, title, body, createdAt } = announcement

  return (
    <article
      className={`overflow-hidden rounded-2xl shadow-[0_12px_32px_rgba(91,11,5,0.08)] transition-shadow hover:shadow-[0_16px_40px_rgba(91,11,5,0.12)] ${
        pinned
          ? 'border-l-4 border-isr-turquoise bg-isr-cream/50 ring-1 ring-isr-turquoise/25'
          : 'bg-white ring-1 ring-black/5'
      }`}
    >
      {imageUrl && (
        <div className="relative mx-auto aspect-[3/4] w-full max-w-sm bg-isr-cream">
          <Image
            src={imageUrl}
            alt={`${title} image`}
            fill
            className="h-full w-full object-cover object-center"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </div>
      )}

      <div className="p-6 sm:p-8">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <time
            dateTime={createdAt}
            className="text-sm font-semibold uppercase tracking-[0.14em] text-isr-dark-red"
          >
            {formatAnnouncementDate(createdAt)}
          </time>

          {pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-isr-turquoise/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-isr-dark-red">
              <PinIcon className="w-3 h-3" />
              Pinned
            </span>
          )}
        </div>

        <h3 className="mb-3 text-2xl font-bold text-isr-dark-red sm:text-3xl">{title}</h3>

        <p className="leading-relaxed text-gray-700 whitespace-pre-line">{body}</p>
      </div>
    </article>
  )
}

type AnnouncementsListProps = {
  initialAnnouncements: Announcement[]
}

export default function AnnouncementsList({
  initialAnnouncements,
}: AnnouncementsListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      const data = await fetchAnnouncements({ signal: controller.signal })
      setAnnouncements(data)
    } catch {
      setAnnouncements([])
      setError('Unable to load announcements right now.')
    } finally {
      window.clearTimeout(timeoutId)
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6" aria-live="polite" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-isr-cream/80 p-8">
            <div className="mb-4 h-4 w-32 rounded bg-isr-light-blue/30" />
            <div className="mb-3 h-8 w-3/4 rounded bg-isr-light-blue/30" />
            <div className="mb-2 h-4 w-full rounded bg-isr-light-blue/20" />
            <div className="h-4 w-5/6 rounded bg-isr-light-blue/20" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-isr-bright-red/20 bg-isr-yellow/60 px-6 py-8 text-center">
        <p className="text-sm text-isr-dark-red">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 min-h-11 text-sm font-semibold text-isr-dark-red underline-offset-2 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-isr-light-blue/30 bg-white px-6 py-12 text-center">
        <p className="text-lg font-semibold text-isr-dark-red">No announcements yet</p>
        <p className="mt-2 text-sm text-gray-600">Check back soon for updates from ISR.</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 min-h-11 text-sm font-semibold text-isr-dark-red underline-offset-2 hover:underline"
        >
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {announcements.map((announcement) => (
        <AnnouncementCard key={announcement.id} announcement={announcement} />
      ))}
    </div>
  )
}
