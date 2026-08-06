import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminApplications from './AdminApplications'
import { AllProviders } from '../../test/testUtils'

function jsonResponse(body, status = 200) {
  return { ok: status < 400, status, headers: { get: () => 'application/json' }, json: async () => body }
}

describe('AdminApplications page', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('renders only real businesses from the API no demo/sample rows', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      const path = String(url)
      if (path.includes('/auth/me')) return jsonResponse({ ok: false, message: 'Not authenticated' }, 401)
      if (path.includes('/admin/applications')) {
        return jsonResponse({ ok: true, data: [{ id: 'biz-1', name: 'Riverside Consulting LLC', state: 'TX', entity_type: 'LLC', status: 'draft', created_at: new Date().toISOString() }] })
      }
      return jsonResponse({ ok: false, message: 'Not found' }, 404)
    }))

    render(<AllProviders><AdminApplications/></AllProviders>)
    expect(await screen.findByText('Riverside Consulting LLC')).toBeInTheDocument()
    expect(screen.queryByText(/sample/i)).not.toBeInTheDocument()
    expect(screen.getByText('1 total')).toBeInTheDocument()
  })

  it('changing a status calls the real admin endpoint', async () => {
    const fetchMock = vi.fn(async (url, options = {}) => {
      const path = String(url)
      if (path.includes('/auth/me')) return jsonResponse({ ok: false, message: 'Not authenticated' }, 401)
      if (path.includes('/status') && options.method === 'PATCH') {
        return jsonResponse({ ok: true, data: { id: 'biz-1', status: 'submitted' } })
      }
      if (path.includes('/admin/applications')) {
        return jsonResponse({ ok: true, data: [{ id: 'biz-1', name: 'Riverside Consulting LLC', state: 'TX', entity_type: 'LLC', status: 'draft', created_at: new Date().toISOString() }] })
      }
      return jsonResponse({ ok: false, message: 'Not found' }, 404)
    })
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    render(<AllProviders><AdminApplications/></AllProviders>)
    const select = await screen.findByDisplayValue('draft')
    await user.selectOptions(select, 'submitted')

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/admin/applications/biz-1/status'),
      expect.objectContaining({ method: 'PATCH' })
    ))
  })
})
