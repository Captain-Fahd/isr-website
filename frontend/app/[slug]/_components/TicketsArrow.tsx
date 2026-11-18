'use client'

import { ArrowDownIcon } from 'lucide-react'
import { useTicketsLive } from '@/components/flagship/TicketsStatusLabel'
import type { FlagshipEvent } from '@/lib/flagship'

/** Points from the hero down to the booking section at the foot of the page, while tickets are on sale. */
export default function TicketsArrow({ event }: { event: FlagshipEvent }) {
  if (!useTicketsLive(event)) return null

  return (
    <a
      href="#booking"
      className="absolute inset-x-0 bottom-5 mx-auto flex w-fit flex-col items-center gap-1 rounded-full bg-(--su-dark)/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-(--su-on-dark) shadow-lg ring-1 ring-(--su-on-dark)/20 backdrop-blur-sm transition hover:bg-(--su-dark)"
    >
      Tickets below
      <ArrowDownIcon className="size-5 motion-safe:animate-bounce" aria-hidden="true" />
    </a>
  )
}
