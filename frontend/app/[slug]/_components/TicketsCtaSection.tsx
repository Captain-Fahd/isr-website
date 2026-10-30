'use client'

import { CAMPUS } from '@/lib/campus'
import { useFlagshipEvents } from '@/lib/flagship/live'
import PrimaryCta from './PrimaryCta'
import type { EventPhase } from '@/lib/flagship/types'

type Props = {
  slug: string
  phase: EventPhase
  ticketUrl: string
  ticketsOnSale: boolean
  secondaryBtnClassName: string
}

/**
 * The closing "secure your seat" / "be first to know" band. Reads `ticketsOnSale`
 * live (see lib/flagship/live.ts) so flipping the admin switch takes effect on this
 * static-exported page without a rebuild — same reasoning as `released`.
 */
export default function TicketsCtaSection({
  slug,
  phase,
  ticketUrl,
  ticketsOnSale: builtTicketsOnSale,
  secondaryBtnClassName,
}: Props) {
  const { events } = useFlagshipEvents()
  const ticketsOnSale = events.find((event) => event.slug === slug)?.ticketsOnSale ?? builtTicketsOnSale
  const isBooking = phase === 'booking' && Boolean(ticketUrl)
  const ticketsLive = isBooking || ticketsOnSale

  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-(--su-accent)">
        {ticketsLive ? 'Don’t miss out' : 'Be first to know'}
      </p>
      <h2 className="mb-4 text-3xl font-bold md:text-4xl">
        {ticketsLive ? 'Secure your seat' : 'Tickets open soon on TryBooking'}
      </h2>
      <p className="mb-6 text-lg opacity-85">
        {ticketsLive
          ? 'Seats are limited — book today.'
          : 'Join our WhatsApp community or mailing list and we’ll message you the moment booking opens.'}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {ticketsLive && (
          <PrimaryCta phase={phase} ticketUrl={ticketUrl} slug={slug} ticketsOnSale={builtTicketsOnSale} />
        )}
        <a href={CAMPUS.whatsappUrl} target="_blank" rel="noopener noreferrer" className={secondaryBtnClassName}>
          Message us on WhatsApp
        </a>
        <a
          href="https://www.instagram.com/islamicsocietyofrmit/"
          target="_blank"
          rel="noopener noreferrer"
          className={secondaryBtnClassName}
        >
          Follow on Instagram
        </a>
      </div>
    </div>
  )
}
