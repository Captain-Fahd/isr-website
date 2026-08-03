import { API_BASE_URL } from '@/lib/api'
import type { Event } from '@/lib/events'
import type { Announcement } from '@/lib/announcements'

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
