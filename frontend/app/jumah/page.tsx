'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/**
 * Legacy /jumah route — redirects to the combined prayer times page.
 * Kept for old links; static export cannot use next.config redirects.
 */
export default function JumahRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/prayer-times/#jumah')
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-isr-cream px-4">
      <p className="text-center text-gray-700">
        Jumu&apos;ah details have moved to{' '}
        <Link
          href="/prayer-times/#jumah"
          className="font-semibold text-isr-dark-red underline underline-offset-2"
        >
          Prayer Times &amp; Jumu&apos;ah
        </Link>
        .
      </p>
    </main>
  )
}
