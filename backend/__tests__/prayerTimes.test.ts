import { getPrayerTimesByDate } from '../controllers/prayerTimesController';
import { Request, Response } from 'express';
import { test, expect, jest, afterEach } from '@jest/globals';

// A representative Aladhan timingsByCity payload. Includes the timing keys the
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
            Lastthird: '03:25'
        },
        date: {
            readable: '23 Jun 2026',
            timestamp: '1782162000',
            hijri: { date: '08-01-1448', day: '8', month: { number: 1, en: 'Muḥarram' }, year: '1448' },
            gregorian: { date: '23-06-2026', month: { number: 6, en: 'June' }, year: '2026' }
        },
        meta: {
            timezone: 'Australia/Melbourne',
            method: { id: 3, name: 'Muslim World League' }
        }
    }
};

afterEach(() => {
    jest.restoreAllMocks();
});

test('returns filtered prayer times for a valid date', async () => {
    const req = { params: { date: '23-06-2026' } } as unknown as Request;
    const res = { json: jest.fn(), status: jest.fn() } as unknown as Response;

    global.fetch = jest.fn(async () => ({
        ok: true,
        json: async () => aladhanResponse
    })) as unknown as typeof fetch;

    const data = await getPrayerTimesByDate(req, res);

    const expectedTimings = {
        Fajr: '06:02',
        Sunrise: '07:36',
        Dhuhr: '12:22',
        Asr: '14:51',
        Sunset: '17:09',
        Maghrib: '17:09',
        Isha: '18:38'
    };

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            data: expect.objectContaining({ timings: expectedTimings })
        })
    );

    const jsonArg = (res.json as any).mock.calls[0][0];
    expect(jsonArg.data.timings).not.toHaveProperty('Imsak');
    expect(jsonArg.data.timings).not.toHaveProperty('Midnight');
    expect(jsonArg.data.timings).not.toHaveProperty('Firstthird');
    expect(jsonArg.data.timings).not.toHaveProperty('Lastthird');

    expect(data).toEqual(expect.objectContaining({ timings: expectedTimings }));
});

test('rejects an invalid date format with 400', async () => {
    const req = { params: { date: '2026-06-23' } } as unknown as Request;
    const json = jest.fn();
    const status = jest.fn(() => ({ json })) as any;
    const res = { json, status } as unknown as Response;

    const fetchSpy = jest.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    await getPrayerTimesByDate(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(fetchSpy).not.toHaveBeenCalled();
});
