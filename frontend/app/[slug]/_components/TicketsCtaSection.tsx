'use client'

import { CAMPUS } from '@/lib/campus'
import { useLiveFlagshipEvent } from '@/lib/flagship/preview'
import PrimaryCta from './PrimaryCta'
import { Eyebrow, Ornament, serif } from './flagshipStyle'
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
  const ticketsOnSale = useLiveFlagshipEvent(slug)?.ticketsOnSale ?? builtTicketsOnSale
  const isBooking = phase === 'booking' && Boolean(ticketUrl)
  const ticketsLive = isBooking || ticketsOnSale

  return (
    <div>
      <Eyebrow>{ticketsLive ? 'Don’t miss out' : 'Be first to know'}</Eyebrow>
      <h2 className={`${serif.className} mb-3 text-4xl font-extrabold italic leading-tight md:text-5xl`}>
        {ticketsLive ? 'Secure your seat' : 'Tickets open soon on TryBooking'}
      </h2>
      <Ornament className="mb-5 justify-start" />
      <p className="mb-8 text-lg opacity-85">
        {ticketsLive
          ? 'Seats are limited — book today.'
          : 'Join our WhatsApp community or mailing list and we’ll message you the moment booking opens.'}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {ticketsLive && (
          <PrimaryCta
            phase={phase}
            ticketUrl={ticketUrl}
            slug={slug}
            ticketsOnSale={builtTicketsOnSale}
            variant="solid"
          />
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
