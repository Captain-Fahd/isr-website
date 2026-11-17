'use client'

import { useEffect, useState } from 'react'
import PrimaryCta from './PrimaryCta'
import { plate, serif } from './flagshipStyle'
import type { EventPhase } from '@/lib/flagship/types'

type Props = {
  phase: EventPhase
  ticketUrl: string
  slug: string
  ticketsOnSale: boolean
  name: string
  dateLabel: string
}

/** Phone-only bottom bar that appears once the hero CTA scrolls out of view. */
export default function StickyCtaBar({ phase, ticketUrl, slug, ticketsOnSale, name, dateLabel }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting))
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 ${plate} border-t border-white/15 px-4 py-3 shadow-[0_-8px_24px_rgb(0_0_0/0.2)] transition-transform duration-300 md:hidden ${
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={`${serif.className} truncate text-base font-bold italic`}>{name}</p>
          <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.15em] opacity-80">{dateLabel}</p>
        </div>
        <PrimaryCta
          phase={phase}
          ticketUrl={ticketUrl}
          slug={slug}
          ticketsOnSale={ticketsOnSale}
          variant="light"
          className="shrink-0 px-4"
        />
      </div>
    </div>
  )
}
