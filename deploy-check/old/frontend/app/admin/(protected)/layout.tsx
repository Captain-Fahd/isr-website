'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getToken, removeToken } from '@/lib/auth'

const NAV_LINKS = [
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/announcements', label: 'Announcements' },
]

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      router.replace('/admin/login')
    } else {
      setReady(true)
    }
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen bg-isr-cream flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-isr-dark-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  function handleLogout() {
    removeToken()
    router.replace('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-isr-dark-red shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-8">
              <span className="font-bold text-isr-cream tracking-wide text-sm">
                ISR Admin
              </span>
              <div className="flex gap-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      pathname.startsWith(href)
                        ? 'bg-white/15 text-white'
                        : 'text-isr-cream/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-isr-cream/70 hover:text-white transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
