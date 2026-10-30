import './env';
import { afterAll, afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../app';
import { disconnectPrisma, resetDatabase, seedFlagshipEvent } from './helpers';

const app = createApp();

const sampleFlagshipEvent = {
  slug: 'sample-flagship',
  name: 'Sample Flagship Event',
  tagline: 'Tagline',
  description: 'Description',
  phase: 'save-the-date',
  featuredOnHome: true,
  released: false,
  start: new Date('2099-11-28T13:30:00.000Z'),
  end: new Date('2099-11-28T19:30:00.000Z'),
  dateLabel: 'Saturday 28 November 2099',
  timeLabel: '1:30 pm – 7:30 pm',
  venue: { name: 'Hall', address: 'Address', mapUrl: '', notes: [] },
  banner: { src: 'https://example.com/banner.webp', alt: 'alt', width: 1600, height: 900 },
  ogImage: 'https://example.com/og.png',
  theme: {
    dark: '#000',
    onDark: '#fff',
    light: '#fff',
    onLight: '#000',
    primary: '#000',
    onPrimary: '#fff',
    accent: '#000',
    hero: { backdrop: 'https://example.com/backdrop.webp', background: '', text: '#000', heading: '#000' },
  },
};

beforeEach(async () => {
  await resetDatabase();
});

afterEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnectPrisma();
});

describe('GET /api/flagship-events', () => {
  test('returns an empty list when there are none', async () => {
    const res = await request(app).get('/api/flagship-events');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [] });
  });

  test('returns every flagship event, released or not', async () => {
    await seedFlagshipEvent(sampleFlagshipEvent);

    const res = await request(app).get('/api/flagship-events');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ slug: 'sample-flagship', released: false });
  });
});

describe('GET /api/flagship-events/:slug', () => {
  test('returns a single flagship event', async () => {
    const event = await seedFlagshipEvent(sampleFlagshipEvent);

    const res = await request(app).get(`/api/flagship-events/${event.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: event.id, slug: event.slug, name: event.name });
  });

  test('returns 404 when the slug does not exist', async () => {
    const res = await request(app).get('/api/flagship-events/missing');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Flagship event not found' });
  });
});

describe('POST /api/flagship-events (auth)', () => {
  test('rejects unauthenticated create requests', async () => {
    const res = await request(app).post('/api/flagship-events').send(sampleFlagshipEvent);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  test('does not write to the database when unauthenticated', async () => {
    await request(app).post('/api/flagship-events').send(sampleFlagshipEvent);

    const res = await request(app).get('/api/flagship-events');
    expect(res.body.data).toEqual([]);
  });

  test('rejects a malformed Authorization header', async () => {
    const res = await request(app)
      .post('/api/flagship-events')
      .set('Authorization', 'token-without-bearer-prefix')
      .send(sampleFlagshipEvent);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });
});

describe('POST /api/flagship-events/upload-image (auth)', () => {
  test('rejects unauthenticated upload requests', async () => {
    const res = await request(app)
      .post('/api/flagship-events/upload-image')
      .attach('image', Buffer.from('fake'), 'a.webp');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });
});

describe('PUT /api/flagship-events/:id (auth)', () => {
  test('rejects unauthenticated update requests', async () => {
    const event = await seedFlagshipEvent(sampleFlagshipEvent);

    const res = await request(app)
      .put(`/api/flagship-events/${event.id}`)
      .send({ name: 'Hijacked' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  test('leaves the event unchanged when unauthenticated', async () => {
    const event = await seedFlagshipEvent(sampleFlagshipEvent);

    await request(app).put(`/api/flagship-events/${event.id}`).send({ name: 'Hijacked', released: true });

    const res = await request(app).get(`/api/flagship-events/${event.slug}`);
    expect(res.body.data.name).toBe(event.name);
    expect(res.body.data.released).toBe(false);
  });

  test('rejects before validating the id, so a bad id still returns 401', async () => {
    const res = await request(app).put('/api/flagship-events/abc').send({ name: 'Hijacked' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });
});

describe('DELETE /api/flagship-events/:id (auth)', () => {
  test('rejects unauthenticated delete requests', async () => {
    const event = await seedFlagshipEvent(sampleFlagshipEvent);

    const res = await request(app).delete(`/api/flagship-events/${event.id}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  test('leaves the event in place when unauthenticated', async () => {
    const event = await seedFlagshipEvent(sampleFlagshipEvent);

    await request(app).delete(`/api/flagship-events/${event.id}`);

    const res = await request(app).get(`/api/flagship-events/${event.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(event.id);
  });

  test('rejects before checking existence, so a missing id still returns 401', async () => {
    const res = await request(app).delete('/api/flagship-events/99999');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });
});
