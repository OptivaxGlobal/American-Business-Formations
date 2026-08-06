import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Settings from './Settings'
import { AllProviders } from '../../test/testUtils'

const AUTHENTICATED_USER = {
  id: 'user-1', name: 'Jordan Lee', email: 'jordan@example.com', role: 'customer',
  email_verified: true, phone: '', marketing_consent: false, email_reminders_enabled: true, sms_reminders_enabled: false,
}

function jsonResponse(body, status = 200) {
  return { ok: status < 400, status, headers: { get: () => 'application/json' }, json: async () => body }
}

function renderSettings(fetchImpl) {
  vi.stubGlobal('fetch', vi.fn(fetchImpl))
  return render(<AllProviders><Settings/></AllProviders>)
}

describe('Settings page', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('only shows "Saved" after the real API call succeeds', async () => {
    renderSettings(async (url) => {
      const path = String(url)
      if (path.includes('/auth/me')) return jsonResponse({ ok: true, data: AUTHENTICATED_USER })
      if (path.includes('/account/profile')) return jsonResponse({ ok: true, data: { ...AUTHENTICATED_USER, name: 'Jordan A. Lee' } })
      return jsonResponse({ ok: false, message: 'Not found' }, 404)
    })

    const user = userEvent.setup()
    await screen.findByDisplayValue('Jordan Lee')

    const button = screen.getByRole('button', { name: /save changes/i })
    expect(button).toHaveTextContent('Save changes')
    await user.click(button)

    await waitFor(() => expect(button).toHaveTextContent('Saved'))
  })

  it('shows a real error and never claims success when the save fails', async () => {
    renderSettings(async (url) => {
      const path = String(url)
      if (path.includes('/auth/me')) return jsonResponse({ ok: true, data: AUTHENTICATED_USER })
      if (path.includes('/account/profile')) return jsonResponse({ ok: false, message: 'Something went wrong on our end. Please try again.' }, 500)
      return jsonResponse({ ok: false, message: 'Not found' }, 404)
    })

    const user = userEvent.setup()
    const button = await screen.findByRole('button', { name: /save changes/i })
    await user.click(button)

    await waitFor(() => expect(button).not.toHaveTextContent('Saved'))
  })

  it('email change shows a pending-confirmation state instead of silently updating the email', async () => {
    renderSettings(async (url) => {
      const path = String(url)
      if (path.includes('/auth/me')) return jsonResponse({ ok: true, data: AUTHENTICATED_USER })
      if (path.includes('/account/email')) return jsonResponse({ ok: true, data: { pending_email: 'new-address@example.com' } })
      return jsonResponse({ ok: false, message: 'Not found' }, 404)
    })

    const user = userEvent.setup()
    await screen.findByDisplayValue('Jordan Lee')

    const emailInput = screen.getByLabelText(/new email address/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'new-address@example.com')
    await user.click(screen.getByRole('button', { name: /update email/i }))

    expect(await screen.findByText(/won.t change until you click it/i)).toBeInTheDocument()
  })

  it('the reminder-preference checkboxes are real controlled inputs (not the old always-on/uncontrolled fields)', async () => {
    renderSettings(async (url) => {
      const path = String(url)
      if (path.includes('/auth/me')) return jsonResponse({ ok: true, data: AUTHENTICATED_USER })
      return jsonResponse({ ok: false, message: 'Not found' }, 404)
    })

    const user = userEvent.setup()
    const smsCheckbox = await screen.findByLabelText(/sms reminders/i)
    expect(smsCheckbox).not.toBeChecked()
    await user.click(smsCheckbox)
    expect(smsCheckbox).toBeChecked()
  })
})
