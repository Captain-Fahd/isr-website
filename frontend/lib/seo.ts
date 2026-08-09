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
  imageUrl?: string | null
  url: string
  ticketUrl?: string | null
}

export function eventJsonLd(event: EventJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: truncateMetaDescription(event.description, 300),
    startDate: event.startDate,
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
