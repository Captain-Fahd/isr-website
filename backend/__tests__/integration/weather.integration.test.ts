import './env';
import { afterAll, afterEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../app';
import { weatherPayload } from '../../test/fixtures';
import { disconnectPrisma } from './helpers';

const app = createApp();

afterEach(() => {
  jest.restoreAllMocks();
  process.env.WEATHER_API_KEY = 'weather-integration-test';
});

afterAll(async () => {
  await disconnectPrisma();
});

describe('GET /api/weather', () => {
  test('returns Melbourne weather from the WeatherAPI mock', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => weatherPayload,
    } as Response);

    const res = await request(app).get('/api/weather');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      location: {
        name: 'Melbourne',
        region: 'Victoria',
        country: 'Australia',
      },
      current: {
        temp_c: 14.2,
        condition: { text: 'Partly cloudy' },
      },
    });
  });

  test('returns 500 when the weather API key is missing', async () => {
    delete process.env.WEATHER_API_KEY;

    const res = await request(app).get('/api/weather');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Weather API key not configured' });
  });

  test('returns 502 when WeatherAPI rejects the key', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);

    const res = await request(app).get('/api/weather');
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'Invalid Weather API key' });
  });

  test('returns 502 when WeatherAPI is unavailable', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network'));

    const res = await request(app).get('/api/weather');
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'Failed to fetch weather data' });
  });
});
