'use client'

import { useEffect, useState } from 'react'

type Props = {
  start: string
  end: string
}

type Remaining = { days: number; hours: number; minutes: number; seconds: number }

function remaining(target: number, now: number): Remaining {
  const total = Math.max(0, Math.floor((target - now) / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

/**
 * Counts down to the event start, then shows "happening now" and
 * "thank you" states — so the page updates itself without a redeploy.
 */
export default function Countdown({ start, end }: Props) {
  // null until mounted: the page is statically exported, so the time must
  // only be read in the browser to avoid a hydration mismatch.
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()

  if (now !== null && now >= endMs) {
    return (
      <p className="text-lg font-semibold">
        Jazakum Allahu khayran to everyone who joined us.
      </p>
    )
  }

  if (now !== null && now >= startMs) {
    return (
      <p className="inline-flex items-center gap-2 text-lg font-semibold">
        <span className="h-2.5 w-2.5 rounded-full bg-(--su-primary) motion-safe:animate-pulse" />
        Happening now
      </p>
    )
  }

  const parts = now === null ? null : remaining(startMs, now)
  const units: [keyof Remaining, string][] = [
    ['days', 'Days'],
    ['hours', 'Hours'],
    ['minutes', 'Mins'],
    ['seconds', 'Secs'],
  ]

  return (
    <div className="grid max-w-md grid-cols-4 gap-2 sm:gap-3" role="timer" aria-label="Time until the event">
      {units.map(([key, label]) => (
        <div
          key={key}
          className="rounded-xl border border-current/20 bg-current/10 px-2 py-3 text-center backdrop-blur-sm"
        >
          <span className="block text-2xl font-bold tabular-nums sm:text-3xl">
            {parts ? String(parts[key]).padStart(2, '0') : '--'}
          </span>
          <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.2em] opacity-75">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
