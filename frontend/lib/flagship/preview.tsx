'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useFlagshipEvents } from './live'
import type { FlagshipEvent } from './types'

/**
 * True inside the admin preview. Sections that normally prefer the live API value
 * over their build-time props (so toggles apply without a rebuild) must use the
 * props instead there — otherwise the preview would show live data, not the draft.
 */
const FlagshipPreviewContext = createContext(false)

export function FlagshipPreviewProvider({ children }: { children: ReactNode }) {
  return <FlagshipPreviewContext.Provider value>{children}</FlagshipPreviewContext.Provider>
}

export function useIsFlagshipPreview(): boolean {
  return useContext(FlagshipPreviewContext)
}

/** The live copy of an event, or undefined while loading — and always in preview. */
export function useLiveFlagshipEvent(slug: string): FlagshipEvent | undefined {
  const preview = useIsFlagshipPreview()
  const { events } = useFlagshipEvents()
  return preview ? undefined : events.find((event) => event.slug === slug)
}

/**
 * The event's venue, read live so a venue change in the admin panel reaches the
 * static-exported page without a rebuild. Falls back to the build-time copy while
 * loading, if the API can't be reached, and in preview.
 */
export function useLiveVenue(event: Pick<FlagshipEvent, 'slug' | 'venue'>): FlagshipEvent['venue'] {
  return useLiveFlagshipEvent(event.slug)?.venue ?? event.venue
}
