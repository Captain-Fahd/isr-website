'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { EventPhase } from '@/lib/flagship/types'

type Props = {
  phase: EventPhase
  ticketUrl: string
  slug: string
  ticketsOnSale: boolean
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

export default function PrimaryCta({ phase, ticketUrl, slug, ticketsOnSale, className = '' }: Props) {
  const [ref, setRef] = useState<string | null>(null)

  useEffect(() => {
    setRef(new URLSearchParams(window.location.search).get('ref'))
  }, [])

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
