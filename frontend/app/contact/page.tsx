import type { Metadata } from 'next'
import ContactPageClient from '@/components/ContactPageClient'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact the Islamic Society of RMIT — email, WhatsApp, Instagram, and campus location for Muslim students at RMIT University City Campus, Melbourne.',
  alternates: { canonical: '/contact/' },
  openGraph: {
    title: 'Contact | Islamic Society of RMIT',
    description:
      'Contact the Islamic Society of RMIT — email, WhatsApp, Instagram, and campus location for Muslim students at RMIT University City Campus, Melbourne.',
    url: '/contact/',
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}
