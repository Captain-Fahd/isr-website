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
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
  type Event,
} from '@/lib/events'

interface Props {
  open: boolean
  event: Event | null
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
}

export function EventModal({ open, event, onClose, onSubmit }: Props) {
  const isEdit = event !== null

  const [name, setName] = useState(event?.name ?? '')
  const [date, setDate] = useState(event ? toDatetimeLocalValue(event.date) : '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setName(event?.name ?? '')
    setDate(event ? toDatetimeLocalValue(event.date) : '')
    setDescription(event?.description ?? '')
    setImageFile(null)
    setError('')
  }, [event, open])

  async function handleSave() {
    if (!name || !date || !description) {
      setError('Name, date, and description are required')
      return
    }
    if (!isEdit && !imageFile) {
      setError('An image is required')
      return
    }

    setError('')
    setSubmitting(true)

    const formData = new FormData()
    formData.set('name', name)
    formData.set('date', fromDatetimeLocalValue(date))
    formData.set('description', description)
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
          <DialogTitle>{isEdit ? 'Edit Event' : 'New Event'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ev-name">Name</Label>
            <Input
              id="ev-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eid Dinner"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-date">Date &amp; Time</Label>
            <Input
              id="ev-date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-desc">Description</Label>
            <Textarea
              id="ev-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What's this event about?"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-image">
              {isEdit ? 'Replace Image (optional)' : 'Image'}
            </Label>
            {event?.imageUrl && (
              <p className="text-xs text-muted-foreground">
                Current:{' '}
                <a
                  href={event.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 text-isr-turquoise"
                >
                  view
                </a>
              </p>
            )}
            <Input
              id="ev-image"
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
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
