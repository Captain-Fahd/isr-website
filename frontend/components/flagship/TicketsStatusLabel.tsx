'use client'

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
