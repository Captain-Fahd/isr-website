'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ExternalLinkIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { getToken } from '@/lib/auth'
import { updateSiteSettings } from '@/lib/admin-api'
import { fetchSiteSettings, type SiteSettings } from '@/lib/siteSettings'
import { FLAGSHIP_EVENTS } from '@/lib/flagship'

const event = FLAGSHIP_EVENTS[0]

function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export default function AdminSitePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    fetchSiteSettings()
      .then(setSettings)
      .catch(() => setLoadError('Failed to load site settings'))
  }, [])

  const released = settings?.flagshipReleased ?? false

  // Saves as soon as it's flipped, so the site can be shown and hidden again quickly.
  async function handleToggle(next: boolean) {
    if (!settings) return
    const previous = settings
    setSettings({ ...settings, flagshipReleased: next })
    setSaving(true)
    setSaveError('')
    try {
      setSettings(await updateSiteSettings(getToken()!, { flagshipReleased: next }))
    } catch (err) {
      setSettings(previous)
      setSaveError(err instanceof Error ? err.message : 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-isr-dark-red mb-6">Site</h1>

      {loadError && (
        <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3">{loadError}</p>
      )}

      {!settings && !loadError && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-isr-dark-red border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {settings && (
        <section className="rounded-xl border bg-white p-6 max-w-2xl">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <Label htmlFor="flagship-released" className="text-lg font-semibold">
                  {event.name}
                </Label>
                {released ? (
                  <Badge className="bg-isr-turquoise text-white">Live</Badge>
                ) : (
                  <Badge variant="secondary">Hidden</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {released
                  ? `On: the home page shows the hero carousel with ${event.name} first, and /${event.slug}/ is public.`
                  : `Off: the home page shows the regular hero and /${event.slug}/ is hidden from visitors. You can still preview it while signed in.`}
              </p>
            </div>
            <Switch
              id="flagship-released"
              checked={released}
              onCheckedChange={handleToggle}
              disabled={saving}
              className="mt-1 data-checked:bg-isr-turquoise"
            />
          </div>

          {saveError && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{saveError}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {saving
                ? 'Saving…'
                : settings.updatedAt
                  ? `Last changed ${formatUpdatedAt(settings.updatedAt)}`
                  : 'Never changed'}
            </p>
            <Link
              href={`/${event.slug}/`}
              target="_blank"
              className={buttonVariants({ variant: 'ghost' })}
            >
              <ExternalLinkIcon className="size-4" />
              Preview page
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
