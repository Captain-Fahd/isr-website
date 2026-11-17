import { Playfair_Display } from 'next/font/google'

/**
 * Shared look for flagship event pages below the hero, taken from the event's
 * banner/poster: a display serif, square "name plate" gradients, letterspaced
 * capitals and a ✦ ornament. Colours come only from the event theme's CSS vars
 * (see lib/flagship/theme.ts), so another event with a different theme gets the
 * same treatment in its own colours.
 */
export const serif = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  style: ['normal', 'italic'],
})

/** Dark wine fading into crimson, square corners — the poster's speaker name plates. */
export const plate =
  'bg-linear-to-r from-(--su-dark) to-[color-mix(in_srgb,var(--su-dark)_45%,var(--su-primary))] text-white'

export const plateButton = `${plate} inline-flex whitespace-nowrap min-h-11 items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] shadow-md transition hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current`

const squareButton =
  'inline-flex whitespace-nowrap min-h-11 items-center justify-center px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] shadow-md transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'

/** Square crimson button, for use on the dark closing band where a wine gradient would vanish. */
export const solidButton = `${squareButton} bg-(--su-primary) text-(--su-on-primary)`

/** Square light button, for use on a wine-gradient bar. */
export const lightButton = `${squareButton} bg-white text-(--su-dark)`

export const outlineButton =
  'inline-flex whitespace-nowrap min-h-11 items-center justify-center border border-current px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] transition hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'

/** Frosted, square card used for highlights, speakers and FAQs. */
export const frostedCard = 'bg-white/70 shadow-sm ring-1 ring-(--su-dark)/10 backdrop-blur-md'

export function Ornament({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-3 text-(--su-primary) ${className}`}>
      <span className="h-px w-12 bg-linear-to-r from-transparent to-current/60" />
      <span className="text-sm">✦</span>
      <span className="h-px w-12 bg-linear-to-l from-transparent to-current/60" />
    </div>
  )
}

export function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`${serif.className} mb-2 text-sm font-bold uppercase tracking-[0.35em] ${className}`}>{children}</p>
  )
}

/**
 * Section heading: letterspaced serif eyebrow, italic serif title, ornament.
 * `tone="dark"` for use on the dark closing band.
 */
export function SectionHeading({
  eyebrow,
  title,
  align = 'center',
  tone = 'light',
}: {
  eyebrow: string
  title: string
  align?: 'center' | 'left'
  tone?: 'light' | 'dark'
}) {
  const colour = tone === 'dark' ? 'text-(--su-on-dark)' : 'text-(--su-dark)'
  return (
    <header className={`mb-10 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      <Eyebrow className={colour}>{eyebrow}</Eyebrow>
      <h2
        className={`${serif.className} text-4xl font-extrabold italic leading-tight md:text-5xl ${colour}`}
        style={{ textWrap: 'balance' } as React.CSSProperties}
      >
        {title}
      </h2>
      <Ornament className={`mt-4 ${align === 'left' ? 'justify-start' : ''}`} />
    </header>
  )
}

/**
 * Splits a description paragraph written as "Intro: - one - two - three" into an
 * intro and list items, so admins can type a list into a plain textarea.
 */
export function splitInlineList(paragraph: string): { intro: string; items: string[] } | null {
  const match = paragraph.match(/^([^]*?:)\s*-\s+([^]+)$/)
  if (!match) return null
  const items = match[2].split(/\s+-\s+/).map((item) => item.trim()).filter(Boolean)
  return items.length >= 2 ? { intro: match[1].trim(), items } : null
}
