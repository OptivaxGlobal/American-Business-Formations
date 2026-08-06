import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from './Login'
import { AllProviders } from '../test/testUtils'
import { useApp } from '../context/AppContext'

// Renders whatever the login flow put into AppContext, so a regression that
// reads the wrong field off the API response shows up as "no-user" here
// instead of only manifesting as a silent redirect loop in ProtectedRoute.
function UserProbe() {
  const { user } = useApp()
  return <div data-testid="user-probe">{user ? `${user.email}:${user.role}` : 'no-user'}</div>
}

describe('Login page - real backend response handling', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('logs the user in from the real backend envelope { ok, data }, not a { user } shape', async () => {
    // The real /api/auth/login response is { ok: true, data: {...} } (see
    // server/app/utils.py ok()) NOT { user: {...} }. This regression test
    // guards against reintroducing the bug where Login.jsx read `result.user`
    // (always undefined for a real response) instead of `result.data`, which
    // silently set the logged-in user to undefined and bounced straight back
    // to /login via ProtectedRoute after a real, successful login.
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        ok: true,
        data: { id: 'user-1', name: 'jordan', email: 'jordan@example.com', role: 'customer', email_verified: false }
      })
    })))

    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/login']}><Login/><UserProbe/></AllProviders>)

    await user.type(screen.getByLabelText(/email address/i), 'jordan@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'Str0ng!Pass1')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByTestId('user-probe')).toHaveTextContent('jordan@example.com:customer')
    })
  })

  it('sends admin users to /admin using the role from the real response, not the demo-admin checkbox', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        ok: true,
        data: { id: 'user-2', name: 'ops', email: 'ops@example.com', role: 'admin', email_verified: true }
      })
    })))

    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/login']}><Login/><UserProbe/></AllProviders>)

    await user.type(screen.getByLabelText(/email address/i), 'ops@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'Str0ng!Pass1')
    // Note: demo-admin checkbox intentionally left unchecked here the real
    // response's role should still win.
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByTestId('user-probe')).toHaveTextContent('ops@example.com:admin')
    })
  })

  it('shows a real error (never a fake login, never a crash) when /api/* is swallowed by an SPA rewrite and returns HTML instead of JSON', async () => {
    // Regression test for a real production bug: a hosting rewrite (Vercel's
    // catch-all SPA rewrite) served index.html with a 200 status for /api/*
    // requests instead of hitting the Flask backend. response.ok was true
    // but the body was HTML, not JSON. This used to crash on
    // `loggedInUser.role` with a raw "Cannot read properties of undefined"
    // error. Login no longer has any local fallback for authentication (see
    // docs/part-1-handoff.md), so the correct behavior now is: no crash, no
    // fake logged-in session, and a clear error message instead.
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      headers: { get: () => 'text/html; charset=utf-8' },
      json: async () => { throw new SyntaxError('Unexpected token <') }
    })))

    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/login']}><Login/><UserProbe/></AllProviders>)

    await user.type(screen.getByLabelText(/email address/i), 'jordan@example.com')
    await user.type(screen.getByLabelText(/^password/i), 'Str0ng!Pass1')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByText(/we could not log you in/i)).toBeInTheDocument()
    })
    expect(screen.getByTestId('user-probe')).toHaveTextContent('no-user')
    expect(screen.queryByText(/cannot read properties/i)).not.toBeInTheDocument()
  })
})
