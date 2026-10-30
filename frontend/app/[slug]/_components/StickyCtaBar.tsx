'use client'

import { useEffect, useState } from 'react'
import PrimaryCta from './PrimaryCta'
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
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-(--su-on-dark)/15 bg-(--su-dark)/95 px-4 py-3 text-(--su-on-dark) backdrop-blur-md transition-transform duration-300 md:hidden ${
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{name}</p>
          <p className="truncate text-xs opacity-75">{dateLabel}</p>
        </div>
        <PrimaryCta
          phase={phase}
          ticketUrl={ticketUrl}
          slug={slug}
          ticketsOnSale={ticketsOnSale}
          className="shrink-0 px-4 text-xs"
        />
      </div>
    </div>
  )
}
