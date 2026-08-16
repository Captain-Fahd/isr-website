'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { HeartIcon } from '@/components/Icons'
import { fetchEventLikes, getClientId, likeEvent, unlikeEvent } from '@/lib/likes'

type LikeButtonProps = {
  eventId: number
  /** Used for the screen-reader label, e.g. "Like Eid Dinner". */
  eventName: string
  likeCount?: number
  likedByMe?: boolean
  /**
   * Fetch this event's live count on mount. The events list refreshes every card
   * in one request instead, so it opts out to avoid a request per card.
   */
  refreshOnMount?: boolean
  className?: string
}

export default function LikeButton({
  eventId,
  eventName,
  likeCount = 0,
  likedByMe = false,
  refreshOnMount = true,
  className = '',
}: LikeButtonProps) {
  const [count, setCount] = useState(likeCount)
  const [liked, setLiked] = useState(likedByMe)
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  // A ref as well as state, so an in-flight click can be seen from effects
  // without making them re-run when it settles.
  const pendingRef = useRef(false)

  // Take fresh values from the parent, unless a click is mid-flight — that
  // request's own response is newer than anything the parent knows.
  useEffect(() => {
    if (pendingRef.current) return
    setCount(likeCount)
    setLiked(likedByMe)
  }, [likeCount, likedByMe])

  useEffect(() => {
    if (!refreshOnMount) return

    const clientId = getClientId()
    if (!clientId) return

    let active = true
    fetchEventLikes(eventId, clientId)
      .then((state) => {
        if (!active || pendingRef.current) return
        setCount(state.likeCount)
        setLiked(state.likedByMe)
      })
      // A slightly stale count is better than an error message on a like button.
      .catch(() => {})

    return () => {
      active = false
    }
  }, [eventId, refreshOnMount])

  const toggle = useCallback(async () => {
    if (pendingRef.current) return

    const clientId = getClientId()
    if (!clientId) return

    const previousCount = count
    const previousLiked = liked
    const nextLiked = !liked

    pendingRef.current = true
    setPending(true)
    setFailed(false)
    // Optimistic: the heart fills immediately, then the server's count wins.
    setLiked(nextLiked)
    setCount((current) => Math.max(0, current + (nextLiked ? 1 : -1)))

    try {
      const state = nextLiked
        ? await likeEvent(eventId, clientId)
        : await unlikeEvent(eventId, clientId)
      setCount(state.likeCount)
      setLiked(state.likedByMe)
    } catch {
      setCount(previousCount)
      setLiked(previousLiked)
      setFailed(true)
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }, [count, eventId, liked])

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={pending}
        aria-pressed={liked}
        aria-label={`${liked ? 'Unlike' : 'Like'} ${eventName}`}
        className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-70 ${
          liked
            ? 'bg-isr-bright-red/10 text-isr-bright-red ring-1 ring-isr-bright-red/30 hover:bg-isr-bright-red/15'
            : 'text-isr-dark-red ring-1 ring-isr-light-blue/40 hover:bg-isr-cream/60 hover:text-isr-bright-red'
        }`}
      >
        <HeartIcon filled={liked} className="h-5 w-5" />
        <span aria-hidden>{count}</span>
        <span className="sr-only">{count === 1 ? '1 like' : `${count} likes`}</span>
      </button>

      {failed && (
        <span role="status" className="text-xs text-isr-bright-red">
          Could not save that — try again.
        </span>
      )}
    </div>
  )
}
