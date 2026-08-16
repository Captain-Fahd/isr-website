import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  formatEventDate,
  fromDatetimeLocalValue,
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
})
