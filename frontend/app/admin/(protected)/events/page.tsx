'use client'

import { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EventModal } from '@/components/admin/EventModal'
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog'
import { getToken } from '@/lib/auth'
import {
  fetchAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/lib/admin-api'
import { formatEventDate } from '@/lib/events'
import type { Event } from '@/lib/events'

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)

  function sortDesc(list: Event[]): Event[] {
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  useEffect(() => {
    fetchAllEvents()
      .then((data) => setEvents(sortDesc(data)))
      .catch(() => setLoadError('Failed to load events'))
      .finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setSelectedEvent(null)
    setModalOpen(true)
  }

  function openEdit(event: Event) {
    setSelectedEvent(event)
    setModalOpen(true)
  }

  function openDelete(event: Event) {
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

  async function handleSubmit(formData: FormData) {
    const token = getToken()!
    if (selectedEvent) {
      const updated = await updateEvent(token, selectedEvent.id, formData)
      setEvents((prev) => sortDesc(prev.map((e) => (e.id === updated.id ? updated : e))))
    } else {
      const created = await createEvent(token, formData)
      setEvents((prev) => sortDesc([...prev, created]))
    }
  }

  async function handleDelete() {
    const token = getToken()!
    await deleteEvent(token, eventToDelete!.id)
    setEvents((prev) => prev.filter((e) => e.id !== eventToDelete!.id))
    closeDelete()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-isr-dark-red">Events</h1>
        <Button
          onClick={openCreate}
          className="bg-isr-turquoise hover:bg-isr-turquoise/90 text-white"
        >
          <PlusIcon className="size-4" />
          New Event
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-isr-dark-red border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {loadError && (
        <p className="text-red-600 bg-red-50 rounded-lg px-4 py-3">{loadError}</p>
      )}

      {!loading && !loadError && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Ticket URL</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-10"
                  >
                    No events yet. Create your first event.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => {
                  const { date, time } = formatEventDate(event.date)
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs leading-5">
                        {date}
                        <br />
                        {time}
                      </TableCell>
                      <TableCell>
                        <a
                          href={event.ticketUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-isr-turquoise underline underline-offset-2 hover:text-isr-turquoise/80"
                        >
                          Link ↗
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => openEdit(event)}
                            title="Edit event"
                          >
                            <PencilIcon />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => openDelete(event)}
                            title="Delete event"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <EventModal
        open={modalOpen}
        event={selectedEvent}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete Event"
        description={`Are you sure you want to delete "${eventToDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={closeDelete}
      />
    </div>
  )
}
