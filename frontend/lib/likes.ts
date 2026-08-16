import { API_BASE_URL } from '@/lib/api'

export type LikeState = {
  likeCount: number
  likedByMe: boolean
}

type LikeResponse = {
  data: { id: number; likeCount: number; likedByMe: boolean }
}

const STORAGE_KEY = 'isr:like-client-id'

/** Used when localStorage is unavailable, so likes still work for this page session. */
let sessionClientId: string | null = null

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

/**
 * The id this browser identifies itself with when liking. Visitors are anonymous,
 * so the id is random and generated once — it dedupes repeat taps and lets someone
 * unlike later, nothing more. Returns null on the server, where there is no visitor.
 */
export function getClientId(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) return stored

    const created = randomId()
    window.localStorage.setItem(STORAGE_KEY, created)
    return created
  } catch {
    // Private browsing or blocked storage: keep an id in memory so the button still
    // works, accepting that it is forgotten when the page unloads.
    sessionClientId ??= randomId()
    return sessionClientId
  }
}

function toLikeState(json: LikeResponse): LikeState {
  return { likeCount: json.data.likeCount, likedByMe: json.data.likedByMe }
}

export async function likeEvent(eventId: number, clientId: string): Promise<LikeState> {
  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId }),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to like event')
  }

  return toLikeState((await response.json()) as LikeResponse)
}

export async function unlikeEvent(eventId: number, clientId: string): Promise<LikeState> {
  // Sent as a query parameter rather than a DELETE body, which some proxies strip.
  const query = `?clientId=${encodeURIComponent(clientId)}`
  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/like${query}`, {
    method: 'DELETE',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to unlike event')
  }

  return toLikeState((await response.json()) as LikeResponse)
}

/**
 * The live like state for one event. The site is a static export, so counts baked
 * into the HTML are as old as the last build and have to be refreshed in the browser.
 */
export async function fetchEventLikes(eventId: number, clientId: string): Promise<LikeState> {
  const query = `?clientId=${encodeURIComponent(clientId)}`
  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}${query}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch event likes')
  }

  const json = (await response.json()) as { data: { likeCount?: number; likedByMe?: boolean } }
  return {
    likeCount: json.data.likeCount ?? 0,
    likedByMe: json.data.likedByMe ?? false,
  }
}
