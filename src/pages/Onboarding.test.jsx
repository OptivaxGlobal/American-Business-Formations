import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Onboarding from './Onboarding'
import { AllProviders } from '../test/testUtils'

async function fillStep0(user) {
  await user.type(screen.getByLabelText(/proposed business name/i), 'Bright Path Studio LLC')
  await user.selectOptions(screen.getByLabelText(/^industry/i), 'Technology')
  await user.click(screen.getByRole('button', { name: /continue/i }))
}

async function fillStep1(user) {
  await user.type(screen.getByLabelText(/business purpose/i), 'Provide marketing consulting services')
  await user.type(screen.getByLabelText(/^county/i), 'Travis County')
  await user.type(screen.getByLabelText(/^city/i), 'Austin')
  await user.click(screen.getByRole('button', { name: /continue/i }))
}

async function fillContactStep(user) {
  await user.type(screen.getByLabelText(/full name/i), 'Jordan Lee')
  await user.type(screen.getByLabelText(/^email/i), 'jordan@example.com')
  await user.type(screen.getByLabelText(/^phone/i), '2341230900')
  await user.click(screen.getByRole('button', { name: /continue/i }))
}

async function fillAddressStep(user) {
  await user.type(screen.getByLabelText(/principal office street address/i), '123 Main St')
  await user.type(screen.getByLabelText(/^city$/i), 'Austin')
  await user.type(screen.getByLabelText(/zip code/i), '78701')
  await user.click(screen.getByRole('button', { name: /continue/i }))
}

describe('Onboarding wizard - contact information step', () => {
  it('blocks continuing without a valid full name, email, and phone', async () => {
    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/formation-details']}><Onboarding/></AllProviders>)

    await fillStep0(user)
    await fillStep1(user)

    // Step 2: Contact information - submit empty
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByText(/enter your full name/i)).toBeInTheDocument()
    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument()
    expect(screen.getByText(/enter your phone number/i)).toBeInTheDocument()
    // still on the contact information step
    expect(screen.getByText(/how should we reach you/i)).toBeInTheDocument()
  })

  it('rejects a phone number with more than 10 digits', async () => {
    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/formation-details']}><Onboarding/></AllProviders>)

    await fillStep0(user)
    await fillStep1(user)

    await user.type(screen.getByLabelText(/full name/i), 'Jordan Lee')
    await user.type(screen.getByLabelText(/^email/i), 'jordan@example.com')
    await user.type(screen.getByLabelText(/^phone/i), '234123090012')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByText(/valid 10-digit u\.s\. phone number/i)).toBeInTheDocument()
  })

  it('advances to the next step with valid contact information', async () => {
    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/formation-details']}><Onboarding/></AllProviders>)

    await fillStep0(user)
    await fillStep1(user)
    await fillContactStep(user)

    expect(await screen.findByText(/where is the business located/i)).toBeInTheDocument()
  })
})

describe('Onboarding wizard - multi-state formation', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('recalculates the state filing fee shown in the order summary when a different state is selected', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      const path = String(url)
      if (path.includes('/auth/me')) {
        return { ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => ({ ok: true, data: { id: 'user-1', name: 'Jordan Lee', email: 'jordan@example.com', role: 'customer', email_verified: true } }) }
      }
      return { ok: false, status: 401, headers: { get: () => 'application/json' }, json: async () => ({ ok: false, message: 'Not authenticated' }) }
    }))

    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/formation-details']}><Onboarding/></AllProviders>)

    // Default selection is Texas the $300 fee should be reflected nowhere
    // yet since we haven't reached a pricing screen. Switch to Wyoming
    // before continuing past step 1.
    await user.selectOptions(screen.getByLabelText(/formation state/i), 'WY')
    await fillStep0(user)
    await fillStep1(user)
    await fillContactStep(user)
    await fillAddressStep(user)
    await user.type(screen.getByPlaceholderText(/owner 1 name/i), 'Jordan Lee')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByLabelText(/i authorize american business formations/i))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.type(screen.getByLabelText(/responsible party full name/i), 'Jordan Lee')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Review step: Wyoming's real $100 filing fee, never Texas's $300.
    expect(await screen.findByText(/wyoming state filing fee/i)).toBeInTheDocument()
    expect(screen.queryByText(/texas state filing fee/i)).not.toBeInTheDocument()
    expect(screen.getByText('$100')).toBeInTheDocument()
  }, 20000)

  it('blocks continuing without a valid formation state', async () => {
    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/formation-details']}><Onboarding/></AllProviders>)

    await user.type(screen.getByLabelText(/proposed business name/i), 'Bright Path Studio LLC')
    await user.selectOptions(screen.getByLabelText(/formation state/i), '')
    await user.selectOptions(screen.getByLabelText(/^industry/i), 'Technology')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByText(/select a state where llc formation is currently available/i)).toBeInTheDocument()
  })
})

