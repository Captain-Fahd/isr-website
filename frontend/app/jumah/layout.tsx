import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Jumu'ah Prayers at RMIT",
  description:
    "Jumu'ah details have moved to the Prayer Times & Jumu'ah page for RMIT City and Bundoora.",
  alternates: { canonical: '/prayer-times/' },
  robots: { index: false, follow: true },
}

export default function JumahLayout({ children }: { children: React.ReactNode }) {
  return children
}
