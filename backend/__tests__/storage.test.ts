import { test, expect, jest, describe, beforeEach, afterEach } from '@jest/globals';

const mockToBuffer = jest.fn<() => Promise<Buffer>>();
const mockWebp = jest.fn((_opts: Record<string, unknown>) => ({ toBuffer: mockToBuffer }));
const mockResize = jest.fn((_opts: Record<string, unknown>) => ({ webp: mockWebp }));
const mockRotate = jest.fn(() => ({ resize: mockResize }));
const mockSharp = jest.fn((_input: Buffer) => ({ rotate: mockRotate }));

// Virtual so the suite never needs sharp's platform-specific native binaries.
jest.mock('sharp', () => ({ __esModule: true, default: mockSharp }), { virtual: true });

const mockUpload = jest.fn<(key: string, body: Buffer, opts: any) => Promise<any>>();
const mockGetPublicUrl = jest.fn<(key: string) => any>();
const mockRemove = jest.fn<(keys: string[]) => Promise<any>>();
const mockFrom = jest.fn((_bucket: string) => ({
  upload: mockUpload,
  getPublicUrl: mockGetPublicUrl,
  remove: mockRemove,
}));

jest.mock('../lib/supabase', () => ({
  supabaseAdmin: { storage: { from: mockFrom } },
}));

import {
  uploadEventImage,
  deleteEventImage,
  uploadAnnouncementImage,
  deleteAnnouncementImage,
  uploadFlagshipImage,
  deleteFlagshipImage,
  deleteFlagshipImages,
  collectFlagshipImageUrls,
} from '../lib/storage';

const EVENT_BUCKET = 'event-images';
const ANNOUNCEMENT_BUCKET = 'announcement-images';
const FLAGSHIP_BUCKET = 'flagship-images';
const OPTIMISED = Buffer.from('optimised-webp-bytes');

function multerFile(overrides: Record<string, unknown> = {}) {
  return {
    fieldname: 'image',
    originalname: 'poster.png',
    mimetype: 'image/png',
    buffer: Buffer.from('original-png-bytes'),
    size: 18,
    ...overrides,
  } as Express.Multer.File;
}

