import { API_BASE_URL } from '@/lib/api'

export const DAILY_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

export type DailyPrayer = (typeof DAILY_PRAYERS)[number]

export type PrayerTimesData = {
  timings: Record<string, string>
  date: {
    readable: string
    hijri?: {
      day: string
      month: { en: string }
      year: string
    }
  }
  meta: {
    timezone: string
  }
}

export type PrayerTimesResponse = {
  data: PrayerTimesData
}

const TIMEZONE = 'Australia/Melbourne'

export const NO_IQAMAH = '--:--'

const IQAMAH_OFFSET_MINUTES: Record<DailyPrayer, number | null> = {
  Fajr: null,
  Dhuhr: 10,
  Asr: 10,
  Maghrib: 10,
  Isha: null,
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function getIqamahTime(prayer: DailyPrayer, athaan: string | undefined): string {
  const offset = IQAMAH_OFFSET_MINUTES[prayer]
  if (offset === null || !athaan) return NO_IQAMAH

  const match = athaan.match(/^\s*(\d{1,2}):(\d{2})/)
  if (!match) return NO_IQAMAH

  const total = (Number(match[1]) * 60 + Number(match[2]) + offset) % (24 * 60)
  const hours = String(Math.floor(total / 60)).padStart(2, '0')
  const minutes = String(total % 60).padStart(2, '0')

  return `${hours}:${minutes}`
}

function currentMinutesInMelbourne(): number {
  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(new Date())
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0)

  return hour * 60 + minute
}

export async function fetchPrayerTimes(): Promise<PrayerTimesData> {
  const response = await fetch(`${API_BASE_URL}/api/prayer-times`)

  if (!response.ok) {
    throw new Error('Failed to fetch prayer times')
  }

  const json = (await response.json()) as PrayerTimesResponse
  return json.data
}

export function getNextPrayer(timings: Record<string, string>): DailyPrayer {
  const nowMinutes = currentMinutesInMelbourne()

  for (const prayer of DAILY_PRAYERS) {
    if (parseTimeToMinutes(timings[prayer]) > nowMinutes) {
      return prayer
    }
  }

  return 'Fajr'
}
