'use client'

import { useEffect, useState } from 'react'
import EventDetail from '@/components/EventDetail'
import { parseEventIdFromLocation } from '@/lib/events'

/**
 * Host-agnostic safety net: if the host serves 404.html for an /events/<id>/ URL
 * (i.e. the .htaccess rewrite to /events/live/ isn't in effect), render the event
 * live instead of the "page not found" content.
 */
export default function NotFoundEventFallback({ children }: { children: React.ReactNode }) {
  const [isEventPath, setIsEventPath] = useState(false)

  useEffect(() => {
    setIsEventPath(parseEventIdFromLocation(window.location.pathname) !== null)
  }, [])

  return isEventPath ? <EventDetail /> : <>{children}</>
}
