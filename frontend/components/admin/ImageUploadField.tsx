'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getToken } from '@/lib/auth'
import { uploadFlagshipImage } from '@/lib/admin-api'

interface Props {
  id: string
  label: string
  value: string
  onChange: (url: string) => void
  optional?: boolean
  /**
   * The server resizes to fit within a box (preserving aspect ratio), so the
   * original file's aspect ratio already matches the stored image — read here,
   * client-side, so callers that need width/height (e.g. for next/image) don't
   * have to guess them.
   */
  onDimensions?: (dimensions: { width: number; height: number }) => void
}

/**
 * Uploads a file immediately on selection (via POST /api/flagship-events/upload-image)
 * and reports the resulting Supabase Storage URL back through `onChange` — a flagship
 * event has too many image slots for one multipart form submit, so each is uploaded
 * independently before the rest of the form is saved as JSON.
 */
export function ImageUploadField({ id, label, value, onChange, optional, onDimensions }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function readDimensions(file: File) {
    if (!onDimensions) return
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      onDimensions({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(objectUrl)
    }
    img.src = objectUrl
  }

  async function handleFile(file: File | null) {
    if (!file) return
    setUploading(true)
    setError('')
    readDimensions(file)
    try {
      const url = await uploadFlagshipImage(getToken()!, file)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {optional ? ' (optional)' : ''}
      </Label>
      {value && (
        <p className="text-xs text-muted-foreground truncate">
          Current:{' '}
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 text-isr-turquoise"
          >
            view
          </a>
        </p>
      )}
      <Input
        id={id}
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        className="cursor-pointer"
      />
      {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
