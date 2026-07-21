"use client"

import { useCallback, useEffect, useState } from 'react'
import { API_BASE_URL } from '@/lib/api'
import {
  DAILY_PRAYERS,
  getNextPrayer,
  type DailyPrayer,
  type PrayerTimesData,
} from '@/lib/prayerTimes'

function formatHijriDate(date: PrayerTimesData['date']): string | null {
  if (!date.hijri) return null
  return `${date.hijri.day} ${date.hijri.month.en} ${date.hijri.year} AH`
}

export default function PrayerTimesTable() {
  const [data, setData] = useState<PrayerTimesData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [nextPrayer, setNextPrayer] = useState<DailyPrayer>('Fajr')

  const loadPrayerTimes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/prayer-times`)
      if (!response.ok) throw new Error('Failed to fetch prayer times')

      const json = (await response.json()) as { data: PrayerTimesData }
      setData(json.data)
      setNextPrayer(getNextPrayer(json.data.timings))
    } catch {
      setData(null)
      setError('Unable to load prayer times right now.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPrayerTimes()
  }, [loadPrayerTimes])

  useEffect(() => {
    if (!data) return

    const updateNextPrayer = () => {
      setNextPrayer(getNextPrayer(data.timings))
    }

    updateNextPrayer()
    const intervalId = window.setInterval(updateNextPrayer, 60_000)

    return () => window.clearInterval(intervalId)
  }, [data])

  const hijriDate = data ? formatHijriDate(data.date) : null

  return (
    <div className="rounded-2xl bg-white/85 p-6 shadow-[0_16px_36px_rgba(91,11,5,0.08)] ring-1 ring-black/5 backdrop-blur-sm sm:p-8">
      <div className="mb-6 border-b border-isr-light-blue/30 pb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-isr-turquoise">
          Today&apos;s Prayer Times
        </p>
        {data && (
          <>
            <h2 className="mt-2 text-2xl font-bold text-isr-dark-red">{data.date.readable}</h2>
            {hijriDate && <p className="mt-1 text-sm text-gray-600">{hijriDate}</p>}
            <p className="mt-1 text-xs text-gray-500">Melbourne · {data.meta.timezone}</p>
          </>
        )}
      </div>

      {loading && (
        <div className="space-y-3" aria-live="polite" aria-busy="true">
          {DAILY_PRAYERS.map((prayer) => (
            <div
              key={prayer}
              className="flex items-center justify-between rounded-lg bg-isr-cream/60 px-4 py-3"
            >
              <div className="h-4 w-20 animate-pulse rounded bg-isr-light-blue/40" />
              <div className="h-4 w-14 animate-pulse rounded bg-isr-light-blue/40" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-isr-bright-red/20 bg-isr-yellow/60 px-4 py-6 text-center">
          <p className="text-sm text-isr-dark-red">{error}</p>
          <button
            type="button"
            onClick={() => void loadPrayerTimes()}
            className="mt-4 text-sm font-semibold text-isr-turquoise underline-offset-2 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && data && (
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.16em] text-gray-500">
              <th className="pb-3 font-semibold">Prayer</th>
              <th className="pb-3 text-right font-semibold">Time</th>
            </tr>
          </thead>
          <tbody>
            {DAILY_PRAYERS.map((prayer) => {
              const isNext = prayer === nextPrayer
              const cellClass = isNext
                ? 'bg-isr-turquoise/15 py-3'
                : 'border-t border-isr-light-blue/20 py-3'

              return (
                <tr key={prayer}>
                  <td className={`${cellClass} pl-3 font-semibold text-isr-dark-red first:rounded-l-lg`}>
                    {prayer}
                    {isNext && (
                      <span className="ml-2 text-xs font-medium uppercase tracking-wide text-isr-turquoise">
                        Next
                      </span>
                    )}
                  </td>
                  <td className={`${cellClass} pr-3 text-right font-mono text-base text-gray-800 last:rounded-r-lg`}>
                    {data.timings[prayer]}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
