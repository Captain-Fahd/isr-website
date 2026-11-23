'use client'

import { siWhatsapp } from 'simple-icons'
import { trackEvent } from '@/lib/analytics'
import { absoluteUrl } from '@/lib/seo'
import type { FlagshipEvent } from '@/lib/flagship'
import { useLiveVenue } from '@/lib/flagship/preview'

type Props = {
  event: Pick<FlagshipEvent, 'slug' | 'name' | 'dateLabel' | 'venue'>
  /** Where on the page this button sits, sent with the `share_click` analytics event. */
  placement: 'hero' | 'prompt'
  className?: string
}

/**
 * Opens WhatsApp with the event pre-written, so a visitor can send it to the
 * friend they'd come with. The link is tagged `?ref=share`, so seats sold
 * through shares show up in the CTA analytics and on TryBooking.
 */
export default function ShareButton({ event, placement, className = '' }: Props) {
  const venue = useLiveVenue(event)
  const pageUrl = `${absoluteUrl(`/${event.slug}/`)}?ref=share`
  const text = `${event.name}: ${event.dateLabel} at ${venue.name}. Want to come with me? ${pageUrl}`

  return (
    <a
      href={`https://wa.me/?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('share_click', { placement })}
      className={`gap-2 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4 shrink-0">
        <path d={siWhatsapp.path} />
      </svg>
      Send to a friend
    </a>
  )
}
