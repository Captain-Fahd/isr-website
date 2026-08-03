'use client'

import { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AnnouncementModal } from '@/components/admin/AnnouncementModal'
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog'
import { getToken } from '@/lib/auth'
import {
  fetchAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/lib/admin-api'
import { formatAnnouncementDate } from '@/lib/announcements'
import type { Announcement } from '@/lib/announcements'

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] =
    useState<Announcement | null>(null)

  useEffect(() => {
    fetchAllAnnouncements()
      .then(setAnnouncements)
      .catch(() => setLoadError('Failed to load announcements'))
      .finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setSelectedAnnouncement(null)
    setModalOpen(true)
  }

  function openEdit(announcement: Announcement) {
    setSelectedAnnouncement(announcement)
    setModalOpen(true)
  }

  function openDelete(announcement: Announcement) {
    setAnnouncementToDelete(announcement)
    setDeleteOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
  }

  function closeDelete() {
    setDeleteOpen(false)
    setAnnouncementToDelete(null)
  }

  async function handleSubmit(formData: FormData) {
    const token = getToken()!
    if (selectedAnnouncement) {
      const updated = await updateAnnouncement(
        token,
        selectedAnnouncement.id,
        formData,
      )
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      )
    } else {
      const created = await createAnnouncement(token, formData)
      setAnnouncements((prev) => [created, ...prev])
    }
  }

  async function handleDelete() {
    const token = getToken()!
    await deleteAnnouncement(token, announcementToDelete!.id)
    setAnnouncements((prev) =>
      prev.filter((a) => a.id !== announcementToDelete!.id),
    )
    closeDelete()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-isr-dark-red">Announcements</h1>
        <Button
          onClick={openCreate}
          className="bg-isr-turquoise hover:bg-isr-turquoise/90 text-white"
        >
          <PlusIcon className="size-4" />
          New Announcement
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
                <TableHead>Title</TableHead>
                <TableHead>Body</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-10"
                  >
                    No announcements yet. Create your first announcement.
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium max-w-[180px] truncate">
                      {a.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-[240px] truncate">
                      {a.body}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatAnnouncementDate(a.createdAt)}
                    </TableCell>
                    <TableCell>
                      {a.pinned ? (
                        <Badge className="bg-isr-turquoise/15 text-isr-turquoise hover:bg-isr-turquoise/20 border-0">
                          Pinned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Normal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => openEdit(a)}
                          title="Edit announcement"
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => openDelete(a)}
                          title="Delete announcement"
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

      <AnnouncementModal
        open={modalOpen}
        announcement={selectedAnnouncement}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="Delete Announcement"
        description={`Are you sure you want to delete "${announcementToDelete?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={closeDelete}
      />
    </div>
  )
}
