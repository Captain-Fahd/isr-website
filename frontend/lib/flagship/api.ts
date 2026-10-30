import { API_BASE_URL } from '@/lib/api'
import type { FlagshipEvent } from './types'

function fetchOptions(): RequestInit {
  // The site is a static export, so the server-side branch only ever runs at
  // build time. In the browser we must bypass the HTTP cache, otherwise a
  // refresh can replay the stale response the page was built with.
  return typeof window === 'undefined' ? { next: { revalidate: 60 } } : { cache: 'no-store' }
}

export async function fetchFlagshipEvents(init?: RequestInit): Promise<FlagshipEvent[]> {
  const response = await fetch(`${API_BASE_URL}/api/flagship-events`, {
    ...fetchOptions(),
    ...init,
  })

  if (!response.ok) {
    throw new Error('Failed to fetch flagship events')
  }

  const json = (await response.json()) as { data: FlagshipEvent[] }
  return json.data
}

export async function fetchFlagshipEventBySlug(
  slug: string,
  init?: RequestInit,
): Promise<FlagshipEvent | null> {
  const response = await fetch(`${API_BASE_URL}/api/flagship-events/${slug}`, {
    ...fetchOptions(),
    ...init,
  })

  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error('Failed to fetch flagship event')
  }

  const json = (await response.json()) as { data: FlagshipEvent }
  return json.data
}
