import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  describeSchedule,
  displayOccurrence,
  formatEventDate,
  formatEventSchedule,
  formatRecurrence,
  fromDatetimeLocalValue,
  isEventOver,
  isEventPast,
  sortEventsForDisplay,
  toDatetimeLocalValue,
  type Event,
} from '@/lib/events'

/**
 * Melbourne is AEST (UTC+10) in winter and AEDT (UTC+11) from the first Sunday
 * in October to the first Sunday in April. 2026 transitions: 5 Apr and 4 Oct.
 */

function event(overrides: Partial<Event> & { id: number; date: string }): Event {
  return {
    name: `Event ${overrides.id}`,
    description: 'Description',
    imageUrl: 'https://cdn.example.com/poster.webp',
    ticketUrl: null,
    ...overrides,
  }
}

describe('toDatetimeLocalValue', () => {
  test('converts a winter UTC instant to AEST wall time', () => {
    expect(toDatetimeLocalValue('2026-08-13T08:30:00.000Z')).toBe('2026-08-13T18:30')
  })

  test('converts a summer UTC instant to AEDT wall time', () => {
    expect(toDatetimeLocalValue('2026-01-15T07:30:00.000Z')).toBe('2026-01-15T18:30')
  })

  test('rolls the date forward when UTC and Melbourne fall on different days', () => {
    // 22:00 UTC on 12 Aug is 08:00 on 13 Aug in Melbourne.
    expect(toDatetimeLocalValue('2026-08-12T22:00:00.000Z')).toBe('2026-08-13T08:00')
  })

  test('renders Melbourne midnight as 00:00, not 24:00', () => {
    expect(toDatetimeLocalValue('2026-08-12T14:00:00.000Z')).toBe('2026-08-13T00:00')
  })

  test('uses the AEDT offset right before the April DST end', () => {
    // 2026-04-05 02:59 AEDT (UTC+11) — still summer time.
    expect(toDatetimeLocalValue('2026-04-04T15:59:00.000Z')).toBe('2026-04-05T02:59')
  })

  test('uses the AEST offset right after the April DST end', () => {
    // 2026-04-05 02:00 AEST (UTC+10) — the clock has gone back.
    expect(toDatetimeLocalValue('2026-04-04T16:00:00.000Z')).toBe('2026-04-05T02:00')
  })
})

describe('fromDatetimeLocalValue', () => {
  test('converts AEST wall time to UTC', () => {
    expect(fromDatetimeLocalValue('2026-08-13T18:30')).toBe('2026-08-13T08:30:00.000Z')
  })

  test('converts AEDT wall time to UTC', () => {
    expect(fromDatetimeLocalValue('2026-01-15T18:30')).toBe('2026-01-15T07:30:00.000Z')
  })

  test('converts Melbourne midnight to the previous UTC day', () => {
    expect(fromDatetimeLocalValue('2026-08-13T00:00')).toBe('2026-08-12T14:00:00.000Z')
  })

  test('converts a time just before the October DST start', () => {
    // 2026-10-04 01:59 is still AEST (UTC+10).
    expect(fromDatetimeLocalValue('2026-10-04T01:59')).toBe('2026-10-03T15:59:00.000Z')
  })

  test('converts a time just after the October DST start', () => {
    // 2026-10-04 03:00 is AEDT (UTC+11); 02:00–02:59 does not exist locally.
    expect(fromDatetimeLocalValue('2026-10-04T03:00')).toBe('2026-10-03T16:00:00.000Z')
  })

  test('resolves to a real instant for a wall time skipped by the DST jump', () => {
    // 02:30 on 4 Oct never occurs in Melbourne. The convergence loop cannot
    // match it exactly, but it must still return a valid instant rather than
    // NaN or a throw.
    const result = fromDatetimeLocalValue('2026-10-04T02:30')
    expect(Number.isNaN(Date.parse(result))).toBe(false)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })
})

describe('datetime-local round trip', () => {
  const wallTimes = [
    '2026-08-13T18:30', // AEST
    '2026-01-15T09:05', // AEDT
    '2026-08-13T00:00', // midnight AEST
    '2026-01-15T00:00', // midnight AEDT
    '2026-12-31T23:59', // year boundary
    '2026-04-05T12:00', // DST-end day
    '2026-10-04T12:00', // DST-start day
  ]

  test.each(wallTimes)('%s survives local -> UTC -> local', (wallTime) => {
    expect(toDatetimeLocalValue(fromDatetimeLocalValue(wallTime))).toBe(wallTime)
  })
})

describe('formatEventDate', () => {
  test('formats a winter instant in Melbourne time', () => {
    const { date, time } = formatEventDate('2026-08-13T08:30:00.000Z')
    expect(date).toBe('Thursday 13 August 2026')
    expect(time).toBe('6:30 pm')
  })

  test('formats a summer instant using the AEDT offset', () => {
    const { date, time } = formatEventDate('2026-01-15T07:30:00.000Z')
    expect(date).toBe('Thursday 15 January 2026')
    expect(time).toBe('6:30 pm')
  })

  test('uses the Melbourne day, not the UTC day', () => {
    const { date } = formatEventDate('2026-08-12T22:00:00.000Z')
    expect(date).toBe('Thursday 13 August 2026')
  })
})

