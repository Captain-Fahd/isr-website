'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getToken,
  getTokenExpiry,
  removeToken,
  SESSION_EXPIRED_EVENT,
} from '@/lib/auth'

/**
 * Guards an admin page: sends the user to the login page if they have no valid
 * token, when it expires, or when the API rejects it. Returns true once the
 * session has been confirmed and the page can render.
 */
export function useAdminSession(): boolean {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    function toLogin() {
      removeToken()
      router.replace('/admin/login')
    }

    const token = getToken()
    if (!token) {
      toLogin()
      return
    }
    setReady(true)

    // Redirect the moment the token expires, even if the admin is idle on the page.
    // (Capped because setTimeout overflows past ~24.8 days.)
    const expiry = getTokenExpiry(token)
    const delay = expiry === null ? 0 : Math.max(0, expiry - Date.now())
    const timer = window.setTimeout(toLogin, Math.min(delay, 2 ** 31 - 1))

    // Timers are throttled/paused in background tabs and during sleep, so
    // re-check when the admin comes back to the tab.
    function recheck() {
      if (document.visibilityState === 'visible' && !getToken()) toLogin()
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, toLogin)
    document.addEventListener('visibilitychange', recheck)
    window.addEventListener('focus', recheck)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(SESSION_EXPIRED_EVENT, toLogin)
      document.removeEventListener('visibilitychange', recheck)
      window.removeEventListener('focus', recheck)
    }
  }, [router])

  return ready
}
