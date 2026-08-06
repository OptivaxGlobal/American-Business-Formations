import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AppProvider, useApp } from './AppContext'
import { MemoryRouter } from 'react-router-dom'

function Probe() {
  const { user, authStatus, authServiceError, logout } = useApp()
  return <div>
    <span data-testid="status">{authStatus}</span>
    <span data-testid="user">{user ? `${user.email}:${user.role}` : 'none'}</span>
    <span data-testid="service-error">{String(authServiceError)}</span>
    <button onClick={logout}>Log out</button>
  </div>
}

function renderProbe() {
  return render(<MemoryRouter><AppProvider><Probe/></AppProvider></MemoryRouter>)
}

describe('AppContext auth state', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('starts in a loading state and never trusts localStorage for identity', () => {
    localStorage.setItem('abf-user', JSON.stringify({ email: 'forged@example.com', role: 'admin' }))
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    renderProbe()
    expect(screen.getByTestId('status')).toHaveTextContent('loading')
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('restores the session from /api/auth/me on mount when a real session exists', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true, status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true, data: { email: 'jordan@example.com', role: 'customer' } })
    })))
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))
    expect(screen.getByTestId('user')).toHaveTextContent('jordan@example.com:customer')
    expect(screen.getByTestId('service-error')).toHaveTextContent('false')
  })

  it('treats a 401 from /me as simply "not logged in", not a service error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false, status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: false, message: 'Not authenticated' })
    })))
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anonymous'))
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('service-error')).toHaveTextContent('false')
  })

  it('flags a genuine service outage (network failure) distinctly from a normal logged-out state', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down') }))
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anonymous'))
    expect(screen.getByTestId('service-error')).toHaveTextContent('true')
  })

  it('logout() calls the real /api/auth/logout endpoint and clears local state', async () => {
    const fetchMock = vi.fn(async (url) => {
      if (String(url).includes('/auth/logout')) {
        return { ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => ({ ok: true, data: { loggedOut: true } }) }
      }
      return { ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => ({ ok: true, data: { email: 'jordan@example.com', role: 'customer' } }) }
    })
    vi.stubGlobal('fetch', fetchMock)

    const user = (await import('@testing-library/user-event')).default.setup()
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'))

    await user.click(screen.getByRole('button', { name: /log out/i }))

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('anonymous'))
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/auth/logout'), expect.objectContaining({ method: 'POST', credentials: 'include' }))
  })
})
