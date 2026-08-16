export const aladhanTimingsPayload = {
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
  },
};

export const aladhanCalendarPayload = {
  data: [aladhanTimingsPayload.data],
};

export const weatherPayload = {
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

export const sampleEvents = [
  {
    name: 'Welcome BBQ',
    date: new Date('2099-03-15T07:00:00.000Z'),
    description: 'Kick off the semester with food and community.',
    imageUrl: 'https://example.com/images/welcome-bbq.jpg',
    ticketUrl: 'https://example.com/tickets/welcome-bbq',
  },
  {
    name: 'Eid Dinner',
    date: new Date('2020-05-01T08:00:00.000Z'),
    description: 'A past celebration with the ISR community.',
    imageUrl: 'https://example.com/images/eid-dinner.jpg',
    ticketUrl: null as string | null,
  },
];

// A multi-day event that is running right now, and an open-ended weekly one whose first
// occurrence is long past — both must still count as upcoming.
export const runningMultiDayEvent = {
  name: 'Islam Awareness Week',
  date: new Date(Date.now() - 24 * 60 * 60 * 1000),
  endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  description: 'A week of stalls and talks across campus.',
  imageUrl: 'https://example.com/images/iaw.jpg',
  ticketUrl: null as string | null,
};

export const weeklyRecurringEvent = {
  name: 'Weekly Halaqa',
  date: new Date('2020-01-06T07:00:00.000Z'),
  description: 'Every Monday evening in the prayer room.',
  imageUrl: 'https://example.com/images/halaqa.jpg',
  ticketUrl: null as string | null,
  recurrenceFrequency: 'WEEKLY' as const,
  recurrenceInterval: 1,
};

export const sampleAnnouncements = [
  {
    title: 'Welcome to ISR!',
    body: 'Stay tuned for upcoming events, prayer times, and community updates.',
    pinned: true,
    imageUrl: null as string | null,
  },
  {
    title: 'Friday Prayer Location Update',
    body: "Jumu'ah this week will be held in Building 8.",
    pinned: false,
    imageUrl: null as string | null,
  },
];
