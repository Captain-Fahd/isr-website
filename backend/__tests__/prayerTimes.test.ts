import {
  getTodayPrayerTimes,
  getPrayerTimesByDate,
  getMonthlyCalendar,
} from '../controllers/prayerTimesController';
import { Request, Response } from 'express';
import { test, expect, jest, afterEach } from '@jest/globals';

// A representative Aladhan timings payload. Includes the timing keys the
// controller is supposed to strip (Imsak/Midnight/Firstthird/Lastthird) plus the
// extra date/meta fields the real API returns, so the test exercises filtering
// without depending on the live network.
const aladhanResponse = {
  data: {
    timings: {
      Fajr: '06:02',
      Sunrise: '07:36',
      Dhuhr: '12:22',
      Asr: '14:51',
      Sunset: '17:09',
      Maghrib: '17:09',
      Isha: '18:38',
      Imsak: '05:52',
      Midnight: '00:22',
      Firstthird: '21:18',
      Lastthird: '03:25',
    },
    date: {
      readable: '23 Jun 2026',
      timestamp: '1782162000',
      hijri: {
        date: '08-01-1448',
        day: '8',
        month: { number: 1, en: 'Muḥarram' },
        year: '1448',
      },
      gregorian: {
        date: '23-06-2026',
        month: { number: 6, en: 'June' },
        year: '2026',
      },
    },
    meta: {
      timezone: 'Australia/Melbourne',
      method: { id: 3, name: 'Muslim World League' },
    },
  },
};

const expectedTimings = {
  Fajr: '06:02',
  Sunrise: '07:36',
  Dhuhr: '12:22',
  Asr: '14:51',
  Sunset: '17:09',
  Maghrib: '17:09',
  Isha: '18:38',
};

function mockRes() {
  const json = jest.fn();
  const status = jest.fn((_code: number) => ({ json }));
  const res = { json, status } as unknown as Response;
  return { res, json, status };
}

function mockOkFetch(payload: unknown = aladhanResponse) {
  global.fetch = jest.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => payload,
  })) as unknown as typeof fetch;
}

afterEach(() => {
  jest.restoreAllMocks();
});

test('getPrayerTimesByDate returns filtered prayer times for a valid date', async () => {
  const req = { params: { date: '23-06-2026' } } as unknown as Request;
  const { res, json } = mockRes();
  mockOkFetch();

  const data = await getPrayerTimesByDate(req, res);

  expect(json).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ timings: expectedTimings }),
    }),
  );

  const jsonArg = (json as any).mock.calls[0][0];
  expect(jsonArg.data.timings).not.toHaveProperty('Imsak');
  expect(jsonArg.data.timings).not.toHaveProperty('Midnight');
  expect(jsonArg.data.timings).not.toHaveProperty('Firstthird');
  expect(jsonArg.data.timings).not.toHaveProperty('Lastthird');

  expect(data).toEqual(expect.objectContaining({ timings: expectedTimings }));
});

test('getPrayerTimesByDate rejects an invalid date format with 400', async () => {
  const req = { params: { date: '2026-06-23' } } as unknown as Request;
  const { res, json, status } = mockRes();

  const fetchSpy = jest.fn();
  global.fetch = fetchSpy as unknown as typeof fetch;

  await getPrayerTimesByDate(req, res);

  expect(status).toHaveBeenCalledWith(400);
  expect(json).toHaveBeenCalledWith({ error: 'Date must be in DD-MM-YYYY format' });
  expect(fetchSpy).not.toHaveBeenCalled();
});

test('getPrayerTimesByDate returns 502 when upstream fetch fails', async () => {
  const req = { params: { date: '23-06-2026' } } as unknown as Request;
  const { res, json, status } = mockRes();

  global.fetch = jest.fn(async () => ({
    ok: false,
    status: 500,
    json: async () => ({}),
  })) as unknown as typeof fetch;

  await getPrayerTimesByDate(req, res);

  expect(status).toHaveBeenCalledWith(502);
  expect(json).toHaveBeenCalledWith({ error: 'Failed to fetch prayer times' });
});

test('getTodayPrayerTimes returns filtered prayer times', async () => {
  const { res, json } = mockRes();
  mockOkFetch();

  const data = await getTodayPrayerTimes({} as Request, res);

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringMatching(/\/timings\/\d{2}-\d{2}-\d{4}\?/),
  );
  expect(json).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ timings: expectedTimings }),
    }),
  );
  expect(data).toEqual(expect.objectContaining({ timings: expectedTimings }));
});

test('getTodayPrayerTimes returns 502 when fetch throws', async () => {
  const { res, json, status } = mockRes();

  global.fetch = jest.fn(async () => {
    throw new Error('network');
  }) as unknown as typeof fetch;

  await getTodayPrayerTimes({} as Request, res);

  expect(status).toHaveBeenCalledWith(502);
  expect(json).toHaveBeenCalledWith({ error: 'Failed to fetch prayer times' });
});

test('getMonthlyCalendar returns filtered calendar for explicit year/month', async () => {
  const calendarPayload = {
    data: [aladhanResponse.data, aladhanResponse.data],
  };
  mockOkFetch(calendarPayload);

  const req = { query: { year: '2026', month: '6' } } as unknown as Request;
  const { res, json } = mockRes();

  await getMonthlyCalendar(req, res);

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/calendar/2026/6?'),
  );
  expect(json).toHaveBeenCalledWith({
    data: [
      expect.objectContaining({ timings: expectedTimings }),
      expect.objectContaining({ timings: expectedTimings }),
    ],
  });
});

test('getMonthlyCalendar defaults to Melbourne year/month when query omitted', async () => {
  mockOkFetch({ data: [aladhanResponse.data] });

  const melbourneParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Australia/Melbourne',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(new Date());
  const year = melbourneParts.find((p) => p.type === 'year')?.value;
  const month = Number(melbourneParts.find((p) => p.type === 'month')?.value);

  const req = { query: {} } as unknown as Request;
  const { res, json } = mockRes();

  await getMonthlyCalendar(req, res);

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining(`/calendar/${year}/${month}?`),
  );
  expect(json).toHaveBeenCalledWith({
    data: [expect.objectContaining({ timings: expectedTimings })],
  });
});

test('getMonthlyCalendar returns 502 when upstream fails', async () => {
  global.fetch = jest.fn(async () => ({
    ok: false,
    status: 502,
    json: async () => ({}),
  })) as unknown as typeof fetch;

  const req = { query: { year: '2026', month: '6' } } as unknown as Request;
  const { res, json, status } = mockRes();

  await getMonthlyCalendar(req, res);

  expect(status).toHaveBeenCalledWith(502);
  expect(json).toHaveBeenCalledWith({ error: 'Failed to fetch prayer calendar' });
});