describe('isEventPast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-13T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns true for an instant before now', () => {
    expect(isEventPast('2026-08-12T23:59:59.000Z')).toBe(true)
  })

  test('returns false for an instant after now', () => {
    expect(isEventPast('2026-08-13T00:00:01.000Z')).toBe(false)
  })

  test('returns false at exactly now', () => {
    expect(isEventPast('2026-08-13T00:00:00.000Z')).toBe(false)
  })
})

describe('sortEventsForDisplay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-13T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('places all upcoming events before all past events', () => {
    const events = [
      event({ id: 1, date: '2026-01-01T00:00:00.000Z' }), // past
      event({ id: 2, date: '2026-09-01T00:00:00.000Z' }), // upcoming
      event({ id: 3, date: '2025-06-01T00:00:00.000Z' }), // past
      event({ id: 4, date: '2026-12-01T00:00:00.000Z' }), // upcoming
    ]

    expect(sortEventsForDisplay(events).map((e) => e.id)).toEqual([4, 2, 1, 3])
  })

  test('orders upcoming events furthest-first, matching the documented order', () => {
    const events = [
      event({ id: 1, date: '2026-09-01T00:00:00.000Z' }),
      event({ id: 2, date: '2026-12-01T00:00:00.000Z' }),
      event({ id: 3, date: '2026-10-01T00:00:00.000Z' }),
    ]

    expect(sortEventsForDisplay(events).map((e) => e.id)).toEqual([2, 3, 1])
  })

  test('orders past events most-recent-first', () => {
    const events = [
      event({ id: 1, date: '2024-01-01T00:00:00.000Z' }),
      event({ id: 2, date: '2026-06-01T00:00:00.000Z' }),
      event({ id: 3, date: '2025-01-01T00:00:00.000Z' }),
    ]

    expect(sortEventsForDisplay(events).map((e) => e.id)).toEqual([2, 3, 1])
  })

  test('treats an event dated exactly now as upcoming', () => {
    const events = [
      event({ id: 1, date: '2026-08-12T00:00:00.000Z' }),
      event({ id: 2, date: '2026-08-13T00:00:00.000Z' }),
    ]

    expect(sortEventsForDisplay(events).map((e) => e.id)).toEqual([2, 1])
  })

  test('does not mutate the input array', () => {
    const events = [
      event({ id: 1, date: '2024-01-01T00:00:00.000Z' }),
      event({ id: 2, date: '2026-09-01T00:00:00.000Z' }),
    ]
    const original = [...events]

    sortEventsForDisplay(events)

    expect(events).toEqual(original)
  })

  test('handles an empty list', () => {
    expect(sortEventsForDisplay([])).toEqual([])
  })

  test('keeps a running multi-day event among the upcoming ones', () => {
    const events = [
      event({ id: 1, date: '2026-09-01T00:00:00.000Z' }), // upcoming
      event({
        id: 2, // started before now, still running
        date: '2026-08-11T00:00:00.000Z',
        endDate: '2026-08-15T00:00:00.000Z',
      }),
      event({ id: 3, date: '2026-01-01T00:00:00.000Z' }), // past
    ]

    expect(sortEventsForDisplay(events).map((e) => e.id)).toEqual([1, 2, 3])
  })

  test('sorts a recurring event on its next occurrence, not its first', () => {
    const events = [
      event({ id: 1, date: '2026-09-01T00:00:00.000Z' }),
      event({
        id: 2, // first occurrence years ago, next one after id 1
        date: '2020-01-06T00:00:00.000Z',
        recurrenceFrequency: 'WEEKLY',
        recurrenceInterval: 1,
        nextOccurrence: {
          start: '2026-10-01T00:00:00.000Z',
          end: '2026-10-01T00:00:00.000Z',
        },
      }),
    ]

    expect(sortEventsForDisplay(events).map((e) => e.id)).toEqual([2, 1])
  })
})

describe('isEventOver', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-13T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('trusts nextOccurrence when the API provides it', () => {
    const recurring = event({
      id: 1,
      date: '2020-01-06T07:00:00.000Z',
      recurrenceFrequency: 'WEEKLY',
      recurrenceInterval: 1,
      nextOccurrence: { start: '2026-08-17T07:00:00.000Z', end: '2026-08-17T07:00:00.000Z' },
    })

    expect(isEventOver(recurring)).toBe(false)
  })

  test('treats a null nextOccurrence as over even for a future start date', () => {
    const finished = event({ id: 1, date: '2099-01-01T00:00:00.000Z', nextOccurrence: null })

    expect(isEventOver(finished)).toBe(true)
  })

  test('falls back to endDate when the API omits nextOccurrence', () => {
    const running = event({
      id: 1,
      date: '2026-08-11T00:00:00.000Z',
      endDate: '2026-08-15T00:00:00.000Z',
    })

    expect(isEventOver(running)).toBe(false)
  })

  test('falls back to the start date for a single-day event', () => {
    expect(isEventOver(event({ id: 1, date: '2026-08-12T00:00:00.000Z' }))).toBe(true)
  })
})

