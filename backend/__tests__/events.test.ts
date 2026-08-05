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

test('getEvents returns upcoming-then-past ordering when unfiltered', async () => {
  const upcoming = { id: 1, name: 'Future', date: new Date('2099-01-01') };
  const pastNewer = { id: 2, name: 'Past newer', date: new Date('2020-06-01') };
  const pastOlder = { id: 3, name: 'Past older', date: new Date('2019-01-01') };
  // DB returns asc by date; controller re-sorts past descending
  mockFindMany.mockResolvedValue([pastOlder, pastNewer, upcoming]);

  const req = { query: {} } as unknown as Request;
  const { res, json, status } = mockRes();

  await getEvents(req, res);

  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ data: [upcoming, pastNewer, pastOlder] });
});

test('getEvents filters upcoming events', async () => {
  const events = [{ id: 1, name: 'Eid Dinner', date: new Date('2099-01-01') }];
  mockFindMany.mockResolvedValue(events);

  const req = { query: { filter: 'upcoming' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await getEvents(req, res);

  expect(mockFindMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { date: { gte: expect.any(Date) } },
      orderBy: { date: 'asc' },
    }),
  );
  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ data: events });
});

test('getEvents filters past events descending', async () => {
  const events = [{ id: 1, name: 'Old', date: new Date('2020-01-01') }];
  mockFindMany.mockResolvedValue(events);

  const req = { query: { filter: 'past' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await getEvents(req, res);

  expect(mockFindMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { date: { lt: expect.any(Date) } },
      orderBy: { date: 'desc' },
    }),
  );
  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ data: events });
});

test('getEvents returns 500 on db error', async () => {
  mockFindMany.mockRejectedValue(new Error('db down'));

  const req = { query: {} } as unknown as Request;
  const { res, json, status } = mockRes();

  await getEvents(req, res);

  expect(status).toHaveBeenCalledWith(500);
  expect(json).toHaveBeenCalledWith({ error: 'Failed to fetch events' });
});

test('getEventById returns the event', async () => {
  const event = { id: 1, name: 'Eid Dinner' };
  mockFindUnique.mockResolvedValue(event);

  const req = { params: { id: '1' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await getEventById(req, res);

  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ data: event });
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
  const created = { id: 1, name: 'Eid Dinner', imageUrl: 'https://cdn/img.jpg' };
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
  expect(json).toHaveBeenCalledWith({ data: created });
});

test('createEvent succeeds without ticketUrl and stores null', async () => {
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
    },
    file,
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await createEvent(req, res);

  expect(mockCreate).toHaveBeenCalledWith({
    data: expect.objectContaining({ ticketUrl: null }),
  });
  expect(status).toHaveBeenCalledWith(201);
  expect(json).toHaveBeenCalledWith({ data: created });
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
  const existing = {
    id: 1,
    name: 'Old',
    description: 'Old desc',
    imageUrl: 'https://cdn/old.jpg',
    ticketUrl: null,
  };
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
  });
  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ data: updated });
});

test('updateEvent replaces image and deletes the old one', async () => {
  const existing = {
    id: 1,
    name: 'Eid',
    description: 'x',
    imageUrl: 'https://cdn/old.jpg',
  };
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
  expect(json).toHaveBeenCalledWith({ data: updated });
});

test('updateEvent returns 500 on failure', async () => {
  mockFindUnique.mockResolvedValue({ id: 1, imageUrl: 'https://cdn/old.jpg' });
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
