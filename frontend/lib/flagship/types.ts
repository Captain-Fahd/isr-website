/** Shared shape for flagship event landing pages (served at /<slug>/). */

export type EventPhase = 'save-the-date' | 'booking'

/** How speaker cards are laid out: rows of 3, then 2, then 2, or a rotating carousel. */
export type SpeakerLayout = 'rows' | 'carousel'

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
    /** Portrait version shown instead of `backdrop` on phones (ideally 1290×2796) */
    backdropMobile?: string
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
  /**
   * Who the session is for, e.g. "Brothers" or "Sisters". In the rows layout, a row
   * where every speaker has one is shown as simultaneous sessions.
   */
  audience?: string
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

/** A page section that admins can move; the hero stays first and booking last. */
export type FlagshipSectionId = 'about' | 'speakers' | 'programme' | 'venue' | 'faqs'

/** A block inside the about section that admins can move. */
export type AboutBlockId = 'description' | 'highlights'

export type FlagshipEvent = {
  id: number
  /** URL path segment — the page is served at /<slug>/ */
  slug: string
  name: string
  tagline: string
  description: string
  phase: EventPhase
  /** Show this event as the first slide of the home page hero carousel. */
  featuredOnHome: boolean
  /** Page is public. Off = hidden from visitors; admins can still preview it. */
  released: boolean
  /** TryBooking event URL. Leave empty until booking opens. */
  ticketUrl: string
  /**
   * TryBooking event ID (`data-eid`) for the booking widget at the foot of
   * /<slug>/. A placeholder is shown while empty.
   */
  ticketEventId: string
  /** Reveals the booking section on /<slug>/ and points the CTA buttons at it, instead of the external "Notify me" link. */
  ticketsOnSale: boolean
  /**
   * Short price line, e.g. "From $15 · Early bird", shown in the hero, sticky bar
   * and booking prompts once tickets are on sale. Hidden while empty.
   */
  priceLabel: string
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
  /** Show the speakers section. Off = the whole section is hidden. */
  showSpeakers: boolean
  speakers: Speaker[]
  speakerLayout: SpeakerLayout
  /** Total speaker slots; any not filled by `speakers` show as "To be announced". */
  speakerPlaceholderCount: number
  /** Hidden while empty. */
  programme: ProgrammeItem[]
  faqs: Faq[]
  /** Order of the sections between the hero and the booking section. */
  sectionOrder: FlagshipSectionId[]
  /** Order of the description and highlights inside the about section. */
  aboutOrder: AboutBlockId[]
}
