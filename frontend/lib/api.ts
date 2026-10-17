const configured = process.env.NEXT_PUBLIC_API_URL

/** Browser: same-origin `/api` (dev rewrite → Express). SSR: direct to local backend. */
export const API_BASE_URL =
  configured && configured.length > 0
    ? configured
    : typeof window === 'undefined'
      ? (process.env.BACKEND_URL ?? 'http://127.0.0.1:4000')
      : ''
