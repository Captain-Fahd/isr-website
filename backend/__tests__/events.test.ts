import { test, expect, jest, afterEach } from '@jest/globals';
import { Request, Response } from 'express';

const mockFindMany = jest.fn<(args?: any) => Promise<any>>();
const mockFindUnique = jest.fn<(args: any) => Promise<any>>();
const mockCreate = jest.fn<(args: any) => Promise<any>>();
const mockDelete = jest.fn<(args: any) => Promise<any>>();

jest.mock('../lib/prisma', () => ({
    prisma: {
        event: {
            findMany: mockFindMany,
            findUnique: mockFindUnique,
            create: mockCreate,
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

test('getEvents returns the list of events', async () => {
    const events = [{ id: 1, name: 'Eid Dinner' }];
    mockFindMany.mockResolvedValue(events);

    const req = { query: {} } as unknown as Request;
    const { res, json, status } = mockRes();

    await getEvents(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: events });
});

test('getEventById returns 404 when the event does not exist', async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = { params: { id: '99' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await getEventById(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: 'Event not found' });
});

test('createEvent returns 400 when a required field is missing', async () => {
    const req = {
        body: { name: 'Eid Dinner', description: 'x', ticketUrl: 'https://t' },
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
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ data: created });
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
