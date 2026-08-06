import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import BusinessDetail from './BusinessDetail'
import ProtectedRoute from '../../components/ProtectedRoute'
import { AllProviders } from '../../test/testUtils'

const BUSINESS = { id: 'biz-1', name: 'Riverside Consulting LLC', entity_type: 'LLC', state: 'TX', status: 'draft', application: null }
const AUTHENTICATED_USER = { id: 'user-1', name: 'Jordan Lee', email: 'jordan@example.com', role: 'customer' }

function jsonResponse(body, status = 200) {
  return { ok: status < 400, status, headers: { get: () => 'application/json' }, json: async () => body }
}

function baseFetch(url) {
  const path = String(url)
  if (path.includes('/auth/me')) return jsonResponse({ ok: true, data: AUTHENTICATED_USER })
  if (path.includes('/applications')) return jsonResponse({ ok: true, data: [{ business: BUSINESS, application: null }] })
  if (path.includes('/documents/')) return jsonResponse({ ok: true, data: [] })
  if (path.includes('/compliance/')) return jsonResponse({ ok: true, data: [] })
  return jsonResponse({ ok: false, message: 'Not found' }, 404)
}

function renderDetail(fetchImpl) {
  const fetchMock = vi.fn(fetchImpl)
  vi.stubGlobal('fetch', fetchMock)
  render(
    <AllProviders initialEntries={['/dashboard/businesses/biz-1']}>
      {/* Mirrors App.jsx: the real dashboard subtree only ever mounts BusinessDetail
          once ProtectedRoute has let authStatus resolve, so wrap it here too —
          otherwise this test hits a first-render race (user still null) that
          production code never sees. */}
      <Routes><Route path="/dashboard/businesses/:id" element={<ProtectedRoute><BusinessDetail/></ProtectedRoute>}/></Routes>
    </AllProviders>
  )
  return fetchMock
}

describe('BusinessDetail document upload', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('rejects an invalid file type client-side without ever calling the upload API', async () => {
    const fetchMock = renderDetail(baseFetch)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /^documents$/i }))

    const file = new File(['not a real script'], 'malware.exe', { type: 'application/octet-stream' })
    const input = document.querySelector('input[type="file"]')
    await user.upload(input, file)

    expect(await screen.findByText(/upload a/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/upload'), expect.anything())
  })

  it('rejects an oversized file client-side without calling the upload API', async () => {
    const fetchMock = renderDetail(baseFetch)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /^documents$/i }))

    const bigFile = new File([new Uint8Array(11 * 1024 * 1024)], 'formation.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]')
    await user.upload(input, bigFile)

    expect(await screen.findByText(/must be smaller than/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/upload'), expect.anything())
  })

  it('uploads a valid file through the real multipart endpoint and refreshes the list', async () => {
    let uploaded = false
    const fetchMock = renderDetail(async (url, options = {}) => {
      const path = String(url)
      if (path.includes('/upload')) {
        uploaded = true
        return jsonResponse({ ok: true, data: { id: 'doc-1', file_name: 'formation.pdf' } }, 201)
      }
      if (path.includes('/documents/')) {
        return jsonResponse({ ok: true, data: uploaded ? [{ id: 'doc-1', file_name: 'formation.pdf', document_type: 'customer_upload', created_at: new Date().toISOString() }] : [] })
      }
      return baseFetch(url)
    })

    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /^documents$/i }))

    const file = new File(['%PDF-1.4 fake pdf bytes'], 'formation.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]')
    await user.upload(input, file)

    await waitFor(() => expect(screen.getByText('formation.pdf')).toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/upload'), expect.objectContaining({ method: 'POST' }))
  })
})
