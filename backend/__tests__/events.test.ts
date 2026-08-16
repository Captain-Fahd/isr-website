import { test, expect, jest, afterEach } from '@jest/globals';
import { Request, Response } from 'express';

const mockFindMany = jest.fn<(args?: any) => Promise<any>>();
const mockFindUnique = jest.fn<(args: any) => Promise<any>>();
const mockCreate = jest.fn<(args: any) => Promise<any>>();
const mockUpdate = jest.fn<(args: any) => Promise<any>>();
const mockDelete = jest.fn<(args: any) => Promise<any>>();

jest.mock('../lib/prisma', () => ({
  prisma: {
    event: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

const mockUploadEventImage = jest.fn<(file: any) => Promise<string>>();
const mockDeleteEventImage = jest.fn<(url: string) => Promise<void>>();

jest.mock('../lib/storage', () => ({
  uploadEventImage: mockUploadEventImage,
  deleteEventImage: mockDeleteEventImage,
}));

import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventsController';

afterEach(() => {
  jest.clearAllMocks();
});

function mockRes() {
  const json = jest.fn();
  const status = jest.fn((_code: number) => ({ json }));
  const res = { json, status } as unknown as Response;
  return { res, json, status };
}

// Prisma rows as the controller sees them: every scheduling column present.
function eventRow(overrides: Record<string, unknown>) {
  return {
    id: 1,
    name: 'Event',
    description: 'x',
    imageUrl: 'https://cdn/img.jpg',
    ticketUrl: null,
    date: new Date('2099-01-01'),
    endDate: null,
    recurrenceFrequency: null,
    recurrenceInterval: null,
    recurrenceEndDate: null,
    ...overrides,
  };
}

function respondedNames(json: jest.Mock) {
  const payload = json.mock.calls[0][0] as { data: { name: string }[] };
  return payload.data.map((e) => e.name);
}

test('getEvents returns upcoming-then-past ordering when unfiltered', async () => {
  const upcoming = eventRow({ id: 1, name: 'Future' });
  const pastNewer = eventRow({ id: 2, name: 'Past newer', date: new Date('2020-06-01') });
  const pastOlder = eventRow({ id: 3, name: 'Past older', date: new Date('2019-01-01') });
  mockFindMany.mockResolvedValue([pastOlder, pastNewer, upcoming]);

  const req = { query: {} } as unknown as Request;
  const { res, json, status } = mockRes();

  await getEvents(req, res);

  expect(status).toHaveBeenCalledWith(200);
  expect(respondedNames(json)).toEqual(['Future', 'Past newer', 'Past older']);
});

test('getEvents surfaces each event like count', async () => {
  mockFindMany.mockResolvedValue([eventRow({ name: 'Eid Dinner', _count: { likes: 4 } })]);

  const req = { query: {} } as unknown as Request;
  const { res, json, status } = mockRes();

  await getEvents(req, res);

  expect(status).toHaveBeenCalledWith(200);
  const payload = json.mock.calls[0][0] as { data: { likeCount: number }[] };
  expect(payload.data[0].likeCount).toBe(4);
});

test('getEvents reports likedByMe when the caller supplies a clientId', async () => {
  mockFindMany.mockResolvedValue([
    eventRow({ name: 'Eid Dinner', _count: { likes: 4 }, likes: [{ id: 7 }] }),
  ]);

  const req = { query: { clientId: 'abc-123' } } as unknown as Request;
  const { res, json } = mockRes();

  await getEvents(req, res);

  expect(mockFindMany).toHaveBeenCalledWith(
    expect.objectContaining({
      include: expect.objectContaining({
        likes: { where: { clientId: 'abc-123' }, select: { id: true } },
      }),
    }),
  );
  const payload = json.mock.calls[0][0] as {
    data: { likeCount: number; likedByMe: boolean }[];
  };
  expect(payload.data[0]).toMatchObject({ likeCount: 4, likedByMe: true });
});

test('getEvents filters upcoming events', async () => {
  mockFindMany.mockResolvedValue([
    eventRow({ id: 1, name: 'Eid Dinner' }),
    eventRow({ id: 2, name: 'Old', date: new Date('2020-01-01') }),
  ]);

  const req = { query: { filter: 'upcoming' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await getEvents(req, res);

  expect(status).toHaveBeenCalledWith(200);
  expect(respondedNames(json)).toEqual(['Eid Dinner']);
});

test('getEvents filters past events descending', async () => {
  mockFindMany.mockResolvedValue([
    eventRow({ id: 1, name: 'Older', date: new Date('2019-01-01') }),
    eventRow({ id: 2, name: 'Newer', date: new Date('2020-01-01') }),
    eventRow({ id: 3, name: 'Future' }),
  ]);

  const req = { query: { filter: 'past' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await getEvents(req, res);

  expect(status).toHaveBeenCalledWith(200);
  expect(respondedNames(json)).toEqual(['Newer', 'Older']);
});

test('getEvents keeps a multi-day event that is still running in the upcoming list', async () => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  mockFindMany.mockResolvedValue([
    eventRow({ id: 1, name: 'Islam Awareness Week', date: yesterday, endDate: tomorrow }),
  ]);

  const req = { query: { filter: 'upcoming' } } as unknown as Request;
  const { res, json } = mockRes();

  await getEvents(req, res);

  const payload = json.mock.calls[0][0] as { data: any[] };
  expect(payload.data).toHaveLength(1);
  expect(payload.data[0]).toMatchObject({ isMultiDay: true, isRecurring: false });
  expect(payload.data[0].nextOccurrence.start).toEqual(yesterday);
});

test('getEvents treats a recurring event with a due occurrence as upcoming', async () => {
  mockFindMany.mockResolvedValue([
    eventRow({
      id: 1,
      name: 'Weekly Halaqa',
      date: new Date('2020-01-06T07:00:00.000Z'), // a Monday, long past
      recurrenceFrequency: 'WEEKLY',
      recurrenceInterval: 1,
    }),
  ]);

  const req = { query: { filter: 'upcoming' } } as unknown as Request;
  const { res, json } = mockRes();

  await getEvents(req, res);

  const payload = json.mock.calls[0][0] as { data: any[] };
  expect(payload.data).toHaveLength(1);
  expect(payload.data[0].isRecurring).toBe(true);
  expect(payload.data[0].nextOccurrence.start.getTime()).toBeGreaterThanOrEqual(
    Date.now(),
  );
  // Occurrences stay on the original weekday.
  expect(payload.data[0].nextOccurrence.start.getUTCDay()).toBe(1);
});

test('getEvents moves a recurring event to past once its recurrence end has passed', async () => {
  mockFindMany.mockResolvedValue([
    eventRow({
      id: 1,
      name: 'Ramadan Iftar',
      date: new Date('2020-04-24T09:00:00.000Z'),
      recurrenceFrequency: 'DAILY',
      recurrenceInterval: 1,
      recurrenceEndDate: new Date('2020-05-23T09:00:00.000Z'),
    }),
  ]);

  const req = { query: { filter: 'past' } } as unknown as Request;
  const { res, json } = mockRes();

  await getEvents(req, res);

  const payload = json.mock.calls[0][0] as { data: any[] };
  expect(payload.data).toHaveLength(1);
  expect(payload.data[0].nextOccurrence).toBeNull();
});

test('getEvents returns 500 on db error', async () => {
  mockFindMany.mockRejectedValue(new Error('db down'));

  const req = { query: {} } as unknown as Request;
  const { res, json, status } = mockRes();

  await getEvents(req, res);

  expect(status).toHaveBeenCalledWith(500);
  expect(json).toHaveBeenCalledWith({ error: 'Failed to fetch events' });
});

test('getEventById returns the event with its derived schedule', async () => {
  const event = eventRow({ id: 1, name: 'Eid Dinner' });
  mockFindUnique.mockResolvedValue(event);

  const req = { params: { id: '1' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await getEventById(req, res);

  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({
    data: expect.objectContaining({
      id: 1,
      name: 'Eid Dinner',
      isMultiDay: false,
      isRecurring: false,
    }),
  });
});

test('getEventById returns 404 when the event does not exist', async () => {
  mockFindUnique.mockResolvedValue(null);

  const req = { params: { id: '99' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await getEventById(req, res);

  expect(status).toHaveBeenCalledWith(404);
  expect(json).toHaveBeenCalledWith({ error: 'Event not found' });
});

test('getEventById returns 400 for non-integer id', async () => {
  const req = { params: { id: 'abc' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await getEventById(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({ error: 'Invalid event id' });
  expect(mockFindUnique).not.toHaveBeenCalled();
});

test('createEvent returns 400 when a required field is missing', async () => {
  const req = {
    body: { name: 'Eid Dinner', description: 'x' },
    file: { buffer: Buffer.from('x') },
  } as unknown as Request;
  const { res, status } = mockRes();

  await createEvent(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(mockCreate).not.toHaveBeenCalled();
});

test('createEvent returns 400 when the image file is missing', async () => {
  const req = {
    body: {
      name: 'Eid Dinner',
      date: '2026-08-01T18:00:00Z',
      description: 'x',
      ticketUrl: 'https://t',
    },
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await createEvent(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({ error: 'An image file is required' });
  expect(mockCreate).not.toHaveBeenCalled();
});

test('createEvent returns 400 for invalid date', async () => {
  const req = {
    body: {
      name: 'Eid Dinner',
      date: 'not-a-date',
      description: 'x',
    },
    file: { buffer: Buffer.from('x') },
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await createEvent(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({ error: 'date must be a valid date' });
  expect(mockCreate).not.toHaveBeenCalled();
});

test('createEvent uploads the image and creates the event', async () => {
  mockUploadEventImage.mockResolvedValue('https://cdn/img.jpg');
  const created = eventRow({ id: 1, name: 'Eid Dinner', ticketUrl: 'https://t' });
  mockCreate.mockResolvedValue(created);

  const file = { buffer: Buffer.from('x'), mimetype: 'image/jpeg', originalname: 'p.jpg' };
  const req = {
    body: {
      name: 'Eid Dinner',
      date: '2026-08-01T18:00:00Z',
      description: 'x',
      ticketUrl: 'https://t',
    },
    file,
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await createEvent(req, res);

  expect(mockUploadEventImage).toHaveBeenCalledWith(file);
  expect(mockCreate).toHaveBeenCalledWith({
    data: expect.objectContaining({ ticketUrl: 'https://t' }),
  });
  expect(status).toHaveBeenCalledWith(201);
  expect(json).toHaveBeenCalledWith({ data: expect.objectContaining(created) });
});

test('createEvent succeeds without ticketUrl and stores null', async () => {
  mockUploadEventImage.mockResolvedValue('https://cdn/img.jpg');
  const created = eventRow({ id: 1, name: 'Eid Dinner' });
  mockCreate.mockResolvedValue(created);

  const file = { buffer: Buffer.from('x'), mimetype: 'image/jpeg', originalname: 'p.jpg' };
  const req = {
    body: {
      name: 'Eid Dinner',
      date: '2026-08-01T18:00:00Z',
      description: 'x',
    },
    file,
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await createEvent(req, res);

  expect(mockCreate).toHaveBeenCalledWith({
    data: expect.objectContaining({ ticketUrl: null }),
  });
  expect(status).toHaveBeenCalledWith(201);
  expect(json).toHaveBeenCalledWith({ data: expect.objectContaining(created) });
});

test('createEvent normalizes blank ticketUrl to null', async () => {
  mockUploadEventImage.mockResolvedValue('https://cdn/img.jpg');
  const created = {
    id: 1,
    name: 'Eid Dinner',
    imageUrl: 'https://cdn/img.jpg',
    ticketUrl: null,
  };
  mockCreate.mockResolvedValue(created);

  const file = { buffer: Buffer.from('x'), mimetype: 'image/jpeg', originalname: 'p.jpg' };
  const req = {
    body: {
      name: 'Eid Dinner',
      date: '2026-08-01T18:00:00Z',
      description: 'x',
      ticketUrl: '   ',
    },
    file,
  } as unknown as Request;
  const { res, status } = mockRes();

  await createEvent(req, res);

  expect(mockCreate).toHaveBeenCalledWith({
    data: expect.objectContaining({ ticketUrl: null }),
  });
  expect(status).toHaveBeenCalledWith(201);
});

test('createEvent returns 500 on failure', async () => {
  mockUploadEventImage.mockRejectedValue(new Error('upload failed'));

  const file = { buffer: Buffer.from('x'), mimetype: 'image/jpeg', originalname: 'p.jpg' };
  const req = {
    body: {
      name: 'Eid Dinner',
      date: '2026-08-01T18:00:00Z',
      description: 'x',
    },
    file,
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await createEvent(req, res);

  expect(status).toHaveBeenCalledWith(500);
  expect(json).toHaveBeenCalledWith({ error: 'Failed to create event' });
});

test('createEvent stores a multi-day event', async () => {
  mockUploadEventImage.mockResolvedValue('https://cdn/img.jpg');
  mockCreate.mockResolvedValue(eventRow({}));

  const req = {
    body: {
      name: 'Islam Awareness Week',
      date: '2026-08-01T09:00:00Z',
      endDate: '2026-08-05T17:00:00Z',
      description: 'x',
    },
    file: { buffer: Buffer.from('x') },
  } as unknown as Request;
  const { res, status } = mockRes();

  await createEvent(req, res);

  expect(mockCreate).toHaveBeenCalledWith({
    data: expect.objectContaining({
      date: new Date('2026-08-01T09:00:00Z'),
      endDate: new Date('2026-08-05T17:00:00Z'),
      recurrenceFrequency: null,
    }),
  });
  expect(status).toHaveBeenCalledWith(201);
});

test('createEvent stores a recurring event and defaults the interval to 1', async () => {
  mockUploadEventImage.mockResolvedValue('https://cdn/img.jpg');
  mockCreate.mockResolvedValue(eventRow({}));

  const req = {
    body: {
      name: 'Weekly Halaqa',
      date: '2026-08-03T18:00:00Z',
      description: 'x',
      recurrenceFrequency: 'weekly',
      recurrenceEndDate: '2026-11-30T18:00:00Z',
    },
    file: { buffer: Buffer.from('x') },
  } as unknown as Request;
  const { res, status } = mockRes();

  await createEvent(req, res);

  expect(mockCreate).toHaveBeenCalledWith({
    data: expect.objectContaining({
      recurrenceFrequency: 'WEEKLY',
      recurrenceInterval: 1,
      recurrenceEndDate: new Date('2026-11-30T18:00:00Z'),
    }),
  });
  expect(status).toHaveBeenCalledWith(201);
});

test('createEvent returns 400 for an unknown recurrence frequency', async () => {
  const req = {
    body: {
      name: 'Weekly Halaqa',
      date: '2026-08-03T18:00:00Z',
      description: 'x',
      recurrenceFrequency: 'HOURLY',
    },
    file: { buffer: Buffer.from('x') },
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await createEvent(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({
    error: 'recurrenceFrequency must be one of DAILY, WEEKLY, MONTHLY',
  });
  expect(mockCreate).not.toHaveBeenCalled();
});

test('createEvent returns 400 when endDate is not after date', async () => {
  const req = {
    body: {
      name: 'Camp',
      date: '2026-08-05T09:00:00Z',
      endDate: '2026-08-01T09:00:00Z',
      description: 'x',
    },
    file: { buffer: Buffer.from('x') },
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await createEvent(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({ error: 'endDate must be after date' });
  expect(mockCreate).not.toHaveBeenCalled();
});

test('createEvent returns 400 when an occurrence overlaps the next one', async () => {
  const req = {
    body: {
      name: 'Overlapping camp',
      date: '2026-08-01T09:00:00Z',
      endDate: '2026-08-10T09:00:00Z',
      description: 'x',
      recurrenceFrequency: 'WEEKLY',
    },
    file: { buffer: Buffer.from('x') },
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await createEvent(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({
    error: 'endDate must fall before the next occurrence starts',
  });
  expect(mockCreate).not.toHaveBeenCalled();
});

test('createEvent returns 400 for recurrence fields without a frequency', async () => {
  const req = {
    body: {
      name: 'Halaqa',
      date: '2026-08-03T18:00:00Z',
      description: 'x',
      recurrenceInterval: '2',
    },
    file: { buffer: Buffer.from('x') },
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await createEvent(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({
    error: 'recurrenceInterval and recurrenceEndDate require recurrenceFrequency',
  });
  expect(mockCreate).not.toHaveBeenCalled();
});

test('createEvent returns 400 for an out-of-range recurrence interval', async () => {
  const req = {
    body: {
      name: 'Halaqa',
      date: '2026-08-03T18:00:00Z',
      description: 'x',
      recurrenceFrequency: 'WEEKLY',
      recurrenceInterval: '0',
    },
    file: { buffer: Buffer.from('x') },
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await createEvent(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({
    error: 'recurrenceInterval must be an integer between 1 and 365',
  });
  expect(mockCreate).not.toHaveBeenCalled();
});

test('updateEvent returns 400 for non-integer id', async () => {
  const req = { params: { id: 'abc' }, body: { name: 'x' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await updateEvent(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({ error: 'Invalid event id' });
  expect(mockFindUnique).not.toHaveBeenCalled();
});

test('updateEvent returns 400 for invalid date', async () => {
  const req = {
    params: { id: '1' },
    body: { date: 'not-a-date' },
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await updateEvent(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({ error: 'date must be a valid date' });
  expect(mockFindUnique).not.toHaveBeenCalled();
});

test('updateEvent returns 404 when the event does not exist', async () => {
  mockFindUnique.mockResolvedValue(null);

  const req = { params: { id: '99' }, body: { name: 'x' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await updateEvent(req, res);

  expect(status).toHaveBeenCalledWith(404);
  expect(json).toHaveBeenCalledWith({ error: 'Event not found' });
  expect(mockUpdate).not.toHaveBeenCalled();
});

test('updateEvent updates fields without replacing image', async () => {
  const existing = eventRow({ name: 'Old', description: 'Old desc', imageUrl: 'https://cdn/old.jpg' });
  const updated = { ...existing, name: 'New' };
  mockFindUnique.mockResolvedValue(existing);
  mockUpdate.mockResolvedValue(updated);

  const req = {
    params: { id: '1' },
    body: { name: 'New' },
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await updateEvent(req, res);

  expect(mockUploadEventImage).not.toHaveBeenCalled();
  expect(mockDeleteEventImage).not.toHaveBeenCalled();
  expect(mockUpdate).toHaveBeenCalledWith({
    where: { id: 1 },
    data: expect.objectContaining({ name: 'New', imageUrl: 'https://cdn/old.jpg' }),
    include: { _count: { select: { likes: true } } },
  });
  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ data: expect.objectContaining(updated) });
});

test('updateEvent replaces image and deletes the old one', async () => {
  const existing = eventRow({ name: 'Eid', imageUrl: 'https://cdn/old.jpg' });
  const updated = { ...existing, imageUrl: 'https://cdn/new.jpg' };
  mockFindUnique.mockResolvedValue(existing);
  mockUploadEventImage.mockResolvedValue('https://cdn/new.jpg');
  mockUpdate.mockResolvedValue(updated);

  const file = { buffer: Buffer.from('x'), mimetype: 'image/jpeg', originalname: 'new.jpg' };
  const req = {
    params: { id: '1' },
    body: {},
    file,
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await updateEvent(req, res);

  expect(mockUploadEventImage).toHaveBeenCalledWith(file);
  expect(mockDeleteEventImage).toHaveBeenCalledWith('https://cdn/old.jpg');
  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ data: expect.objectContaining(updated) });
});

test('updateEvent validates endDate against the stored date', async () => {
  mockFindUnique.mockResolvedValue(eventRow({ date: new Date('2026-08-05T09:00:00Z') }));

  const req = {
    params: { id: '1' },
    body: { endDate: '2026-08-01T09:00:00Z' },
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await updateEvent(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({ error: 'endDate must be after date' });
  expect(mockUpdate).not.toHaveBeenCalled();
});

test('updateEvent clearing the frequency clears the rest of the recurrence rule', async () => {
  const existing = eventRow({
    recurrenceFrequency: 'WEEKLY',
    recurrenceInterval: 2,
    recurrenceEndDate: new Date('2099-06-01'),
  });
  mockFindUnique.mockResolvedValue(existing);
  mockUpdate.mockResolvedValue(eventRow({}));

  const req = {
    params: { id: '1' },
    body: { recurrenceFrequency: '' },
  } as unknown as Request;
  const { res, status } = mockRes();

  await updateEvent(req, res);

  expect(mockUpdate).toHaveBeenCalledWith({
    where: { id: 1 },
    data: expect.objectContaining({
      recurrenceFrequency: null,
      recurrenceInterval: null,
      recurrenceEndDate: null,
    }),
    include: { _count: { select: { likes: true } } },
  });
  expect(status).toHaveBeenCalledWith(200);
});

test('updateEvent clears endDate when sent blank, turning a multi-day event single-day', async () => {
  mockFindUnique.mockResolvedValue(eventRow({ endDate: new Date('2099-01-03') }));
  mockUpdate.mockResolvedValue(eventRow({}));

  const req = {
    params: { id: '1' },
    body: { endDate: '' },
  } as unknown as Request;
  const { res, status } = mockRes();

  await updateEvent(req, res);

  expect(mockUpdate).toHaveBeenCalledWith({
    where: { id: 1 },
    data: expect.objectContaining({ endDate: null }),
    include: { _count: { select: { likes: true } } },
  });
  expect(status).toHaveBeenCalledWith(200);
});

test('updateEvent leaves scheduling fields untouched when none are sent', async () => {
  const existing = eventRow({ recurrenceFrequency: 'MONTHLY', recurrenceInterval: 1 });
  mockFindUnique.mockResolvedValue(existing);
  mockUpdate.mockResolvedValue(existing);

  const req = {
    params: { id: '1' },
    body: { name: 'Renamed' },
  } as unknown as Request;
  const { res, status } = mockRes();

  await updateEvent(req, res);

  const data = mockUpdate.mock.calls[0][0].data;
  expect(data).not.toHaveProperty('date');
  expect(data).not.toHaveProperty('recurrenceFrequency');
  expect(status).toHaveBeenCalledWith(200);
});

test('updateEvent returns 500 on failure', async () => {
  mockFindUnique.mockResolvedValue(eventRow({}));
  mockUpdate.mockRejectedValue(new Error('db'));

  const req = {
    params: { id: '1' },
    body: { name: 'New' },
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await updateEvent(req, res);

  expect(status).toHaveBeenCalledWith(500);
  expect(json).toHaveBeenCalledWith({ error: 'Failed to update event' });
});

test('deleteEvent returns 400 for non-integer id', async () => {
  const req = { params: { id: 'abc' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await deleteEvent(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({ error: 'Invalid event id' });
  expect(mockFindUnique).not.toHaveBeenCalled();
});

test('deleteEvent returns 404 when the event does not exist', async () => {
  mockFindUnique.mockResolvedValue(null);

  const req = { params: { id: '99' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await deleteEvent(req, res);

  expect(status).toHaveBeenCalledWith(404);
  expect(json).toHaveBeenCalledWith({ error: 'Event not found' });
  expect(mockDelete).not.toHaveBeenCalled();
});

test('deleteEvent removes the event and its image', async () => {
  mockFindUnique.mockResolvedValue({ id: 1, imageUrl: 'https://cdn/img.jpg' });
  mockDelete.mockResolvedValue({ id: 1 });

  const req = { params: { id: '1' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await deleteEvent(req, res);

  expect(mockDelete).toHaveBeenCalledWith({ where: { id: 1 } });
  expect(mockDeleteEventImage).toHaveBeenCalledWith('https://cdn/img.jpg');
  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ data: { id: 1 } });
});

test('deleteEvent returns 500 on failure', async () => {
  mockFindUnique.mockResolvedValue({ id: 1, imageUrl: 'https://cdn/img.jpg' });
  mockDelete.mockRejectedValue(new Error('db'));

  const req = { params: { id: '1' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await deleteEvent(req, res);

  expect(status).toHaveBeenCalledWith(500);
  expect(json).toHaveBeenCalledWith({ error: 'Failed to delete event' });
});
