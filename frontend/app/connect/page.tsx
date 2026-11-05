import type { Metadata } from 'next'
import ConnectPageClient from '@/components/ConnectPageClient'

// Unlisted: not in the navbar, not linked from the home page, and excluded from
// search results. Reachable only by visiting the URL directly.
export const metadata: Metadata = {
  title: 'Connect',
  robots: { index: false, follow: false },
}

export default function ConnectPage() {
  return <ConnectPageClient />
}
