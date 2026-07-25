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

function formatDatetimeLocalInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''

  let hour = get('hour')
  if (hour === '24') hour = '00'

  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`
}

/** ISO UTC → `datetime-local` value in Australia/Melbourne. */
export function toDatetimeLocalValue(isoDate: string): string {
  return formatDatetimeLocalInTimeZone(new Date(isoDate), TIMEZONE)
}

/** `datetime-local` value (Melbourne local time) → ISO UTC. */
export function fromDatetimeLocalValue(localValue: string): string {
  const [datePart, timePart] = localValue.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)

  let utcMs = Date.UTC(year, month - 1, day, hour, minute)

  for (let i = 0; i < 4; i++) {
    const formatted = formatDatetimeLocalInTimeZone(new Date(utcMs), TIMEZONE)
    if (formatted === localValue) {
      return new Date(utcMs).toISOString()
    }

    const [fDate, fTime] = formatted.split('T')
    const [fy, fm, fd] = fDate.split('-').map(Number)
    const [fh, fmin] = fTime.split(':').map(Number)

    utcMs += Date.UTC(year, month - 1, day, hour, minute) - Date.UTC(fy, fm - 1, fd, fh, fmin)
  }

  return new Date(utcMs).toISOString()
}

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

/**
 * Orders events for display: upcoming first (soonest at the top), then past
 * events from most recent down to the oldest.
 */
export function sortEventsForDisplay(events: Event[]): Event[] {
  const now = Date.now()

  return [...events].sort((a, b) => {
    const aTime = new Date(a.date).getTime()
    const bTime = new Date(b.date).getTime()
    const aUpcoming = aTime >= now
    const bUpcoming = bTime >= now

    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1
    return aUpcoming ? aTime - bTime : bTime - aTime
  })
}

function fetchOptions(): RequestInit | undefined {
  return typeof window === 'undefined' ? { next: { revalidate: 60 } } : undefined
}

export async function fetchEvents(filter: EventsFilter = 'all'): Promise<Event[]> {
  const query = filter === 'all' ? '' : `?filter=${filter}`
  const response = await fetch(`${API_BASE_URL}/api/events${query}`, fetchOptions())

  if (!response.ok) {
    throw new Error('Failed to fetch events')
  }

  const json = (await response.json()) as EventsResponse
  return json.data
}

export async function fetchEventById(id: number): Promise<Event | null> {
  const response = await fetch(`${API_BASE_URL}/api/events/${id}`, fetchOptions())

  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error('Failed to fetch event')
  }

  const json = (await response.json()) as EventResponse
  return json.data
}
