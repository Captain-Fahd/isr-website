import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchFlagshipEvents, fetchFlagshipEventBySlug } from '@/lib/flagship'
import { truncateMetaDescription } from '@/lib/seo'
import FlagshipReleaseGate from '@/components/flagship/FlagshipReleaseGate'
import FlagshipEventView from './_components/FlagshipEventView'

type Params = { slug: string }

// Static export: only registered flagship slugs are built; anything else 404s.
export const dynamicParams = false

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const events = await fetchFlagshipEvents()
    return events.map(({ slug }) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await fetchFlagshipEventBySlug(slug)
  if (!event) return {}

  const pagePath = `/${event.slug}/`
  const description = truncateMetaDescription(event.description)
  return {
    title: event.name,
    description,
    alternates: { canonical: pagePath },
    openGraph: {
      title: `${event.name} | Islamic Society of RMIT`,
      description,
      url: pagePath,
      images: [{ url: event.ogImage, width: 1200, height: 630, alt: event.name }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [event.ogImage],
    },
  }
}

export default async function FlagshipEventPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const event = await fetchFlagshipEventBySlug(slug)
  if (!event) notFound()

  return (
    <FlagshipReleaseGate slug={event.slug}>
      <FlagshipEventView event={event} />
    </FlagshipReleaseGate>
  )
}