describe('Onboarding wizard - accessibility', () => {
  it('announces the current step and moves focus to the first invalid field with a programmatically connected error', async () => {
    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/formation-details']}><Onboarding/></AllProviders>)

    // Step announcement exists and is a live region (screen reader users
    // hear "Step 1 of 15" etc. without needing to look at the sidebar).
    const stepAnnouncement = screen.getByText(/step 1 of 15/i)
    expect(stepAnnouncement).toHaveAttribute('aria-live', 'polite')

    await fillStep0(user)
    await fillStep1(user)
    // Step 2: Contact information submit empty to trigger validation.
    await user.click(screen.getByRole('button', { name: /continue/i }))

    const nameField = await screen.findByLabelText(/full name/i)
    // First invalid field in step order receives real DOM focus, not just
    // a visual error state.
    expect(nameField).toHaveFocus()
    expect(nameField).toHaveAttribute('aria-invalid', 'true')
    const describedBy = nameField.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    // The id it points to actually exists and holds the visible error text.
    expect(document.getElementById(describedBy)).toHaveTextContent(/enter your full name/i)

    // The step-level error summary is announced assertively (role="alert"),
    // not just styled a screen reader user is told a problem exists even
    // before reaching the individual field.
    expect(screen.getByText(/please correct the highlighted fields/i)).toHaveAttribute('role', 'alert')
  })
})

describe('Onboarding wizard - business address step', () => {
  it('requires street, city, and ZIP separately', async () => {
    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/formation-details']}><Onboarding/></AllProviders>)

    await fillStep0(user)
    await fillStep1(user)
    await fillContactStep(user)
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByText(/enter a street address/i)).toBeInTheDocument()
    expect(screen.getByText(/enter a city/i)).toBeInTheDocument()
    expect(screen.getByText(/enter a zip code/i)).toBeInTheDocument()
  })
})

describe('Onboarding wizard - ownership step', () => {
  it('blocks continuing when ownership percentages do not total 100%', async () => {
    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/formation-details']}><Onboarding/></AllProviders>)

    await fillStep0(user)
    await fillStep1(user)
    await fillContactStep(user)
    await fillAddressStep(user)

    // Step 4: Ownership - change owner count to 2 so we get two rows to mismatch
    await user.selectOptions(screen.getByLabelText(/number of owners/i), '2')
    const nameInputs = screen.getAllByPlaceholderText(/owner \d name/i)
    await user.type(nameInputs[0], 'Alex Rivera')
    await user.type(nameInputs[1], 'Sam Rivera')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByText(/total ownership must equal 100%/i)).toBeInTheDocument()
  })
})

describe('Onboarding wizard - registered agent step', () => {
  it('rejects a PO Box registered office address', async () => {
    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/formation-details']}><Onboarding/></AllProviders>)

    await fillStep0(user)
    await fillStep1(user)
    await fillContactStep(user)
    await fillAddressStep(user)
    // Step 4: ownership - fill the single default owner's name (100% is already valid)
    await user.type(screen.getByPlaceholderText(/owner 1 name/i), 'Jordan Lee')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Step 5: Registered agent - appoint someone else, use a PO Box
    await user.click(screen.getByRole('button', { name: /appoint someone else/i }))
    await user.type(screen.getByLabelText(/registered agent name/i), 'Jamie Rivera')
    await user.type(screen.getByLabelText(/registered office street address/i), 'PO Box 123')
    await user.type(screen.getByLabelText(/^city$/i), 'Austin')
    await user.type(screen.getByLabelText(/zip code/i), '78701')
    await user.click(screen.getByLabelText(/i confirm this registered agent has consented/i))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByText(/a po box cannot be used here/i)).toBeInTheDocument()
  })
})

// The remaining tests exercise the full flow through to final submission
// against a mocked-but-real backend response shape (server/app/api/
// applications.py, checkout.py) /auth/me returns an already-authenticated
// user so AccountStep needs no input, matching a returning customer.
async function fillThroughReviewAuthenticated(user) {
  await fillStep0(user)
  await fillStep1(user)
  await fillContactStep(user)
  await fillAddressStep(user)
  // Step 4: ownership (single default owner at 100%)
  await user.type(screen.getByPlaceholderText(/owner 1 name/i), 'Jordan Lee')
  await user.click(screen.getByRole('button', { name: /continue/i }))
  // Step 5: registered agent (default ABF, just consent)
  await user.click(screen.getByLabelText(/i authorize american business formations/i))
  await user.click(screen.getByRole('button', { name: /continue/i }))
  // Step 6: organizer (default self)
  await user.click(screen.getByRole('button', { name: /continue/i }))
  // Step 7: effective date (default upon filing)
  await user.click(screen.getByRole('button', { name: /continue/i }))
  // Step 8: EIN assistance
  await user.type(screen.getByLabelText(/responsible party full name/i), 'Jordan Lee')
  await user.click(screen.getByRole('button', { name: /continue/i }))
  // Step 9: additional services (none required)
  await user.click(screen.getByRole('button', { name: /continue/i }))
  // Step 10: package (default plan already selected)
  await user.click(screen.getByRole('button', { name: /continue/i }))
  // Step 11: account (already signed in nothing to fill)
  await user.click(screen.getByRole('button', { name: /continue/i }))
  // Step 12: review - final consent
  await user.click(screen.getByLabelText(/recurring billing terms/i))
  await user.click(screen.getByRole('button', { name: /continue/i }))
}

