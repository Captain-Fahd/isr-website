import { test, expect, jest, afterEach } from '@jest/globals';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

const mockFindMany = jest.fn<(args?: any) => Promise<any>>();
const mockFindUnique = jest.fn<(args: any) => Promise<any>>();
const mockCreate = jest.fn<(args: any) => Promise<any>>();
const mockUpdate = jest.fn<(args: any) => Promise<any>>();
const mockDelete = jest.fn<(args: any) => Promise<any>>();

jest.mock('../lib/prisma', () => ({
    prisma: {
        flagshipEvent: {
            findMany: mockFindMany,
            findUnique: mockFindUnique,
            create: mockCreate,
            update: mockUpdate,
            delete: mockDelete,
        },
    },
}));

const mockUploadFlagshipImage = jest.fn<(file: any) => Promise<string>>();
const mockDeleteFlagshipImages = jest.fn<(urls: string[]) => Promise<void>>();
const mockCollectFlagshipImageUrls = jest.fn<(event: any) => string[]>();

jest.mock('../lib/storage', () => ({
    uploadFlagshipImage: mockUploadFlagshipImage,
    deleteFlagshipImages: mockDeleteFlagshipImages,
    collectFlagshipImageUrls: mockCollectFlagshipImageUrls,
}));

import {
    listFlagshipEvents,
    getFlagshipEventBySlug,
    createFlagshipEvent,
    updateFlagshipEvent,
    deleteFlagshipEvent,
    uploadFlagshipEventImage,
    listFlagshipEventsAdmin,
    saveFlagshipEventDraft,
    discardFlagshipEventDraft,
    publishFlagshipEventDraft,
} from '../controllers/flagshipEventsController';

afterEach(() => {
    jest.clearAllMocks();
});

function mockRes() {
    const json = jest.fn();
    const status = jest.fn((_code: number) => ({ json }));
    const res = { json, status } as unknown as Response;
    return { res, json, status };
}

const baseBody = {
    slug: 'sacred-union',
    name: 'The Sacred Union',
    tagline: 'Prepare for the future you pray for',
    description: 'Desc',
    phase: 'save-the-date',
    start: '2026-11-28T13:30:00+11:00',
    end: '2026-11-28T19:30:00+11:00',
    dateLabel: 'Saturday 28 November 2026',
    timeLabel: '1:30 pm – 7:30 pm',
    venue: { name: 'Hall', address: 'Addr', mapUrl: '', notes: [] },
    banner: { src: 'https://cdn/banner.webp', alt: 'alt', width: 1600, height: 900 },
    ogImage: 'https://cdn/og.png',
    theme: { dark: '#000', onDark: '#fff', light: '#fff', onLight: '#000', primary: '#000', onPrimary: '#fff', accent: '#000', hero: { backdrop: 'https://cdn/backdrop.webp', background: '', text: '#000', heading: '#000' } },
};

// --- listFlagshipEvents ---

test('listFlagshipEvents returns events ordered by start', async () => {
    const events = [{ id: 1, slug: 'sacred-union' }];
    mockFindMany.mockResolvedValue(events);

    const req = {} as unknown as Request;
    const { res, json, status } = mockRes();

    await listFlagshipEvents(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: events });
    expect(mockFindMany).toHaveBeenCalledWith({ orderBy: { start: 'asc' }, omit: { draft: true } });
});

test('listFlagshipEvents returns 500 on db error', async () => {
    mockFindMany.mockRejectedValue(new Error('db down'));

    const req = {} as unknown as Request;
    const { res, json, status } = mockRes();

    await listFlagshipEvents(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Failed to fetch flagship events' });
});

// --- getFlagshipEventBySlug ---

test('getFlagshipEventBySlug returns the event', async () => {
    const event = { id: 1, slug: 'sacred-union' };
    mockFindUnique.mockResolvedValue(event);

    const req = { params: { slug: 'sacred-union' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await getFlagshipEventBySlug(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: event });
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { slug: 'sacred-union' }, omit: { draft: true } });
});

test('getFlagshipEventBySlug returns 404 when not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = { params: { slug: 'missing' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await getFlagshipEventBySlug(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: 'Flagship event not found' });
});

// --- createFlagshipEvent ---

test('createFlagshipEvent returns 400 when a required field is missing', async () => {
    const { description, ...rest } = baseBody;
    const req = { body: rest } as unknown as Request;
    const { res, json, status } = mockRes();

    await createFlagshipEvent(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'description is required' });
    expect(mockCreate).not.toHaveBeenCalled();
});

