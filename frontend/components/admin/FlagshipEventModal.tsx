'use client'

import { useEffect, useState } from 'react'
import { PlusIcon, Trash2Icon } from 'lucide-react'
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
import { StringListField } from '@/components/admin/StringListField'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { toDatetimeLocalValue, fromDatetimeLocalValue } from '@/lib/events'
import type { EventPhase, FlagshipEvent } from '@/lib/flagship'

type FlagshipEventInput = Omit<FlagshipEvent, 'id'>
type Highlight = FlagshipEvent['highlights'][number]
type Speaker = FlagshipEvent['speakers'][number]
type ProgrammeItem = FlagshipEvent['programme'][number]
type Faq = FlagshipEvent['faqs'][number]

interface Props {
  open: boolean
  event: FlagshipEvent | null
  onClose: () => void
  onSubmit: (payload: FlagshipEventInput) => Promise<void>
}

const PHASES: { value: EventPhase; label: string }[] = [
  { value: 'save-the-date', label: 'Save the date' },
  { value: 'booking', label: 'Booking open' },
]

const emptyVenue: FlagshipEvent['venue'] = { name: '', address: '', mapUrl: '', notes: [] }
const emptyBanner: FlagshipEvent['banner'] = { src: '', alt: '', width: 0, height: 0 }
const emptyTheme: FlagshipEvent['theme'] = {
  dark: '#5B0B05',
  onDark: '#EAE3D8',
  light: '#EAE3D8',
  onLight: '#561610',
  primary: '#D43325',
  onPrimary: '#FFFFFF',
  accent: '#509589',
  hero: { backdrop: '', text: '#561610', heading: '#561610', background: '' },
}

function updateAt<T>(items: T[], index: number, patch: Partial<T>): T[] {
  return items.map((item, i) => (i === index ? { ...item, ...patch } : item))
}

function removeAt<T>(items: T[], index: number): T[] {
  return items.filter((_, i) => i !== index)
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
          aria-label={`${label} color picker`}
        />
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" />
      </div>
    </div>
  )
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-lg border p-4">
      <legend className="-mt-6 bg-popover px-1.5 text-sm font-semibold text-isr-dark-red">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

