'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  getToken,
  getTokenExpiry,
  removeToken,
  SESSION_EXPIRED_EVENT,
} from '@/lib/auth'

const NAV_LINKS = [
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/announcements', label: 'Announcements' },
  { href: '/admin/flagship-events', label: 'Flagship Events' },
  { href: '/admin/connect-page', label: 'Connect Page' },
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
    function toLogin() {
      removeToken()
      router.replace('/admin/login')
    }

    const token = getToken()
    if (!token) {
      toLogin()
      return
    }
    setReady(true)

    // Redirect the moment the token expires, even if the admin is idle on the page.
    // (Capped because setTimeout overflows past ~24.8 days.)
    const expiry = getTokenExpiry(token)
    const delay = expiry === null ? 0 : Math.max(0, expiry - Date.now())
    const timer = window.setTimeout(toLogin, Math.min(delay, 2 ** 31 - 1))

    // Timers are throttled/paused in background tabs and during sleep, so
    // re-check when the admin comes back to the tab.
    function recheck() {
      if (document.visibilityState === 'visible' && !getToken()) toLogin()
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, toLogin)
    document.addEventListener('visibilitychange', recheck)
    window.addEventListener('focus', recheck)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(SESSION_EXPIRED_EVENT, toLogin)
      document.removeEventListener('visibilitychange', recheck)
      window.removeEventListener('focus', recheck)
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
