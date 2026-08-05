import { test, expect, jest, afterEach, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { getMelbourneWeather } from '../controllers/weatherController';

function mockRes() {
  const json = jest.fn();
  const status = jest.fn((_code: number) => ({ json }));
  const res = { json, status } as unknown as Response;
  return { res, json, status };
}

const weatherPayload = {
  location: {
    name: 'Melbourne',
    region: 'Victoria',
    country: 'Australia',
    localtime: '2026-06-19 12:00',
  },
  current: {
    temp_c: 14.2,
    feelslike_c: 13.0,
    humidity: 70,
    wind_kph: 15.1,
    wind_dir: 'S',
    condition: { text: 'Partly cloudy', icon: '//cdn.weatherapi.com/x.png', code: 1003 },
    uv: 3,
    vis_km: 10,
    precip_mm: 0,
  },
};

beforeEach(() => {
  process.env.WEATHER_API_KEY = 'test-key';
});

afterEach(() => {
  jest.restoreAllMocks();
  delete process.env.WEATHER_API_KEY;
});

test('getMelbourneWeather returns 500 when API key is missing', async () => {
  delete process.env.WEATHER_API_KEY;

  const { res, json, status } = mockRes();
  await getMelbourneWeather({} as Request, res);

  expect(status).toHaveBeenCalledWith(500);
  expect(json).toHaveBeenCalledWith({ error: 'Weather API key not configured' });
});

test('getMelbourneWeather returns shaped weather data on success', async () => {
  global.fetch = jest.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => weatherPayload,
  })) as unknown as typeof fetch;

  const { res, json } = mockRes();
  await getMelbourneWeather({} as Request, res);

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('key=test-key&q=Melbourne'),
  );
  expect(json).toHaveBeenCalledWith({
    data: {
      location: weatherPayload.location,
      current: weatherPayload.current,
    },
  });
});

test('getMelbourneWeather returns 502 when API key is invalid', async () => {
  global.fetch = jest.fn(async () => ({
    ok: false,
    status: 401,
    json: async () => ({}),
  })) as unknown as typeof fetch;

  const { res, json, status } = mockRes();
  await getMelbourneWeather({} as Request, res);

  expect(status).toHaveBeenCalledWith(502);
  expect(json).toHaveBeenCalledWith({ error: 'Invalid Weather API key' });
});

test('getMelbourneWeather returns 502 on non-ok upstream status', async () => {
  global.fetch = jest.fn(async () => ({
    ok: false,
    status: 503,
    json: async () => ({}),
  })) as unknown as typeof fetch;

  const { res, json, status } = mockRes();
  await getMelbourneWeather({} as Request, res);

  expect(status).toHaveBeenCalledWith(502);
  expect(json).toHaveBeenCalledWith({ error: 'Weather API responded with 503' });
});

test('getMelbourneWeather returns 502 when fetch throws', async () => {
  global.fetch = jest.fn(async () => {
    throw new Error('network down');
  }) as unknown as typeof fetch;

  const { res, json, status } = mockRes();
  await getMelbourneWeather({} as Request, res);

  expect(status).toHaveBeenCalledWith(502);
  expect(json).toHaveBeenCalledWith({ error: 'Failed to fetch weather data' });
});