describe('displayOccurrence', () => {
  test('prefers the next occurrence over the stored first one', () => {
    const recurring = event({
      id: 1,
      date: '2020-01-06T07:00:00.000Z',
      nextOccurrence: { start: '2026-08-17T07:00:00.000Z', end: '2026-08-17T09:00:00.000Z' },
    })

    expect(displayOccurrence(recurring).start).toBe('2026-08-17T07:00:00.000Z')
  })

  test('falls back to the stored dates', () => {
    const multiDay = event({
      id: 1,
      date: '2026-08-11T00:00:00.000Z',
      endDate: '2026-08-15T00:00:00.000Z',
    })

    expect(displayOccurrence(multiDay)).toEqual({
      start: '2026-08-11T00:00:00.000Z',
      end: '2026-08-15T00:00:00.000Z',
    })
  })
})

describe('formatEventSchedule', () => {
  test('keeps the single-day format for a one-off event', () => {
    const single = event({ id: 1, date: '2026-08-13T08:30:00.000Z' })

    expect(formatEventSchedule(single)).toEqual(formatEventDate('2026-08-13T08:30:00.000Z'))
  })

  test('renders a multi-day event as a date range', () => {
    const multiDay = event({
      id: 1,
      date: '2026-08-13T08:30:00.000Z',
      endDate: '2026-08-16T08:30:00.000Z',
    })

    expect(formatEventSchedule(multiDay).date).toBe('13 Aug 2026 – 16 Aug 2026')
  })

  test('keeps the single-day format when the end is the same Melbourne day', () => {
    const sameDay = event({
      id: 1,
      date: '2026-08-13T08:30:00.000Z',
      endDate: '2026-08-13T11:30:00.000Z',
    })

    expect(formatEventSchedule(sameDay).date).toBe(
      formatEventDate('2026-08-13T08:30:00.000Z').date,
    )
  })

  test('formats the next occurrence of a recurring event, not its first', () => {
    const recurring = event({
      id: 1,
      date: '2020-01-06T07:00:00.000Z',
      recurrenceFrequency: 'WEEKLY',
      recurrenceInterval: 1,
      nextOccurrence: { start: '2026-08-17T07:00:00.000Z', end: '2026-08-17T07:00:00.000Z' },
    })

    expect(formatEventSchedule(recurring).date).toBe(
      formatEventDate('2026-08-17T07:00:00.000Z').date,
    )
  })
})

describe('formatRecurrence', () => {
  test('returns null for a one-off event', () => {
    expect(formatRecurrence(event({ id: 1, date: '2026-08-13T08:30:00.000Z' }))).toBeNull()
  })

  test('uses the singular noun for an interval of one', () => {
    const weekly = event({
      id: 1,
      date: '2026-08-13T08:30:00.000Z',
      recurrenceFrequency: 'WEEKLY',
      recurrenceInterval: 1,
    })

    expect(formatRecurrence(weekly)).toBe('Every week')
  })

  test('uses the plural noun for a longer interval', () => {
    const fortnightly = event({
      id: 1,
      date: '2026-08-13T08:30:00.000Z',
      recurrenceFrequency: 'WEEKLY',
      recurrenceInterval: 2,
    })

    expect(formatRecurrence(fortnightly)).toBe('Every 2 weeks')
  })

  test('mentions the end of the series when there is one', () => {
    const bounded = event({
      id: 1,
      date: '2026-08-13T08:30:00.000Z',
      recurrenceFrequency: 'MONTHLY',
      recurrenceInterval: 1,
      recurrenceEndDate: '2026-11-13T08:30:00.000Z',
    })

    expect(formatRecurrence(bounded)).toBe('Every month until 13 Nov 2026')
  })
})

describe('describeSchedule', () => {
  test('returns null for a plain single-day event', () => {
    expect(describeSchedule(event({ id: 1, date: '2026-08-13T08:30:00.000Z' }))).toBeNull()
  })

  test('describes the run of a multi-day event', () => {
    const multiDay = event({
      id: 1,
      date: '2026-08-13T08:30:00.000Z',
      endDate: '2026-08-16T08:30:00.000Z',
    })

    expect(describeSchedule(multiDay)).toBe(
      'Runs Thursday 13 August 2026 to Sunday 16 August 2026',
    )
  })

  test('combines the run with the recurrence rule', () => {
    const multiDayRecurring = event({
      id: 1,
      date: '2026-08-13T08:30:00.000Z',
      endDate: '2026-08-16T08:30:00.000Z',
      recurrenceFrequency: 'MONTHLY',
      recurrenceInterval: 1,
    })

    expect(describeSchedule(multiDayRecurring)).toBe(
      'Runs Thursday 13 August 2026 to Sunday 16 August 2026 · every month',
    )
  })
})
