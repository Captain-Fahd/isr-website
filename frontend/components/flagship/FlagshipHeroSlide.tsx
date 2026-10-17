import { getImageProps } from 'next/image'
import Link from 'next/link'
import HeroBackdrop from '@/components/flagship/HeroBackdrop'
import Countdown from '@/components/flagship/Countdown'
import type { FlagshipEvent } from '@/lib/flagship'
import { themeVars } from '@/lib/flagship/theme'

const bannerClass = 'h-auto w-full rounded-2xl shadow-2xl ring-1 ring-current/15'

/**
 * Event banner, swapped for its portrait version on phones when one exists.
 * A <picture> means each device downloads only the image it shows.
 */
function BannerImage({ banner }: { banner: FlagshipEvent['banner'] }) {
  const common = { alt: '', priority: true }
  const { props: desktop } = getImageProps({ ...common, src: banner.src, width: banner.width, height: banner.height })
  if (!banner.mobile) return <img {...desktop} className={bannerClass} />

  const { props: mobile } = getImageProps({ ...common, ...banner.mobile })
  return (
    <picture>
      <source
        media="(min-width: 640px)"
        srcSet={desktop.srcSet ?? desktop.src}
        width={banner.width}
        height={banner.height}
      />
      {/* Capped height keeps the portrait poster, countdown and button on one phone screen */}
      <img {...mobile} className={`${bannerClass} max-sm:mx-auto max-sm:max-h-[55svh] max-sm:w-auto`} />
    </picture>
  )
}

/** Home page carousel slide promoting a flagship event with its countdown. */
export default function FlagshipHeroSlide({ event }: { event: FlagshipEvent }) {
  const isBooking = event.phase === 'booking' && Boolean(event.ticketUrl)

  return (
    <section
      style={themeVars(event)}
      className="relative isolate flex h-full min-h-svh items-center overflow-hidden max-sm:items-stretch bg-(--su-light) bg-(image:--su-hero-bg) px-4 pb-20 pt-24 text-(--su-hero-text) sm:min-h-screen sm:pb-24 sm:pt-32"
    >
      <HeroBackdrop hero={event.theme.hero} />

      <div className="container-isr grid w-full items-center gap-4 max-sm:content-between sm:gap-10 lg:items-stretch lg:grid-cols-[1.6fr_1.05fr]">
        <Link href={`/${event.slug}/`} className="block lg:flex lg:items-center" tabIndex={-1} aria-hidden="true">
          <BannerImage banner={event.banner} />
        </Link>

        {/* Frosted panel keeps text legible over the backdrop's dark lower half; on mobile it shows only the countdown and button */}
        <div className="rounded-2xl bg-(--su-light)/75 p-5 text-center shadow-xl ring-1 ring-current/10 backdrop-blur-md sm:p-8 lg:flex lg:flex-col lg:items-start lg:justify-center lg:p-6 lg:text-left">
          <p className="mb-4 text-xl font-semibold uppercase tracking-[0.2em] text-(--su-hero-heading) sm:hidden">
            {isBooking ? 'Tickets on sale' : 'Save the date'}
          </p>
          <h2
            className="mb-3 text-4xl font-bold leading-tight text-(--su-hero-heading) max-sm:sr-only sm:text-5xl lg:mb-2"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            {event.name}
          </h2>
          <p className="mb-6 text-lg font-semibold max-sm:hidden lg:mb-4">{event.dateLabel}</p>

          <div className="mb-6 flex justify-center sm:mb-8 lg:mb-5 lg:justify-start">
            <Countdown start={event.start} end={event.end} />
          </div>

          <Link
            href={`/${event.slug}/`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-(--su-primary) px-8 py-3 text-base font-semibold text-(--su-on-primary) shadow-lg transition hover:brightness-110"
          >
            {isBooking ? 'Get tickets' : 'Find out more'}
          </Link>
        </div>
      </div>
    </section>
  )
}
