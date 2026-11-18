'use client'

import { Fragment, type ReactNode } from 'react'
import { useLiveFlagshipEvent } from '@/lib/flagship/preview'
import { normalizeAboutOrder, normalizeSectionOrder } from '@/lib/flagship/sections'

type Props = {
  slug: string
  /** Which saved order to follow: the page sections, or the blocks inside About. */
  field: 'sectionOrder' | 'aboutOrder'
  builtOrder: string[] | undefined
  blocks: Record<string, ReactNode>
}

/**
 * Renders `blocks` in the event's saved order. The order is read live (see
 * lib/flagship/live.ts) so reordering in the admin panel reaches this
 * static-exported page without a rebuild — same reasoning as `released`.
 */
export default function LiveOrder({ slug, field, builtOrder, blocks }: Props) {
  const order = useLiveFlagshipEvent(slug)?.[field] ?? builtOrder
  const ids = field === 'sectionOrder' ? normalizeSectionOrder(order) : normalizeAboutOrder(order)

  return (
    <>
      {ids.map((id) => (
        <Fragment key={id}>{blocks[id]}</Fragment>
      ))}
    </>
  )
}
