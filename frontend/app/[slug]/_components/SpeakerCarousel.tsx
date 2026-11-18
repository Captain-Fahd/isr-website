'use client'

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

const ROTATE_MS = 5000
/** Cards per page (or row) on tablet/desktop, repeated if there are more cards than this covers. */
export const PAGE_PATTERN = [3, 2, 2]

export function paginate<T>(items: T[], pattern: number[]): T[][] {
  const pages: T[][] = []
  for (let i = 0, p = 0; i < items.length; p++) {
    const size = pattern[p % pattern.length]
    pages.push(items.slice(i, i + size))
    i += size
  }
  return pages
}

/**
 * Auto-rotating speaker carousel. On tablet/desktop the cards are grouped into
 * pages of 3, then 2, then 2 (see PAGE_PATTERN), with smaller pages centred so
 * every card stays the same size; on phones it's one card per page. It loops back
 * to the first page after the last, can be swiped or driven by the arrows/dots,
 * pauses on hover or keyboard focus, and doesn't auto-rotate for reduced-motion
 * users. With a single page it renders as a plain row with no controls.
 */
export default function SpeakerCarousel({ children }: { children: ReactNode; audiences?: (string | undefined)[] }) {
  const slides = Children.toArray(children)
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [wide, setWide] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [keyboardFocus, setKeyboardFocus] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const width = window.matchMedia('(min-width: 640px)')
    const sync = () => {
      setReducedMotion(motion.matches)
      setWide(width.matches)
    }
    sync()
    motion.addEventListener('change', sync)
    width.addEventListener('change', sync)
    return () => {
      motion.removeEventListener('change', sync)
      width.removeEventListener('change', sync)
    }
  }, [])

  const pages = paginate(slides, wide ? PAGE_PATTERN : [1])
  const lastIndex = pages.length - 1

  // Re-paginating (e.g. rotating a phone) can leave us past the end or mid-scroll.
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 })
    setActive(0)
  }, [wide, slides.length])

  // Keep `active` in sync with manual swipes/scrolls. Pages are full track width.
  function onScroll() {
    const track = trackRef.current
    if (!track || !track.clientWidth) return
    setActive(Math.min(lastIndex, Math.round(track.scrollLeft / track.clientWidth)))
  }

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current
      if (!track) return
      const target = index > lastIndex ? 0 : index < 0 ? lastIndex : index
      track.scrollTo({ left: target * track.clientWidth, behavior: reducedMotion ? 'auto' : 'smooth' })
      setActive(target)
    },
    [lastIndex, reducedMotion],
  )

  const autoplay = lastIndex > 0 && !hovered && !keyboardFocus && !reducedMotion

  // Restarting on every `active` change means a manual move resets the timer.
  useEffect(() => {
    if (!autoplay) return
    const id = window.setTimeout(() => goTo(active + 1), ROTATE_MS)
    return () => window.clearTimeout(id)
  }, [autoplay, active, goTo])

  const arrowClass =
    'flex h-10 w-10 items-center justify-center border border-(--su-dark)/40 bg-white/70 text-xl text-(--su-dark) shadow-sm transition hover:bg-(--su-dark) hover:text-white'

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Speakers"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(e) => setKeyboardFocus(e.target.matches(':focus-visible'))}
      onBlur={() => setKeyboardFocus(false)}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((page, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${pages.length}`}
            aria-hidden={lastIndex > 0 && i !== active}
            className="flex w-full shrink-0 snap-start justify-center gap-6"
          >
            {page.map((slide, j) => (
              <div key={j} className="w-full sm:w-[calc((100%-3rem)/3)]">
                {slide}
              </div>
            ))}
          </div>
        ))}
      </div>

      {lastIndex > 0 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button type="button" onClick={() => goTo(active - 1)} className={arrowClass} aria-label="Previous speakers">
            ‹
          </button>
          <div className="flex items-center gap-1">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to page ${i + 1} of speakers`}
                aria-current={i === active}
                className="flex h-8 items-center px-1"
              >
                <span
                  className={`block h-1.5 transition-all ${
                    i === active ? 'w-8 bg-(--su-primary)' : 'w-3 bg-(--su-dark)/25'
                  }`}
                />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => goTo(active + 1)} className={arrowClass} aria-label="Next speakers">
            ›
          </button>
        </div>
      )}
    </div>
  )
}
