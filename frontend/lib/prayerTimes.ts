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

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
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

export function getNextPrayer(timings: Record<string, string>): DailyPrayer {
  const nowMinutes = currentMinutesInMelbourne()

  for (const prayer of DAILY_PRAYERS) {
    if (parseTimeToMinutes(timings[prayer]) > nowMinutes) {
      return prayer
    }
  }

  return 'Fajr'
}
