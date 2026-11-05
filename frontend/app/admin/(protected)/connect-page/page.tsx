'use client'

import { useEffect, useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { getToken } from '@/lib/auth'
import { fetchCommunityFormsPageAdmin, updateCommunityFormsPage } from '@/lib/admin-api'
import type { CommunityFormsPage, FormButton } from '@/lib/communityFormsPage'

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-lg border p-4">
      <legend className="-mt-6 bg-white px-1.5 text-sm font-semibold text-isr-dark-red">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function updateAt<T>(items: T[], index: number, patch: Partial<T>): T[] {
  return items.map((item, i) => (i === index ? { ...item, ...patch } : item))
}

function removeAt<T>(items: T[], index: number): T[] {
  return items.filter((_, i) => i !== index)
}

function moveAt<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction
  if (target < 0 || target >= items.length) return items
  const next = [...items]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

export default function AdminConnectPage() {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  const [enabled, setEnabled] = useState(false)
  const [title, setTitle] = useState('')
  const [intro, setIntro] = useState('')
  const [buttons, setButtons] = useState<FormButton[]>([])

  useEffect(() => {
    fetchCommunityFormsPageAdmin()
      .then((page: CommunityFormsPage) => {
        setEnabled(page.enabled)
        setTitle(page.title)
        setIntro(page.intro)
        setButtons(page.buttons)
      })
      .catch(() => setLoadError('Failed to load the Connect page'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaveError('')
    setSaved(false)
    setSaving(true)
    try {
      const token = getToken()!
      await updateCommunityFormsPage(token, { enabled, title, intro, buttons })
      setSaved(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-isr-dark-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (loadError) {
    return <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3">{loadError}</p>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-isr-dark-red">Connect Page</h1>
          <p className="text-sm text-muted-foreground">
            The unlisted page at <code>/connect/</code> — not linked from the navbar or home page.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-white p-4">
        <Fieldset title="Visibility">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="cp-enabled">Page enabled</Label>
              <p className="text-xs text-muted-foreground">
                Off = visiting /connect/ shows an unavailable message.
              </p>
            </div>
            <Switch id="cp-enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </Fieldset>

        <Fieldset title="Content">
          <div className="space-y-1.5">
            <Label htmlFor="cp-title">Title</Label>
            <Input id="cp-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp-intro">Intro (optional)</Label>
            <Textarea
              id="cp-intro"
              rows={3}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
            />
          </div>
        </Fieldset>

        <Fieldset title="Buttons">
          <div className="space-y-3">
            {buttons.map((button, index) => (
              <div key={index} className="flex gap-2 rounded-lg border p-3">
                <div className="flex-1 space-y-2">
                  <Input
                    value={button.label}
                    placeholder="Button label, e.g. Feedback"
                    onChange={(e) => setButtons(updateAt(buttons, index, { label: e.target.value }))}
                  />
                  <Input
                    value={button.url}
                    placeholder="https://forms.gle/..."
                    onChange={(e) => setButtons(updateAt(buttons, index, { url: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setButtons(moveAt(buttons, index, -1))}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <ArrowUpIcon />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setButtons(moveAt(buttons, index, 1))}
                    disabled={index === buttons.length - 1}
                    title="Move down"
                  >
                    <ArrowDownIcon />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setButtons(removeAt(buttons, index))}
                    className="text-destructive hover:bg-destructive/10"
                    title="Remove button"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setButtons([...buttons, { label: '', url: '' }])}
          >
            <PlusIcon className="size-4" />
            Add button
          </Button>
        </Fieldset>

        {saveError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{saveError}</p>}
        {saved && <p className="text-sm text-isr-turquoise bg-isr-turquoise/10 rounded-lg px-3 py-2">Saved.</p>}

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-isr-dark-red hover:bg-isr-dark-red/90 text-isr-cream"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
