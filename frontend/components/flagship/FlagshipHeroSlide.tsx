import Image from 'next/image'
import Link from 'next/link'
import Countdown from '@/components/flagship/Countdown'
import GeometricPattern from '@/components/flagship/GeometricPattern'
import type { FlagshipEvent } from '@/lib/flagship'
import { themeVars } from '@/lib/flagship/theme'

/** Home page carousel slide promoting a flagship event with its countdown. */
export default function FlagshipHeroSlide({ event }: { event: FlagshipEvent }) {
  const isBooking = event.phase === 'booking' && Boolean(event.ticketUrl)

  return (
    <section
      style={themeVars(event)}
      className="relative isolate flex h-full min-h-screen items-center overflow-hidden bg-(--su-dark) px-4 pb-24 pt-28 text-(--su-on-dark) sm:pt-32"
    >
      {/* Blurred banner wash ties the background to the banner's colours */}
      <Image
        src={event.banner.src}
        alt=""
        fill
        priority
        className="-z-20 scale-110 object-cover opacity-30 blur-3xl"
      />
      <GeometricPattern className="absolute inset-0 -z-10 h-full w-full text-(--su-accent) opacity-15" />

      <div className="container-isr grid w-full items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <Link href={`/${event.slug}/`} className="block" tabIndex={-1} aria-hidden="true">
          <Image
            src={event.banner.src}
            alt=""
            width={event.banner.width}
            height={event.banner.height}
            priority
            className="h-auto w-full rounded-2xl shadow-2xl ring-1 ring-(--su-on-dark)/15"
          />
        </Link>

        <div className="text-center lg:text-left">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-(--su-accent)">
            {isBooking ? 'Tickets on sale' : 'Save the date'}
          </p>
          <h2
            className="mb-3 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            {event.name}
          </h2>
          <p className="mb-6 text-lg font-semibold">{event.dateLabel}</p>

          <div className="mb-8 flex justify-center lg:justify-start">
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
