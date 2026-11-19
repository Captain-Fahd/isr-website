'use client'

import type { FlagshipEvent } from '@/lib/flagship'
import { useTicketPrice } from '@/components/flagship/TicketsStatusLabel'
import { plate } from './flagshipStyle'

/** The hero's price row, as a small name plate; absent until tickets are on sale with a price set. */
export default function HeroPrice({ event }: { event: FlagshipEvent }) {
  const price = useTicketPrice(event)
  if (!price) return null

  return (
    <div className="flex gap-2 pt-2">
      <dt className="sr-only">Price</dt>
      <dd className={`${plate} px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] shadow-md`}>{price}</dd>
    </div>
  )
}
