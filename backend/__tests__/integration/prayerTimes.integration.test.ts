import './env';
import { afterAll, afterEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../app';
import { aladhanCalendarPayload, aladhanTimingsPayload } from '../../test/fixtures';
import { disconnectPrisma } from './helpers';

const app = createApp();

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await disconnectPrisma();
});

describe('GET /api/prayer-times', () => {
  test('returns today timings from the Aladhan mock', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => aladhanTimingsPayload,
    } as Response);

    const res = await request(app).get('/api/prayer-times');
    expect(res.status).toBe(200);
    expect(res.body.data.timings).toMatchObject({
      Fajr: '06:02',
      Dhuhr: '12:22',
      Asr: '14:51',
      Maghrib: '17:09',
      Isha: '18:38',
    });
    expect(res.body.data.timings.Imsak).toBeUndefined();
  });

  test('returns 502 when Aladhan is unavailable', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
    } as Response);

    const res = await request(app).get('/api/prayer-times');
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'Failed to fetch prayer times' });
  });
});

describe('GET /api/prayer-times/:date', () => {
  test('returns 400 for an invalid date format', async () => {
    const res = await request(app).get('/api/prayer-times/2026-08-06');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Date must be in DD-MM-YYYY format' });
  });

  test('returns timings for a valid date', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => aladhanTimingsPayload,
    } as Response);

    const res = await request(app).get('/api/prayer-times/06-08-2026');
    expect(res.status).toBe(200);
    expect(res.body.data.timings.Fajr).toBe('06:02');
  });
});

describe('GET /api/prayer-times/calendar', () => {
  test('returns a monthly calendar payload', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => aladhanCalendarPayload,
    } as Response);

    const res = await request(app)
      .get('/api/prayer-times/calendar')
      .query({ year: 2026, month: 8 });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].timings.Dhuhr).toBe('12:22');
  });
});
