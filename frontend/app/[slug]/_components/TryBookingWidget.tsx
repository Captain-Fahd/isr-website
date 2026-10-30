'use client'

import { useEffect, useRef } from 'react'

const WIDGET_SRC = 'https://www.trybooking.com/widget.js'

declare global {
  // eslint-disable-next-line no-var
  var trybWidgetsInitialized: boolean | undefined
}

/**
 * TryBooking's full booking embed. widget.js fills `.tryb-widget` elements
 * once per page load (guarded by `trybWidgetsInitialized`), so the guard is
 * cleared and a fresh script tag added on every mount — otherwise the widget
 * stays empty after client-side navigation back to the page. widget.js sizes
 * the iframe itself: full width, height following the booking form.
 */
export default function TryBookingWidget({ eventId }: { eventId: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    globalThis.trybWidgetsInitialized = false
    const script = document.createElement('script')
    script.src = WIDGET_SRC
    script.async = true
    script.defer = true
    container.appendChild(script)

    return () => script.remove()
  }, [eventId])

  return (
    <div ref={containerRef}>
      <div className="tryb-widget" data-type="fullEmbed" data-eid={eventId} />
    </div>
  )
}