export function FlagshipEventModal({ open, event, onClose, onSubmit }: Props) {
  const isEdit = event !== null

  const [slug, setSlug] = useState(event?.slug ?? '')
  const [name, setName] = useState(event?.name ?? '')
  const [tagline, setTagline] = useState(event?.tagline ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [phase, setPhase] = useState<EventPhase>(event?.phase ?? 'save-the-date')
  const [featuredOnHome, setFeaturedOnHome] = useState(event?.featuredOnHome ?? false)
  const [released, setReleased] = useState(event?.released ?? false)
  const [ticketUrl, setTicketUrl] = useState(event?.ticketUrl ?? '')
  const [ticketEventId, setTicketEventId] = useState(event?.ticketEventId ?? '')
  const [ticketsOnSale, setTicketsOnSale] = useState(event?.ticketsOnSale ?? false)
  const [start, setStart] = useState(event ? toDatetimeLocalValue(event.start) : '')
  const [end, setEnd] = useState(event ? toDatetimeLocalValue(event.end) : '')
  const [dateLabel, setDateLabel] = useState(event?.dateLabel ?? '')
  const [timeLabel, setTimeLabel] = useState(event?.timeLabel ?? '')
  const [venue, setVenue] = useState<FlagshipEvent['venue']>(event?.venue ?? emptyVenue)
  const [banner, setBanner] = useState<FlagshipEvent['banner']>(event?.banner ?? emptyBanner)
  const [ogImage, setOgImage] = useState(event?.ogImage ?? '')
  const [theme, setTheme] = useState<FlagshipEvent['theme']>(event?.theme ?? emptyTheme)
  const [highlights, setHighlights] = useState<Highlight[]>(event?.highlights ?? [])
  const [speakers, setSpeakers] = useState<Speaker[]>(event?.speakers ?? [])
  const [speakerPlaceholderCount, setSpeakerPlaceholderCount] = useState(
    event?.speakerPlaceholderCount ?? 0,
  )
  const [programme, setProgramme] = useState<ProgrammeItem[]>(event?.programme ?? [])
  const [faqs, setFaqs] = useState<Faq[]>(event?.faqs ?? [])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setSlug(event?.slug ?? '')
    setName(event?.name ?? '')
    setTagline(event?.tagline ?? '')
    setDescription(event?.description ?? '')
    setPhase(event?.phase ?? 'save-the-date')
    setFeaturedOnHome(event?.featuredOnHome ?? false)
    setReleased(event?.released ?? false)
    setTicketUrl(event?.ticketUrl ?? '')
    setTicketEventId(event?.ticketEventId ?? '')
    setTicketsOnSale(event?.ticketsOnSale ?? false)
    setStart(event ? toDatetimeLocalValue(event.start) : '')
    setEnd(event ? toDatetimeLocalValue(event.end) : '')
    setDateLabel(event?.dateLabel ?? '')
    setTimeLabel(event?.timeLabel ?? '')
    setVenue(event?.venue ?? emptyVenue)
    setBanner(event?.banner ?? emptyBanner)
    setOgImage(event?.ogImage ?? '')
    setTheme(event?.theme ?? emptyTheme)
    setHighlights(event?.highlights ?? [])
    setSpeakers(event?.speakers ?? [])
    setSpeakerPlaceholderCount(event?.speakerPlaceholderCount ?? 0)
    setProgramme(event?.programme ?? [])
    setFaqs(event?.faqs ?? [])
    setError('')
  }, [event, open])

  async function handleSave() {
    if (
      !slug ||
      !name ||
      !tagline ||
      !description ||
      !start ||
      !end ||
      !dateLabel ||
      !timeLabel ||
      !venue.name ||
      !venue.address ||
      !banner.src ||
      !ogImage ||
      !theme.hero.backdrop
    ) {
      setError(
        'Please fill in all required fields: basics, schedule, venue name & address, banner image, OG image, and backdrop image.',
      )
      return
    }

    setError('')
    setSubmitting(true)
    try {
      await onSubmit({
        slug,
        name,
        tagline,
        description,
        phase,
        featuredOnHome,
        released,
        ticketUrl,
        ticketEventId,
        ticketsOnSale,
        start: fromDatetimeLocalValue(start),
        end: fromDatetimeLocalValue(end),
        dateLabel,
        timeLabel,
        venue,
        banner,
        ogImage,
        theme,
        highlights,
        speakers,
        speakerPlaceholderCount,
        programme,
        faqs,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Flagship Event' : 'New Flagship Event'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Fieldset title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fe-slug">Slug</Label>
                <Input
                  id="fe-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. sacred-union"
                />
                <p className="text-xs text-muted-foreground">Page served at /{slug || '<slug>'}/</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fe-name">Name</Label>
                <Input id="fe-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fe-tagline">Tagline</Label>
              <Input id="fe-tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fe-description">Description</Label>
              <Textarea
                id="fe-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Separate paragraphs with a blank line…"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fe-phase">Phase</Label>
                <select
                  id="fe-phase"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as EventPhase)}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {PHASES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fe-ticket-url">TryBooking URL (optional)</Label>
                <Input id="fe-ticket-url" value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fe-ticket-event-id">TryBooking event id (optional)</Label>
              <Input
                id="fe-ticket-event-id"
                value={ticketEventId}
                onChange={(e) => setTicketEventId(e.target.value)}
                placeholder="data-eid for the booking widget"
              />
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={featuredOnHome} onCheckedChange={setFeaturedOnHome} id="fe-featured" />
                <Label htmlFor="fe-featured">Featured on home carousel</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={released} onCheckedChange={setReleased} id="fe-released" />
                <Label htmlFor="fe-released">Released (live)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={ticketsOnSale} onCheckedChange={setTicketsOnSale} id="fe-tickets-on-sale" />
                <Label htmlFor="fe-tickets-on-sale">Tickets on sale</Label>
              </div>
            </div>
            {ticketsOnSale && (
              <p className="text-xs text-muted-foreground">
                CTA buttons will link to /{slug || '<slug>'}/tickets/ instead of the external &quot;Notify
                me&quot; link.
              </p>
            )}
          </Fieldset>

          <Fieldset title="Schedule & Venue">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fe-start">Start</Label>
                <Input id="fe-start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fe-end">End</Label>
                <Input id="fe-end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fe-date-label">Date label</Label>
                <Input
                  id="fe-date-label"
                  value={dateLabel}
                  onChange={(e) => setDateLabel(e.target.value)}
                  placeholder="Saturday 28 November 2026"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fe-time-label">Time label</Label>
                <Input
                  id="fe-time-label"
                  value={timeLabel}
                  onChange={(e) => setTimeLabel(e.target.value)}
                  placeholder="1:30 pm – 7:30 pm"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fe-venue-name">Venue name</Label>
                <Input
                  id="fe-venue-name"
                  value={venue.name}
                  onChange={(e) => setVenue({ ...venue, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fe-venue-address">Venue address</Label>
                <Input
                  id="fe-venue-address"
                  value={venue.address}
                  onChange={(e) => setVenue({ ...venue, address: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fe-venue-map">Google Maps link (optional)</Label>
              <Input
                id="fe-venue-map"
                value={venue.mapUrl}
                onChange={(e) => setVenue({ ...venue, mapUrl: e.target.value })}
              />
            </div>
            <StringListField
              label="Venue notes"
              values={venue.notes}
              onChange={(notes) => setVenue({ ...venue, notes })}
              placeholder="e.g. Prayer space available on site"
              addLabel="Add note"
            />
            <ImageUploadField
              id="fe-venue-image"
              label="Venue photo"
              value={venue.image?.src ?? ''}
              optional
              onChange={(src) =>
                setVenue({ ...venue, image: { src, alt: venue.image?.alt ?? '', width: venue.image?.width ?? 0, height: venue.image?.height ?? 0 } })
              }
              onDimensions={({ width, height }) =>
                setVenue((v) => ({ ...v, image: v.image ? { ...v.image, width, height } : { src: '', alt: '', width, height } }))
              }
            />
            {venue.image && (
              <div className="space-y-1.5">
                <Label htmlFor="fe-venue-image-alt">Venue photo alt text</Label>
                <Input
                  id="fe-venue-image-alt"
                  value={venue.image.alt}
                  onChange={(e) => setVenue({ ...venue, image: { ...venue.image!, alt: e.target.value } })}
                />
              </div>
            )}
          </Fieldset>

          <Fieldset title="Theme & Images">
            <div className="grid gap-4 sm:grid-cols-3">
              <ColorField id="fe-color-dark" label="Dark" value={theme.dark} onChange={(v) => setTheme({ ...theme, dark: v })} />
              <ColorField id="fe-color-ondark" label="On dark" value={theme.onDark} onChange={(v) => setTheme({ ...theme, onDark: v })} />
              <ColorField id="fe-color-light" label="Light" value={theme.light} onChange={(v) => setTheme({ ...theme, light: v })} />
              <ColorField id="fe-color-onlight" label="On light" value={theme.onLight} onChange={(v) => setTheme({ ...theme, onLight: v })} />
              <ColorField id="fe-color-primary" label="Primary" value={theme.primary} onChange={(v) => setTheme({ ...theme, primary: v })} />
              <ColorField id="fe-color-onprimary" label="On primary" value={theme.onPrimary} onChange={(v) => setTheme({ ...theme, onPrimary: v })} />
              <ColorField id="fe-color-accent" label="Accent" value={theme.accent} onChange={(v) => setTheme({ ...theme, accent: v })} />
              <ColorField
                id="fe-color-hero-text"
                label="Hero text"
                value={theme.hero.text}
                onChange={(v) => setTheme({ ...theme, hero: { ...theme.hero, text: v } })}
              />
              <ColorField
                id="fe-color-hero-heading"
                label="Hero heading"
                value={theme.hero.heading}
                onChange={(v) => setTheme({ ...theme, hero: { ...theme.hero, heading: v } })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUploadField
                id="fe-banner"
                label="Banner image"
                value={banner.src}
                onChange={(src) => setBanner({ ...banner, src })}
                onDimensions={({ width, height }) => setBanner((b) => ({ ...b, width, height }))}
              />
              <div className="space-y-1.5">
                <Label htmlFor="fe-banner-alt">Banner alt text</Label>
                <Input id="fe-banner-alt" value={banner.alt} onChange={(e) => setBanner({ ...banner, alt: e.target.value })} />
              </div>
            </div>
            <ImageUploadField
              id="fe-banner-mobile"
              label="Banner image (mobile portrait, optional)"
              value={banner.mobile?.src ?? ''}
              optional
              onChange={(src) => setBanner((b) => ({ ...b, mobile: { src, width: b.mobile?.width ?? 0, height: b.mobile?.height ?? 0 } }))}
              onDimensions={({ width, height }) =>
                setBanner((b) => ({ ...b, mobile: b.mobile ? { ...b.mobile, width, height } : { src: '', width, height } }))
              }
            />

            <ImageUploadField
              id="fe-backdrop"
              label="Hero backdrop"
              value={theme.hero.backdrop}
              onChange={(backdrop) => setTheme({ ...theme, hero: { ...theme.hero, backdrop } })}
            />
            <ImageUploadField
              id="fe-backdrop-mobile"
              label="Hero backdrop (mobile portrait, optional)"
              value={theme.hero.backdropMobile ?? ''}
              optional
              onChange={(backdropMobile) => setTheme({ ...theme, hero: { ...theme.hero, backdropMobile } })}
            />
            <div className="space-y-1.5">
              <Label htmlFor="fe-hero-background">Hero background CSS (advanced)</Label>
              <Textarea
                id="fe-hero-background"
                value={theme.hero.background}
                onChange={(e) => setTheme({ ...theme, hero: { ...theme.hero, background: e.target.value } })}
                rows={2}
                placeholder="CSS background-image value, e.g. linear-gradient(to bottom, var(--su-light), var(--su-dark))"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setTheme({
                    ...theme,
                    hero: {
                      ...theme.hero,
                      background: `linear-gradient(to bottom, ${theme.light} 0%, ${theme.dark} 100%)`,
                    },
                  })
                }
              >
                Generate simple gradient from colours
              </Button>
            </div>

            <ImageUploadField id="fe-og-image" label="Link preview image (1200×630)" value={ogImage} onChange={setOgImage} />
          </Fieldset>

          <Fieldset title="Highlights">
            <div className="space-y-3">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2 rounded-lg border p-3">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={highlight.title}
                      placeholder="Title"
                      onChange={(e) => setHighlights(updateAt(highlights, index, { title: e.target.value }))}
                    />
                    <Textarea
                      value={highlight.body}
                      placeholder="Body"
                      rows={2}
                      onChange={(e) => setHighlights(updateAt(highlights, index, { body: e.target.value }))}
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setHighlights(removeAt(highlights, index))}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => setHighlights([...highlights, { title: '', body: '' }])}>
              <PlusIcon className="size-4" />
              Add highlight
            </Button>
          </Fieldset>

          <Fieldset title="Speakers">
            <div className="space-y-1.5">
              <Label htmlFor="fe-speaker-placeholders">Placeholder count (shown while `speakers` is empty)</Label>
              <Input
                id="fe-speaker-placeholders"
                type="number"
                min={0}
                value={speakerPlaceholderCount}
                onChange={(e) => setSpeakerPlaceholderCount(Number(e.target.value) || 0)}
                className="w-24"
              />
            </div>
            <div className="space-y-3">
              {speakers.map((speaker, index) => (
                <div key={index} className="flex gap-2 rounded-lg border p-3">
                  <div className="flex-1 space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        value={speaker.name}
                        placeholder="Name"
                        onChange={(e) => setSpeakers(updateAt(speakers, index, { name: e.target.value }))}
                      />
                      <Input
                        value={speaker.title}
                        placeholder="Title"
                        onChange={(e) => setSpeakers(updateAt(speakers, index, { title: e.target.value }))}
                      />
                    </div>
                    <Input
                      value={speaker.topic ?? ''}
                      placeholder="Topic (optional)"
                      onChange={(e) => setSpeakers(updateAt(speakers, index, { topic: e.target.value }))}
                    />
                    <ImageUploadField
                      id={`fe-speaker-image-${index}`}
                      label="Photo"
                      value={speaker.image}
                      onChange={(image) => setSpeakers(updateAt(speakers, index, { image }))}
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setSpeakers(removeAt(speakers, index))}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSpeakers([...speakers, { name: '', title: '', topic: '', image: '' }])}
            >
              <PlusIcon className="size-4" />
              Add speaker
            </Button>
          </Fieldset>

          <Fieldset title="Programme">
            <div className="space-y-3">
              {programme.map((item, index) => (
                <div key={index} className="flex gap-2 rounded-lg border p-3">
                  <div className="flex-1 space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        value={item.time}
                        placeholder="Time, e.g. 1:30 pm"
                        onChange={(e) => setProgramme(updateAt(programme, index, { time: e.target.value }))}
                      />
                      <Input
                        value={item.title}
                        placeholder="Title"
                        onChange={(e) => setProgramme(updateAt(programme, index, { title: e.target.value }))}
                      />
                    </div>
                    <Input
                      value={item.detail ?? ''}
                      placeholder="Detail (optional)"
                      onChange={(e) => setProgramme(updateAt(programme, index, { detail: e.target.value }))}
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setProgramme(removeAt(programme, index))}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => setProgramme([...programme, { time: '', title: '' }])}>
              <PlusIcon className="size-4" />
              Add item
            </Button>
          </Fieldset>

          <Fieldset title="FAQs">
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="flex gap-2 rounded-lg border p-3">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={faq.question}
                      placeholder="Question"
                      onChange={(e) => setFaqs(updateAt(faqs, index, { question: e.target.value }))}
                    />
                    <Textarea
                      value={faq.answer}
                      placeholder="Answer"
                      rows={2}
                      onChange={(e) => setFaqs(updateAt(faqs, index, { answer: e.target.value }))}
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setFaqs(removeAt(faqs, index))}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}>
              <PlusIcon className="size-4" />
              Add FAQ
            </Button>
          </Fieldset>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
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
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Flagship Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
