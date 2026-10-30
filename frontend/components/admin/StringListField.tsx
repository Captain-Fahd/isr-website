'use client'

import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  addLabel?: string
}

/** Repeatable single-line text rows with add/remove, e.g. a venue's notes. */
export function StringListField({ label, values, onChange, placeholder, addLabel = 'Add' }: Props) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={value}
              placeholder={placeholder}
              onChange={(e) =>
                onChange(values.map((v, i) => (i === index ? e.target.value : v)))
              }
            />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="text-destructive hover:bg-destructive/10"
              title="Remove"
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" size="sm" variant="outline" onClick={() => onChange([...values, ''])}>
        <PlusIcon className="size-4" />
        {addLabel}
      </Button>
    </div>
  )
}
