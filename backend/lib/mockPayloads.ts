/** Deterministic payloads used when MOCK_EXTERNALS=1 (e2e / local offline). */

export const mockAladhanTimings = {
  timings: {
    Fajr: '06:02',
    Sunrise: '07:36',
    Dhuhr: '12:22',
    Asr: '14:51',
    Sunset: '17:09',
    Maghrib: '17:09',
    Isha: '18:38',
  },
  date: {
    readable: '06 Aug 2026',
    timestamp: '1785974400',
    hijri: {
      date: '12-02-1448',
      day: '12',
      month: { number: 2, en: 'Ṣafar' },
      year: '1448',
    },
    gregorian: {
      date: '06-08-2026',
      month: { number: 8, en: 'August' },
      year: '2026',
    },
  },
  meta: {
    latitude: -37.8136,
    longitude: 144.9631,
    timezone: 'Australia/Melbourne',
    method: { id: 3 },
  },
};

export const mockWeather = {
  location: {
    name: 'Melbourne',
    region: 'Victoria',
    country: 'Australia',
    localtime: '2026-08-06 12:00',
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

export function shouldMockExternals(): boolean {
  return process.env.MOCK_EXTERNALS === '1';
}
