import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Contact from './Contact'
import { AllProviders } from '../test/testUtils'

describe('Contact page', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('blocks submission and shows errors when required fields are invalid', async () => {
    const user = userEvent.setup()
    render(<AllProviders><Contact/></AllProviders>)

    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect((await screen.findAllByText(/enter your full name/i)).length).toBeGreaterThan(0)
    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument()
  })

  it('rejects a numbers-only name', async () => {
    const user = userEvent.setup()
    render(<AllProviders><Contact/></AllProviders>)

    await user.type(screen.getByLabelText(/first name/i), '12345')
    await user.tab()

    expect(await screen.findByText(/enter a valid name/i)).toBeInTheDocument()
  })

  it('rejects an invalid phone number when provided', async () => {
    const user = userEvent.setup()
    render(<AllProviders><Contact/></AllProviders>)

    await user.type(screen.getByLabelText(/phone/i), '12345')
    await user.tab()

    expect(await screen.findByText(/valid 10-digit u\.s\. phone number/i)).toBeInTheDocument()
  })

  it('shows success only after the real API call succeeds no local fallback', async () => {
    const fetchMock = vi.fn(async (url) => {
      if (String(url).includes('/contact')) {
        return { ok: true, status: 201, headers: { get: () => 'application/json' }, json: async () => ({ ok: true, data: { submitted: true } }) }
      }
      return { ok: false, status: 401, headers: { get: () => 'application/json' }, json: async () => ({ ok: false, message: 'Not authenticated' }) }
    })
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    render(<AllProviders><Contact/></AllProviders>)

    await user.type(screen.getByLabelText(/first name/i), 'Jamie')
    await user.type(screen.getByLabelText(/last name/i), 'Rivera')
    await user.type(screen.getByLabelText(/^email/i), 'jamie@example.com')
    await user.type(screen.getByLabelText(/message/i), 'I have a question about registered agents.')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText(/message has been received/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/contact'), expect.objectContaining({ method: 'POST' }))
  })

  it('shows a real error, not a fake success, when the backend rejects the submission', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (String(url).includes('/contact')) {
        return { ok: false, status: 500, headers: { get: () => 'application/json' }, json: async () => ({ ok: false, message: 'Something went wrong on our end. Please try again.' }) }
      }
      return { ok: false, status: 401, headers: { get: () => 'application/json' }, json: async () => ({ ok: false, message: 'Not authenticated' }) }
    }))

    const user = userEvent.setup()
    render(<AllProviders><Contact/></AllProviders>)

    await user.type(screen.getByLabelText(/first name/i), 'Jamie')
    await user.type(screen.getByLabelText(/last name/i), 'Rivera')
    await user.type(screen.getByLabelText(/^email/i), 'jamie@example.com')
    await user.type(screen.getByLabelText(/message/i), 'I have a question about registered agents.')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.queryByText(/message has been received/i)).not.toBeInTheDocument()
  })

  it('shows the published business address and official social links', () => {
    render(<AllProviders><Contact/></AllProviders>)

    expect(screen.getByText(/545 Brandon Road, Conroe, TX 77302/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /facebook/i })).toHaveAttribute('href', 'https://www.facebook.com/americanbusinessformations/')
    expect(screen.getByRole('link', { name: /instagram/i })).toHaveAttribute('href', 'https://www.instagram.com/american_business_formations/')
    expect(screen.getByRole('link', { name: /x/i })).toHaveAttribute('href', 'https://x.com/American_bus_F')
    expect(screen.getByRole('link', { name: /tiktok/i })).toHaveAttribute('href', 'https://www.tiktok.com/@americanbusinessf?lang=en')
    expect(screen.getByRole('link', { name: /pinterest/i })).toHaveAttribute('href', 'https://www.pinterest.com/americanbusinessformations/')
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute('href', 'https://www.linkedin.com/company/american-business-formations/')
  })

  it('never calls the API when the honeypot field is filled (spam bot behavior)', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, status: 201, headers: { get: () => 'application/json' }, json: async () => ({ ok: true, data: {} }) }))
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    render(<AllProviders><Contact/></AllProviders>)

    await user.type(screen.getByLabelText(/first name/i), 'Jamie')
    await user.type(screen.getByLabelText(/last name/i), 'Rivera')
    await user.type(screen.getByLabelText(/^email/i), 'jamie@example.com')
    await user.type(screen.getByLabelText(/message/i), 'I have a question about registered agents.')
    await user.type(screen.getByLabelText(/leave this field blank/i), 'http://spam.example.com')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/contact'), expect.anything())
  })
})
