const TOKEN_KEY = 'admin_token'

// Fired when the session is found to be over (expired JWT or a 401 from the API),
// so the protected admin layout can send the user back to the login page.
export const SESSION_EXPIRED_EVENT = 'admin:session-expired'

// Treat the token as expired slightly early so a request doesn't race the expiry.
const EXPIRY_SKEW_MS = 10_000

// Returns the JWT's `exp` claim in ms since epoch, or null if it can't be read.
export function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const { exp } = JSON.parse(atob(padded)) as { exp?: unknown }
    return typeof exp === 'number' ? exp * 1000 : null
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token)
  // An unreadable token is treated as expired; the backend would reject it anyway.
  if (expiry === null) return true
  return Date.now() >= expiry - EXPIRY_SKEW_MS
}

// Returns the stored token, or null if there is none or it has expired
// (an expired token is cleared from storage).
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem(TOKEN_KEY)
  if (token && isTokenExpired(token)) {
    removeToken()
    return null
  }
  return token
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function expireSession(): void {
  removeToken()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
  }
}
