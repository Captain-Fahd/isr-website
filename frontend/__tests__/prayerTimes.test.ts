import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { DAILY_PRAYERS, getNextPrayer } from '@/lib/prayerTimes'

// Matches the e2e Aladhan fixture (backend/lib/mockPayloads.ts).
const TIMINGS: Record<string, string> = {
  Fajr: '06:02',
  Sunrise: '07:36',
  Dhuhr: '12:22',
  Asr: '14:51',
  Sunset: '17:09',
  Maghrib: '17:09',
  Isha: '18:38',
}

/** 13 Aug 2026 is AEST (UTC+10), so Melbourne wall time = UTC + 10h. */
function atMelbourneTime(hhmm: string): Date {
  const [hour, minute] = hhmm.split(':').map(Number)
  return new Date(Date.UTC(2026, 7, 13, hour - 10, minute))
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('getNextPrayer', () => {
  test.each([
    ['00:30', 'Fajr'],
    ['05:00', 'Fajr'],
    ['06:01', 'Fajr'],
    ['06:03', 'Dhuhr'],
    ['11:00', 'Dhuhr'],
    ['13:00', 'Asr'],
    ['15:00', 'Maghrib'],
    ['17:30', 'Isha'],
  ])('at %s Melbourne time the next prayer is %s', (now, expected) => {
    vi.setSystemTime(atMelbourneTime(now))
    expect(getNextPrayer(TIMINGS)).toBe(expected)
  })

  test('returns the following prayer when the current time equals a prayer time', () => {
    // The comparison is strictly greater-than, so once Fajr has arrived the
    // highlight moves on to Dhuhr.
    vi.setSystemTime(atMelbourneTime('06:02'))
    expect(getNextPrayer(TIMINGS)).toBe('Dhuhr')
  })

  test('rolls over to Fajr after Isha has passed', () => {
    vi.setSystemTime(atMelbourneTime('19:00'))
    expect(getNextPrayer(TIMINGS)).toBe('Fajr')
  })

  test('still returns Fajr just before midnight', () => {
    vi.setSystemTime(atMelbourneTime('23:59'))
    expect(getNextPrayer(TIMINGS)).toBe('Fajr')
  })

  test('uses Melbourne time rather than the machine timezone', () => {
    // 03:00 UTC on 13 Aug is 13:00 in Melbourne (next prayer Asr) but 23:00 on
    // 12 Aug in America/New_York, the TZ the suite runs under.
    vi.setSystemTime(new Date('2026-08-13T03:00:00.000Z'))
    expect(getNextPrayer(TIMINGS)).toBe('Asr')
  })

  test('applies the AEDT offset during daylight saving', () => {
    // 02:00 UTC on 15 Jan is 13:00 Melbourne (UTC+11) -> Asr.
    vi.setSystemTime(new Date('2026-01-15T02:00:00.000Z'))
    expect(getNextPrayer(TIMINGS)).toBe('Asr')
  })

  test('ignores non-daily entries such as Sunrise and Sunset', () => {
    // 07:00 is before Sunrise (07:36) but after Fajr; Sunrise is not a prayer,
    // so the answer must be Dhuhr.
    vi.setSystemTime(atMelbourneTime('07:00'))
    expect(getNextPrayer(TIMINGS)).toBe('Dhuhr')
  })
})

describe('DAILY_PRAYERS', () => {
  test('lists the five daily prayers in order', () => {
    expect(DAILY_PRAYERS).toEqual(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'])
  })
})
