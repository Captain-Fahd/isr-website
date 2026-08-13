import { describe, expect, test } from 'vitest'
import { formatAnnouncementDate } from '@/lib/announcements'

describe('formatAnnouncementDate', () => {
  test('formats a winter instant in Melbourne time', () => {
    expect(formatAnnouncementDate('2026-08-13T08:30:00.000Z')).toBe('13 August 2026')
  })

  test('formats a summer instant using the AEDT offset', () => {
    expect(formatAnnouncementDate('2026-01-15T07:30:00.000Z')).toBe('15 January 2026')
  })

  test('uses the Melbourne day rather than the UTC day', () => {
    // 22:00 UTC on 12 Aug has already become 13 Aug in Melbourne.
    expect(formatAnnouncementDate('2026-08-12T22:00:00.000Z')).toBe('13 August 2026')
  })

  test('uses the Melbourne year at a new year boundary', () => {
    // 14:00 UTC on 31 Dec 2026 is 01:00 on 1 Jan 2027 in Melbourne (AEDT).
    expect(formatAnnouncementDate('2026-12-31T14:00:00.000Z')).toBe('1 January 2027')
  })
})
