import { test, expect, jest, afterEach } from '@jest/globals';
import { Request, Response } from 'express';

const mockFindUnique = jest.fn<(args: any) => Promise<any>>();
const mockLikeUpsert = jest.fn<(args: any) => Promise<any>>();
const mockLikeDeleteMany = jest.fn<(args: any) => Promise<any>>();
const mockLikeCount = jest.fn<(args: any) => Promise<number>>();

jest.mock('../lib/prisma', () => ({
    prisma: {
        event: {
            findUnique: mockFindUnique,
        },
        eventLike: {
            upsert: mockLikeUpsert,
            deleteMany: mockLikeDeleteMany,
            count: mockLikeCount,
        },
    },
}));

jest.mock('../lib/storage', () => ({
    uploadEventImage: jest.fn(),
    deleteEventImage: jest.fn(),
}));

import { likeEvent, unlikeEvent } from '../controllers/eventsController';

afterEach(() => {
    jest.clearAllMocks();
});

function mockRes() {
    const json = jest.fn();
    const status = jest.fn((_code: number) => ({ json }));
    const res = { json, status } as unknown as Response;
    return { res, json, status };
}

test('likeEvent records the like and returns the new count', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, name: 'Eid Dinner' });
    mockLikeUpsert.mockResolvedValue({ id: 10 });
    mockLikeCount.mockResolvedValue(3);

    const req = {
        params: { id: '1' },
        body: { clientId: 'abc-123' },
        query: {},
    } as unknown as Request;
    const { res, json, status } = mockRes();

    await likeEvent(req, res);

    expect(mockLikeUpsert).toHaveBeenCalledWith({
        where: { eventId_clientId: { eventId: 1, clientId: 'abc-123' } },
        create: { eventId: 1, clientId: 'abc-123' },
        update: {},
    });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
        data: { id: 1, likeCount: 3, likedByMe: true },
    });
});

test('likeEvent returns 400 when clientId is missing', async () => {
    const req = { params: { id: '1' }, body: {}, query: {} } as unknown as Request;
    const { res, json, status } = mockRes();

    await likeEvent(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'clientId is required' });
    expect(mockLikeUpsert).not.toHaveBeenCalled();
});

test('likeEvent returns 404 when the event does not exist', async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = {
        params: { id: '99' },
        body: { clientId: 'abc-123' },
        query: {},
    } as unknown as Request;
    const { res, json, status } = mockRes();

    await likeEvent(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: 'Event not found' });
    expect(mockLikeUpsert).not.toHaveBeenCalled();
});

test('likeEvent is idempotent — a repeat like does not raise the count', async () => {
    mockFindUnique.mockResolvedValue({ id: 1 });
    mockLikeUpsert.mockResolvedValue({ id: 10 });
    mockLikeCount.mockResolvedValue(1);

    const req = {
        params: { id: '1' },
        body: { clientId: 'abc-123' },
        query: {},
    } as unknown as Request;

    const first = mockRes();
    await likeEvent(req, first.res);
    const second = mockRes();
    await likeEvent(req, second.res);

    expect(first.json).toHaveBeenCalledWith({
        data: { id: 1, likeCount: 1, likedByMe: true },
    });
    expect(second.json).toHaveBeenCalledWith({
        data: { id: 1, likeCount: 1, likedByMe: true },
    });
});

test('unlikeEvent removes the like and returns the new count', async () => {
    mockFindUnique.mockResolvedValue({ id: 1 });
    mockLikeDeleteMany.mockResolvedValue({ count: 1 });
    mockLikeCount.mockResolvedValue(2);

    // Sent as a query parameter, which is how a client without a DELETE body identifies itself.
    const req = {
        params: { id: '1' },
        query: { clientId: 'abc-123' },
    } as unknown as Request;
    const { res, json, status } = mockRes();

    await unlikeEvent(req, res);

    expect(mockLikeDeleteMany).toHaveBeenCalledWith({
        where: { eventId: 1, clientId: 'abc-123' },
    });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
        data: { id: 1, likeCount: 2, likedByMe: false },
    });
});

test('unlikeEvent succeeds when the client had not liked the event', async () => {
    mockFindUnique.mockResolvedValue({ id: 1 });
    mockLikeDeleteMany.mockResolvedValue({ count: 0 });
    mockLikeCount.mockResolvedValue(0);

    const req = {
        params: { id: '1' },
        body: { clientId: 'never-liked' },
        query: {},
    } as unknown as Request;
    const { res, json, status } = mockRes();

    await unlikeEvent(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
        data: { id: 1, likeCount: 0, likedByMe: false },
    });
});

test('unlikeEvent returns 400 for an invalid event id', async () => {
    const req = {
        params: { id: 'abc' },
        body: { clientId: 'abc-123' },
        query: {},
    } as unknown as Request;
    const { res, json, status } = mockRes();

    await unlikeEvent(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'Invalid event id' });
    expect(mockLikeDeleteMany).not.toHaveBeenCalled();
});
