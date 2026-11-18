import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { absoluteUrl, eventJsonLd } from '@/lib/seo'
import type { AboutBlockId, FlagshipEvent, FlagshipSectionId } from '@/lib/flagship'
import { themeVars } from '@/lib/flagship/theme'
import Countdown from '@/components/flagship/Countdown'
import HeroActions from './HeroActions'
import HeroPrice from './HeroPrice'
import BookingPrompt from './BookingPrompt'
import StickyCtaBar from './StickyCtaBar'
import TicketsSection from './TicketsSection'
import LiveOrder from './LiveOrder'
import TicketsArrow from './TicketsArrow'
import TicketsStatusLabel from '@/components/flagship/TicketsStatusLabel'
import SpeakersSection from './SpeakersSection'
import ProgrammeSection from './ProgrammeSection'
import {
  SectionHeading,
  Eyebrow,
  Ornament,
  serif,
  plateButton,
  frostedCard,
  splitInlineList,
} from './flagshipStyle'
import HeroBackdrop from '@/components/flagship/HeroBackdrop'

/**
 * A flagship event's landing page. Rendered at build time by /<slug>/ and, with
 * draft content, client-side by the admin preview (/admin/flagship-preview/).
 */
export default function FlagshipEventView({ event }: { event: FlagshipEvent }) {
  const pagePath = `/${event.slug}/`
  const isBooking = event.phase === 'booking' && Boolean(event.ticketUrl)

  const jsonLd = eventJsonLd({
    name: event.name,
    description: event.description,
    startDate: event.start,
    endDate: event.end,
    imageUrl: absoluteUrl(event.banner.src),
    url: absoluteUrl(pagePath),
    // Selling through the embedded widget counts too: the offer points at it.
    ticketUrl: isBooking ? event.ticketUrl : event.ticketsOnSale ? absoluteUrl(`${pagePath}#booking`) : null,
  })

  // The about section's description and highlights, rendered in `aboutOrder` (read live).
  const aboutBlocks: Record<AboutBlockId, React.ReactNode> = {
    description: (
      <div className="mx-auto max-w-2xl space-y-5 text-center text-lg leading-relaxed">
        {event.description.split(/\n\s*\n/).map((paragraph, index) => {
          const list = splitInlineList(paragraph)
          if (list) {
            return (
              <div key={paragraph} className={`${frostedCard} px-6 py-6 text-left sm:px-8`}>
                <p className={`${serif.className} mb-4 text-center text-xl font-bold italic text-(--su-dark)`}>
                  {list.intro}
                </p>
                <ul className="space-y-3">
                  {list.items.map((item) => (
                    <li key={item} className="flex gap-3 opacity-90">
                      <span aria-hidden="true" className="mt-0.5 text-sm text-(--su-primary)">✦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          }
          return (
            <p
              key={paragraph}
              className={index === 0 ? `${serif.className} text-xl font-semibold italic text-(--su-dark) sm:text-2xl` : 'opacity-85'}
            >
              {paragraph}
            </p>
          )
        })}
      </div>
    ),
    highlights: event.highlights.length > 0 && (
      <div className="grid gap-6 md:grid-cols-3">
        {event.highlights.map((item, index) => (
          <article key={item.title} className={`${frostedCard} relative p-6 pt-10`}>
            <span
              aria-hidden="true"
              className={`${serif.className} absolute -top-4 left-6 bg-linear-to-r from-(--su-dark) to-[color-mix(in_srgb,var(--su-dark)_45%,var(--su-primary))] px-3 py-1 text-lg font-bold italic text-white shadow-md`}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className={`${serif.className} mb-2 text-xl font-bold leading-snug text-(--su-dark)`}>{item.title}</h3>
            <p className="leading-relaxed opacity-80">{item.body}</p>
          </article>
        ))}
      </div>
    ),
  }

  // The sections between the hero and the booking widget, rendered in `sectionOrder` (read live).
  const sections: Record<FlagshipSectionId, React.ReactNode> = {
    // ── About ─────────────────────────────────────────────────
    about: (
      <section className="px-4 py-16 sm:py-20">
        <div className="container-isr">
          <SectionHeading eyebrow="About the event" title={`What is ${event.name}?`} />
          <div className="space-y-14">
            <LiveOrder slug={event.slug} field="aboutOrder" builtOrder={event.aboutOrder} blocks={aboutBlocks} />
          </div>
        </div>
      </section>
    ),
    speakers: (
      <SpeakersSection
        slug={event.slug}
        showSpeakers={event.showSpeakers}
        speakers={event.speakers}
        speakerLayout={event.speakerLayout}
        speakerPlaceholderCount={event.speakerPlaceholderCount}
        heading={<SectionHeading eyebrow="Speakers" title="Who you’ll hear from" />}
        after={<BookingPrompt event={event} message="Hear them in person." />}
      />
    ),
    programme: (
      <ProgrammeSection
        slug={event.slug}
        programme={event.programme}
        dateLabel={event.dateLabel}
        timeLabel={event.timeLabel}
        venueName={event.venue.name}
        backdrop={event.theme.hero.backdrop}
        after={<BookingPrompt event={event} message={`Save your seat at ${event.venue.name}.`} />}
      />
    ),
    // ── Venue ─────────────────────────────────────────────────
    venue: (
      <section className="bg-white/50 px-4 py-16 sm:py-20">
        <div className="container-isr grid items-center gap-10 md:grid-cols-2">
          <div>
            <Eyebrow className="text-(--su-dark)">The Venue</Eyebrow>
            <h2 className={`${serif.className} mb-3 text-4xl font-extrabold italic leading-tight text-(--su-dark) md:text-5xl`}>
              {event.venue.name}
            </h2>
            <Ornament className="mb-5 justify-start" />
            <p className={`${serif.className} mb-6 text-lg italic text-(--su-dark) opacity-90`}>
              {event.venue.address}
            </p>
            <ul className="mb-8 space-y-3 opacity-90">
              {event.venue.notes.map((note) => (
                <li key={note} className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 text-sm text-(--su-primary)">✦</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
            {event.venue.mapUrl && (
              <a href={event.venue.mapUrl} target="_blank" rel="noopener noreferrer" className={plateButton}>
                Open in Google Maps
              </a>
            )}
          </div>
          {event.venue.image ? (
            <div className="relative">
              {/* Offset frame, like the poster's outlined boxes */}
              <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 border border-(--su-dark)/50" />
              <Image
                src={event.venue.image.src}
                alt={event.venue.image.alt}
                width={event.venue.image.width}
                height={event.venue.image.height}
                className="relative aspect-[4/3] h-auto w-full object-cover shadow-lg"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center border-2 border-dashed border-(--su-on-light)/20 bg-(--su-on-light)/5 text-sm opacity-60">
              Venue photo
            </div>
          )}
        </div>
      </section>
    ),
    // ── FAQ ───────────────────────────────────────────────────
    faqs: (
      <section className="bg-white/50 px-4 py-16 sm:py-20">
        <div className="container-isr max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Good to know" />
          <div className="space-y-3">
            {event.faqs.map((faq) => (
              <details key={faq.question} className={`${frostedCard} group border-l-4 border-(--su-dark) p-5 open:border-(--su-primary)`}>
                <summary
                  className={`${serif.className} flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold text-(--su-dark) [&::-webkit-details-marker]:hidden`}
                >
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center border border-(--su-dark)/40 font-sans text-base text-(--su-primary) transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed opacity-85">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    ),
  }

  return (
    <div style={themeVars(event)} className="min-h-screen bg-(--su-light) text-(--su-on-light)">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section
          id="hero"
          className="relative isolate overflow-hidden bg-(--su-light) bg-(image:--su-hero-bg) px-4 pb-24 pt-28 text-(--su-hero-text) sm:pt-32"
        >
          <HeroBackdrop hero={event.theme.hero} />

          <div className="container-isr grid items-center gap-10 lg:items-stretch lg:grid-cols-[1.6fr_1.05fr]">
            <div className="lg:flex lg:items-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
              <Image
                src={event.banner.src}
                alt={event.banner.alt}
                width={event.banner.width}
                height={event.banner.height}
                priority
                className="h-auto w-full rounded-2xl shadow-2xl ring-1 ring-current/15"
              />
            </div>

            {/* Frosted panel keeps text legible over the backdrop's dark lower half */}
            <div className="flex flex-col rounded-2xl bg-(--su-light)/75 p-6 shadow-xl ring-1 ring-current/10 backdrop-blur-md sm:p-8 lg:justify-center lg:p-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-safe:delay-150">
              <p className="mb-4 text-xl font-semibold uppercase tracking-[0.2em] text-(--su-hero-heading) sm:hidden">
                <TicketsStatusLabel event={event} />
              </p>
              <h1
                className="mb-4 text-4xl font-bold leading-tight text-(--su-hero-heading) sm:text-5xl lg:mb-2 lg:text-4xl"
                style={{ textWrap: 'balance' } as React.CSSProperties}
              >
                {event.name}
              </h1>
              <p className="mb-6 text-lg font-semibold italic opacity-85 lg:mb-3 lg:text-base">{event.tagline}</p>

              <dl className="mb-8 space-y-1 text-base lg:mb-3 lg:space-y-0 lg:text-sm">
                <div className="flex gap-2">
                  <dt className="sr-only">Date</dt>
                  <dd className="font-semibold">{event.dateLabel}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="sr-only">Time</dt>
                  <dd className="opacity-85">{event.timeLabel}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="sr-only">Venue</dt>
                  <dd className="opacity-85">
                    {event.venue.name} · {event.venue.address}
                  </dd>
                </div>
                <HeroPrice event={event} />
              </dl>

              {/* After the buttons on phones, where the banner already pushes them low */}
              <div className="order-last mt-8 sm:order-none sm:mt-0 sm:mb-8 lg:mb-4">
                <Countdown start={event.start} end={event.end} />
              </div>

              <HeroActions event={event} />
            </div>
          </div>
          <TicketsArrow event={event} />
        </section>

        <LiveOrder slug={event.slug} field="sectionOrder" builtOrder={event.sectionOrder} blocks={sections} />

        {/* ── Booking widget ──────────────────────────────────────── */}
        <TicketsSection
          slug={event.slug}
          phase={event.phase}
          ticketUrl={event.ticketUrl}
          ticketEventId={event.ticketEventId}
          ticketsOnSale={event.ticketsOnSale}
          priceLabel={event.priceLabel}
        />
      </main>

      <Footer />
      <StickyCtaBar event={event} />
    </div>
  )
}
