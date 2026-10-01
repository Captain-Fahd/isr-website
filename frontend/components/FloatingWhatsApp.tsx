'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { siWhatsapp } from 'simple-icons'
import { CAMPUS } from '@/lib/campus'

const HIDDEN_ON = ['/admin', '/contact']
const COLLAPSED_KEY = 'isr:whatsapp-collapsed'
const DISMISSED_KEY = 'isr:whatsapp-dismissed'
// Horizontal distance (px) a swipe must travel to dismiss the button.
const DISMISS_THRESHOLD = 80

// Storage can throw (private mode, blocked site data) — treat that as "unset".
function readFlag(storage: () => Storage, key: string) {
  try {
    return storage().getItem(key) === '1'
  } catch {
    return false
  }
}

function writeFlag(storage: () => Storage, key: string, value: boolean) {
  try {
    if (value) storage().setItem(key, '1')
    else storage().removeItem(key)
  } catch {}
}

// Official filled glyph — the outline icon in Icons.tsx reads as lopsided at
// button size.
function WhatsappGlyph({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={siWhatsapp.path} />
    </svg>
  )
}

export default function FloatingWhatsApp() {
  const pathname = usePathname()
  // Storage is only readable on the client, so nothing renders until mount.
  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const didSwipe = useRef(false)

  useEffect(() => {
    setCollapsed(readFlag(() => localStorage, COLLAPSED_KEY))
    // Dismissal lasts for the browsing session, so it comes back next visit.
    setDismissed(readFlag(() => sessionStorage, DISMISSED_KEY))
    setMounted(true)
  }, [])

  if (!mounted || dismissed) return null
  if (HIDDEN_ON.some((route) => pathname?.startsWith(route))) return null

  const toggleCollapsed = (value: boolean) => {
    setCollapsed(value)
    writeFlag(() => localStorage, COLLAPSED_KEY, value)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
    didSwipe.current = false
    setDragging(true)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const t = e.touches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    // Ignore mostly-vertical movement so page scrolling still works.
    if (Math.abs(dx) < Math.abs(dy)) return
    if (Math.abs(dx) > 8) didSwipe.current = true
    // Only follow the finger rightwards, toward the screen edge.
    setDragX(Math.max(0, dx))
  }

  const onTouchEnd = () => {
    touchStart.current = null
    setDragging(false)
    if (dragX >= DISMISS_THRESHOLD) {
      setDragX(window.innerWidth)
      writeFlag(() => sessionStorage, DISMISSED_KEY, true)
      // Let the slide-out animation finish before unmounting.
      window.setTimeout(() => setDismissed(true), 200)
    } else {
      setDragX(0)
    }
  }

  return (
    <div
      className="fixed right-4 z-40"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      {/* Mobile: round button, swipe right to dismiss */}
      <a
        href={CAMPUS.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Message ISR on WhatsApp (swipe right to dismiss)"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onClick={(e) => {
          // A swipe shouldn't also open WhatsApp.
          if (didSwipe.current) e.preventDefault()
        }}
        className={`flex h-14 w-14 touch-pan-y items-center justify-center rounded-full bg-isr-turquoise text-white shadow-lg md:hidden ${
          dragging ? '' : 'motion-safe:transition-[transform,opacity] motion-safe:duration-200'
        }`}
        style={{
          transform: `translateX(${dragX}px)`,
          opacity: Math.max(0.2, 1 - dragX / (DISMISS_THRESHOLD * 2.5)),
        }}
      >
        <WhatsappGlyph className="h-7 w-7 shrink-0" />
      </a>

      {/* Desktop: pill that collapses down to the icon */}
      {/* One element in both states so the label and chevron can animate
          shut. Collapsed: 14px + 28px icon + 14px = a 56px circle. */}
      <div
        className={`relative hidden items-center overflow-hidden rounded-full bg-isr-turquoise text-white shadow-lg md:flex ${
          collapsed ? 'hover:bg-isr-dark-red' : ''
        } motion-safe:transition-colors motion-safe:duration-300`}
      >
        <a
          href={CAMPUS.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          tabIndex={collapsed ? -1 : undefined}
          aria-hidden={collapsed || undefined}
          className={`flex h-14 items-center font-semibold hover:bg-isr-dark-red motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out ${
            collapsed ? 'px-[14px]' : 'pl-5 pr-3'
          }`}
        >
          <WhatsappGlyph className="h-7 w-7 shrink-0" />
          <span
            className={`overflow-hidden whitespace-nowrap motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out ${
              collapsed ? 'ml-0 max-w-0 opacity-0' : 'ml-3 max-w-32 opacity-100'
            }`}
          >
            Chat with us
          </span>
        </a>
        <button
          type="button"
          onClick={() => toggleCollapsed(true)}
          aria-label="Collapse WhatsApp chat button"
          tabIndex={collapsed ? -1 : undefined}
          aria-hidden={collapsed || undefined}
          className={`flex h-14 shrink-0 items-center justify-center overflow-hidden border-l hover:bg-isr-dark-red motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out ${
            collapsed ? 'w-0 border-l-0 border-transparent opacity-0' : 'w-10 border-white/20 opacity-100'
          }`}
        >
          <ChevronRight className="h-5 w-5 shrink-0" />
        </button>
        {/* While collapsed, the whole circle expands the pill instead of
            opening WhatsApp. */}
        {collapsed && (
          <button
            type="button"
            onClick={() => toggleCollapsed(false)}
            aria-label="Expand WhatsApp chat button"
            className="absolute inset-0 rounded-full"
          />
        )}
      </div>
    </div>
  )
}
