import type { FlagshipEvent } from './types'

/**
 * Content for The Sacred Union landing page (/sacred-union/).
 * Update content here — the page components only handle layout.
 *
 * Items marked PLACEHOLDER still need real details before launch.
 */

export const sacredUnion: FlagshipEvent = {
  slug: 'sacred-union',
  name: 'The Sacred Union',
  tagline: 'PLACEHOLDER — one-line tagline for the event',
  description:
    'PLACEHOLDER — ISR’s flagship conference for 2026. An evening of talks, reflection and community, bringing together students and guests from across Melbourne.',

  /**
   * 'save-the-date' — date announced, tickets not yet on sale.
   * 'booking'       — TryBooking link is live; switch once `ticketUrl` is set.
   */
  phase: 'save-the-date',

  /** First slide of the home page hero carousel. */
  featuredOnHome: true,

  /** TryBooking event URL. Leave empty until booking opens. */
  ticketUrl: '',

  /** ISO 8601 with Melbourne offset (AEDT is +11:00). PLACEHOLDER — times not yet confirmed. */
  start: '2026-11-15T17:00:00+11:00',
  end: '2026-11-15T21:30:00+11:00',

  /** Human-readable labels shown on the page. */
  dateLabel: 'Sunday 15 November 2026',
  timeLabel: '5:00 pm – 9:30 pm', // PLACEHOLDER

  venue: {
    name: 'RMIT Storey Hall',
    address: 'Building 16, 336–348 Swanston St, Melbourne VIC 3000',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=RMIT+Storey+Hall,+336-348+Swanston+Street,+Melbourne+VIC+3000',
    notes: [
      'Melbourne Central Station is a short walk away, with trams along Swanston Street.',
      'No on-campus visitor parking. Commercial car parks and metered parking are nearby.',
      'Prayer space available on site',
    ],
    image: {
      src: '/images/sacred-union/venue-storey-hall.webp',
      alt: 'Storey Hall auditorium at RMIT',
      width: 1024,
      height: 576,
    },
  },

  /** Save-the-date banner; the colour scheme below follows it. */
  banner: {
    src: '/images/sacred-union/save-the-date.webp',
    alt: 'Save the date — The Sacred Union: The Marriage Conference. Renowned speakers, lectures, break out rooms, panel discussion.',
    width: 1600,
    height: 900,
  },

  /** 1200×630 image used for link previews on WhatsApp, Instagram, etc. */
  ogImage: '/images/sacred-union/og-placeholder.png',

  theme: {
    dark: '#5B0B05',
    onDark: '#EAE3D8',
    light: '#EAE3D8',
    onLight: '#561610',
    primary: '#D43325',
    onPrimary: '#FFFFFF',
    accent: '#509589',
    hero: {
      backdrop: '/images/sacred-union/backdrop.webp',
      text: '#561610',
      heading: '#561610',
      // Palette approximation of the backdrop, shown while it loads: a white
      // spotlight from the top-left over a cream haze, rose vignettes on the
      // right, deepening to dark red along the bottom.
      background: [
        'radial-gradient(60% 45% at 0% 0%, rgb(255 255 255 / 0.95), transparent 70%)',
        'radial-gradient(45% 35% at 100% 0%, color-mix(in srgb, var(--su-dark) 30%, transparent), transparent 75%)',
        'radial-gradient(30% 45% at 100% 65%, color-mix(in srgb, var(--su-dark) 25%, transparent), transparent 75%)',
        'radial-gradient(45% 7rem at 0% 100%, var(--su-dark), transparent)',
        `linear-gradient(to bottom,
          color-mix(in srgb, var(--su-dark) 8%, var(--su-light)) 0%,
          color-mix(in srgb, var(--su-light), white 40%) 35%,
          color-mix(in srgb, var(--su-light), white 25%) 55%,
          color-mix(in srgb, var(--su-dark) 25%, var(--su-light)) calc(100% - 14rem),
          color-mix(in srgb, var(--su-dark) 40%, var(--su-light)) calc(100% - 6rem),
          var(--su-dark) 100%)`,
      ].join(', '),
    },
  },

  highlights: [
    {
      title: 'Panel Discussion',
      body: 'A conversation with the panel on the questions that matter for marriage.',
    },
    {
      title: 'Renowned Scholars',
      body: 'Lectures and discussion with scholars invited for the conference.',
    },
    {
      title: 'Dedicated breakout rooms for brothers and sisters',
      body: 'Separate spaces for brothers and sisters throughout the programme.',
    },
  ],

  /** Hidden on the page while empty. */
  speakers: [],
  speakerPlaceholderCount: 3,

  /** Hidden on the page while empty. */
  programme: [],

  /** Logo image paths. Shows a "become a sponsor" prompt while empty. */
  sponsors: [],

  faqs: [
    {
      question: 'Who can attend?',
      answer:
        'PLACEHOLDER — Everyone is welcome: RMIT and non-RMIT students, Muslims and non-Muslims, families and friends.',
    },
    {
      question: 'When do tickets go on sale?',
      answer:
        'Tickets will be sold through TryBooking. Join the mailing list or our WhatsApp community and we’ll let you know the moment they’re live.',
    },
    {
      question: 'Is there a dress code?',
      answer: 'PLACEHOLDER — Smart casual / modest dress.',
    },
    {
      question: 'Is there separate seating?',
      answer: 'PLACEHOLDER — Seating arrangements for brothers and sisters.',
    },
    {
      question: 'What is the refund policy?',
      answer: 'PLACEHOLDER — Refund policy once tickets are on sale.',
    },
  ],
}