beforeEach(() => {
  mockToBuffer.mockResolvedValue(OPTIMISED);
  mockUpload.mockResolvedValue({ error: null });
  mockGetPublicUrl.mockImplementation((key: string) => ({
    data: { publicUrl: `https://cdn.example.com/storage/v1/object/public/bucket/${key}` },
  }));
  mockRemove.mockResolvedValue({ error: null });
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

// --- uploadEventImage ---

describe('uploadEventImage', () => {
  test('optimises the image before uploading it', async () => {
    await uploadEventImage(multerFile());

    expect(mockSharp).toHaveBeenCalledWith(Buffer.from('original-png-bytes'));
    // rotate() applies EXIF orientation so portrait phone photos are not sideways.
    expect(mockRotate).toHaveBeenCalledTimes(1);
    expect(mockResize).toHaveBeenCalledWith({
      width: 1200,
      height: 1600,
      fit: 'inside',
      withoutEnlargement: true,
    });
    expect(mockWebp).toHaveBeenCalledWith({ quality: 80 });
  });

  test('uploads the optimised buffer to the event bucket as webp', async () => {
    await uploadEventImage(multerFile());

    expect(mockFrom).toHaveBeenCalledWith(EVENT_BUCKET);
    expect(mockUpload).toHaveBeenCalledTimes(1);

    const [key, body, opts] = mockUpload.mock.calls[0];
    expect(key).toMatch(/^\d+-[0-9a-f-]{36}\.webp$/);
    // The original PNG bytes must never reach storage.
    expect(body).toBe(OPTIMISED);
    expect(opts).toEqual({ contentType: 'image/webp', cacheControl: '31536000' });
  });

  test('returns the public URL for the uploaded key', async () => {
    const url = await uploadEventImage(multerFile());

    const [key] = mockUpload.mock.calls[0];
    expect(mockGetPublicUrl).toHaveBeenCalledWith(key);
    expect(url).toBe(
      `https://cdn.example.com/storage/v1/object/public/bucket/${key}`,
    );
  });

  test('generates a distinct key per upload of the same file', async () => {
    await uploadEventImage(multerFile());
    await uploadEventImage(multerFile());

    const [firstKey] = mockUpload.mock.calls[0];
    const [secondKey] = mockUpload.mock.calls[1];
    expect(firstKey).not.toBe(secondKey);
  });

  test('throws when Supabase rejects the upload', async () => {
    mockUpload.mockResolvedValue({ error: { message: 'bucket not found' } });

    await expect(uploadEventImage(multerFile())).rejects.toThrow(
      'Failed to upload image: bucket not found',
    );
    expect(mockGetPublicUrl).not.toHaveBeenCalled();
  });

  test('propagates a sharp failure on a corrupt image', async () => {
    mockToBuffer.mockRejectedValue(new Error('Input buffer contains unsupported image format'));

    await expect(uploadEventImage(multerFile())).rejects.toThrow(
      'Input buffer contains unsupported image format',
    );
    expect(mockUpload).not.toHaveBeenCalled();
  });
});

// --- uploadAnnouncementImage ---

describe('uploadAnnouncementImage', () => {
  test('uploads to the announcement bucket', async () => {
    const url = await uploadAnnouncementImage(multerFile());

    expect(mockFrom).toHaveBeenCalledWith(ANNOUNCEMENT_BUCKET);
    const [key] = mockUpload.mock.calls[0];
    expect(key).toMatch(/\.webp$/);
    expect(url).toContain(key);
  });

  test('throws when Supabase rejects the upload', async () => {
    mockUpload.mockResolvedValue({ error: { message: 'payload too large' } });

    await expect(uploadAnnouncementImage(multerFile())).rejects.toThrow(
      'Failed to upload image: payload too large',
    );
  });
});

// --- deleteEventImage ---

describe('deleteEventImage', () => {
  test('extracts the storage key from the public URL', async () => {
    await deleteEventImage(
      'https://cdn.example.com/storage/v1/object/public/event-images/1750000000-abc.webp',
    );

    expect(mockFrom).toHaveBeenCalledWith(EVENT_BUCKET);
    expect(mockRemove).toHaveBeenCalledWith(['1750000000-abc.webp']);
  });

  test('keeps nested paths intact in the extracted key', async () => {
    await deleteEventImage(
      'https://cdn.example.com/storage/v1/object/public/event-images/2026/08/poster.webp',
    );

    expect(mockRemove).toHaveBeenCalledWith(['2026/08/poster.webp']);
  });

  test('does nothing when the URL is not an event-bucket URL', async () => {
    await deleteEventImage('https://example.com/some/other/image.png');

    expect(mockRemove).not.toHaveBeenCalled();
  });

  test('does not delete when handed an announcement URL', async () => {
    await deleteEventImage(
      'https://cdn.example.com/storage/v1/object/public/announcement-images/notice.webp',
    );

    expect(mockRemove).not.toHaveBeenCalled();
  });

  test('does nothing for an empty URL', async () => {
    await deleteEventImage('');

    expect(mockRemove).not.toHaveBeenCalled();
  });

  test('swallows a storage failure so it cannot block the DB delete', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockRemove.mockRejectedValue(new Error('network down'));

    await expect(
      deleteEventImage(
        'https://cdn.example.com/storage/v1/object/public/event-images/gone.webp',
      ),
    ).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to delete event image:',
      expect.any(Error),
    );
  });
});

// --- deleteAnnouncementImage ---

describe('deleteAnnouncementImage', () => {
  test('extracts the storage key from the public URL', async () => {
    await deleteAnnouncementImage(
      'https://cdn.example.com/storage/v1/object/public/announcement-images/notice.webp',
    );

    expect(mockFrom).toHaveBeenCalledWith(ANNOUNCEMENT_BUCKET);
    expect(mockRemove).toHaveBeenCalledWith(['notice.webp']);
  });

  test('does not delete when handed an event URL', async () => {
    await deleteAnnouncementImage(
      'https://cdn.example.com/storage/v1/object/public/event-images/poster.webp',
    );

    expect(mockRemove).not.toHaveBeenCalled();
  });

  test('swallows a storage failure so it cannot block the DB delete', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockRemove.mockRejectedValue(new Error('network down'));

    await expect(
      deleteAnnouncementImage(
        'https://cdn.example.com/storage/v1/object/public/announcement-images/gone.webp',
      ),
    ).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to delete announcement image:',
      expect.any(Error),
    );
  });
});

// --- uploadFlagshipImage / deleteFlagshipImage(s) ---

