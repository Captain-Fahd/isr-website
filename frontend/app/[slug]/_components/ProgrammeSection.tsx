'use client'

import Image from 'next/image'
import { Playfair_Display } from 'next/font/google'
import { useFlagshipEvents } from '@/lib/flagship/live'
import type { FlagshipEvent, ProgrammeItem } from '@/lib/flagship/types'

const serif = Playfair_Display({ subsets: ['latin'], weight: ['600', '700', '800'], style: ['normal', 'italic'] })

type Props = {
  slug: string
  programme: ProgrammeItem[]
  dateLabel: string
  timeLabel: string
  venueName: string
  backdrop?: string
}

type Kind = 'session' | 'break' | 'milestone'

const BREAK_PATTERN = /\b(intermission|break|recess|prayer|salah|lunch|dinner|iftar|refreshments?)\b/i
const MILESTONE_PATTERN = /\b(doors? open|registration|arrivals?|event (ends|closes)|close|closing|finish)\b/i

/** Splits trailing "(…)" notes off a title, e.g. "Talk (Split Session)" → ["Talk", ["Split Session"]]. */
function splitTags(raw: string): { title: string; tags: string[] } {
  const tags: string[] = []
  let title = raw.trim()
  let match: RegExpMatchArray | null
  while ((match = title.match(/\s*\(([^()]+)\)\s*$/))) {
    tags.unshift(match[1].trim())
    title = title.slice(0, match.index).trim()
  }
  return { title: title || raw.trim(), tags }
}

function classify(title: string, tags: string[]): Kind {
  const text = [title, ...tags].join(' ')
  if (BREAK_PATTERN.test(text)) return 'break'
  if (MILESTONE_PATTERN.test(title)) return 'milestone'
  return 'session'
}

/** "1:30 pm" / "13:30" → minutes since midnight, or null if it can't be read. */
function toMinutes(time: string): number | null {
  const match = time.trim().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/i)
  if (!match) return null
  let hours = Number(match[1])
  const minutes = Number(match[2] ?? 0)
  const meridiem = match[3]?.toLowerCase()
  if (meridiem === 'pm' && hours < 12) hours += 12
  if (meridiem === 'am' && hours === 12) hours = 0
  return hours * 60 + minutes
}

