'use client'

import { googleCalendarUrl, icsDataUri } from '@/lib/flagship/calendar'
import type { FlagshipEvent } from '@/lib/flagship'
import { useTicketsLive } from '@/components/flagship/TicketsStatusLabel'
import PrimaryCta from './PrimaryCta'
import ShareButton from './ShareButton'

const secondaryBtn =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-current px-5 py-3 text-sm font-semibold transition hover:bg-current/10 lg:min-h-9 lg:px-3 lg:py-2 lg:text-xs'

const textLink = 'font-semibold underline underline-offset-4 hover:opacity-100'

/**
 * The hero's buttons. While tickets are on sale the ticket button leads alone and
 * the calendar options shrink to a line of links, so nothing competes with it;
 * before then, saving the date is the main ask and they stay full buttons.
 * `#hero-cta` is what the phone sticky bar watches (see StickyCtaBar).
 */
export default function HeroActions({ event }: { event: FlagshipEvent }) {
  const ticketsLive = useTicketsLive(event)
  const cta = (
    <PrimaryCta
      phase={event.phase}
      ticketUrl={event.ticketUrl}
      slug={event.slug}
      ticketsOnSale={event.ticketsOnSale}
      placement="hero"
    />
  )

  if (!ticketsLive) {
    return (
      <div id="hero-cta" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:gap-2">
        {cta}
        <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={secondaryBtn}>
          Add to Google Calendar
        </a>
        <a href={icsDataUri(event)} download={`${event.slug}.ics`} className={secondaryBtn}>
          Apple / Outlook (.ics)
        </a>
        <ShareButton event={event} placement="hero" className={secondaryBtn} />
      </div>
    )
  }

  return (
    <div>
      <div id="hero-cta" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:gap-2">
        {cta}
        <ShareButton event={event} placement="hero" className={secondaryBtn} />
      </div>
      <p className="mt-4 text-sm opacity-85 lg:mt-3 lg:text-xs">
        Add to calendar:{' '}
        <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className={textLink}>
          Google
        </a>
        <span aria-hidden="true" className="mx-1.5 opacity-60">·</span>
        <a href={icsDataUri(event)} download={`${event.slug}.ics`} className={textLink}>
          Apple / Outlook
        </a>
      </p>
    </div>
  )
}
