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

  test('does not write to the database when unauthenticated', async () => {
    await request(app)
      .post('/api/events')
      .field('name', 'Unauthorized Event')
      .field('date', '2099-01-01T00:00:00.000Z')
      .field('description', 'Should not be created');

    const res = await request(app).get('/api/events');
    expect(res.body.data).toEqual([]);
  });

  test('rejects a malformed Authorization header', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', 'token-without-bearer-prefix')
      .field('name', 'Unauthorized Event')
      .field('date', '2099-01-01T00:00:00.000Z')
      .field('description', 'Should not be created');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });
});

describe('PUT /api/events/:id (auth)', () => {
  test('rejects unauthenticated update requests', async () => {
    const { events } = await seedPublicData();

    const res = await request(app)
      .put(`/api/events/${events[0].id}`)
      .field('name', 'Hijacked Event');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  test('leaves the event unchanged when unauthenticated', async () => {
    const { events } = await seedPublicData();
    const target = events[0];

    await request(app).put(`/api/events/${target.id}`).field('name', 'Hijacked Event');

    const res = await request(app).get(`/api/events/${target.id}`);
    expect(res.body.data.name).toBe(target.name);
  });

  test('rejects before validating the id, so a bad id still returns 401', async () => {
    // checkAuth runs ahead of the controller; an unauthenticated caller must not
    // be able to probe which ids are valid.
    const res = await request(app).put('/api/events/abc').field('name', 'Hijacked Event');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });
});

describe('DELETE /api/events/:id (auth)', () => {
  test('rejects unauthenticated delete requests', async () => {
    const { events } = await seedPublicData();

    const res = await request(app).delete(`/api/events/${events[0].id}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  test('leaves the event in place when unauthenticated', async () => {
    const { events } = await seedPublicData();
    const target = events[0];

    await request(app).delete(`/api/events/${target.id}`);

    const res = await request(app).get(`/api/events/${target.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(target.id);
  });

  test('rejects before checking existence, so a missing id still returns 401', async () => {
    const res = await request(app).delete('/api/events/99999');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });
});
