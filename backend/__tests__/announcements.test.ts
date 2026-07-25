import { test, expect, jest, afterEach } from '@jest/globals';
import { Request, Response } from 'express';

const mockFindMany = jest.fn<(args?: any) => Promise<any>>();
const mockFindUnique = jest.fn<(args: any) => Promise<any>>();
const mockCreate = jest.fn<(args: any) => Promise<any>>();
const mockUpdate = jest.fn<(args: any) => Promise<any>>();
const mockDelete = jest.fn<(args: any) => Promise<any>>();

jest.mock('../lib/prisma', () => ({
    prisma: {
        announcement: {
            findMany: mockFindMany,
            findUnique: mockFindUnique,
            create: mockCreate,
            update: mockUpdate,
            delete: mockDelete,
        },
    },
}));

const mockUploadAnnouncementImage = jest.fn<(file: any) => Promise<string>>();
const mockDeleteAnnouncementImage = jest.fn<(url: string) => Promise<void>>();

jest.mock('../lib/storage', () => ({
    uploadAnnouncementImage: mockUploadAnnouncementImage,
    deleteAnnouncementImage: mockDeleteAnnouncementImage,
}));

import {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} from '../controllers/announcementsController';

afterEach(() => {
    jest.clearAllMocks();
});

function mockRes() {
    const json = jest.fn();
    const status = jest.fn((_code: number) => ({ json }));
    const res = { json, status } as unknown as Response;
    return { res, json, status };
}

// --- getAnnouncements ---

test('getAnnouncements returns pinned-first list', async () => {
    const announcements = [
        { id: 2, title: 'Pinned', pinned: true },
        { id: 1, title: 'Normal', pinned: false },
    ];
    mockFindMany.mockResolvedValue(announcements);

    const req = {} as unknown as Request;
    const { res, json, status } = mockRes();

    await getAnnouncements(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: announcements });
    expect(mockFindMany).toHaveBeenCalledWith({
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });
});

test('getAnnouncements returns 500 on db error', async () => {
    mockFindMany.mockRejectedValue(new Error('db down'));

    const req = {} as unknown as Request;
    const { res, json, status } = mockRes();

    await getAnnouncements(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Failed to fetch announcements' });
});

// --- getAnnouncementById ---

test('getAnnouncementById returns the announcement', async () => {
    const announcement = { id: 1, title: 'Hello' };
    mockFindUnique.mockResolvedValue(announcement);

    const req = { params: { id: '1' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await getAnnouncementById(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: announcement });
});

test('getAnnouncementById returns 404 when not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = { params: { id: '99' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await getAnnouncementById(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: 'Announcement not found' });
});

test('getAnnouncementById returns 400 for non-integer id', async () => {
    const req = { params: { id: 'abc' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await getAnnouncementById(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'Invalid announcement id' });
    expect(mockFindUnique).not.toHaveBeenCalled();
});

// --- createAnnouncement ---

test('createAnnouncement returns 400 when title is missing', async () => {
    const req = {
        body: { body: 'Some content' },
    } as unknown as Request;
    const { res, json, status } = mockRes();

    await createAnnouncement(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'title and body are required' });
    expect(mockCreate).not.toHaveBeenCalled();
});

test('createAnnouncement returns 400 when body is missing', async () => {
    const req = {
        body: { title: 'Hello' },
    } as unknown as Request;
    const { res, json, status } = mockRes();

    await createAnnouncement(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'title and body are required' });
    expect(mockCreate).not.toHaveBeenCalled();
});

test('createAnnouncement creates without image', async () => {
    const created = { id: 1, title: 'Hello', body: 'World', pinned: false, imageUrl: null };
    mockCreate.mockResolvedValue(created);

    const req = {
        body: { title: 'Hello', body: 'World' },
    } as unknown as Request;
    const { res, json, status } = mockRes();

    await createAnnouncement(req, res);

    expect(mockUploadAnnouncementImage).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ data: created });
});

test('createAnnouncement uploads image and creates', async () => {
    mockUploadAnnouncementImage.mockResolvedValue('https://cdn/ann.jpg');
    const created = { id: 1, title: 'Hello', body: 'World', pinned: true, imageUrl: 'https://cdn/ann.jpg' };
    mockCreate.mockResolvedValue(created);

    const file = { buffer: Buffer.from('x'), mimetype: 'image/jpeg', originalname: 'a.jpg' };
    const req = {
        body: { title: 'Hello', body: 'World', pinned: 'true' },
        file,
    } as unknown as Request;
    const { res, json, status } = mockRes();

    await createAnnouncement(req, res);

    expect(mockUploadAnnouncementImage).toHaveBeenCalledWith(file);
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ data: created });
});

// --- updateAnnouncement ---

test('updateAnnouncement returns 404 when not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = { params: { id: '99' }, body: { title: 'New' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await updateAnnouncement(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: 'Announcement not found' });
    expect(mockUpdate).not.toHaveBeenCalled();
});

test('updateAnnouncement updates title without touching image', async () => {
    const existing = { id: 1, title: 'Old', body: 'Body', pinned: false, imageUrl: null };
    const updated = { ...existing, title: 'New' };
    mockFindUnique.mockResolvedValue(existing);
    mockUpdate.mockResolvedValue(updated);

    const req = {
        params: { id: '1' },
        body: { title: 'New' },
    } as unknown as Request;
    const { res, json, status } = mockRes();

    await updateAnnouncement(req, res);

    expect(mockUploadAnnouncementImage).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: updated });
});

test('updateAnnouncement replaces image and deletes old one', async () => {
    const existing = { id: 1, title: 'Old', body: 'Body', pinned: false, imageUrl: 'https://cdn/old.jpg' };
    const updated = { ...existing, imageUrl: 'https://cdn/new.jpg' };
    mockFindUnique.mockResolvedValue(existing);
    mockUploadAnnouncementImage.mockResolvedValue('https://cdn/new.jpg');
    mockUpdate.mockResolvedValue(updated);

    const file = { buffer: Buffer.from('x'), mimetype: 'image/jpeg', originalname: 'new.jpg' };
    const req = {
        params: { id: '1' },
        body: {},
        file,
    } as unknown as Request;
    const { res, json, status } = mockRes();

    await updateAnnouncement(req, res);

    expect(mockUploadAnnouncementImage).toHaveBeenCalledWith(file);
    expect(mockDeleteAnnouncementImage).toHaveBeenCalledWith('https://cdn/old.jpg');
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: updated });
});

// --- deleteAnnouncement ---

test('deleteAnnouncement returns 404 when not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = { params: { id: '99' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await deleteAnnouncement(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: 'Announcement not found' });
    expect(mockDelete).not.toHaveBeenCalled();
});

test('deleteAnnouncement removes the record and its image', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, imageUrl: 'https://cdn/ann.jpg' });
    mockDelete.mockResolvedValue({ id: 1 });

    const req = { params: { id: '1' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await deleteAnnouncement(req, res);

    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockDeleteAnnouncementImage).toHaveBeenCalledWith('https://cdn/ann.jpg');
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: { id: 1 } });
});

test('deleteAnnouncement skips image deletion when no imageUrl', async () => {
    mockFindUnique.mockResolvedValue({ id: 2, imageUrl: null });
    mockDelete.mockResolvedValue({ id: 2 });

    const req = { params: { id: '2' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await deleteAnnouncement(req, res);

    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 2 } });
    expect(mockDeleteAnnouncementImage).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: { id: 2 } });
});
