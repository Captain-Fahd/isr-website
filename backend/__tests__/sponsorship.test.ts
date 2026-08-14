import { test, expect, jest, afterEach, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';

const mockSend = jest.fn<(opts: any) => Promise<any>>();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

import { sendSponsorshipEnquiry } from '../controllers/sponsorshipController';

function mockRes() {
  const json = jest.fn();
  const status = jest.fn((_code: number) => ({ json }));
  const res = { json, status } as unknown as Response;
  return { res, json, status };
}

const validBody = {
  name: 'Omar',
  email: 'omar@example.com',
  phone: '+61 400 000 000',
  businessType: 'Restaurant',
  businessName: 'Barakah Eats',
  message: 'We would like to sponsor an ISR event.',
};

const requiredError =
  'name, email, phone, businessType, businessName, and message are all required';

beforeEach(() => {
  process.env.RESEND_API_KEY = 're_test';
  process.env.RESEND_FROM_ADDRESS = 'noreply@example.com';
});

afterEach(() => {
  jest.clearAllMocks();
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM_ADDRESS;
});

test('sendSponsorshipEnquiry returns 500 when email service is not configured', async () => {
  delete process.env.RESEND_API_KEY;

  const req = { body: validBody } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendSponsorshipEnquiry(req, res);

  expect(status).toHaveBeenCalledWith(500);
  expect(json).toHaveBeenCalledWith({ error: 'Email service not configured' });
  expect(mockSend).not.toHaveBeenCalled();
});

test('sendSponsorshipEnquiry returns 400 when a required field is missing', async () => {
  const { businessName, ...rest } = validBody;
  const req = { body: rest } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendSponsorshipEnquiry(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({ error: requiredError });
  expect(mockSend).not.toHaveBeenCalled();
});

test('sendSponsorshipEnquiry returns 400 when a field is only whitespace', async () => {
  const req = { body: { ...validBody, message: '   ' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendSponsorshipEnquiry(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({ error: requiredError });
  expect(mockSend).not.toHaveBeenCalled();
});

test('sendSponsorshipEnquiry returns 400 for invalid email', async () => {
  const req = { body: { ...validBody, email: 'not-an-email' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendSponsorshipEnquiry(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({ error: 'Invalid email address' });
  expect(mockSend).not.toHaveBeenCalled();
});

test('sendSponsorshipEnquiry returns 400 for invalid phone number', async () => {
  const req = { body: { ...validBody, phone: 'call me' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendSponsorshipEnquiry(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({ error: 'Invalid phone number' });
  expect(mockSend).not.toHaveBeenCalled();
});

test('sendSponsorshipEnquiry returns 200 when inbound send succeeds', async () => {
  mockSend
    .mockResolvedValueOnce({ data: { id: 'inbound' }, error: null })
    .mockResolvedValueOnce({ data: { id: 'confirm' }, error: null });

  const req = { body: validBody } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendSponsorshipEnquiry(req, res);

  expect(mockSend).toHaveBeenCalledTimes(2);
  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ success: true });
});

test('sendSponsorshipEnquiry emails ISR with the business details and replies to the sender', async () => {
  mockSend
    .mockResolvedValueOnce({ data: { id: 'inbound' }, error: null })
    .mockResolvedValueOnce({ data: { id: 'confirm' }, error: null });

  const req = { body: validBody } as unknown as Request;
  const { res } = mockRes();

  await sendSponsorshipEnquiry(req, res);

  const inbound = mockSend.mock.calls[0][0];
  expect(inbound.to).toEqual(['isr@rmit.edu.au']);
  expect(inbound.replyTo).toBe(validBody.email);
  expect(inbound.subject).toBe('[Sponsorship] Barakah Eats');
  expect(inbound.html).toContain('Barakah Eats');
  expect(inbound.html).toContain('Restaurant');
  expect(inbound.html).toContain('+61 400 000 000');

  const confirmation = mockSend.mock.calls[1][0];
  expect(confirmation.to).toEqual([validBody.email]);
});

test('sendSponsorshipEnquiry escapes HTML in submitted values', async () => {
  mockSend
    .mockResolvedValueOnce({ data: { id: 'inbound' }, error: null })
    .mockResolvedValueOnce({ data: { id: 'confirm' }, error: null });

  const req = {
    body: { ...validBody, message: '<script>alert(1)</script>' },
  } as unknown as Request;
  const { res } = mockRes();

  await sendSponsorshipEnquiry(req, res);

  const inbound = mockSend.mock.calls[0][0];
  expect(inbound.html).not.toContain('<script>');
  expect(inbound.html).toContain('&lt;script&gt;');
});

test('sendSponsorshipEnquiry still returns 200 when confirmation send fails', async () => {
  mockSend
    .mockResolvedValueOnce({ data: { id: 'inbound' }, error: null })
    .mockResolvedValueOnce({ data: null, error: { message: 'bounce' } });

  const req = { body: validBody } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendSponsorshipEnquiry(req, res);

  expect(status).toHaveBeenCalledWith(200);
  expect(json).toHaveBeenCalledWith({ success: true });
});

test('sendSponsorshipEnquiry returns 502 when inbound send errors', async () => {
  mockSend
    .mockResolvedValueOnce({ data: null, error: { message: 'rate limit' } })
    .mockResolvedValueOnce({ data: { id: 'confirm' }, error: null });

  const req = { body: validBody } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendSponsorshipEnquiry(req, res);

  expect(status).toHaveBeenCalledWith(502);
  expect(json).toHaveBeenCalledWith({ error: 'Failed to send email' });
});

test('sendSponsorshipEnquiry returns 502 when Resend throws', async () => {
  mockSend.mockRejectedValue(new Error('network'));

  const req = { body: validBody } as unknown as Request;
  const { res, json, status } = mockRes();

  await sendSponsorshipEnquiry(req, res);

  expect(status).toHaveBeenCalledWith(502);
  expect(json).toHaveBeenCalledWith({ error: 'Failed to send email' });
});
