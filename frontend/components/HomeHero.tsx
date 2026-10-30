'use client'

import HeroCarousel, { type HeroSlide } from '@/components/HeroCarousel'
import FlagshipHeroSlide from '@/components/flagship/FlagshipHeroSlide'
import type { FlagshipEvent } from '@/lib/flagship'
import { useFlagshipEvents } from '@/lib/flagship/live'

function isShown(event: FlagshipEvent): boolean {
  return event.featuredOnHome && event.released
}

/**
 * Home page hero. Shows the plain default hero until an admin features+releases
 * at least one flagship event, then the carousel with those slides in front —
 * ordered soonest-first, live, so toggling `featuredOnHome`/`released` from the
 * admin panel takes effect without a rebuild.
 */
export default function HomeHero({
  flagshipEvents,
  defaultSlides,
}: {
  flagshipEvents: FlagshipEvent[]
  defaultSlides: HeroSlide[]
}) {
  const { events: liveEvents } = useFlagshipEvents()
  const liveBySlug = new Map(liveEvents.map((event) => [event.slug, event]))

  // Slide markup/images come from the build-time list (baked into the static page);
  // whether each one is actually shown, and in what order, is decided from the live
  // flags where available — falling back to each event's own build-time flags while
  // the live fetch is still in flight, so repeat visitors don't see a flash of the
  // wrong carousel.
  const flagshipSlides: HeroSlide[] = flagshipEvents
    .filter((event) => isShown(liveBySlug.get(event.slug) ?? event))
    .sort((a, b) => (liveBySlug.get(a.slug) ?? a).start.localeCompare((liveBySlug.get(b.slug) ?? b).start))
    .map((event) => ({
      id: event.slug,
      label: event.name,
      duration: 12000,
      content: <FlagshipHeroSlide event={event} />,
    }))

  const slides = [...flagshipSlides, ...defaultSlides]
  // Keyed so the carousel restarts on the first slide when the view switches.
  return <HeroCarousel key={slides.length} slides={slides} />
}
