import { API_BASE_URL } from '@/lib/api'
import type { CommunityFormsPage } from './types'

function fetchOptions(): RequestInit {
  // The site is a static export, so the server-side branch only ever runs at
  // build time. In the browser we must bypass the HTTP cache, otherwise a
  // refresh can replay the stale response the page was built with.
  return typeof window === 'undefined' ? { next: { revalidate: 60 } } : { cache: 'no-store' }
}

export async function fetchCommunityFormsPage(init?: RequestInit): Promise<CommunityFormsPage> {
  const response = await fetch(`${API_BASE_URL}/api/community-forms-page`, {
    ...fetchOptions(),
    ...init,
  })

  if (!response.ok) {
    throw new Error('Failed to fetch community forms page')
  }

  const json = (await response.json()) as { data: CommunityFormsPage }
  return json.data
}
