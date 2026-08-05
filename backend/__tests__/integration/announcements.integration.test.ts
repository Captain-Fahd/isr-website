import './env';
import { afterAll, afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../app';
import { disconnectPrisma, resetDatabase, seedPublicData } from './helpers';

const app = createApp();

beforeEach(async () => {
  await resetDatabase();
});

afterEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnectPrisma();
});

describe('GET /api/announcements', () => {
  test('returns an empty list when there are no announcements', async () => {
    const res = await request(app).get('/api/announcements');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [] });
  });

  test('returns pinned announcements first', async () => {
    await seedPublicData();

    const res = await request(app).get('/api/announcements');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].title).toBe('Welcome to ISR!');
    expect(res.body.data[0].pinned).toBe(true);
    expect(res.body.data[1].title).toBe('Friday Prayer Location Update');
    expect(res.body.data[1].pinned).toBe(false);
  });
});

describe('GET /api/announcements/:id', () => {
  test('returns a single announcement', async () => {
    const { announcements } = await seedPublicData();
    const target = announcements[0];

    const res = await request(app).get(`/api/announcements/${target.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: target.id,
      title: target.title,
      body: target.body,
      pinned: target.pinned,
    });
  });

  test('returns 404 when the announcement does not exist', async () => {
    const res = await request(app).get('/api/announcements/99999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Announcement not found' });
  });

  test('returns 400 for a non-integer id', async () => {
    const res = await request(app).get('/api/announcements/abc');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid announcement id' });
  });
});

describe('POST /api/announcements (auth)', () => {
  test('rejects unauthenticated create requests', async () => {
    const res = await request(app)
      .post('/api/announcements')
      .field('title', 'Nope')
      .field('body', 'Should not be created');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });
});
