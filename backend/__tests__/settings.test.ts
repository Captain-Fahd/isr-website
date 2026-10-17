import { test, expect, jest, afterEach } from '@jest/globals';
import { Request, Response } from 'express';

const mockFindUnique = jest.fn<(args: any) => Promise<any>>();
const mockUpsert = jest.fn<(args: any) => Promise<any>>();

jest.mock('../lib/prisma', () => ({
    prisma: {
        siteSettings: {
            findUnique: mockFindUnique,
            upsert: mockUpsert,
        },
    },
}));

import { getSettings, updateSettings } from '../controllers/settingsController';

afterEach(() => {
    jest.clearAllMocks();
});

function mockRes() {
    const json = jest.fn();
    const status = jest.fn((_code: number) => ({ json }));
    const res = { json, status } as unknown as Response;
    return { res, json, status };
}

// --- getSettings ---

test('getSettings returns the stored settings', async () => {
    const updatedAt = new Date('2026-10-17T00:00:00Z');
    mockFindUnique.mockResolvedValue({ id: 1, flagshipReleased: true, updatedAt });

    const { res, json, status } = mockRes();
    await getSettings({} as Request, res);

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: { flagshipReleased: true, updatedAt } });
});

test('getSettings returns unreleased defaults before anything is saved', async () => {
    mockFindUnique.mockResolvedValue(null);

    const { res, json, status } = mockRes();
    await getSettings({} as Request, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: { flagshipReleased: false, updatedAt: null } });
});

test('getSettings returns 500 on db error', async () => {
    mockFindUnique.mockRejectedValue(new Error('db down'));

    const { res, json, status } = mockRes();
    await getSettings({} as Request, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Failed to fetch settings' });
});

// --- updateSettings ---

test('updateSettings upserts the single settings row', async () => {
    const updatedAt = new Date('2026-10-17T00:00:00Z');
    mockUpsert.mockResolvedValue({ id: 1, flagshipReleased: true, updatedAt });

    const req = { body: { flagshipReleased: true } } as Request;
    const { res, json, status } = mockRes();
    await updateSettings(req, res);

    expect(mockUpsert).toHaveBeenCalledWith({
        where: { id: 1 },
        create: { id: 1, flagshipReleased: true },
        update: { flagshipReleased: true },
    });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: { flagshipReleased: true, updatedAt } });
});

test('updateSettings rejects a non-boolean flag', async () => {
    const req = { body: { flagshipReleased: 'true' } } as Request;
    const { res, json, status } = mockRes();
    await updateSettings(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'flagshipReleased must be a boolean' });
    expect(mockUpsert).not.toHaveBeenCalled();
});

test('updateSettings returns 500 on db error', async () => {
    mockUpsert.mockRejectedValue(new Error('db down'));

    const req = { body: { flagshipReleased: false } } as Request;
    const { res, json, status } = mockRes();
    await updateSettings(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Failed to update settings' });
});
