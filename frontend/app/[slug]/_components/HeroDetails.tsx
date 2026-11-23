'use client'

import type { FlagshipEvent } from '@/lib/flagship'
import { useLiveFlagshipEvent } from '@/lib/flagship/preview'

/**
 * The hero's date, time and venue lines. Read live (see lib/flagship/live.ts), as
 * the programme's date bar is, so admin edits reach this static-exported page
 * without a rebuild and the two never disagree.
 */
export default function HeroDetails({
  event,
}: {
  event: Pick<FlagshipEvent, 'slug' | 'dateLabel' | 'timeLabel' | 'venue'>
}) {
  const live = useLiveFlagshipEvent(event.slug)
  const { dateLabel, timeLabel, venue } = live ?? event

  return (
    <>
      <div className="flex gap-2">
        <dt className="sr-only">Date</dt>
        <dd className="font-semibold">{dateLabel}</dd>
      </div>
      <div className="flex gap-2">
        <dt className="sr-only">Time</dt>
        <dd className="opacity-85">{timeLabel}</dd>
      </div>
      <div className="flex gap-2">
        <dt className="sr-only">Venue</dt>
        <dd className="opacity-85">
          {venue.name} · {venue.address}
        </dd>
      </div>
    </>
  )
}
