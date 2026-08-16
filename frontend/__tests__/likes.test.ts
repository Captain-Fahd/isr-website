import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { fetchEventLikes, getClientId, likeEvent, unlikeEvent } from '@/lib/likes'

const API = 'http://localhost:4000'

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  } as Response
}

/** A minimal localStorage stand-in; the unit environment is node, so there is no window. */
function stubWindowWithStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial))
  const localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  }
  vi.stubGlobal('window', { localStorage })
  return store
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('getClientId', () => {
  test('returns null on the server, where there is no visitor', () => {
    expect(getClientId()).toBeNull()
  })

  test('creates and persists an id on first use', () => {
    const store = stubWindowWithStorage()

    const id = getClientId()

    expect(id).toBeTruthy()
    expect(store.get('isr:like-client-id')).toBe(id)
  })

  test('reuses the stored id on later visits', () => {
    stubWindowWithStorage({ 'isr:like-client-id': 'existing-id' })

    expect(getClientId()).toBe('existing-id')
  })

  test('falls back to an in-memory id when storage is blocked', async () => {
    // Fresh module so the in-memory fallback does not carry over between tests.
    vi.resetModules()
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => {
          throw new Error('storage disabled')
        },
        setItem: () => {
          throw new Error('storage disabled')
        },
      },
    })

    const { getClientId: freshGetClientId } = await import('@/lib/likes')

    const first = freshGetClientId()
    expect(first).toBeTruthy()
    // Stable for the rest of the page session, so a like can still be undone.
    expect(freshGetClientId()).toBe(first)
  })
})

describe('likeEvent', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  test('posts the clientId and returns the new state', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ data: { id: 7, likeCount: 4, likedByMe: true } }),
    )

    const state = await likeEvent(7, 'client-abc')

    expect(fetchMock).toHaveBeenCalledWith(
      `${API}/api/events/7/like`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ clientId: 'client-abc' }),
      }),
    )
    expect(state).toEqual({ likeCount: 4, likedByMe: true })
  })

  test('throws when the API rejects the request', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'nope' }, false, 500))

    await expect(likeEvent(7, 'client-abc')).rejects.toThrow('Failed to like event')
  })
})

describe('unlikeEvent', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  test('sends the clientId as a query parameter, not a DELETE body', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ data: { id: 7, likeCount: 3, likedByMe: false } }),
    )

    const state = await unlikeEvent(7, 'client abc')

    expect(fetchMock).toHaveBeenCalledWith(
      `${API}/api/events/7/like?clientId=client%20abc`,
      expect.objectContaining({ method: 'DELETE' }),
    )
    expect(state).toEqual({ likeCount: 3, likedByMe: false })
  })

  test('throws when the API rejects the request', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'nope' }, false, 500))

    await expect(unlikeEvent(7, 'client-abc')).rejects.toThrow('Failed to unlike event')
  })
})

describe('fetchEventLikes', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  test('reads the live count for one event', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ data: { id: 7, name: 'Eid Dinner', likeCount: 9, likedByMe: true } }),
    )

    const state = await fetchEventLikes(7, 'client-abc')

    expect(fetchMock).toHaveBeenCalledWith(
      `${API}/api/events/7?clientId=client-abc`,
      expect.objectContaining({ cache: 'no-store' }),
    )
    expect(state).toEqual({ likeCount: 9, likedByMe: true })
  })

  test('defaults to zero for an API response without like fields', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { id: 7, name: 'Eid Dinner' } }))

    expect(await fetchEventLikes(7, 'client-abc')).toEqual({
      likeCount: 0,
      likedByMe: false,
    })
  })
})
