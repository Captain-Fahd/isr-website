'use client'

import Image from 'next/image'
import type { FlagshipEvent } from '@/lib/flagship'
import { useLiveVenue } from '@/lib/flagship/preview'
import { Eyebrow, Ornament, plateButton, serif } from './flagshipStyle'

/**
 * The venue's name, address, notes, map link and photo. Read live (see
 * lib/flagship/live.ts) so a venue change in the admin panel reaches this
 * static-exported page without a rebuild; the build-time venue is the fallback.
 */
export default function VenueSection({ event }: { event: Pick<FlagshipEvent, 'slug' | 'venue'> }) {
  const venue = useLiveVenue(event)

  return (
    <section className="bg-white/50 px-4 py-16 sm:py-20">
      <div className="container-isr grid items-center gap-10 md:grid-cols-2">
        <div>
          <Eyebrow className="text-(--su-dark)">The Venue</Eyebrow>
          <h2 className={`${serif.className} mb-3 text-4xl font-extrabold italic leading-tight text-(--su-dark) md:text-5xl`}>
            {venue.name}
          </h2>
          <Ornament className="mb-5 justify-start" />
          <p className={`${serif.className} mb-6 text-lg italic text-(--su-dark) opacity-90`}>{venue.address}</p>
          <ul className="mb-8 space-y-3 opacity-90">
            {venue.notes.map((note) => (
              <li key={note} className="flex gap-3">
                <span aria-hidden="true" className="mt-0.5 text-sm text-(--su-primary)">✦</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
          {venue.mapUrl && (
            <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer" className={plateButton}>
              Open in Google Maps
            </a>
          )}
        </div>
        {venue.image?.src ? (
          <div className="relative">
            {/* Offset frame, like the poster's outlined boxes */}
            <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 border border-(--su-dark)/50" />
            <Image
              src={venue.image.src}
              alt={venue.image.alt}
              width={venue.image.width}
              height={venue.image.height}
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
  )
}
