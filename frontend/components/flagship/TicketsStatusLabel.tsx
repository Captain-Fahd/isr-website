'use client'

import Link from 'next/link'
import { useLiveFlagshipEvent } from '@/lib/flagship/preview'
import type { FlagshipEvent } from '@/lib/flagship'

/** True when tickets can be bought: TryBooking booking is open, or the admin "Tickets on sale" switch is on (read live). */
export function useTicketsLive(event: Pick<FlagshipEvent, 'slug' | 'phase' | 'ticketUrl' | 'ticketsOnSale'>): boolean {
  const live = useLiveFlagshipEvent(event.slug)
  const isBooking = event.phase === 'booking' && Boolean(event.ticketUrl)
  return isBooking || (live?.ticketsOnSale ?? event.ticketsOnSale)
}

/** "Tickets on sale" once tickets are live, "Save the date" until then. */
export default function TicketsStatusLabel({
  event,
}: {
  event: Pick<FlagshipEvent, 'slug' | 'phase' | 'ticketUrl' | 'ticketsOnSale'>
}) {
  return <>{useTicketsLive(event) ? 'Tickets on sale' : 'Save the date'}</>
}

/** The home carousel slide's button: straight to the booking section once tickets are live. */
export function SlideCta({ event }: { event: Pick<FlagshipEvent, 'slug' | 'phase' | 'ticketUrl' | 'ticketsOnSale'> }) {
  const ticketsLive = useTicketsLive(event)

  return (
    <Link
      href={ticketsLive ? `/${event.slug}/#booking` : `/${event.slug}/`}
      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-(--su-primary) px-8 py-3 text-base font-semibold text-(--su-on-primary) shadow-lg transition hover:brightness-110"
    >
      {ticketsLive ? 'Get tickets' : 'Find out more'}
    </Link>
  )
}
