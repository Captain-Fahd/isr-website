'use client'

import { useEffect, useMemo, useState } from 'react'
import { PlusIcon, PencilIcon, Trash2Icon, EyeIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FlagshipEventModal } from '@/components/admin/FlagshipEventModal'
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog'
import { getToken } from '@/lib/auth'
import {
  fetchAdminFlagshipEvents,
  createFlagshipEvent,
  updateFlagshipEvent,
  deleteFlagshipEvent,
  saveFlagshipEventDraft,
  discardFlagshipEventDraft,
  withDraftApplied,
  flagshipPreviewPath,
  type AdminFlagshipEvent,
  type FlagshipEventInput,
} from '@/lib/admin-api'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne',
    dateStyle: 'medium',
  }).format(new Date(iso))
}

export default function AdminFlagshipEventsPage() {
  const [events, setEvents] = useState<AdminFlagshipEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  // Snapshot taken when the modal opens; the form is filled from it (draft applied).
  const [selectedEvent, setSelectedEvent] = useState<AdminFlagshipEvent | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<AdminFlagshipEvent | null>(null)

  const formEvent = useMemo(
    () => (selectedEvent ? withDraftApplied(selectedEvent) : null),
    [selectedEvent],
  )
  // Read from the list (not the snapshot) so it updates as drafts are saved/discarded.
  const selectedHasDraft = Boolean(
    selectedEvent && events.find((e) => e.id === selectedEvent.id)?.draft,
  )

  function replaceEvent(updated: AdminFlagshipEvent) {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
  }

  useEffect(() => {
    fetchAdminFlagshipEvents(getToken()!)
      .then(setEvents)
      .catch(() => setLoadError('Failed to load flagship events'))
      .finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setSelectedEvent(null)
    setModalOpen(true)
  }

  function openEdit(event: AdminFlagshipEvent) {
    setSelectedEvent(event)
    setModalOpen(true)
  }

  function openDelete(event: AdminFlagshipEvent) {
    setEventToDelete(event)
    setDeleteOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
  }

  function closeDelete() {
    setDeleteOpen(false)
    setEventToDelete(null)
  }

  async function handleSubmit(payload: FlagshipEventInput) {
    const token = getToken()!
    if (selectedEvent) {
      // Publishing straight from the form also clears any pending draft.
      const updated = await updateFlagshipEvent(token, selectedEvent.id, payload)
      replaceEvent({ ...updated, draft: null })
    } else {
      const created = await createFlagshipEvent(token, payload)
      setEvents((prev) => [...prev, { ...created, draft: null }])
    }
  }

  async function handleSaveDraft(payload: FlagshipEventInput) {
    replaceEvent(await saveFlagshipEventDraft(getToken()!, selectedEvent!.id, payload))
  }

  async function handleDiscardDraft() {
    const updated = await discardFlagshipEventDraft(getToken()!, selectedEvent!.id)
    replaceEvent(updated)
    setSelectedEvent(updated) // reloads the form with the live content
  }

  async function handleDelete() {
    const token = getToken()!
    await deleteFlagshipEvent(token, eventToDelete!.id)
    setEvents((prev) => prev.filter((e) => e.id !== eventToDelete!.id))
    closeDelete()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-isr-dark-red">Flagship Events</h1>
        <Button onClick={openCreate} className="bg-isr-turquoise hover:bg-isr-turquoise/90 text-white">
          <PlusIcon className="size-4" />
          New Flagship Event
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-isr-dark-red border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {loadError && <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3">{loadError}</p>}

      {!loading && !loadError && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    No flagship events yet. Create your first one.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{event.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">/{event.slug}/</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(event.start)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {event.released ? (
                          <Badge className="bg-isr-turquoise/15 text-isr-turquoise hover:bg-isr-turquoise/20 border-0">
                            Live
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Hidden
                          </Badge>
                        )}
                        {event.draft && (
                          <Badge className="bg-isr-yellow text-isr-dark-red hover:bg-isr-yellow border-0">
                            Unpublished changes
                          </Badge>
                        )}
                        {event.featuredOnHome && (
                          <Badge variant="outline" className="text-muted-foreground">
                            On home
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <a
                          href={flagshipPreviewPath(event.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={event.draft ? 'Preview unpublished changes' : 'Preview page'}
                          className={buttonVariants({ size: 'icon-sm', variant: 'ghost' })}
                        >
                          <EyeIcon />
                        </a>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => openEdit(event)}
                          title="Edit flagship event"
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => openDelete(event)}
                          title="Delete flagship event"
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <FlagshipEventModal
        open={modalOpen}
        event={formEvent}
        onClose={closeModal}
        onSubmit={handleSubmit}
        hasDraft={selectedHasDraft}
        previewHref={selectedEvent ? flagshipPreviewPath(selectedEvent.slug) : undefined}
        onSaveDraft={selectedEvent ? handleSaveDraft : undefined}
        onDiscardDraft={selectedEvent ? handleDiscardDraft : undefined}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete Flagship Event"
        description={`Are you sure you want to delete "${eventToDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={closeDelete}
      />
    </div>
  )
}
