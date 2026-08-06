import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { AppProvider } from '../context/AppContext'

function mockMeResponse({ status, data }) {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: status < 400,
    status,
    headers: { get: () => 'application/json' },
    json: async () => (status < 400 ? { ok: true, data } : { ok: false, message: 'Not authenticated' })
  })))
}

function renderProtected(initialEntries) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard content</div></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><div>Admin content</div></ProtectedRoute>} />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows a loading state before the session check resolves, never an immediate redirect', () => {
    // A deliberately never-resolving fetch keeps the component in its
    // initial 'loading' authStatus so we can assert on that exact moment.
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    renderProtected(['/dashboard'])

    expect(screen.queryByText(/login page/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/dashboard content/i)).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('redirects to login once the session check confirms no user is signed in', async () => {
    mockMeResponse({ status: 401 })
    renderProtected(['/dashboard'])
    await waitFor(() => expect(screen.getByText(/login page/i)).toBeInTheDocument())
    expect(screen.queryByText(/dashboard content/i)).not.toBeInTheDocument()
  })

  it('renders the protected content once the server confirms a signed-in user', async () => {
    mockMeResponse({ status: 200, data: { name: 'Jordan', email: 'jordan@example.com', role: 'customer' } })
    renderProtected(['/dashboard'])
    await waitFor(() => expect(screen.getByText(/dashboard content/i)).toBeInTheDocument())
  })

  it('does not trust a role from localStorage a customer is blocked from an admin-only route even if localStorage says otherwise', async () => {
    // Even if something wrote a stale/forged admin flag to localStorage,
    // the server response (customer) must be what actually gates access.
    localStorage.setItem('abf-user', JSON.stringify({ name: 'Jordan', email: 'jordan@example.com', role: 'admin' }))
    mockMeResponse({ status: 200, data: { name: 'Jordan', email: 'jordan@example.com', role: 'customer' } })
    renderProtected(['/admin'])
    await waitFor(() => expect(screen.queryByText(/admin content/i)).not.toBeInTheDocument())
    localStorage.clear()
  })

  it('lets an admin-role user (from the server response) through to an admin-only route', async () => {
    mockMeResponse({ status: 200, data: { name: 'Ops', email: 'ops@example.com', role: 'admin' } })
    renderProtected(['/admin'])
    await waitFor(() => expect(screen.getByText(/admin content/i)).toBeInTheDocument())
  })
})
