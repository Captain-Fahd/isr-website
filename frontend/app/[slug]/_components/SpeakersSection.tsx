'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import { useFlagshipEvents } from '@/lib/flagship/live'
import SpeakerCarousel from './SpeakerCarousel'
import type { Speaker } from '@/lib/flagship/types'

type Props = {
  slug: string
  showSpeakers: boolean
  speakers: Speaker[]
  speakerPlaceholderCount: number
  heading: ReactNode
}

function Silhouette() {
  return (
    <div className="flex aspect-square w-full items-end justify-center bg-(--su-on-light)/10" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="h-4/5 w-4/5 fill-(--su-on-light) opacity-25">
        <circle cx="50" cy="36" r="20" />
        <path d="M10 100c0-24 18-40 40-40s40 16 40 40z" />
      </svg>
    </div>
  )
}

/**
 * Speaker cards plus "To be announced" placeholders for any unfilled slots.
 * `showSpeakers`, `speakers` and the slot count are read live (see
 * lib/flagship/live.ts) so admin changes reach this static-exported page without a
 * rebuild — same reasoning as `released` and `ticketsOnSale`.
 */
export default function SpeakersSection({
  slug,
  showSpeakers: builtShowSpeakers,
  speakers: builtSpeakers,
  speakerPlaceholderCount: builtPlaceholderCount,
  heading,
}: Props) {
  const { events } = useFlagshipEvents()
  const live = events.find((event) => event.slug === slug)
  const showSpeakers = live?.showSpeakers ?? builtShowSpeakers
  const speakers = (live?.speakers ?? builtSpeakers).filter((speaker) => speaker.name.trim())
  const slotCount = live?.speakerPlaceholderCount ?? builtPlaceholderCount
  const placeholders = Math.max(0, slotCount - speakers.length)

  if (!showSpeakers || speakers.length + placeholders === 0) return null

  return (
    <section className="bg-white/50 px-4 py-16 sm:py-20">
      <div className="container-isr">
        {heading}
        <SpeakerCarousel>
          {speakers.map((speaker, index) => (
            <article
              key={`${speaker.name}-${index}`}
              className="h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-(--su-on-light)/10"
            >
              {speaker.image ? (
                <Image
                  src={speaker.image}
                  alt={speaker.name}
                  width={600}
                  height={600}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <Silhouette />
              )}
              <div className="p-5">
                <h3 className="text-lg font-semibold">{speaker.name}</h3>
                <p className="text-sm opacity-75">{speaker.title}</p>
                {speaker.topic && <p className="mt-2 text-sm font-medium text-(--su-accent)">{speaker.topic}</p>}
              </div>
            </article>
          ))}
          {Array.from({ length: placeholders }, (_, index) => (
            <article
              key={`placeholder-${index}`}
              className="h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-(--su-on-light)/10"
            >
              <Silhouette />
              <div className="p-5">
                <h3 className="text-lg font-semibold">Speaker to be announced</h3>
                <p className="text-sm opacity-75">Stay tuned</p>
              </div>
            </article>
          ))}
        </SpeakerCarousel>
      </div>
    </section>
  )
}
