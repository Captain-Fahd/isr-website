import { Request, Response } from 'express';

const ALADHAN_BASE = 'https://api.aladhan.com/v1';
const CITY = 'Melbourne';
const COUNTRY = 'Australia';
const METHOD = 3; // Muslim World League

const OMIT_TIMINGS = new Set(['Imsak', 'Midnight', 'Firstthird', 'Lastthird']);

type ApiData = { timings: Record<string, string>; date: unknown; meta: unknown };

function filterTimings(data: ApiData): ApiData {
  const timings = Object.fromEntries(
    Object.entries(data.timings).filter(([key]) => !OMIT_TIMINGS.has(key))
  );
  return { ...data, timings };
}

function todayDDMMYYYY(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

async function fetchTimings(date: string) {
  const url = `${ALADHAN_BASE}/timingsByCity/${date}?city=${CITY}&country=${COUNTRY}&method=${METHOD}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`AlAdhan API responded with ${res.status}`);
  const json = await res.json() as { data: ApiData };
  return filterTimings(json.data);
}

export async function getTodayPrayerTimes(_req: Request, res: Response) {
  try {
    const data = await fetchTimings(todayDDMMYYYY());
    res.json({ data });
    return data;
  } catch {
    res.status(502).json({ error: 'Failed to fetch prayer times' });
  }
}

export async function getPrayerTimesByDate(req: Request, res: Response) {
  const date = String(req.params['date']);
  if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    res.status(400).json({ error: 'Date must be in DD-MM-YYYY format' });
    return;
  }
  try {
    const data = await fetchTimings(date);
    res.json({ data });
    return data;
  } catch {
    res.status(502).json({ error: 'Failed to fetch prayer times' });
  }
}

export async function getMonthlyCalendar(req: Request, res: Response) {
  const now = new Date();
  const year = Number(req.query.year) || now.getFullYear();
  const month = Number(req.query.month) || now.getMonth() + 1;

  try {
    const url = `${ALADHAN_BASE}/calendarByCity/${year}/${month}?city=${CITY}&country=${COUNTRY}&method=${METHOD}`;
    const apiRes = await fetch(url);
    if (!apiRes.ok) throw new Error(`AlAdhan API responded with ${apiRes.status}`);
    const json = await apiRes.json() as { data: ApiData[] };
    res.json({ data: json.data.map(filterTimings) });
  } catch {
    res.status(502).json({ error: 'Failed to fetch prayer calendar' });
  }
}