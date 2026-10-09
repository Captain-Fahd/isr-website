import { sacredUnion } from './sacred-union'
import type { FlagshipEvent } from './types'

export type { FlagshipEvent } from './types'

/** Every flagship event gets its own top-level page at /<slug>/. */
export const FLAGSHIP_EVENTS: FlagshipEvent[] = [sacredUnion]

export function getFlagshipEvent(slug: string): FlagshipEvent | undefined {
  return FLAGSHIP_EVENTS.find((event) => event.slug === slug)
}

/** Event promoted on the home page carousel, if any. */
export function getFeaturedFlagshipEvent(): FlagshipEvent | undefined {
  return FLAGSHIP_EVENTS.find((event) => event.featuredOnHome)
}
