import { API_BASE_URL } from '@/lib/api'

export const RECURRENCE_FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY'] as const
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number]

export type Occurrence = {
  start: string
  end: string
}

export type Event = {
  id: number
  name: string
  date: string
  imageUrl: string
  description: string
  ticketUrl: string | null
  /** End of the first occurrence; null for a single-day event. */
  endDate?: string | null
  recurrenceFrequency?: RecurrenceFrequency | null
  recurrenceInterval?: number | null
  recurrenceEndDate?: string | null
  /** Derived by the API. Optional so an older API response still type-checks. */
  isMultiDay?: boolean
  isRecurring?: boolean
  /** First occurrence that has not finished yet, or null once the event is over. */
  nextOccurrence?: Occurrence | null
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
 * The occurrence to show for an event: the next one still to come (or in progress),
 * falling back to the stored dates for an API response without the derived fields.
 */
export function displayOccurrence(event: Event): Occurrence {
  if (event.nextOccurrence) return event.nextOccurrence
  return { start: event.date, end: event.endDate ?? event.date }
}

/** True once every occurrence of the event has finished. */
export function isEventOver(event: Event): boolean {
  if (event.nextOccurrence !== undefined) return event.nextOccurrence === null
  return isEventPast(event.endDate ?? event.date)
}

/**
 * Orders events for display: upcoming first (furthest in the future at the top),
 * then past events from most recent down to the oldest. Multi-day and recurring
 * events sort on the occurrence being shown, not on their original start date.
 */
export function sortEventsForDisplay(events: Event[]): Event[] {
  return [...events].sort((a, b) => {
    const aOver = isEventOver(a)
    const bOver = isEventOver(b)
    if (aOver !== bOver) return aOver ? 1 : -1

    const aTime = new Date(displayOccurrence(a).start).getTime()
    const bTime = new Date(displayOccurrence(b).start).getTime()
    return bTime - aTime
  })
}

function formatDay(isoDate: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate))
}

function formatShortDay(isoDate: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate))
}

function sameDayInMelbourne(a: string, b: string): boolean {
  const key = (iso: string) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(iso))
  return key(a) === key(b)
}

/**
 * The date/time line for an event card. Multi-day occurrences read as a range;
 * single-day ones keep the existing `{ date, time }` split.
 */
export function formatEventSchedule(event: Event): { date: string; time: string } {
  const { start, end } = displayOccurrence(event)
  const { date, time } = formatEventDate(start)

  if (!event.endDate || sameDayInMelbourne(start, end)) {
    return { date, time }
  }

  return { date: `${formatShortDay(start)} – ${formatShortDay(end)}`, time }
}

const FREQUENCY_NOUNS: Record<RecurrenceFrequency, { one: string; many: string }> = {
  DAILY: { one: 'day', many: 'days' },
  WEEKLY: { one: 'week', many: 'weeks' },
  MONTHLY: { one: 'month', many: 'months' },
}

/** Short label for the recurrence rule, e.g. "Every 2 weeks", or null for a one-off. */
export function formatRecurrence(event: Event): string | null {
  if (!event.recurrenceFrequency) return null

  const interval = event.recurrenceInterval ?? 1
  const noun = FREQUENCY_NOUNS[event.recurrenceFrequency]
  if (!noun) return null

  const every = interval === 1 ? `Every ${noun.one}` : `Every ${interval} ${noun.many}`
  return event.recurrenceEndDate
    ? `${every} until ${formatShortDay(event.recurrenceEndDate)}`
    : every
}

/** Full sentence describing when a recurring and/or multi-day event runs. */
export function describeSchedule(event: Event): string | null {
  const recurrence = formatRecurrence(event)
  const { start, end } = displayOccurrence(event)

  if (event.endDate && !sameDayInMelbourne(start, end)) {
    const range = `Runs ${formatDay(start)} to ${formatDay(end)}`
    return recurrence ? `${range} · ${recurrence.toLowerCase()}` : range
  }

  return recurrence
}

function fetchOptions(): RequestInit {
  // The site is a static export, so the server-side branch only ever runs at
  // build time. In the browser we must bypass the HTTP cache, otherwise a
  // refresh can replay the stale response the page was built with.
  return typeof window === 'undefined' ? { next: { revalidate: 60 } } : { cache: 'no-store' }
}

export async function fetchEvents(
  filter: EventsFilter = 'all',
  init?: RequestInit,
): Promise<Event[]> {
  const query = filter === 'all' ? '' : `?filter=${filter}`
  const response = await fetch(`${API_BASE_URL}/api/events${query}`, {
    ...fetchOptions(),
    ...init,
  })

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
