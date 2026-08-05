import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theisr.com.au'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
