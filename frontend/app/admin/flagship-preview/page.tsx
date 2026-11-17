'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getToken } from '@/lib/auth'
import { useAdminSession } from '@/lib/useAdminSession'
import {
  fetchAdminFlagshipEvents,
  publishFlagshipEventDraft,
  withDraftApplied,
  type AdminFlagshipEvent,
} from '@/lib/admin-api'
import { FlagshipPreviewProvider } from '@/lib/flagship/preview'
import FlagshipEventView from '@/app/[slug]/_components/FlagshipEventView'

/**
 * Admin-only preview of a flagship event page with its unpublished draft applied:
 * /admin/flagship-preview/?slug=<slug>. The site is a static export, so this is a
 * single client-rendered route keyed by query string rather than a page per slug —
 * it works for events created since the last build, and the draft never leaves
 * the authenticated admin API.
 */
export default function FlagshipPreviewPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <FlagshipPreview />
    </Suspense>
  )
}

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-isr-cream">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-isr-dark-red border-t-transparent" />
    </div>
  )
}

function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-isr-cream px-4 text-center text-isr-dark-red">
      <p>{children}</p>
      <Link href="/admin/flagship-events/" className="font-semibold underline underline-offset-4">
        Back to flagship events
      </Link>
    </div>
  )
}

function FlagshipPreview() {
  const ready = useAdminSession()
  const slug = useSearchParams().get('slug') ?? ''

  const [event, setEvent] = useState<AdminFlagshipEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showLive, setShowLive] = useState(false)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    if (!ready) return
    const token = getToken()
    if (!token) return
    fetchAdminFlagshipEvents(token)
      .then((events) => {
        setEvent(
          events.find((e) => e.slug === slug) ??
            events.find((e) => e.draft?.slug === slug) ??
            null,
        )
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load event'))
      .finally(() => setLoading(false))
  }, [ready, slug])

  async function handlePublish() {
    if (!event?.draft) return
    const goesLive = event.draft.released
    const confirmed = window.confirm(
      goesLive
        ? `Publish these changes to "${event.draft.name}"? They will be visible to the public.`
        : `Publish these changes to "${event.draft.name}"? The page stays hidden until it is released.`,
    )
    if (!confirmed) return

    setPublishing(true)
    setError('')
    try {
      setEvent(await publishFlagshipEventDraft(getToken()!, event.id))
      setShowLive(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }

  if (!ready || loading) return <Spinner />
  if (!slug) return <Message>No event selected to preview.</Message>
  if (!event) return <Message>{error || `No flagship event found for “${slug}”.`}</Message>

  const hasDraft = Boolean(event.draft)
  const shown = showLive || !hasDraft ? event : withDraftApplied(event)

  let status: string
  if (hasDraft && !showLive) status = 'Previewing unpublished changes — not visible to the public.'
  else if (hasDraft) status = 'Showing the current live version (without your draft).'
  else status = 'No unpublished changes — this is the current version.'
  if (!shown.released) status += ' This page is hidden from the public.'

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-isr-dark-red px-4 py-2 text-sm text-isr-cream shadow-md">
        <span className="font-semibold">Admin preview</span>
        <span className="opacity-90">{status}</span>
        {error && <span className="rounded bg-isr-bright-red px-2 py-0.5 text-white">{error}</span>}
        <div className="flex flex-wrap items-center gap-2">
          {hasDraft && (
            <>
              <button
                type="button"
                onClick={() => setShowLive((v) => !v)}
                className="rounded border border-isr-cream/50 px-2.5 py-1 hover:bg-white/10"
              >
                {showLive ? 'View draft' : 'View live version'}
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="rounded bg-isr-turquoise px-2.5 py-1 font-semibold text-white hover:bg-isr-turquoise/90 disabled:opacity-60"
              >
                {publishing ? 'Publishing…' : 'Publish changes'}
              </button>
            </>
          )}
          <Link
            href="/admin/flagship-events/"
            className="rounded border border-isr-cream/50 px-2.5 py-1 hover:bg-white/10"
          >
            Back to admin
          </Link>
        </div>
      </div>

      <FlagshipPreviewProvider>
        {/* Remount on toggle so client sections (countdown, carousel) reset cleanly */}
        <FlagshipEventView key={showLive ? 'live' : 'draft'} event={shown} />
      </FlagshipPreviewProvider>
    </>
  )
}
