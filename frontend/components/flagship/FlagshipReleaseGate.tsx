'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { useSiteSettings } from '@/lib/siteSettings'

/**
 * Hides a flagship event page until an admin releases it from the admin panel.
 * Visitors are sent to the home page; signed-in admins see the page with a
 * preview banner so they can check it before launch.
 */
export default function FlagshipReleaseGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { settings, loading } = useSiteSettings()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => setIsAdmin(Boolean(getToken())), [])

  const released = settings.flagshipReleased
  const hidden = !loading && !released && !isAdmin

  useEffect(() => {
    if (hidden) router.replace('/')
  }, [hidden, router])

  // Cached "released" renders straight away; otherwise wait for the API.
  if (!released && (loading || hidden)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-isr-cream">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-isr-dark-red border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      {!released && (
        <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-3 bg-isr-dark-red px-4 py-2 text-sm text-isr-cream">
          <span>Admin preview — this page is hidden from the public.</span>
          <Link href="/admin/site/" className="font-semibold underline underline-offset-4">
            Release
          </Link>
        </div>
      )}
      {children}
    </>
  )
}
