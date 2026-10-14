import { absoluteUrl } from '@/lib/seo'
import type { FlagshipEvent } from './types'

/** 2026-12-05T17:00:00+11:00 → 20261205T060000Z */
function toCalendarStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function eventDetails(event: FlagshipEvent) {
  return {
    pageUrl: absoluteUrl(`/${event.slug}/`),
    location: `${event.venue.name}, ${event.venue.address}`,
  }
}

export function googleCalendarUrl(event: FlagshipEvent): string {
  const { pageUrl, location } = eventDetails(event)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${toCalendarStamp(event.start)}/${toCalendarStamp(event.end)}`,
    details: `${event.description}\n\n${pageUrl}`,
    location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** .ics file as a data URI, for Apple Calendar / Outlook. */
export function icsDataUri(event: FlagshipEvent): string {
  const { pageUrl, location } = eventDetails(event)
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Islamic Society of RMIT//Flagship Event//EN',
    'BEGIN:VEVENT',
    `UID:${event.slug}@theisr.com.au`,
    `DTSTAMP:${toCalendarStamp(event.start)}`,
    `DTSTART:${toCalendarStamp(event.start)}`,
    `DTEND:${toCalendarStamp(event.end)}`,
    `SUMMARY:${event.name}`,
    `DESCRIPTION:${pageUrl}`,
    `LOCATION:${location.replace(/,/g, '\\,')}`,
    `URL:${pageUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
}
