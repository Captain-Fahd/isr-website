import './env';
import { afterAll, afterEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';

const mockSend = jest.fn<(opts: unknown) => Promise<unknown>>();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

import { createApp } from '../../app';
import { disconnectPrisma } from './helpers';

const app = createApp();

const validBody = {
  name: 'Omar',
  email: 'omar@example.com',
  subject: 'Hello',
  message: 'Assalamu alaikum',
};

afterEach(() => {
  jest.clearAllMocks();
  process.env.RESEND_API_KEY = 're_integration_test';
  process.env.RESEND_FROM_ADDRESS = 'noreply@example.com';
});

afterAll(async () => {
  await disconnectPrisma();
});

describe('POST /api/contact', () => {
  test('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Omar', email: 'omar@example.com' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'name, email, subject, and message are all required',
    });
    expect(mockSend).not.toHaveBeenCalled();
  });

  test('returns 400 for an invalid email', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...validBody, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid email address' });
    expect(mockSend).not.toHaveBeenCalled();
  });

  test('returns 500 when email service is not configured', async () => {
    delete process.env.RESEND_API_KEY;

    const res = await request(app).post('/api/contact').send(validBody);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Email service not configured' });
    expect(mockSend).not.toHaveBeenCalled();
  });

  test('returns 200 when Resend accepts both emails', async () => {
    mockSend
      .mockResolvedValueOnce({ data: { id: 'inbound' }, error: null })
      .mockResolvedValueOnce({ data: { id: 'confirm' }, error: null });

    const res = await request(app).post('/api/contact').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  test('returns 502 when the inbound email fails', async () => {
    mockSend
      .mockResolvedValueOnce({ data: null, error: { message: 'rate limit' } })
      .mockResolvedValueOnce({ data: { id: 'confirm' }, error: null });

    const res = await request(app).post('/api/contact').send(validBody);

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'Failed to send email' });
  });
});
