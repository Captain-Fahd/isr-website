'use client'

import HeroCarousel, { type HeroSlide } from '@/components/HeroCarousel'
import { useSiteSettings } from '@/lib/siteSettings'

/**
 * Home page hero. Shows the plain default hero until an admin releases the
 * flagship event, then the carousel with the flagship slides in front.
 */
export default function HomeHero({
  flagshipSlides,
  defaultSlides,
}: {
  flagshipSlides: HeroSlide[]
  defaultSlides: HeroSlide[]
}) {
  const { settings } = useSiteSettings()
  const slides = settings.flagshipReleased ? [...flagshipSlides, ...defaultSlides] : defaultSlides
  // Keyed so the carousel restarts on the first slide when the view switches.
  return <HeroCarousel key={slides.length} slides={slides} />
}