describe('uploadFlagshipImage', () => {
  test('uploads to the flagship bucket', async () => {
    const url = await uploadFlagshipImage(multerFile());

    expect(mockFrom).toHaveBeenCalledWith(FLAGSHIP_BUCKET);
    const [key] = mockUpload.mock.calls[0];
    expect(key).toMatch(/\.webp$/);
    expect(url).toContain(key);
  });
});

describe('deleteFlagshipImage', () => {
  test('extracts the storage key from the public URL', async () => {
    await deleteFlagshipImage(
      'https://cdn.example.com/storage/v1/object/public/flagship-images/sacred-union/banner.webp',
    );

    expect(mockFrom).toHaveBeenCalledWith(FLAGSHIP_BUCKET);
    expect(mockRemove).toHaveBeenCalledWith(['sacred-union/banner.webp']);
  });

  test('does not delete when handed an event URL', async () => {
    await deleteFlagshipImage(
      'https://cdn.example.com/storage/v1/object/public/event-images/poster.webp',
    );

    expect(mockRemove).not.toHaveBeenCalled();
  });

  test('swallows a storage failure so it cannot block the DB delete', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockRemove.mockRejectedValue(new Error('network down'));

    await expect(
      deleteFlagshipImage(
        'https://cdn.example.com/storage/v1/object/public/flagship-images/gone.webp',
      ),
    ).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to delete flagship image:',
      expect.any(Error),
    );
  });
});

describe('deleteFlagshipImages', () => {
  test('removes every url in the list', async () => {
    await deleteFlagshipImages([
      'https://cdn.example.com/storage/v1/object/public/flagship-images/a.webp',
      'https://cdn.example.com/storage/v1/object/public/flagship-images/b.webp',
    ]);

    expect(mockRemove).toHaveBeenCalledWith(['a.webp']);
    expect(mockRemove).toHaveBeenCalledWith(['b.webp']);
  });

  test('swallows a failure so it cannot block the DB operation', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockRemove.mockRejectedValue(new Error('network down'));

    await expect(
      deleteFlagshipImages(['https://cdn.example.com/storage/v1/object/public/flagship-images/a.webp']),
    ).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to delete flagship image(s):',
      expect.any(Error),
    );
  });
});

describe('collectFlagshipImageUrls', () => {
  const FLAGSHIP_PREFIX = 'https://cdn.example.com/storage/v1/object/public/flagship-images';
  const LOCAL_BANNER = '/images/sacred-union/save-the-date.webp';

  test('collects every image field stored in the flagship bucket', () => {
    const urls = collectFlagshipImageUrls({
      banner: { src: `${FLAGSHIP_PREFIX}/banner.webp`, mobile: { src: `${FLAGSHIP_PREFIX}/banner-mobile.webp` } },
      ogImage: `${FLAGSHIP_PREFIX}/og.png`,
      theme: { hero: { backdrop: `${FLAGSHIP_PREFIX}/backdrop.webp`, backdropMobile: `${FLAGSHIP_PREFIX}/backdrop-mobile.webp` } },
      venue: { image: { src: `${FLAGSHIP_PREFIX}/venue.webp` } },
      speakers: [{ image: `${FLAGSHIP_PREFIX}/speaker-1.webp` }, { image: `${FLAGSHIP_PREFIX}/speaker-2.webp` }],
    });

    expect(urls).toEqual([
      `${FLAGSHIP_PREFIX}/banner.webp`,
      `${FLAGSHIP_PREFIX}/banner-mobile.webp`,
      `${FLAGSHIP_PREFIX}/og.png`,
      `${FLAGSHIP_PREFIX}/backdrop.webp`,
      `${FLAGSHIP_PREFIX}/backdrop-mobile.webp`,
      `${FLAGSHIP_PREFIX}/venue.webp`,
      `${FLAGSHIP_PREFIX}/speaker-1.webp`,
      `${FLAGSHIP_PREFIX}/speaker-2.webp`,
    ]);
  });

  test('filters out urls that are not in the flagship bucket', () => {
    const urls = collectFlagshipImageUrls({
      banner: { src: LOCAL_BANNER },
      ogImage: `${FLAGSHIP_PREFIX}/og.png`,
    });

    expect(urls).toEqual([`${FLAGSHIP_PREFIX}/og.png`]);
  });

  test('tolerates missing/optional fields', () => {
    const urls = collectFlagshipImageUrls({});

    expect(urls).toEqual([]);
  });
});
