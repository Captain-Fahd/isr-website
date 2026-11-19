'use client'

import { useEffect, useState } from 'react'
import { campaignRef, trackEvent } from '@/lib/analytics'
import { useLiveFlagshipEvent } from '@/lib/flagship/preview'
import type { EventPhase } from '@/lib/flagship/types'
import { lightButton, plateButton, solidButton } from './flagshipStyle'

type Props = {
  phase: EventPhase
  ticketUrl: string
  slug: string
  /** Build-time snapshot; overridden by the live value once fetched (see below). */
  ticketsOnSale: boolean
  /**
   * Set false to pin `ticketsOnSale` to the prop above instead of the live value.
   * Used by the booking section's own "not on sale yet" fallback, which only
   * renders when the (build-time-baked) ticketEventId is empty — following the
   * live value there would anchor this CTA back to the section it sits in.
   */
  respectLiveToggle?: boolean
  className?: string
  /** Poster-style square buttons used below the hero; `default` is the hero's rounded button. */
  variant?: 'default' | 'plate' | 'solid' | 'light'
  /** Where on the page this button sits, sent with the `cta_click` analytics event. */
  placement: 'hero' | 'sticky' | 'prompt' | 'booking'
}

/**
 * Carries a `?ref=` campaign tag (e.g. /sacred-union/?ref=poster) through to
 * an external TryBooking link, so sales per channel can be compared there. The
 * embedded widget can't take it, so clicks are also sent to analytics with the
 * tag (see lib/analytics.ts).
 */
export function withRef(url: string, ref: string | null): string {
  if (!ref) return url
  try {
    const target = new URL(url)
    target.searchParams.set('utm_source', ref)
    return target.toString()
  } catch {
    return url
  }
}

const defaultBase =
  'inline-flex min-h-11 items-center justify-center rounded-lg bg-(--su-primary) px-6 py-3 text-sm font-semibold text-(--su-on-primary) shadow-lg transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--su-accent)'

export default function PrimaryCta({
  phase,
  ticketUrl,
  slug,
  ticketsOnSale: builtTicketsOnSale,
  respectLiveToggle = true,
  className = '',
  variant = 'default',
  placement,
}: Props) {
  const [ref, setRef] = useState<string | null>(null)
  const liveEvent = useLiveFlagshipEvent(slug)

  useEffect(() => {
    setRef(campaignRef())
  }, [])

  const ticketsOnSale = respectLiveToggle
    ? liveEvent?.ticketsOnSale ?? builtTicketsOnSale
    : builtTicketsOnSale

  const base = { default: defaultBase, plate: plateButton, solid: solidButton, light: lightButton }[variant]
  const track = (destination: string) => () => trackEvent('cta_click', { placement, destination })

  if (phase === 'booking' && ticketUrl) {
    return (
      <a
        href={withRef(ticketUrl, ref)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={track('trybooking')}
        className={`${base} ${className}`}
      >
        Get tickets on TryBooking
      </a>
    )
  }

  // The booking widget lives at the foot of the event page (#booking), so this
  // is a scroll rather than a navigation.
  if (ticketsOnSale) {
    return (
      <a href="#booking" onClick={track('booking')} className={`${base} ${className}`}>
        Get tickets
      </a>
    )
  }

  return (
    <a
      href={withRef('https://www.trybooking.com/au/event/1662679', ref)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={track('notify')}
      className={`${base} ${className}`}
    >
      Notify me when tickets open
    </a>
  )
}
