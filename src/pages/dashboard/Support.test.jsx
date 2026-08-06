import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Support from './Support'
import { AllProviders } from '../../test/testUtils'

function jsonResponse(body, status = 200) {
  return { ok: status < 400, status, headers: { get: () => 'application/json' }, json: async () => body }
}

describe('Support page', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('shows a loading state, then the empty state when there are no threads', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      const path = String(url)
      if (path.includes('/auth/me')) return jsonResponse({ ok: false, message: 'Not authenticated' }, 401)
      if (path.includes('/support/threads')) return jsonResponse({ ok: true, data: [] })
      return jsonResponse({ ok: false, message: 'Not found' }, 404)
    }))

    render(<AllProviders><Support/></AllProviders>)
    expect(await screen.findByText(/no support requests yet/i)).toBeInTheDocument()
  })

  it('shows a real error and a retry button when the thread list fails to load', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      const path = String(url)
      if (path.includes('/auth/me')) return jsonResponse({ ok: false, message: 'Not authenticated' }, 401)
      if (path.includes('/support/threads')) return jsonResponse({ ok: false, message: 'Something went wrong on our end. Please try again.' }, 500)
      return jsonResponse({ ok: false, message: 'Not found' }, 404)
    }))

    render(<AllProviders><Support/></AllProviders>)
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('creates a thread through the real API and refreshes the list', async () => {
    let created = false
    vi.stubGlobal('fetch', vi.fn(async (url, options = {}) => {
      const path = String(url)
      if (path.includes('/auth/me')) return jsonResponse({ ok: false, message: 'Not authenticated' }, 401)
      if (path.includes('/support/threads') && options.method === 'POST') {
        created = true
        return jsonResponse({ ok: true, data: { id: 'thread-1' } }, 201)
      }
      if (path.includes('/support/threads')) {
        return jsonResponse({ ok: true, data: created ? [{ id: 'thread-1', subject: 'Question about EIN', status: 'open', priority: 'normal', created_at: new Date().toISOString() }] : [] })
      }
      return jsonResponse({ ok: false, message: 'Not found' }, 404)
    }))

    const user = userEvent.setup()
    render(<AllProviders><Support/></AllProviders>)
    await screen.findByText(/no support requests yet/i)

    await user.type(screen.getByLabelText(/subject/i), 'Question about EIN')
    await user.type(screen.getByLabelText(/message/i), 'How long does an EIN filing usually take?')
    await user.click(screen.getByRole('button', { name: /submit request/i }))

    await waitFor(() => expect(screen.getByText('Question about EIN')).toBeInTheDocument())
  })
})
