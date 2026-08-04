'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { Announcement } from '@/lib/announcements'

interface Props {
  open: boolean
  announcement: Announcement | null
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
}

export function AnnouncementModal({ open, announcement, onClose, onSubmit }: Props) {
  const isEdit = announcement !== null

  const [title, setTitle] = useState(announcement?.title ?? '')
  const [body, setBody] = useState(announcement?.body ?? '')
  const [pinned, setPinned] = useState(announcement?.pinned ?? false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setTitle(announcement?.title ?? '')
    setBody(announcement?.body ?? '')
    setPinned(announcement?.pinned ?? false)
    setImageFile(null)
    setError('')
  }, [announcement, open])

  async function handleSave() {
    if (!title || !body) {
      setError('Title and body are required')
      return
    }

    setError('')
    setSubmitting(true)

    const formData = new FormData()
    formData.set('title', title)
    formData.set('body', body)
    formData.set('pinned', pinned ? 'true' : 'false')
    if (imageFile) formData.set('image', imageFile)

    try {
      await onSubmit(formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Announcement' : 'New Announcement'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="an-title">Title</Label>
            <Input
              id="an-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ramadan Reminder"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="an-body">Body</Label>
            <Textarea
              id="an-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Full announcement text…"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Pin announcement</p>
              <p className="text-xs text-muted-foreground">
                Pinned announcements appear at the top of the list
              </p>
            </div>
            <Switch
              checked={pinned}
              onCheckedChange={(checked) => setPinned(checked)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="an-image">Image (optional)</Label>
            {announcement?.imageUrl && (
              <p className="text-xs text-muted-foreground">
                Current:{' '}
                <a
                  href={announcement.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 text-isr-turquoise"
                >
                  view
                </a>
              </p>
            )}
            <Input
              id="an-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="cursor-pointer"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={submitting}
            className="bg-isr-dark-red hover:bg-isr-dark-red/90 text-isr-cream"
          >
            {submitting
              ? 'Saving…'
              : isEdit
              ? 'Save Changes'
              : 'Create Announcement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
