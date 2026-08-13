import { describe, expect, test } from 'vitest'
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  eventJsonLd,
  organizationJsonLd,
  truncateMetaDescription,
  withTrailingSlash,
} from '@/lib/seo'

describe('absoluteUrl', () => {
  test('prefixes a rooted path with the site URL', () => {
    expect(absoluteUrl('/events/')).toBe(`${SITE_URL}/events/`)
  })

  test('adds the missing leading slash', () => {
    expect(absoluteUrl('events/')).toBe(`${SITE_URL}/events/`)
  })

  test('defaults to the site root', () => {
    expect(absoluteUrl()).toBe(`${SITE_URL}/`)
  })

  test('leaves an absolute https URL untouched', () => {
    expect(absoluteUrl('https://cdn.example.com/poster.webp')).toBe(
      'https://cdn.example.com/poster.webp',
    )
  })

  test('leaves an absolute http URL untouched', () => {
    expect(absoluteUrl('http://example.com/x')).toBe('http://example.com/x')
  })
})

describe('withTrailingSlash', () => {
  test('appends a slash to a bare path', () => {
    expect(withTrailingSlash('/events')).toBe('/events/')
  })

  test('leaves an already-slashed path alone', () => {
    expect(withTrailingSlash('/events/')).toBe('/events/')
  })

  test('leaves the root alone', () => {
    expect(withTrailingSlash('/')).toBe('/')
  })

  test('handles nested paths', () => {
    expect(withTrailingSlash('/events/12')).toBe('/events/12/')
  })
})

describe('truncateMetaDescription', () => {
  test('returns a short description unchanged', () => {
    expect(truncateMetaDescription('A short description.')).toBe('A short description.')
  })

  test('collapses newlines and repeated whitespace', () => {
    expect(truncateMetaDescription('Line one\n\nLine   two\ttabbed')).toBe(
      'Line one Line two tabbed',
    )
  })

  test('trims surrounding whitespace', () => {
    expect(truncateMetaDescription('  padded  ')).toBe('padded')
  })

  test('keeps a description of exactly the maximum length', () => {
    const exact = 'a'.repeat(155)
    expect(truncateMetaDescription(exact)).toBe(exact)
  })

  test('truncates at a word boundary and appends an ellipsis', () => {
    const long = `${'word '.repeat(60)}end`
    const result = truncateMetaDescription(long)

    expect(result.length).toBeLessThanOrEqual(155)
    expect(result.endsWith('…')).toBe(true)
    // The cut must land on a word boundary, not mid-word or on a stray space.
    expect(result.endsWith(' …')).toBe(false)
    expect(long).toContain(result.slice(0, -1))
  })

  test('hard-cuts when there is no late word boundary to cut on', () => {
    // lastIndexOf(' ') lands at index 5, which is not > 80, so the helper falls
    // back to cutting mid-token.
    const long = `short ${'x'.repeat(300)}`
    const result = truncateMetaDescription(long)

    expect(result).toBe(`${long.slice(0, 154)}…`)
    expect(result).toHaveLength(155)
  })

  test('honours a custom maximum length', () => {
    const long = `${'word '.repeat(60)}end`
    const result = truncateMetaDescription(long, 40)

    expect(result.length).toBeLessThanOrEqual(40)
    expect(result.endsWith('…')).toBe(true)
  })

  test('handles an empty string', () => {
    expect(truncateMetaDescription('')).toBe('')
  })
})

describe('organizationJsonLd', () => {
  test('describes the society as a schema.org Organization', () => {
    const jsonLd = organizationJsonLd()

    expect(jsonLd['@context']).toBe('https://schema.org')
    expect(jsonLd['@type']).toBe('Organization')
    expect(jsonLd.name).toBe(SITE_NAME)
    expect(jsonLd.url).toBe(SITE_URL)
    expect(jsonLd.logo).toBe(DEFAULT_OG_IMAGE)
  })

  test('lists only absolute social profile URLs', () => {
    const { sameAs } = organizationJsonLd()

    expect(sameAs.length).toBeGreaterThan(0)
    for (const url of sameAs) {
      expect(url).toMatch(/^https:\/\//)
    }
  })

  test('links the organisation to RMIT University', () => {
    expect(organizationJsonLd().memberOf).toMatchObject({
      '@type': 'CollegeOrUniversity',
      name: 'RMIT University',
    })
  })

  test('serialises to valid JSON', () => {
    expect(() => JSON.stringify(organizationJsonLd())).not.toThrow()
  })
})

describe('eventJsonLd', () => {
  const baseEvent = {
    name: 'Welcome BBQ',
    description: 'Kick off the semester with food and community.',
    startDate: '2026-09-01T08:30:00.000Z',
    url: `${SITE_URL}/events/1/`,
  }

  test('maps the core event fields', () => {
    const jsonLd = eventJsonLd(baseEvent)

    expect(jsonLd['@type']).toBe('Event')
    expect(jsonLd.name).toBe('Welcome BBQ')
    expect(jsonLd.startDate).toBe('2026-09-01T08:30:00.000Z')
    expect(jsonLd.url).toBe(`${SITE_URL}/events/1/`)
    expect(jsonLd.eventStatus).toBe('https://schema.org/EventScheduled')
  })

  test('uses the event image when one is supplied', () => {
    const jsonLd = eventJsonLd({
      ...baseEvent,
      imageUrl: 'https://cdn.example.com/poster.webp',
    })

    expect(jsonLd.image).toEqual(['https://cdn.example.com/poster.webp'])
  })

  test('falls back to the default OG image when imageUrl is null', () => {
    expect(eventJsonLd({ ...baseEvent, imageUrl: null }).image).toEqual([DEFAULT_OG_IMAGE])
  })

  test('omits offers when there is no ticket URL', () => {
    expect(eventJsonLd(baseEvent)).not.toHaveProperty('offers')
    expect(eventJsonLd({ ...baseEvent, ticketUrl: null })).not.toHaveProperty('offers')
  })

  test('adds an offer when a ticket URL is present', () => {
    const jsonLd = eventJsonLd({ ...baseEvent, ticketUrl: 'https://tickets.example.com/bbq' })

    expect(jsonLd.offers).toEqual({
      '@type': 'Offer',
      url: 'https://tickets.example.com/bbq',
      availability: 'https://schema.org/InStock',
    })
  })

  test('truncates a long description at 300 characters', () => {
    const jsonLd = eventJsonLd({ ...baseEvent, description: 'word '.repeat(200) })

    expect(jsonLd.description.length).toBeLessThanOrEqual(300)
    expect(jsonLd.description.endsWith('…')).toBe(true)
  })

  test('names ISR as the organizer and RMIT as the location', () => {
    const jsonLd = eventJsonLd(baseEvent)

    expect(jsonLd.organizer).toMatchObject({ '@type': 'Organization', name: SITE_NAME })
    expect(jsonLd.location).toMatchObject({ '@type': 'Place', name: 'RMIT University' })
  })
})
