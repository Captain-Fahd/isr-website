import { test, expect, jest, afterEach, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';

const mockSend = jest.fn<(opts: any) => Promise<any>>();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

import { sendContactEmail } from '../controllers/contactController';

function mockRes() {
  const json = jest.fn();
  const status = jest.fn((_code: number) => ({ json }));
  const res = { json, status } as unknown as Response;
  return { res, json, status };
}

const validBody = {
  name: 'Omar',
  email: 'omar@example.com',
  subject: 'Hello',
  message: 'Assalamu alaikum',
};

beforeEach(() => {
  process.env.RESEND_API_KEY = 're_test';
  process.env.RESEND_FROM_ADDRESS = 'noreply@example.com';
});

afterEach(() => {
  jest.clearAllMocks();
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM_ADDRESS;
});

test('sendContactEmail returns 500 when email service is not configured', async () => {
  delete process.env.RESEND_API_KEY;

  const req = { body: validBody } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendContactEmail(req, res);

  expect(status).toHaveBeenCalledWith(500);
  expect(json).toHaveBeenCalledWith({ error: 'Email service not configured' });
  expect(mockSend).not.toHaveBeenCalled();
});

test('sendContactEmail returns 400 when a required field is missing', async () => {
  const req = {
    body: { name: 'Omar', email: 'omar@example.com', subject: 'Hello' },
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendContactEmail(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({
    error: 'name, email, subject, and message are all required',
  });
  expect(mockSend).not.toHaveBeenCalled();
});

test('sendContactEmail returns 400 for invalid email', async () => {
  const req = {
    body: { ...validBody, email: 'not-an-email' },
  } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendContactEmail(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({ error: 'Invalid email address' });
  expect(mockSend).not.toHaveBeenCalled();
});

test('sendContactEmail returns 200 when inbound send succeeds', async () => {
  mockSend
    .mockResolvedValueOnce({ data: { id: 'inbound' }, error: null })
    .mockResolvedValueOnce({ data: { id: 'confirm' }, error: null });

  const req = { body: validBody } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendContactEmail(req, res);

  expect(mockSend).toHaveBeenCalledTimes(2);
  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ success: true });
});

test('sendContactEmail still returns 200 when confirmation send fails', async () => {
  mockSend
    .mockResolvedValueOnce({ data: { id: 'inbound' }, error: null })
    .mockResolvedValueOnce({ data: null, error: { message: 'bounce' } });

  const req = { body: validBody } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendContactEmail(req, res);

  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ success: true });
});

test('sendContactEmail returns 502 when inbound send errors', async () => {
  mockSend
    .mockResolvedValueOnce({ data: null, error: { message: 'rate limit' } })
    .mockResolvedValueOnce({ data: { id: 'confirm' }, error: null });

  const req = { body: validBody } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendContactEmail(req, res);

  expect(status).toHaveBeenCalledWith(502);
  expect(json).toHaveBeenCalledWith({ error: 'Failed to send email' });
});

test('sendContactEmail returns 502 when Resend throws', async () => {
  mockSend.mockRejectedValue(new Error('network'));

  const req = { body: validBody } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendContactEmail(req, res);

  expect(status).toHaveBeenCalledWith(502);
  expect(json).toHaveBeenCalledWith({ error: 'Failed to send email' });
});
