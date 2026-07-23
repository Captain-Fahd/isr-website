import { API_BASE_URL } from '@/lib/api'

export type Event = {
  id: number
  name: string
  date: string
  imageUrl: string
  description: string
  ticketUrl: string
}

export type EventsFilter = 'all' | 'upcoming' | 'past'

export type EventsResponse = {
  data: Event[]
}

export type EventResponse = {
  data: Event
}

const TIMEZONE = 'Australia/Melbourne'

export function formatEventDate(isoDate: string): { date: string; time: string } {
  const parsed = new Date(isoDate)

  const date = new Intl.DateTimeFormat('en-AU', {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed)

  const time = new Intl.DateTimeFormat('en-AU', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(parsed)

  return { date, time }
}

export function isEventPast(isoDate: string): boolean {
  return new Date(isoDate).getTime() < Date.now()
}

export async function fetchEvents(filter: EventsFilter = 'all'): Promise<Event[]> {
  const query = filter === 'all' ? '' : `?filter=${filter}`
  const response = await fetch(`${API_BASE_URL}/api/events${query}`, {
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch events')
  }

  const json = (await response.json()) as EventsResponse
  return json.data
}

export async function fetchEventById(id: number): Promise<Event | null> {
  const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
    next: { revalidate: 60 },
  })

  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error('Failed to fetch event')
  }

  const json = (await response.json()) as EventResponse
  return json.data
}
