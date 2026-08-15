// Scheduling helpers for multi-day and recurring events.
//
// An event stores its *first* occurrence in `date` (+ optional `endDate` for a multi-day
// occurrence). A recurrence rule (`recurrenceFrequency` + `recurrenceInterval`, optionally
// bounded by `recurrenceEndDate`) repeats that occurrence, preserving its duration.
// Occurrences are never materialised in the database — they are derived on read.

export const RECURRENCE_FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY"] as const;
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number];

// Guards against an admin typo turning into an unbounded loop below.
export const MAX_RECURRENCE_INTERVAL = 365;

export type EventSchedule = {
  date: Date;
  endDate: Date | null;
  recurrenceFrequency: RecurrenceFrequency | null;
  recurrenceInterval: number | null;
  recurrenceEndDate: Date | null;
};

export type Occurrence = { start: Date; end: Date };

function isFrequency(value: unknown): value is RecurrenceFrequency {
  return RECURRENCE_FREQUENCIES.includes(value as RecurrenceFrequency);
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

// Adds `interval` units of `frequency` to `from`. Monthly steps clamp to the last day of
// the target month, so a 31 Jan event recurs on 28/29 Feb rather than rolling into March.
export function addRecurrenceStep(
  from: Date,
  frequency: RecurrenceFrequency,
  interval: number,
): Date {
  const next = new Date(from.getTime());

  if (frequency === "DAILY") {
    next.setUTCDate(next.getUTCDate() + interval);
    return next;
  }
  if (frequency === "WEEKLY") {
    next.setUTCDate(next.getUTCDate() + interval * 7);
    return next;
  }

  const day = next.getUTCDate();
  next.setUTCDate(1);
  next.setUTCMonth(next.getUTCMonth() + interval);
  next.setUTCDate(Math.min(day, daysInMonth(next.getUTCFullYear(), next.getUTCMonth())));
  return next;
}

// How long a single occurrence runs, in milliseconds (0 for a same-day event).
function durationMs(schedule: EventSchedule): number {
  if (!schedule.endDate) return 0;
  return Math.max(0, schedule.endDate.getTime() - schedule.date.getTime());
}

// The first occurrence that has not finished by `from`, or null if the series is over.
export function nextOccurrence(
  schedule: EventSchedule,
  from: Date = new Date(),
): Occurrence | null {
  const duration = durationMs(schedule);
  const occurrenceAt = (start: Date): Occurrence => ({
    start,
    end: new Date(start.getTime() + duration),
  });

  const first = occurrenceAt(schedule.date);
  if (!schedule.recurrenceFrequency) {
    return first.end >= from ? first : null;
  }

  const interval = schedule.recurrenceInterval ?? 1;
  let current = first;
  while (current.end < from) {
    const start = addRecurrenceStep(
      current.start,
      schedule.recurrenceFrequency,
      interval,
    );
    if (schedule.recurrenceEndDate && start > schedule.recurrenceEndDate) return null;
    current = occurrenceAt(start);
  }
  return current;
}

// True when the event still has an occurrence running now or scheduled in the future.
export function isUpcoming(schedule: EventSchedule, from: Date = new Date()): boolean {
  return nextOccurrence(schedule, from) !== null;
}

export type ScheduleInput = {
  date?: unknown;
  endDate?: unknown;
  recurrenceFrequency?: unknown;
  recurrenceInterval?: unknown;
  recurrenceEndDate?: unknown;
};

// Nullable fields accept "" / "null" so multipart clients can clear them, since
// form-data has no way to send a real null.
function isCleared(value: unknown): boolean {
  return value === null || (typeof value === "string" && value.trim() === "");
}

type ParsedSchedule = Partial<EventSchedule>;

export type ScheduleParseResult =
  | { ok: true; values: ParsedSchedule }
  | { ok: false; error: string };

// Validates and normalises the scheduling fields of a create/update payload. Only the
// fields present on `input` appear in `values`, so it works for partial updates; pass the
// stored event as `existing` so cross-field rules see the merged result.
export function parseSchedule(
  input: ScheduleInput,
  existing?: EventSchedule,
): ScheduleParseResult {
  const values: ParsedSchedule = {};

  if (input.date !== undefined) {
    if (typeof input.date !== "string" || isNaN(Date.parse(input.date))) {
      return { ok: false, error: "date must be a valid date" };
    }
    values.date = new Date(input.date);
  }

  if (input.endDate !== undefined) {
    if (isCleared(input.endDate)) {
      values.endDate = null;
    } else if (typeof input.endDate !== "string" || isNaN(Date.parse(input.endDate))) {
      return { ok: false, error: "endDate must be a valid date" };
    } else {
      values.endDate = new Date(input.endDate);
    }
  }

  if (input.recurrenceFrequency !== undefined) {
    if (isCleared(input.recurrenceFrequency)) {
      values.recurrenceFrequency = null;
    } else {
      const frequency =
        typeof input.recurrenceFrequency === "string"
          ? input.recurrenceFrequency.trim().toUpperCase()
          : input.recurrenceFrequency;
      if (!isFrequency(frequency)) {
        return {
          ok: false,
          error: `recurrenceFrequency must be one of ${RECURRENCE_FREQUENCIES.join(", ")}`,
        };
      }
      values.recurrenceFrequency = frequency;
    }
  }

  if (input.recurrenceInterval !== undefined) {
    if (isCleared(input.recurrenceInterval)) {
      values.recurrenceInterval = null;
    } else {
      const interval = Number(input.recurrenceInterval);
      if (
        !Number.isInteger(interval) ||
        interval < 1 ||
        interval > MAX_RECURRENCE_INTERVAL
      ) {
        return {
          ok: false,
          error: `recurrenceInterval must be an integer between 1 and ${MAX_RECURRENCE_INTERVAL}`,
        };
      }
      values.recurrenceInterval = interval;
    }
  }

  if (input.recurrenceEndDate !== undefined) {
    if (isCleared(input.recurrenceEndDate)) {
      values.recurrenceEndDate = null;
    } else if (
      typeof input.recurrenceEndDate !== "string" ||
      isNaN(Date.parse(input.recurrenceEndDate))
    ) {
      return { ok: false, error: "recurrenceEndDate must be a valid date" };
    } else {
      values.recurrenceEndDate = new Date(input.recurrenceEndDate);
    }
  }

  const merged: EventSchedule = {
    date: values.date ?? existing?.date ?? new Date(NaN),
    endDate: values.endDate !== undefined ? values.endDate : (existing?.endDate ?? null),
    recurrenceFrequency:
      values.recurrenceFrequency !== undefined
        ? values.recurrenceFrequency
        : (existing?.recurrenceFrequency ?? null),
    recurrenceInterval:
      values.recurrenceInterval !== undefined
        ? values.recurrenceInterval
        : (existing?.recurrenceInterval ?? null),
    recurrenceEndDate:
      values.recurrenceEndDate !== undefined
        ? values.recurrenceEndDate
        : (existing?.recurrenceEndDate ?? null),
  };

  if (merged.endDate && merged.endDate <= merged.date) {
    return { ok: false, error: "endDate must be after date" };
  }
  if (!merged.recurrenceFrequency) {
    if (values.recurrenceInterval || values.recurrenceEndDate) {
      return {
        ok: false,
        error: "recurrenceInterval and recurrenceEndDate require recurrenceFrequency",
      };
    }
    // Clearing the frequency drops the rest of the rule with it.
    if (merged.recurrenceInterval !== null) values.recurrenceInterval = null;
    if (merged.recurrenceEndDate !== null) values.recurrenceEndDate = null;
  } else {
    // Default the interval so "every week" needs only a frequency.
    if (merged.recurrenceInterval === null) {
      merged.recurrenceInterval = 1;
      values.recurrenceInterval = 1;
    }
    if (merged.recurrenceEndDate && merged.recurrenceEndDate < merged.date) {
      return { ok: false, error: "recurrenceEndDate must be on or after date" };
    }
    if (merged.endDate) {
      const secondStart = addRecurrenceStep(
        merged.date,
        merged.recurrenceFrequency,
        merged.recurrenceInterval,
      );
      if (merged.endDate >= secondStart) {
        return {
          ok: false,
          error: "endDate must fall before the next occurrence starts",
        };
      }
    }
  }

  return { ok: true, values };
}

// Adds the derived scheduling view the frontend needs, without persisting it.
export function withSchedule<T extends EventSchedule>(event: T, from: Date = new Date()) {
  const next = nextOccurrence(event, from);
  return {
    ...event,
    isMultiDay: event.endDate !== null,
    isRecurring: event.recurrenceFrequency !== null,
    nextOccurrence: next && { start: next.start, end: next.end },
  };
}
