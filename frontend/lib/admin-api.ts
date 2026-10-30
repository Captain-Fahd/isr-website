import { API_BASE_URL } from '@/lib/api'
import type { Event } from '@/lib/events'
import type { Announcement } from '@/lib/announcements'
import type { FlagshipEvent } from '@/lib/flagship'

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` }
}

export async function signIn(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Sign in failed')
  return (json.data.session as { access_token: string }).access_token
}

export async function fetchAllEvents(): Promise<Event[]> {
  const res = await fetch(`${API_BASE_URL}/api/events`, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch events')
  return json.data as Event[]
}

export async function createEvent(token: string, formData: FormData): Promise<Event> {
  const res = await fetch(`${API_BASE_URL}/api/events`, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to create event')
  return json.data as Event
}

export async function updateEvent(
  token: string,
  id: number,
  formData: FormData,
): Promise<Event> {
  const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: formData,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to update event')
  return json.data as Event
}

export async function deleteEvent(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.error ?? 'Failed to delete event')
  }
}

export async function fetchAllAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${API_BASE_URL}/api/announcements`, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch announcements')
  return json.data as Announcement[]
}

export async function createAnnouncement(
  token: string,
  formData: FormData,
): Promise<Announcement> {
  const res = await fetch(`${API_BASE_URL}/api/announcements`, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to create announcement')
  return json.data as Announcement
}

export async function updateAnnouncement(
  token: string,
  id: number,
  formData: FormData,
): Promise<Announcement> {
  const res = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: formData,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to update announcement')
  return json.data as Announcement
}

export async function deleteAnnouncement(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.error ?? 'Failed to delete announcement')
  }
}

export async function fetchAllFlagshipEvents(): Promise<FlagshipEvent[]> {
  const res = await fetch(`${API_BASE_URL}/api/flagship-events`, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch flagship events')
  return json.data as FlagshipEvent[]
}

// Unlike createEvent/createAnnouncement, this takes a plain JSON payload — a flagship
// event has too many images for one multipart request; each is uploaded independently
// via uploadFlagshipImage first, and the resulting URLs go in the payload below.
export async function createFlagshipEvent(
  token: string,
  payload: Omit<FlagshipEvent, 'id'>,
): Promise<FlagshipEvent> {
  const res = await fetch(`${API_BASE_URL}/api/flagship-events`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to create flagship event')
  return json.data as FlagshipEvent
}

export async function updateFlagshipEvent(
  token: string,
  id: number,
  payload: Partial<Omit<FlagshipEvent, 'id'>>,
): Promise<FlagshipEvent> {
  const res = await fetch(`${API_BASE_URL}/api/flagship-events/${id}`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to update flagship event')
  return json.data as FlagshipEvent
}

export async function deleteFlagshipEvent(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/flagship-events/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(json.error ?? 'Failed to delete flagship event')
  }
}

export async function uploadFlagshipImage(token: string, file: File): Promise<string> {
  const formData = new FormData()
  formData.set('image', file)
  const res = await fetch(`${API_BASE_URL}/api/flagship-events/upload-image`, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Failed to upload image')
  return (json.data as { url: string }).url
}
