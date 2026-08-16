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
  type RecurrenceFrequency,
} from '@/lib/events'

type FrequencyValue = '' | RecurrenceFrequency

const FREQUENCY_OPTIONS: { value: FrequencyValue; label: string }[] = [
  { value: '', label: 'Does not repeat' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
]

const INTERVAL_UNITS: Record<RecurrenceFrequency, string> = {
  DAILY: 'day(s)',
  WEEKLY: 'week(s)',
  MONTHLY: 'month(s)',
}

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
  const [ticketUrl, setTicketUrl] = useState(event?.ticketUrl ?? '')
  const [endDate, setEndDate] = useState(
    event?.endDate ? toDatetimeLocalValue(event.endDate) : '',
  )
  const [frequency, setFrequency] = useState<FrequencyValue>(
    event?.recurrenceFrequency ?? '',
  )
  const [interval, setInterval] = useState(String(event?.recurrenceInterval ?? 1))
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(
    event?.recurrenceEndDate ? toDatetimeLocalValue(event.recurrenceEndDate) : '',
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setName(event?.name ?? '')
    setDate(event ? toDatetimeLocalValue(event.date) : '')
    setDescription(event?.description ?? '')
    setTicketUrl(event?.ticketUrl ?? '')
    setEndDate(event?.endDate ? toDatetimeLocalValue(event.endDate) : '')
    setFrequency(event?.recurrenceFrequency ?? '')
    setInterval(String(event?.recurrenceInterval ?? 1))
    setRecurrenceEndDate(
      event?.recurrenceEndDate ? toDatetimeLocalValue(event.recurrenceEndDate) : '',
    )
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
    if (endDate && fromDatetimeLocalValue(endDate) <= fromDatetimeLocalValue(date)) {
      setError('The end date must be after the start date')
      return
    }
    if (frequency) {
      const parsedInterval = Number(interval)
      if (!Number.isInteger(parsedInterval) || parsedInterval < 1 || parsedInterval > 365) {
        setError('Repeat every must be a whole number between 1 and 365')
        return
      }
      if (
        recurrenceEndDate &&
        fromDatetimeLocalValue(recurrenceEndDate) < fromDatetimeLocalValue(date)
      ) {
        setError('The repeat-until date must be on or after the start date')
        return
      }
    }

    setError('')
    setSubmitting(true)

    const formData = new FormData()
    formData.set('name', name)
    formData.set('date', fromDatetimeLocalValue(date))
    formData.set('description', description)
    formData.set('ticketUrl', ticketUrl)
    // Blank values clear the field server-side, which is how a multi-day or
    // recurring event is turned back into a plain one-off.
    formData.set('endDate', endDate ? fromDatetimeLocalValue(endDate) : '')
    formData.set('recurrenceFrequency', frequency)
    formData.set('recurrenceInterval', frequency ? interval : '')
    formData.set(
      'recurrenceEndDate',
      frequency && recurrenceEndDate ? fromDatetimeLocalValue(recurrenceEndDate) : '',
    )
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
            <Label htmlFor="ev-date">Starts</Label>
            <Input
              id="ev-date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-end-date">Ends (optional — for multi-day events)</Label>
            <Input
              id="ev-end-date"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for an event that starts and finishes on the same day.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-frequency">Repeats</Label>
            <select
              id="ev-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as FrequencyValue)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {frequency && (
            <div className="space-y-4 rounded-lg border border-isr-light-blue/40 bg-isr-cream/40 p-3">
              <div className="space-y-1.5">
                <Label htmlFor="ev-interval">Repeat every</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="ev-interval"
                    type="number"
                    min={1}
                    max={365}
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">
                    {INTERVAL_UNITS[frequency]}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ev-recurrence-end">Repeat until (optional)</Label>
                <Input
                  id="ev-recurrence-end"
                  type="datetime-local"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to keep repeating indefinitely.
                </p>
              </div>
            </div>
          )}

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
            <Label htmlFor="ev-ticket">Ticket URL (optional)</Label>
            <Input
              id="ev-ticket"
              type="url"
              value={ticketUrl}
              onChange={(e) => setTicketUrl(e.target.value)}
              placeholder="https://tickets.example.com/event"
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