function formatDuration(total: number): string {
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  if (hours === 0) return `${minutes} min`
  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`
}

// The poster's name plates: dark wine fading into crimson, square corners.
const plate = 'bg-linear-to-r from-(--su-dark) to-[color-mix(in_srgb,var(--su-dark)_45%,var(--su-primary))] text-white'

/**
 * Programme, styled after the event's banner and poster: silk backdrop, gradient
 * name-plate times, letterspaced serif headings, outlined boxes for doors/close.
 * Read live (see lib/flagship/live.ts) so admin edits reach this static-exported
 * page without a rebuild — the build-time props are only the fallback.
 */
export default function ProgrammeSection({ slug, programme: builtProgramme, dateLabel, timeLabel, venueName, backdrop }: Props) {
  const { events } = useFlagshipEvents()
  const live: FlagshipEvent | undefined = events.find((event) => event.slug === slug)
  const programme = (live?.programme ?? builtProgramme).filter((item) => item.title.trim())
  const date = live?.dateLabel ?? dateLabel
  const time = live?.timeLabel ?? timeLabel
  const venue = live?.venue.name ?? venueName

  if (programme.length === 0) return null

  const rows = programme.map((item, index) => {
    const { title, tags } = splitTags(item.title)
    const start = toMinutes(item.time)
    const next = programme[index + 1] ? toMinutes(programme[index + 1].time) : null
    const duration = start !== null && next !== null && next > start ? next - start : null
    return { ...item, title, tags, kind: classify(title, tags), duration }
  })

  return (
    <section className="relative isolate overflow-hidden px-4 py-16 sm:py-24">
      {backdrop && <Image src={backdrop} alt="" fill sizes="100vw" className="-z-20 object-cover" />}
      {/* Keep the silk texture but lift the top so the heading reads cleanly */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-(--su-light)/85 via-(--su-light)/45 to-(--su-dark)/30"
      />

      <div className="container-isr max-w-3xl">
        <header className="mb-10 text-center">
          <p className={`${serif.className} mb-2 text-sm font-bold uppercase tracking-[0.35em] text-(--su-dark)`}>
            The Programme
          </p>
          <h2
            className={`${serif.className} text-4xl font-extrabold italic text-(--su-dark) md:text-5xl`}
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            On the Night
          </h2>
        </header>

        {/* Date bar, as on the poster */}
        <p className={`${plate} mb-8 px-4 py-3 text-center text-sm font-extrabold uppercase tracking-[0.12em] shadow-lg sm:text-lg`}>
          {[date, time, venue].filter(Boolean).map((part, index) => (
            <span key={part} className="block sm:inline">
              {index > 0 && <span aria-hidden="true" className="mx-2 hidden opacity-60 sm:inline">·</span>}
              {part}
            </span>
          ))}
        </p>

        <ol className="space-y-3">
          {rows.map((row, index) => {
            const key = `${row.time}-${row.title}-${index}`

            if (row.kind === 'milestone') {
              return (
                <li key={key} className="py-2">
                  <div className="border border-(--su-dark)/70 bg-white/70 px-4 py-3 text-center shadow-sm backdrop-blur-md">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-(--su-dark) sm:text-sm">
                      {row.title}
                      <span className="mx-2 opacity-50">·</span>
                      <span className="tabular-nums">{row.time}</span>
                    </p>
                    {row.detail && <p className="mt-1 text-sm opacity-75">{row.detail}</p>}
                  </div>
                </li>
              )
            }

            if (row.kind === 'break') {
              return (
                <li key={key} className="flex items-center gap-3 py-1 text-(--su-dark)" aria-label={`${row.time} ${row.title}`}>
                  <span aria-hidden="true" className="h-px flex-1 bg-linear-to-r from-transparent to-(--su-dark)/40" />
                  <p className={`${serif.className} flex flex-wrap items-center justify-center gap-x-2 text-center text-sm italic sm:text-base`}>
                    <span className="not-italic tabular-nums opacity-60">{row.time}</span>
                    <span aria-hidden="true" className="text-(--su-primary)">✦</span>
                    <span className="font-semibold">{row.title}</span>
                    {row.duration !== null && <span className="opacity-60">· {formatDuration(row.duration)}</span>}
                    {row.tags.map((tag) => (
                      <span key={tag} className={`${plate} px-2 py-0.5 font-sans text-xs font-semibold not-italic`}>
                        {tag}
                      </span>
                    ))}
                  </p>
                  <span aria-hidden="true" className="h-px flex-1 bg-linear-to-l from-transparent to-(--su-dark)/40" />
                </li>
              )
            }

            return (
              <li
                key={key}
                className="grid gap-3 bg-white/65 p-4 shadow-sm ring-1 ring-(--su-dark)/10 backdrop-blur-md sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start sm:gap-5 sm:p-5"
              >
                <time className={`${plate} justify-self-start px-3 py-1.5 text-sm italic tabular-nums shadow-md sm:justify-self-stretch sm:text-center sm:text-base`}>
                  {row.time}
                </time>
                <div className="min-w-0">
                  <h3
                    className={`${serif.className} text-lg font-bold leading-snug text-(--su-dark) [overflow-wrap:anywhere] sm:text-xl`}
                    style={{ textWrap: 'balance' } as React.CSSProperties}
                  >
                    {row.title}
                  </h3>
                  {row.detail && <p className="mt-1 leading-relaxed text-(--su-on-light) opacity-80">{row.detail}</p>}
                  {(row.duration !== null || row.tags.length > 0) && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {row.duration !== null && (
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-(--su-on-light) opacity-60">
                          {formatDuration(row.duration)}
                        </span>
                      )}
                      {row.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border border-(--su-dark)/60 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-(--su-dark)"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
