'use client'

import { useEffect, useRef, useState } from 'react'
import { campaignRef, trackEvent } from '@/lib/analytics'
import { CAMPUS } from '@/lib/campus'
import { useLiveFlagshipEvent } from '@/lib/flagship/preview'
import type { EventPhase } from '@/lib/flagship/types'
import PrimaryCta, { withRef } from './PrimaryCta'
import TryBookingWidget from './TryBookingWidget'
import { SectionHeading, plateButton, serif } from './flagshipStyle'

type Props = {
  slug: string
  phase: EventPhase
  ticketUrl: string
  /** TryBooking `data-eid`; empty until the booking form is set up. */
  ticketEventId: string
  ticketsOnSale: boolean
  priceLabel: string
}

/**
 * The booking embed that closes the page. It reads
 * `ticketsOnSale` live (see lib/flagship/live.ts), so flipping the admin switch
 * reveals the widget on this static-exported page without a rebuild — and the
 * CTAs that scroll down to #booking never land on an empty section.
 */
export default function TicketsSection({
  slug,
  phase,
  ticketUrl,
  ticketEventId,
  ticketsOnSale: builtTicketsOnSale,
  priceLabel: builtPriceLabel,
}: Props) {
  const live = useLiveFlagshipEvent(slug)
  const ticketsOnSale = live?.ticketsOnSale ?? builtTicketsOnSale
  const price = (live?.priceLabel ?? builtPriceLabel ?? '').trim()
  const sectionRef = useRef<HTMLElement>(null)
  const [ref, setRef] = useState<string | null>(null)

  useEffect(() => {
    setRef(campaignRef())
  }, [])

  // Once per page view: how many visitors reach the form, to compare with sales.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      trackEvent('booking_view')
      observer.disconnect()
    })
    observer.observe(section)
    return () => observer.disconnect()
  }, [ticketsOnSale])

  if (!ticketsOnSale) return null

  return (
    <section ref={sectionRef} id="booking" className="scroll-mt-24 px-4 py-16 sm:py-20">
      <div className="container-isr max-w-4xl">
        <SectionHeading eyebrow="Tickets" title="Book your seat" />
        {price && (
          <p className={`${serif.className} -mt-4 mb-10 text-center text-xl font-bold italic text-(--su-primary)`}>
            {price}
          </p>
        )}

        {ticketEventId ? (
          // Full-bleed on phones: the section and container gutters leave
          // TryBooking's form too narrow and it gets clipped at the sides.
          <div className="-mx-8 bg-white sm:mx-0 sm:overflow-hidden sm:rounded-2xl sm:p-4 sm:shadow-sm sm:ring-1 sm:ring-(--su-on-light)/10">
            <TryBookingWidget eventId={ticketEventId} />
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-(--su-on-light)/20 bg-white/60 px-6 py-16 text-center">
            <h3 className="mb-3 text-2xl font-bold md:text-3xl">Tickets aren’t on sale yet</h3>
            <p className="mb-8 max-w-xl text-lg opacity-80">
              Booking will open here through TryBooking. Register your interest and we’ll let you
              know the moment tickets go live.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* This block only renders while ticketEventId is empty, so the widget
                  isn't live below either — pin the CTA to the external "Notify me"
                  link rather than letting it anchor back to this same section. */}
              <PrimaryCta
                phase={phase}
                ticketUrl={ticketUrl}
                slug={slug}
                ticketsOnSale={false}
                respectLiveToggle={false}
                variant="plate"
                placement="booking"
              />
              <a
                href={CAMPUS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={plateButton}
              >
                Message us on WhatsApp
              </a>
            </div>
          </div>
        )}

        {ticketEventId && ticketUrl && (
          <p className="mt-8 text-center text-sm">
            <a
              href={withRef(ticketUrl, ref)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-4 opacity-80 hover:opacity-100"
            >
              Trouble booking? Open TryBooking in a new tab
            </a>
          </p>
        )}
      </div>
    </section>
  )
}
