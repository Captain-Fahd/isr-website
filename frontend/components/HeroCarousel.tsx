'use client'

import { useEffect, useState, type ReactNode } from 'react'

export type HeroSlide = {
  id: string
  label: string
  /** How long the slide stays up before auto-advancing, in ms. */
  duration: number
  content: ReactNode
}

const TICK_MS = 100

/**
 * Crossfading hero carousel. All slides stay mounted and share one grid cell,
 * so the carousel is as tall as its tallest slide and nothing jumps on change.
 * Auto-advance can be paused with the play/pause button, pauses while a
 * keyboard user is focused inside, and is off for reduced-motion users.
 */
export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(query.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const autoplay = slides.length > 1 && !paused && !keyboardFocus && !reducedMotion

  useEffect(() => {
    if (!autoplay) return
    const id = window.setInterval(() => setElapsed((ms) => ms + TICK_MS), TICK_MS)
    return () => window.clearInterval(id)
  }, [autoplay])

  useEffect(() => {
    if (elapsed >= slides[active].duration) goTo(active + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed])

  function goTo(index: number) {
    setActive((index + slides.length) % slides.length)
    setElapsed(0)
  }

  if (slides.length === 1) return <>{slides[0].content}</>

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onFocus={(e) => setKeyboardFocus(e.target.matches(':focus-visible'))}
      onBlur={() => setKeyboardFocus(false)}
    >
      <div className="grid">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}: ${slide.label}`}
            aria-hidden={i !== active}
            className={`[grid-area:1/1] transition-opacity duration-700 ease-in-out ${
              i === active ? 'z-10 opacity-100' : 'pointer-events-none invisible opacity-0'
            }`}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {/* Controls: progress dots double as slide pickers */}
      <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center">
        <div className="flex items-center gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-md">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/15"
            aria-label="Previous slide"
          >
            ‹
          </button>
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${slide.label}`}
              aria-current={i === active}
              className="flex h-8 items-center px-1"
            >
              <span
                className={`relative block h-1.5 overflow-hidden rounded-full bg-white/40 transition-all ${
                  i === active ? 'w-10' : 'w-4'
                }`}
              >
                {i === active && (
                  <span
                    className="absolute inset-y-0 left-0 bg-white"
                    style={{
                      width: reducedMotion ? '100%' : `${Math.min(100, (elapsed / slide.duration) * 100)}%`,
                    }}
                  />
                )}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/15"
            aria-label="Next slide"
          >
            ›
          </button>
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs text-white transition hover:bg-white/15"
              aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
            >
              {paused ? '▶' : '❚❚'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