test('createFlagshipEvent returns 400 for an invalid phase', async () => {
    const req = { body: { ...baseBody, phase: 'live' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await createFlagshipEvent(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'phase must be one of: save-the-date, booking' });
    expect(mockCreate).not.toHaveBeenCalled();
});

test('createFlagshipEvent creates with defaults applied', async () => {
    const created = { id: 1, ...baseBody, featuredOnHome: false, released: false };
    mockCreate.mockResolvedValue(created);

    const req = { body: baseBody } as unknown as Request;
    const { res, json, status } = mockRes();

    await createFlagshipEvent(req, res);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ data: created });
    expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
            data: expect.objectContaining({
                slug: 'sacred-union',
                featuredOnHome: false,
                released: false,
                ticketUrl: '',
                ticketEventId: '',
                highlights: [],
                showSpeakers: false,
                speakers: [],
                speakerPlaceholderCount: 0,
                programme: [],
                faqs: [],
            }),
        }),
    );
});

test('createFlagshipEvent returns 400 on duplicate slug', async () => {
    mockCreate.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: '7.9.1',
        }),
    );

    const req = { body: baseBody } as unknown as Request;
    const { res, json, status } = mockRes();

    await createFlagshipEvent(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'A flagship event with that slug already exists' });
});

test('createFlagshipEvent returns 500 on failure', async () => {
    mockCreate.mockRejectedValue(new Error('db'));

    const req = { body: baseBody } as unknown as Request;
    const { res, json, status } = mockRes();

    await createFlagshipEvent(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Failed to create flagship event' });
});

// --- updateFlagshipEvent ---

test('updateFlagshipEvent returns 400 for non-integer id', async () => {
    const req = { params: { id: 'abc' }, body: { name: 'New' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await updateFlagshipEvent(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'Invalid flagship event id' });
    expect(mockFindUnique).not.toHaveBeenCalled();
});

test('updateFlagshipEvent returns 404 when not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = { params: { id: '99' }, body: { name: 'New' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await updateFlagshipEvent(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: 'Flagship event not found' });
    expect(mockUpdate).not.toHaveBeenCalled();
});

test('updateFlagshipEvent cleans up images no longer referenced', async () => {
    const existing = { id: 1, ...baseBody, banner: { ...baseBody.banner, src: 'https://cdn/old-banner.webp' } };
    const updated = { ...existing, banner: { ...baseBody.banner, src: 'https://cdn/new-banner.webp' } };
    mockFindUnique.mockResolvedValue(existing);
    mockUpdate.mockResolvedValue(updated);
    mockCollectFlagshipImageUrls.mockImplementation((event: any) => [event.banner.src]);

    const req = {
        params: { id: '1' },
        body: { banner: updated.banner },
    } as unknown as Request;
    const { res, json, status } = mockRes();

    await updateFlagshipEvent(req, res);

    expect(mockDeleteFlagshipImages).toHaveBeenCalledWith(['https://cdn/old-banner.webp']);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: updated });
});

test('updateFlagshipEvent skips cleanup when no images changed', async () => {
    const existing = { id: 1, ...baseBody };
    const updated = { ...existing, name: 'Renamed' };
    mockFindUnique.mockResolvedValue(existing);
    mockUpdate.mockResolvedValue(updated);
    mockCollectFlagshipImageUrls.mockReturnValue([baseBody.banner.src]);

    const req = { params: { id: '1' }, body: { name: 'Renamed' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await updateFlagshipEvent(req, res);

    expect(mockDeleteFlagshipImages).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
});

test('updateFlagshipEvent returns 500 on failure', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, ...baseBody });
    mockUpdate.mockRejectedValue(new Error('db'));

    const req = { params: { id: '1' }, body: { name: 'New' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await updateFlagshipEvent(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Failed to update flagship event' });
});

// --- deleteFlagshipEvent ---

test('deleteFlagshipEvent returns 400 for non-integer id', async () => {
    const req = { params: { id: 'abc' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await deleteFlagshipEvent(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'Invalid flagship event id' });
    expect(mockFindUnique).not.toHaveBeenCalled();
});

test('deleteFlagshipEvent returns 404 when not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = { params: { id: '99' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await deleteFlagshipEvent(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: 'Flagship event not found' });
    expect(mockDelete).not.toHaveBeenCalled();
});

test('deleteFlagshipEvent removes the record and its images', async () => {
    const existing = { id: 1, ...baseBody };
    mockFindUnique.mockResolvedValue(existing);
    mockDelete.mockResolvedValue({ id: 1 });
    mockCollectFlagshipImageUrls.mockReturnValue(['https://cdn/banner.webp', 'https://cdn/backdrop.webp']);

    const req = { params: { id: '1' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await deleteFlagshipEvent(req, res);

    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockDeleteFlagshipImages).toHaveBeenCalledWith(['https://cdn/banner.webp', 'https://cdn/backdrop.webp']);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: { id: 1 } });
});

test('deleteFlagshipEvent returns 500 on failure', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, ...baseBody });
    mockDelete.mockRejectedValue(new Error('db'));

    const req = { params: { id: '1' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await deleteFlagshipEvent(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Failed to delete flagship event' });
});

// --- uploadFlagshipEventImage ---

test('uploadFlagshipEventImage returns 400 when no file is provided', async () => {
    const req = {} as unknown as Request;
    const { res, json, status } = mockRes();

    await uploadFlagshipEventImage(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'An image file is required' });
    expect(mockUploadFlagshipImage).not.toHaveBeenCalled();
});

