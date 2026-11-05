'use client'

import { useEffect, useState } from 'react'
import { fetchCommunityFormsPage } from './api'
import type { CommunityFormsPage } from './types'

const CACHE_KEY = 'isr_community_forms_page'

function readCache(): CommunityFormsPage | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as CommunityFormsPage) : null
  } catch {
    return null
  }
}

function writeCache(page: CommunityFormsPage) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(page))
  } catch {
    // Storage blocked (private mode etc.) — just skip caching.
  }
}

/**
 * The community forms page config, read live in the browser. The site is a static
 * export, so `enabled` (and the button list) is read at runtime rather than baked
 * in at build time — flipping the toggle in the admin panel takes effect without a
 * rebuild. `loading` is true until the API answers; if it can't be reached, the
 * cached (or null) config stands.
 */
export function useCommunityFormsPage(): { page: CommunityFormsPage | null; loading: boolean } {
  const [page, setPage] = useState<CommunityFormsPage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = readCache()
    if (cached) setPage(cached)

    let cancelled = false
    fetchCommunityFormsPage()
      .then((fresh) => {
        if (!cancelled) setPage(fresh)
        writeCache(fresh)
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  return { page, loading }
}
