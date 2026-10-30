'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useFlagshipEvents } from '@/lib/flagship/live'
import type { EventPhase } from '@/lib/flagship/types'

type Props = {
  phase: EventPhase
  ticketUrl: string
  slug: string
  /** Build-time snapshot; overridden by the live value once fetched (see below). */
  ticketsOnSale: boolean
  /**
   * Set false to pin `ticketsOnSale` to the prop above instead of the live value.
   * Used by the /tickets/ page's own "not on sale yet" fallback, which only
   * renders when the (also build-time-baked) ticketEventId is empty — if the
   * live ticketsOnSale flipped true in the meantime, following it here would
   * link this CTA back to the very page it's on.
   */
  respectLiveToggle?: boolean
  className?: string
}

/**
 * Carries a `?ref=` campaign tag (e.g. /sacred-union/?ref=poster) through to
 * the TryBooking link, so sales per channel can be compared there without
 * adding analytics to the site.
 */
function withRef(url: string, ref: string | null): string {
  if (!ref) return url
  try {
    const target = new URL(url)
    target.searchParams.set('utm_source', ref)
    return target.toString()
  } catch {
    return url
  }
}

export default function PrimaryCta({
  phase,
  ticketUrl,
  slug,
  ticketsOnSale: builtTicketsOnSale,
  respectLiveToggle = true,
  className = '',
}: Props) {
  const [ref, setRef] = useState<string | null>(null)
  const { events } = useFlagshipEvents()

  useEffect(() => {
    setRef(new URLSearchParams(window.location.search).get('ref'))
  }, [])

  const liveEvent = events.find((event) => event.slug === slug)
  const ticketsOnSale = respectLiveToggle
    ? liveEvent?.ticketsOnSale ?? builtTicketsOnSale
    : builtTicketsOnSale

  const base =
    'inline-flex min-h-11 items-center justify-center rounded-lg bg-(--su-primary) px-6 py-3 text-sm font-semibold text-(--su-on-primary) shadow-lg transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--su-accent)'

  if (phase === 'booking' && ticketUrl) {
    return (
      <a
        href={withRef(ticketUrl, ref)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} ${className}`}
      >
        Get tickets on TryBooking
      </a>
    )
  }

  if (ticketsOnSale) {
    return (
      <Link href={`/${slug}/tickets/`} className={`${base} ${className}`}>
        Get tickets
      </Link>
    )
  }

  return (
    <a
      href={withRef('https://www.trybooking.com/au/event/1662679', ref)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${className}`}
    >
      Notify me when tickets open
    </a>
  )
}
