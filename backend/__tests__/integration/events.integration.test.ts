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

describe('GET /api/events', () => {
  test('returns an empty list when there are no events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [] });
  });

  test('returns upcoming events before past events', async () => {
    const { events } = await seedPublicData();
    const upcoming = events.find((e) => e.name === 'Welcome BBQ')!;
    const past = events.find((e) => e.name === 'Eid Dinner')!;

    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].id).toBe(upcoming.id);
    expect(res.body.data[1].id).toBe(past.id);
  });

  test('filters upcoming events', async () => {
    await seedPublicData();

    const res = await request(app).get('/api/events').query({ filter: 'upcoming' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Welcome BBQ');
  });

  test('filters past events', async () => {
    await seedPublicData();

    const res = await request(app).get('/api/events').query({ filter: 'past' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Eid Dinner');
  });
});

describe('GET /api/events/:id', () => {
  test('returns a single event', async () => {
    const { events } = await seedPublicData();
    const target = events[0];

    const res = await request(app).get(`/api/events/${target.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: target.id,
      name: target.name,
      description: target.description,
      imageUrl: target.imageUrl,
    });
  });

  test('returns 404 when the event does not exist', async () => {
    const res = await request(app).get('/api/events/99999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Event not found' });
  });

  test('returns 400 for a non-integer id', async () => {
    const res = await request(app).get('/api/events/abc');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid event id' });
  });
});

describe('POST /api/events (auth)', () => {
  test('rejects unauthenticated create requests', async () => {
    const res = await request(app)
      .post('/api/events')
      .field('name', 'Unauthorized Event')
      .field('date', '2099-01-01T00:00:00.000Z')
      .field('description', 'Should not be created');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });
});