test('uploadFlagshipEventImage uploads and returns the url', async () => {
    mockUploadFlagshipImage.mockResolvedValue('https://cdn/new.webp');
    const file = { buffer: Buffer.from('x'), mimetype: 'image/webp', originalname: 'a.webp' };

    const req = { file } as unknown as Request;
    const { res, json, status } = mockRes();

    await uploadFlagshipEventImage(req, res);

    expect(mockUploadFlagshipImage).toHaveBeenCalledWith(file);
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ data: { url: 'https://cdn/new.webp' } });
});

test('uploadFlagshipEventImage returns 500 on failure', async () => {
    mockUploadFlagshipImage.mockRejectedValue(new Error('storage down'));
    const file = { buffer: Buffer.from('x'), mimetype: 'image/webp', originalname: 'a.webp' };

    const req = { file } as unknown as Request;
    const { res, json, status } = mockRes();

    await uploadFlagshipEventImage(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: 'Failed to upload image' });
});

// --- updateFlagshipEvent + drafts ---

test('updateFlagshipEvent clears any pending draft and keeps its images out of the diff', async () => {
    const existing = { id: 1, ...baseBody, draft: { ...baseBody, banner: { ...baseBody.banner, src: 'https://cdn/draft-banner.webp' } } };
    const updated = { ...existing, name: 'Renamed', draft: null };
    mockFindUnique.mockResolvedValue(existing);
    mockUpdate.mockResolvedValue(updated);
    mockCollectFlagshipImageUrls.mockImplementation((event: any) => [event.banner.src]);

    const req = { params: { id: '1' }, body: { name: 'Renamed' } } as unknown as Request;
    const { res, status } = mockRes();

    await updateFlagshipEvent(req, res);

    expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Renamed', draft: Prisma.DbNull },
    });
    // The draft's banner is no longer referenced once the draft is cleared.
    expect(mockDeleteFlagshipImages).toHaveBeenCalledWith(['https://cdn/draft-banner.webp']);
    expect(status).toHaveBeenCalledWith(200);
});

// --- listFlagshipEventsAdmin ---

test('listFlagshipEventsAdmin returns events including drafts', async () => {
    const events = [{ id: 1, slug: 'sacred-union', draft: { name: 'Draft' } }];
    mockFindMany.mockResolvedValue(events);

    const { res, json, status } = mockRes();
    await listFlagshipEventsAdmin({} as Request, res);

    expect(mockFindMany).toHaveBeenCalledWith({ orderBy: { start: 'asc' } });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: events });
});

// --- saveFlagshipEventDraft ---

test('saveFlagshipEventDraft returns 400 for non-integer id', async () => {
    const req = { params: { id: 'abc' }, body: baseBody } as unknown as Request;
    const { res, status } = mockRes();

    await saveFlagshipEventDraft(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(mockUpdate).not.toHaveBeenCalled();
});

test('saveFlagshipEventDraft returns 400 when a required field is missing', async () => {
    const { name: _name, ...body } = baseBody;
    const req = { params: { id: '1' }, body } as unknown as Request;
    const { res, json, status } = mockRes();

    await saveFlagshipEventDraft(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'name is required' });
});

test('saveFlagshipEventDraft returns 404 when not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = { params: { id: '99' }, body: baseBody } as unknown as Request;
    const { res, status } = mockRes();

    await saveFlagshipEventDraft(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(mockUpdate).not.toHaveBeenCalled();
});

