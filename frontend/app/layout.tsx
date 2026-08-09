import type { Metadata } from 'next'
import './globals.css'
import { Geist } from 'next/font/google'
import { cn } from '@/lib/utils'
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  organizationJsonLd,
} from '@/lib/seo'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Islamic Society of RMIT (ISR) — supporting Muslim students at RMIT University with weekly Jumu\'ah, prayer spaces, events, and community.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description:
      'Supporting Muslim students at RMIT University. Weekly Jumu\'ah, events, and community.',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: 'Islamic Society of RMIT logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description:
      'Supporting Muslim students at RMIT University. Weekly Jumu\'ah, events, and community.',
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: '/images/isr_logo_dark.JPG',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = organizationJsonLd()

  return (
    <html lang="en-AU" className={cn('font-sans', geist.variable)}>
      <body className="bg-white text-gray-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
