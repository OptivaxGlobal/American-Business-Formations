import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from './api'

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.cookie = 'csrf_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
  })

  it('sends credentials: include on every request so the auth cookie round-trips', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true, status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true, data: {} })
    }))
    vi.stubGlobal('fetch', fetchMock)

    await api.me()
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ credentials: 'include' }))
  })

  it('attaches X-CSRF-TOKEN from the csrf_access_token cookie on mutating requests', async () => {
    document.cookie = 'csrf_access_token=test-csrf-value; path=/'
    const fetchMock = vi.fn(async () => ({
      ok: true, status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true, data: {} })
    }))
    vi.stubGlobal('fetch', fetchMock)

    await api.logout()
    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers['X-CSRF-TOKEN']).toBe('test-csrf-value')
  })

  it('does not send a CSRF header on GET requests', async () => {
    document.cookie = 'csrf_access_token=test-csrf-value; path=/'
    const fetchMock = vi.fn(async () => ({
      ok: true, status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true, data: {} })
    }))
    vi.stubGlobal('fetch', fetchMock)

    await api.me()
    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers['X-CSRF-TOKEN']).toBeUndefined()
  })

  it('surfaces a backend-unreachable error instead of any fake success (no local fallback exists)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down') }))
    await expect(api.submitContact({})).rejects.toThrow()
  })
})
