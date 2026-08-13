import { test, expect, describe } from '@jest/globals';
import express, { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import request from 'supertest';
import { upload } from '../middleware/upload';

const FIVE_MB = 5 * 1024 * 1024;

/**
 * Mounts `upload.single('image')` behind a probe route so the multer config
 * (fileFilter + size limit) is exercised through a real multipart request.
 */
function uploadApp() {
  const app = express();

  app.post('/upload', upload.single('image'), (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(200).json({ received: false, body: req.body });
    }
    return res.status(200).json({
      received: true,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      // memoryStorage must buffer the bytes rather than write to disk.
      hasBuffer: Buffer.isBuffer(req.file.buffer),
      path: req.file.path ?? null,
    });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof MulterError) {
      return res.status(413).json({ code: err.code, field: err.field });
    }
    return res.status(500).json({ error: 'Unexpected upload error' });
  });

  return app;
}

describe('upload.single("image")', () => {
  test('accepts an image file and buffers it in memory', async () => {
    const res = await request(uploadApp())
      .post('/upload')
      .attach('image', Buffer.from('fake-png-bytes'), {
        filename: 'poster.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      received: true,
      originalname: 'poster.png',
      mimetype: 'image/png',
      hasBuffer: true,
      path: null,
    });
  });

  test('accepts other image subtypes', async () => {
    const res = await request(uploadApp())
      .post('/upload')
      .attach('image', Buffer.from('fake-webp-bytes'), {
        filename: 'poster.webp',
        contentType: 'image/webp',
      });

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(res.body.mimetype).toBe('image/webp');
  });

  test('silently drops a non-image file so req.file is undefined', async () => {
    const res = await request(uploadApp())
      .post('/upload')
      .attach('image', Buffer.from('not an image'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      });

    // fileFilter calls cb(null, false): no error is raised, the file is skipped.
    // Controllers therefore see a missing image, not a rejected request.
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(false);
  });

  test('silently drops a PDF disguised behind an image filename', async () => {
    const res = await request(uploadApp())
      .post('/upload')
      .attach('image', Buffer.from('%PDF-1.4'), {
        filename: 'poster.png',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(false);
  });

  test('accepts a file just under the 5MB limit', async () => {
    const res = await request(uploadApp())
      .post('/upload')
      .attach('image', Buffer.alloc(FIVE_MB - 1024, 1), {
        filename: 'big.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(res.body.size).toBe(FIVE_MB - 1024);
  });

  test('rejects a file over the 5MB limit with LIMIT_FILE_SIZE', async () => {
    const res = await request(uploadApp())
      .post('/upload')
      .attach('image', Buffer.alloc(FIVE_MB + 1024, 1), {
        filename: 'huge.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(413);
    expect(res.body).toEqual({ code: 'LIMIT_FILE_SIZE', field: 'image' });
  });

  test('rejects a file sent under an unexpected field name', async () => {
    const res = await request(uploadApp())
      .post('/upload')
      .attach('photo', Buffer.from('fake-png-bytes'), {
        filename: 'poster.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(413);
    expect(res.body.code).toBe('LIMIT_UNEXPECTED_FILE');
  });

  test('passes through a request with no file at all', async () => {
    const res = await request(uploadApp()).post('/upload').field('title', 'No image here');

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(false);
    expect(res.body.body).toEqual({ title: 'No image here' });
  });
});
