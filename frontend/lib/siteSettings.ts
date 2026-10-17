'use client'

import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/lib/api'

export type SiteSettings = {
  /** Home carousel + flagship event pages are live. Off = the pre-launch default site. */
  flagshipReleased: boolean
  /** Null until an admin first saves settings. */
  updatedAt: string | null
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = { flagshipReleased: false, updatedAt: null }

// Last-seen settings, so repeat visitors render the right view without a flash.
const CACHE_KEY = 'isr_site_settings'

function readCache(): SiteSettings | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as SiteSettings) : null
  } catch {
    return null
  }
}

function writeCache(settings: SiteSettings) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(settings))
  } catch {
    // Storage blocked (private mode etc.) — just skip caching.
  }
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE_URL}/api/settings`, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch settings')
  writeCache(json.data)
  return json.data as SiteSettings
}

/**
 * Runtime site settings. The site is a static export, so these are read in the
 * browser rather than baked in at build time. `loading` is true until the API
 * answers; if it can't be reached, the cached (or default) settings stand.
 */
export function useSiteSettings(): { settings: SiteSettings; loading: boolean } {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = readCache()
    if (cached) setSettings(cached)

    let cancelled = false
    fetchSiteSettings()
      .then((fresh) => !cancelled && setSettings(fresh))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  return { settings, loading }
}
