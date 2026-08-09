import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // No trailing slash — robots prefix matching treats /admin and /admin/ as distinct.
      disallow: ['/admin'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
