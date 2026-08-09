import type { MetadataRoute } from 'next'
import { fetchEvents } from '@/lib/events'
import { SITE_URL, withTrailingSlash } from '@/lib/seo'

export const dynamic = 'force-static'

function pageEntry(
  path: string,
  lastModified = new Date(),
): MetadataRoute.Sitemap[number] {
  const pathname = path === '/' ? '/' : withTrailingSlash(path)
  return {
    url: `${SITE_URL}${pathname}`,
    lastModified,
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    pageEntry('/'),
    pageEntry('/events'),
    pageEntry('/announcements'),
    pageEntry('/about'),
    pageEntry('/contact'),
    pageEntry('/prayer-times'),
    pageEntry('/jumah'),
    pageEntry('/privacy'),
  ]

  let eventPages: MetadataRoute.Sitemap = []
  try {
    const events = await fetchEvents('all')
    eventPages = events.map((event) =>
      pageEntry(`/events/${event.id}`, new Date(event.date)),
    )
  } catch {
    eventPages = []
  }

  return [...staticPages, ...eventPages]
}
