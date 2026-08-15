import { describe, expect, test } from '@jest/globals';
import {
  addRecurrenceStep,
  isUpcoming,
  nextOccurrence,
  parseSchedule,
  type EventSchedule,
} from '../lib/recurrence';

function schedule(overrides: Partial<EventSchedule> = {}): EventSchedule {
  return {
    date: new Date('2026-08-03T18:00:00.000Z'),
    endDate: null,
    recurrenceFrequency: null,
    recurrenceInterval: null,
    recurrenceEndDate: null,
    ...overrides,
  };
}

describe('addRecurrenceStep', () => {
  test('adds days and weeks', () => {
    const from = new Date('2026-08-03T18:00:00.000Z');
    expect(addRecurrenceStep(from, 'DAILY', 3)).toEqual(new Date('2026-08-06T18:00:00.000Z'));
    expect(addRecurrenceStep(from, 'WEEKLY', 2)).toEqual(new Date('2026-08-17T18:00:00.000Z'));
  });

  test('keeps the time of day across a month step', () => {
    expect(addRecurrenceStep(new Date('2026-01-15T18:00:00.000Z'), 'MONTHLY', 1)).toEqual(
      new Date('2026-02-15T18:00:00.000Z'),
    );
  });

  test('clamps a month step to the last day of a shorter month', () => {
    expect(addRecurrenceStep(new Date('2026-01-31T18:00:00.000Z'), 'MONTHLY', 1)).toEqual(
      new Date('2026-02-28T18:00:00.000Z'),
    );
  });
});

describe('nextOccurrence', () => {
  test('returns the single occurrence of a one-off event that has not happened', () => {
    const s = schedule();
    expect(nextOccurrence(s, new Date('2026-07-01'))?.start).toEqual(s.date);
  });

  test('returns null once a one-off event has finished', () => {
    expect(nextOccurrence(schedule(), new Date('2026-09-01'))).toBeNull();
  });

  test('keeps a multi-day event current until its end date', () => {
    const s = schedule({
      date: new Date('2026-08-03T09:00:00.000Z'),
      endDate: new Date('2026-08-07T17:00:00.000Z'),
    });
    expect(isUpcoming(s, new Date('2026-08-05T12:00:00.000Z'))).toBe(true);
    expect(isUpcoming(s, new Date('2026-08-08T12:00:00.000Z'))).toBe(false);
  });

  test('rolls a weekly event forward to the next due occurrence', () => {
    const s = schedule({ recurrenceFrequency: 'WEEKLY', recurrenceInterval: 1 });
    const next = nextOccurrence(s, new Date('2026-08-20T00:00:00.000Z'));
    expect(next?.start).toEqual(new Date('2026-08-24T18:00:00.000Z'));
  });

  test('honours the interval when stepping forward', () => {
    const s = schedule({ recurrenceFrequency: 'WEEKLY', recurrenceInterval: 2 });
    const next = nextOccurrence(s, new Date('2026-08-20T00:00:00.000Z'));
    expect(next?.start).toEqual(new Date('2026-08-31T18:00:00.000Z'));
  });

  test('preserves occurrence duration for a recurring multi-day event', () => {
    const s = schedule({
      date: new Date('2026-08-03T09:00:00.000Z'),
      endDate: new Date('2026-08-05T17:00:00.000Z'),
      recurrenceFrequency: 'MONTHLY',
      recurrenceInterval: 1,
    });
    const next = nextOccurrence(s, new Date('2026-09-20T00:00:00.000Z'));
    expect(next?.start).toEqual(new Date('2026-10-03T09:00:00.000Z'));
    expect(next?.end).toEqual(new Date('2026-10-05T17:00:00.000Z'));
  });

  test('stops once the recurrence end date has passed', () => {
    const s = schedule({
      recurrenceFrequency: 'WEEKLY',
      recurrenceInterval: 1,
      recurrenceEndDate: new Date('2026-08-31T18:00:00.000Z'),
    });
    expect(nextOccurrence(s, new Date('2026-09-01T00:00:00.000Z'))).toBeNull();
    expect(nextOccurrence(s, new Date('2026-08-30T00:00:00.000Z'))?.start).toEqual(
      new Date('2026-08-31T18:00:00.000Z'),
    );
  });

  test('an open-ended recurring event is always upcoming', () => {
    const s = schedule({ recurrenceFrequency: 'DAILY', recurrenceInterval: 1 });
    expect(isUpcoming(s, new Date('2126-01-01'))).toBe(true);
  });
});

describe('parseSchedule', () => {
  test('normalises a lowercase frequency and defaults the interval', () => {
    const result = parseSchedule({
      date: '2026-08-03T18:00:00Z',
      recurrenceFrequency: 'weekly',
    });
    expect(result).toEqual({
      ok: true,
      values: expect.objectContaining({
        recurrenceFrequency: 'WEEKLY',
        recurrenceInterval: 1,
      }),
    });
  });

  test('rejects a recurrence end date before the first occurrence', () => {
    const result = parseSchedule({
      date: '2026-08-03T18:00:00Z',
      recurrenceFrequency: 'WEEKLY',
      recurrenceEndDate: '2026-07-01T18:00:00Z',
    });
    expect(result).toEqual({
      ok: false,
      error: 'recurrenceEndDate must be on or after date',
    });
  });

  test('only reports fields that were supplied', () => {
    const result = parseSchedule({ date: '2026-08-03T18:00:00Z' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(Object.keys(result.values)).toEqual(['date']);
  });
});
