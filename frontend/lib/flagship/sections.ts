import type { AboutBlockId, FlagshipSectionId } from './types'

/** The movable page sections, in their default order, with their admin-panel titles. */
export const FLAGSHIP_SECTIONS: { id: FlagshipSectionId; title: string }[] = [
  { id: 'about', title: 'About' },
  { id: 'speakers', title: 'Speakers' },
  { id: 'programme', title: 'Programme' },
  { id: 'venue', title: 'Venue' },
  { id: 'faqs', title: 'FAQs' },
]

/** The movable blocks inside the about section, in their default order. */
export const ABOUT_BLOCKS: { id: AboutBlockId; title: string }[] = [
  { id: 'description', title: 'Description' },
  { id: 'highlights', title: 'Highlights' },
]

/**
 * `order` with unknown or repeated ids dropped and any missing ones appended in
 * their default order — so events saved before an order existed still render.
 */
function normalizeOrder<T extends string>(defaults: { id: T }[], order: readonly string[] | undefined): T[] {
  const ids = defaults.map((item) => item.id)
  const known = (order ?? []).filter((id): id is T => ids.includes(id as T))
  return [...new Set([...known, ...ids])]
}

export function normalizeSectionOrder(order: readonly string[] | undefined): FlagshipSectionId[] {
  return normalizeOrder(FLAGSHIP_SECTIONS, order)
}

export function normalizeAboutOrder(order: readonly string[] | undefined): AboutBlockId[] {
  return normalizeOrder(ABOUT_BLOCKS, order)
}
