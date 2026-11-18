'use client'

import { useEffect, useState } from 'react'
import type { FlagshipEvent } from '@/lib/flagship'
import { useTicketPrice } from '@/components/flagship/TicketsStatusLabel'
import PrimaryCta from './PrimaryCta'
import { plate, serif } from './flagshipStyle'

/**
 * Phone-only bottom bar, shown whenever the hero's buttons (#hero-cta) are off
 * screen — including on first load, when the banner pushes them below the fold —
 * and hidden again once the booking section (#booking) scrolls into view.
 * Measured on scroll rather than observed, as #booking mounts only once the live
 * "on sale" switch has been read.
 */
export default function StickyCtaBar({ event }: { event: FlagshipEvent }) {
  const [visible, setVisible] = useState(false)
  const price = useTicketPrice(event)

  useEffect(() => {
    const update = () => {
      const cta = document.getElementById('hero-cta')?.getBoundingClientRect()
      const booking = document.getElementById('booking')?.getBoundingClientRect()
      const ctaOnScreen = cta ? cta.bottom > 0 && cta.top < window.innerHeight : false
      const bookingOnScreen = booking ? booking.top < window.innerHeight : false
      setVisible(!ctaOnScreen && !bookingOnScreen)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 ${plate} border-t border-white/15 px-4 py-3 shadow-[0_-8px_24px_rgb(0_0_0/0.2)] transition-transform duration-300 md:hidden ${
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={`${serif.className} truncate text-base font-bold italic`}>{event.name}</p>
          <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.15em] opacity-80">
            {/* Price first: the date is the part that can be truncated */}
            {[price, event.dateLabel].filter(Boolean).join(' · ')}
          </p>
        </div>
        <PrimaryCta
          phase={event.phase}
          ticketUrl={event.ticketUrl}
          slug={event.slug}
          ticketsOnSale={event.ticketsOnSale}
          variant="light"
          className="shrink-0 px-4"
          placement="sticky"
        />
      </div>
    </div>
  )
}
