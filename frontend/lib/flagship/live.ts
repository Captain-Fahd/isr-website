'use client'

import { useEffect, useState } from 'react'
import { fetchFlagshipEvents } from './api'
import type { FlagshipEvent } from './types'

const CACHE_KEY = 'isr_flagship_events'

function readCache(): FlagshipEvent[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as FlagshipEvent[]) : null
  } catch {
    return null
  }
}

function writeCache(events: FlagshipEvent[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(events))
  } catch {
    // Storage blocked (private mode etc.) — just skip caching.
  }
}

/**
 * Every flagship event, read live in the browser. The site is a static export, so
 * `released`/`featuredOnHome` (and which event is "the" featured one) are read at
 * runtime rather than baked in at build time — flipping a toggle in the admin panel
 * takes effect without a rebuild. `loading` is true until the API answers; if it
 * can't be reached, the cached (or empty) list stands.
 */
export function useFlagshipEvents(): { events: FlagshipEvent[]; loading: boolean } {
  const [events, setEvents] = useState<FlagshipEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = readCache()
    if (cached) setEvents(cached)

    let cancelled = false
    fetchFlagshipEvents()
      .then((fresh) => {
        if (!cancelled) setEvents(fresh)
        writeCache(fresh)
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  return { events, loading }
}

/** The soonest-starting event that's both featured and released, if any. */
export function pickFeaturedFlagshipEvent(events: FlagshipEvent[]): FlagshipEvent | undefined {
  return events
    .filter((event) => event.featuredOnHome && event.released)
    .sort((a, b) => a.start.localeCompare(b.start))[0]
}
