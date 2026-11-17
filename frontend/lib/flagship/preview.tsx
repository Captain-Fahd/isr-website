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
