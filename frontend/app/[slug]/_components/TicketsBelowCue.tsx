'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type Spot = { x: number; y: number }

/**
 * Phone-only scroll cue: on load, dims the rest of the page but masks a
 * soft hole over the "Tickets below" prompt so it reads brighter by
 * contrast — a spotlight, not an added glow. Clears on the visitor's
 * first touch/click anywhere.
 */
export default function TicketsBelowCue() {
  const [spotlight, setSpotlight] = useState(true)
  const [spot, setSpot] = useState<Spot | null>(null)
  const anchorRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const clear = () => setSpotlight(false)
    document.addEventListener('pointerdown', clear, { once: true })
    window.addEventListener('scroll', clear, { once: true, passive: true })
    return () => {
      document.removeEventListener('pointerdown', clear)
      window.removeEventListener('scroll', clear)
    }
  }, [])

  useLayoutEffect(() => {
    const measure = () => {
      const el = anchorRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setSpot({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const maskImage = spot
    ? `radial-gradient(circle 190px at ${spot.x}px ${spot.y}px, transparent 0%, transparent 55%, black 100%)`
    : undefined

  return (
    <>
      <div
        aria-hidden="true"
        style={maskImage ? { WebkitMaskImage: maskImage, maskImage } : undefined}
        className={`pointer-events-none fixed inset-0 z-40 bg-black transition-opacity duration-700 sm:hidden ${
          spotlight && spot ? 'opacity-30' : 'opacity-0'
        }`}
      />

      <div className="relative mt-6 flex flex-col items-center sm:hidden">
        <a
          ref={anchorRef}
          href="#booking"
          className="flex flex-col items-center gap-2 text-2xl font-bold text-[#509589]"
        >
          Tickets below
          <svg
            className="h-10 w-10 animate-bounce"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </a>
      </div>
    </>
  )
}
