'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import { useLiveFlagshipEvent } from '@/lib/flagship/preview'
import SpeakerCarousel from './SpeakerCarousel'
import type { Speaker } from '@/lib/flagship/types'
import { frostedCard, serif } from './flagshipStyle'

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
  const live = useLiveFlagshipEvent(slug)
  const showSpeakers = live?.showSpeakers ?? builtShowSpeakers
  const speakers = (live?.speakers ?? builtSpeakers).filter((speaker) => speaker.name.trim())
  const slotCount = live?.speakerPlaceholderCount ?? builtPlaceholderCount
  const placeholders = Math.max(0, slotCount - speakers.length)

  if (!showSpeakers || speakers.length + placeholders === 0) return null

  return (
    <section className="bg-white/40 px-4 py-16 sm:py-20">
      <div className="container-isr">
        {heading}
        <SpeakerCarousel>
          {speakers.map((speaker, index) => (
            <article
              key={`${speaker.name}-${index}`}
              className={`${frostedCard} h-full overflow-hidden border-b-4 border-(--su-dark)`}
            >
              {speaker.image?.trim() ? (
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
                <h3 className={`${serif.className} text-xl font-bold text-(--su-dark)`}>{speaker.name}</h3>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{speaker.title}</p>
                {speaker.topic && (
                  <p className={`${serif.className} mt-3 border-t border-(--su-dark)/15 pt-3 italic text-(--su-primary)`}>{speaker.topic}</p>
                )}
              </div>
            </article>
          ))}
          {Array.from({ length: placeholders }, (_, index) => (
            <article
              key={`placeholder-${index}`}
              className={`${frostedCard} h-full overflow-hidden border-b-4 border-(--su-dark)`}
            >
              <Silhouette />
              <div className="p-5">
                <h3 className={`${serif.className} text-xl font-bold text-(--su-dark)`}>Speaker to be announced</h3>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.18em] opacity-70">Stay tuned</p>
              </div>
            </article>
          ))}
        </SpeakerCarousel>
      </div>
    </section>
  )
}
