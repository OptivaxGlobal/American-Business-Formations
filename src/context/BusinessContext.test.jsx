import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AppProvider } from './AppContext'
import { BusinessProvider, useBusiness } from './BusinessContext'
import { MemoryRouter } from 'react-router-dom'

function jsonResponse(body, status = 200) {
  return { ok: status < 400, status, headers: { get: () => 'application/json' }, json: async () => body }
}

function Probe() {
  const { businesses, loading } = useBusiness()
  return <div>
    <span data-testid="loading">{String(loading)}</span>
    <span data-testid="businesses">{businesses.map(b => b.name).join(', ') || 'none'}</span>
  </div>
}

function renderWithProviders() {
  return render(
    <MemoryRouter>
      <AppProvider>
        <BusinessProvider><Probe/></BusinessProvider>
      </AppProvider>
    </MemoryRouter>
  )
}

describe('BusinessContext cross-session isolation', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('never shows businesses when there is no authenticated user', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (String(url).includes('/auth/me')) return jsonResponse({ ok: false, message: 'Not authenticated' }, 401)
      return jsonResponse({ ok: false, message: 'Not found' }, 404)
    }))

    renderWithProviders()
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('businesses')).toHaveTextContent('none')
  })

  it('loads the authenticated users own businesses, scoped to that session', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      const path = String(url)
      if (path.includes('/auth/me')) return jsonResponse({ ok: true, data: { id: 'user-1', name: 'Jordan Lee', email: 'jordan@example.com', role: 'customer' } })
      if (path.includes('/applications')) {
        return jsonResponse({ ok: true, data: [{ business: { id: 'biz-1', name: 'Riverside Consulting LLC' }, application: null }] })
      }
      return jsonResponse({ ok: false, message: 'Not found' }, 404)
    }))

    renderWithProviders()
    await waitFor(() => expect(screen.getByTestId('businesses')).toHaveTextContent('Riverside Consulting LLC'))
  })
})
