/** Shared shape for flagship event landing pages (served at /<slug>/). */

export type EventPhase = 'save-the-date' | 'booking'

/**
 * Page colour scheme. These default to the ISR palette and should be
 * re-picked from the event banner once it's uploaded, so the page matches it.
 * Every colour on the page reads from these values.
 */
export type EventTheme = {
  /** Hero, final CTA band and sticky bar background */
  dark: string
  /** Text on `dark` */
  onDark: string
  /** Light section background */
  light: string
  /** Headings and body text on `light` */
  onLight: string
  /** Primary buttons */
  primary: string
  /** Text on `primary` */
  onPrimary: string
  /** Eyebrows, dividers, pattern and small highlights */
  accent: string
  /** Event page hero and home carousel slide */
  hero: {
    /** Backdrop image, cropped to cover the hero */
    backdrop: string
    /** CSS `background-image` layers shown beneath (and while loading) the backdrop */
    background: string
    /** Body text, eyebrow and pattern on `background` */
    text: string
    /** Event name */
    heading: string
  }
}

export type Speaker = {
  name: string
  title: string
  topic?: string
  image: string
}

export type ProgrammeItem = {
  time: string
  title: string
  detail?: string
}

export type Faq = {
  question: string
  answer: string
}

export type FlagshipEvent = {
  /** URL path segment — the page is served at /<slug>/ */
  slug: string
  name: string
  tagline: string
  description: string
  phase: EventPhase
  /** Show this event as the first slide of the home page hero carousel. */
  featuredOnHome: boolean
  /** TryBooking event URL. Leave empty until booking opens. */
  ticketUrl: string
  /** ISO 8601 with Melbourne offset (AEDT is +11:00). */
  start: string
  end: string
  dateLabel: string
  timeLabel: string
  venue: {
    name: string
    address: string
    /** Google Maps link — leave empty while the venue is TBA. */
    mapUrl: string
    notes: string[]
    /** Shown beside the venue details; a placeholder box is shown while unset. */
    image?: { src: string; alt: string; width: number; height: number }
  }
  banner: {
    src: string
    alt: string
    width: number
    height: number
    /** Portrait version shown instead of `src` on phones in the home carousel slide */
    mobile?: { src: string; width: number; height: number }
  }
  /** 1200×630 image used for link previews on WhatsApp, Instagram, etc. */
  ogImage: string
  theme: EventTheme
  highlights: { title: string; body: string }[]
  /** Shown as "To be announced" cards while empty. */
  speakers: Speaker[]
  speakerPlaceholderCount: number
  /** Shown as "Programme released with tickets" while empty. */
  programme: ProgrammeItem[]
  /** Shows a "become a sponsor" prompt while empty. */
  sponsors: { name: string; logo: string; url?: string }[]
  faqs: Faq[]
}