const AUTHENTICATED_USER = { id: 'user-1', name: 'Jordan Lee', email: 'jordan@example.com', role: 'customer', email_verified: true }

const CONFIRMED_ORDER = {
  id: 'order-1', order_number: 'ABF-TEST0001', status: 'awaiting_payment',
  service_fee_cents: 20000, state_fee_cents: 30000, add_on_fee_cents: 0,
  tax_cents: 0, discount_cents: 0, total_cents: 50000,
  created_at: new Date().toISOString(),
  items: [
    { type: 'plan', name: 'Accelerated', price_cents: 20000 },
    { type: 'state_fee', name: 'Texas state filing fee', price_cents: 30000 }
  ]
}

function jsonResponse(body, status = 200) {
  return { ok: status < 400, status, headers: { get: () => 'application/json' }, json: async () => body }
}

describe('Onboarding wizard - final submission (real backend)', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('submits a real order, shows the server-confirmed awaiting-payment status, and never shows a card field', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      const path = String(url)
      if (path.includes('/auth/me')) return jsonResponse({ ok: true, data: AUTHENTICATED_USER })
      if (path.includes('/applications/') && path.endsWith('/submit')) {
        return jsonResponse({ ok: true, data: { business: { id: 'biz-1', status: 'submitted' }, application: { id: 'app-1', status: 'submitted' } } })
      }
      if (path.includes('/applications')) {
        return jsonResponse({ ok: true, data: { business: { id: 'biz-1' }, application: { id: 'app-1', status: 'draft' } } }, 201)
      }
      if (path.includes('/checkout/session')) {
        return jsonResponse({ ok: true, data: { order: CONFIRMED_ORDER, checkout_url: null, message: 'Your formation order has been received.' } }, 202)
      }
      if (path.includes('/orders/')) return jsonResponse({ ok: true, data: CONFIRMED_ORDER })
      return jsonResponse({ ok: false, message: 'Not found' }, 404)
    }))

    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/formation-details']}><Onboarding/></AllProviders>)

    await fillThroughReviewAuthenticated(user)
    expect(await screen.findByText(/submit your formation order/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /submit order/i }))

    expect(await screen.findByText(/your formation order has been received/i, {}, { timeout: 10000 })).toBeInTheDocument()
    expect(screen.getByText('ABF-TEST0001')).toBeInTheDocument()
    expect(screen.getByText(/awaiting payment/i)).toBeInTheDocument()
    expect(screen.queryByText(/^paid$/i)).not.toBeInTheDocument()

    // No card fields anywhere in the DOM, at any point in this flow.
    expect(screen.queryByLabelText(/card number/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^cvc$/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/name on card/i)).not.toBeInTheDocument()
  }, 20000)

  it('keeps the draft and shows a real error, without confirming, when the final submission fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      const path = String(url)
      if (path.includes('/auth/me')) return jsonResponse({ ok: true, data: AUTHENTICATED_USER })
      if (path.includes('/applications')) {
        return jsonResponse({ ok: true, data: { business: { id: 'biz-1' }, application: { id: 'app-1', status: 'draft' } } }, 201)
      }
      if (path.includes('/checkout/session')) return jsonResponse({ ok: false, message: 'Something went wrong on our end. Please try again.' }, 500)
      return jsonResponse({ ok: false, message: 'Not found' }, 404)
    }))

    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/formation-details']}><Onboarding/></AllProviders>)

    await fillThroughReviewAuthenticated(user)
    await user.click(screen.getByRole('button', { name: /submit order/i }))

    expect(await screen.findByText(/we could not submit your order/i, {}, { timeout: 10000 })).toBeInTheDocument()
    // Still on the submit step no confirmation, no duplicate order created.
    expect(screen.getByText(/submit your formation order/i)).toBeInTheDocument()
    expect(screen.queryByText(/your formation order has been received/i)).not.toBeInTheDocument()
  }, 20000)

  it('renders the confirmation directly from the server when the URL already carries an order id (refresh-safe)', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      const path = String(url)
      if (path.includes('/auth/me')) return jsonResponse({ ok: true, data: AUTHENTICATED_USER })
      if (path.includes('/orders/')) return jsonResponse({ ok: true, data: CONFIRMED_ORDER })
      return jsonResponse({ ok: false, message: 'Not found' }, 404)
    }))

    render(<AllProviders initialEntries={['/formation-details?order=order-1']}><Onboarding/></AllProviders>)

    expect(await screen.findByText(/your formation order has been received/i, {}, { timeout: 10000 })).toBeInTheDocument()
    expect(screen.getByText('ABF-TEST0001')).toBeInTheDocument()
  }, 15000)
})