test('saveFlagshipEventDraft rejects a slug already used by another event', async () => {
    mockFindUnique
        .mockResolvedValueOnce({ id: 1, ...baseBody })
        .mockResolvedValueOnce({ id: 2, slug: 'taken' });

    const req = { params: { id: '1' }, body: { ...baseBody, slug: 'taken' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await saveFlagshipEventDraft(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'A flagship event with that slug already exists' });
    expect(mockUpdate).not.toHaveBeenCalled();
});

test('saveFlagshipEventDraft stores only editable fields and leaves live fields alone', async () => {
    const existing = { id: 1, ...baseBody, draft: null };
    mockFindUnique.mockResolvedValue(existing);
    mockUpdate.mockImplementation(async ({ data }: any) => ({ ...existing, ...data }));
    mockCollectFlagshipImageUrls.mockReturnValue([]);

    const req = {
        params: { id: '1' },
        body: { ...baseBody, name: 'Draft name', id: 5, createdAt: 'x' },
    } as unknown as Request;
    const { res, status } = mockRes();

    await saveFlagshipEventDraft(req, res);

    expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { draft: { ...baseBody, name: 'Draft name' } },
    });
    expect(status).toHaveBeenCalledWith(200);
});

test('saveFlagshipEventDraft cleans up images from a replaced draft', async () => {
    const existing = { id: 1, ...baseBody, draft: { ...baseBody, ogImage: 'https://cdn/old-draft-og.png' } };
    mockFindUnique.mockResolvedValue(existing);
    mockUpdate.mockImplementation(async ({ data }: any) => ({ ...existing, ...data }));
    mockCollectFlagshipImageUrls.mockImplementation((event: any) => [event.ogImage]);

    const req = { params: { id: '1' }, body: { ...baseBody, ogImage: 'https://cdn/new-draft-og.png' } } as unknown as Request;
    const { res } = mockRes();

    await saveFlagshipEventDraft(req, res);

    expect(mockDeleteFlagshipImages).toHaveBeenCalledWith(['https://cdn/old-draft-og.png']);
});

// --- discardFlagshipEventDraft ---

test('discardFlagshipEventDraft clears the draft and its images', async () => {
    const existing = { id: 1, ...baseBody, draft: { ...baseBody, ogImage: 'https://cdn/draft-og.png' } };
    mockFindUnique.mockResolvedValue(existing);
    mockUpdate.mockResolvedValue({ ...existing, draft: null });
    mockCollectFlagshipImageUrls.mockImplementation((event: any) => [event.ogImage]);

    const req = { params: { id: '1' } } as unknown as Request;
    const { res, status } = mockRes();

    await discardFlagshipEventDraft(req, res);

    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 1 }, data: { draft: Prisma.DbNull } });
    expect(mockDeleteFlagshipImages).toHaveBeenCalledWith(['https://cdn/draft-og.png']);
    expect(status).toHaveBeenCalledWith(200);
});

test('discardFlagshipEventDraft returns 404 when not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = { params: { id: '1' } } as unknown as Request;
    const { res, status } = mockRes();

    await discardFlagshipEventDraft(req, res);

    expect(status).toHaveBeenCalledWith(404);
});

// --- publishFlagshipEventDraft ---

test('publishFlagshipEventDraft returns 400 when there is no draft', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, ...baseBody, draft: null });

    const req = { params: { id: '1' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await publishFlagshipEventDraft(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'There are no draft changes to publish' });
    expect(mockUpdate).not.toHaveBeenCalled();
});

test('publishFlagshipEventDraft applies the draft and clears it', async () => {
    const existing = {
        id: 1,
        ...baseBody,
        ogImage: 'https://cdn/old-og.png',
        draft: { ...baseBody, name: 'Published name', ogImage: 'https://cdn/new-og.png' },
    };
    const published = { ...existing, ...existing.draft, draft: null };
    mockFindUnique.mockResolvedValue(existing);
    mockUpdate.mockResolvedValue(published);
    mockCollectFlagshipImageUrls.mockImplementation((event: any) => [event.ogImage]);

    const req = { params: { id: '1' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await publishFlagshipEventDraft(req, res);

    const { data } = mockUpdate.mock.calls[0][0];
    expect(data.name).toBe('Published name');
    expect(data.ogImage).toBe('https://cdn/new-og.png');
    expect(data.start).toEqual(new Date(baseBody.start));
    expect(data.draft).toBe(Prisma.DbNull);
    expect(mockDeleteFlagshipImages).toHaveBeenCalledWith(['https://cdn/old-og.png']);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: published });
});

test('publishFlagshipEventDraft returns 400 on a slug clash', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, ...baseBody, draft: { ...baseBody, slug: 'taken' } });
    mockUpdate.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'x' }),
    );

    const req = { params: { id: '1' } } as unknown as Request;
    const { res, json, status } = mockRes();

    await publishFlagshipEventDraft(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'A flagship event with that slug already exists' });
});
