declare global {
  // eslint-disable-next-line no-var
  var gtag: ((command: 'event', name: string, params?: Record<string, unknown>) => void) | undefined
}

/** The `?ref=` campaign tag on the current URL (e.g. /sacred-union/?ref=poster), if any. */
export function campaignRef(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('ref')
}

/**
 * Sends a GA4 event, tagged with the page's `?ref=` campaign so sales channels can
 * be compared. A no-op when gtag hasn't loaded (blocked, or not yet ready).
 */
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  const ref = campaignRef()
  globalThis.gtag?.('event', name, ref ? { ...params, campaign_ref: ref } : params)
}
