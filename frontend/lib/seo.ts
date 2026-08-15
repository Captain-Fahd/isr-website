export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theisr.com.au'

export const SITE_NAME = 'Islamic Society of RMIT'
export const SITE_SHORT_NAME = 'ISR'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/isr_logo_transparent.png`

export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const normalised = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalised}`
}

/** Ensure trailing slash for sitemap / canonical consistency with trailingSlash: true. */
export function withTrailingSlash(path: string): string {
  if (path === '/' || path.endsWith('/')) return path
  return `${path}/`
}

export function truncateMetaDescription(
  text: string,
  maxLength = 155,
): string {
  const cleaned = text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (cleaned.length <= maxLength) return cleaned

  const truncated = cleaned.slice(0, maxLength - 1)
  const lastSpace = truncated.lastIndexOf(' ')
  const cut = lastSpace > 80 ? truncated.slice(0, lastSpace) : truncated
  return `${cut}…`
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: SITE_SHORT_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    email: 'isr@rmit.edu.au',
    sameAs: [
      'https://www.instagram.com/islamicsocietyofrmit/',
      'https://www.facebook.com/RMITIS/',
      'https://au.linkedin.com/company/islamic-society-rmit-isr',
      'https://linktr.ee/IslamicSociety_RMIT',
    ],
    memberOf: {
      '@type': 'CollegeOrUniversity',
      name: 'RMIT University',
      url: 'https://www.rmit.edu.au/',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Melbourne',
      addressRegion: 'VIC',
      addressCountry: 'AU',
    },
  }
}

type EventJsonLdInput = {
  name: string
  description: string
  startDate: string
  endDate?: string | null
  recurrenceFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null
  recurrenceInterval?: number | null
  recurrenceEndDate?: string | null
  imageUrl?: string | null
  url: string
  ticketUrl?: string | null
}

const ISO_DURATION_UNITS = { DAILY: 'D', WEEKLY: 'W', MONTHLY: 'M' } as const

/**
 * schema.org `Schedule` for a recurring event: `repeatFrequency` is an ISO 8601
 * duration (P1W = weekly, P2W = fortnightly, P1M = monthly).
 */
function eventSchedule(event: EventJsonLdInput) {
  if (!event.recurrenceFrequency) return null

  const unit = ISO_DURATION_UNITS[event.recurrenceFrequency]
  if (!unit) return null

  return {
    '@type': 'Schedule',
    startDate: event.startDate,
    repeatFrequency: `P${event.recurrenceInterval ?? 1}${unit}`,
    scheduleTimezone: 'Australia/Melbourne',
    ...(event.recurrenceEndDate ? { endDate: event.recurrenceEndDate } : {}),
  }
}

export function eventJsonLd(event: EventJsonLdInput) {
  const schedule = eventSchedule(event)

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: truncateMetaDescription(event.description, 300),
    startDate: event.startDate,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    ...(schedule ? { eventSchedule: schedule } : {}),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    image: event.imageUrl ? [event.imageUrl] : [DEFAULT_OG_IMAGE],
    url: event.url,
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    location: {
      '@type': 'Place',
      name: 'RMIT University',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Melbourne',
        addressRegion: 'VIC',
        addressCountry: 'AU',
      },
    },
    ...(event.ticketUrl
      ? {
          offers: {
            '@type': 'Offer',
            url: event.ticketUrl,
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  }
}
