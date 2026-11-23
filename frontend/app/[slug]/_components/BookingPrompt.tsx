'use client'

import type { FlagshipEvent } from '@/lib/flagship'
import { useLiveVenue } from '@/lib/flagship/preview'
import { useTicketPrice, useTicketsLive } from '@/components/flagship/TicketsStatusLabel'
import PrimaryCta from './PrimaryCta'
import ShareButton from './ShareButton'
import { plate, serif } from './flagshipStyle'

/**
 * A wine name-plate band that follows the speakers and the programme while tickets
 * are on sale, so the booking ask comes straight after the two sections most likely
 * to convince someone, not only at the foot of the page.
 */
export default function BookingPrompt({
  event,
  message: template,
}: {
  event: FlagshipEvent
  /** `{venue}` is replaced with the live venue name. */
  message: string
}) {
  const ticketsLive = useTicketsLive(event)
  const price = useTicketPrice(event)
  const venue = useLiveVenue(event)
  if (!ticketsLive) return null
  const message = template.split('{venue}').join(venue.name)

  return (
    <aside className={`${plate} px-4 py-10`}>
      <div className="container-isr flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className={`${serif.className} text-2xl font-bold italic leading-snug sm:text-3xl`}>{message}</p>
          {/* One per line on phones, as on the programme's date bar */}
          <p className="mt-3 text-xs font-semibold uppercase leading-relaxed tracking-[0.18em] opacity-85">
            {[event.dateLabel, venue.name, price].filter(Boolean).map((part, index) => (
              <span key={part} className="block sm:inline">
                {index > 0 && <span aria-hidden="true" className="mx-2 hidden sm:inline">✦</span>}
                {part}
              </span>
            ))}
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <PrimaryCta
            phase={event.phase}
            ticketUrl={event.ticketUrl}
            slug={event.slug}
            ticketsOnSale={event.ticketsOnSale}
            variant="light"
            placement="prompt"
          />
          <ShareButton
            event={event}
            placement="prompt"
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap border border-white/60 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] transition hover:bg-white/10"
          />
        </div>
      </div>
    </aside>
  )
}
