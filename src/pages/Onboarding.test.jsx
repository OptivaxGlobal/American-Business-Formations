import { describe, expect, it } from 'vitest'
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

    await user.type(screen.getByLabelText(/full name/i), 'Jordan Lee')
    await user.type(screen.getByLabelText(/^email/i), 'jordan@example.com')
    await user.type(screen.getByLabelText(/^phone/i), '2341230900')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByText(/where is the business located/i)).toBeInTheDocument()
  })
})

describe('Onboarding wizard - ownership step', () => {
  it('blocks continuing when ownership percentages do not total 100%', async () => {
    const user = userEvent.setup()
    render(<AllProviders initialEntries={['/formation-details']}><Onboarding/></AllProviders>)

    await fillStep0(user)
    await fillStep1(user)
    await user.type(screen.getByLabelText(/full name/i), 'Jordan Lee')
    await user.type(screen.getByLabelText(/^email/i), 'jordan@example.com')
    await user.type(screen.getByLabelText(/^phone/i), '2341230900')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.type(screen.getByLabelText(/principal office address/i), '123 Main St, Austin, TX 78701')
    await user.click(screen.getByRole('button', { name: /continue/i }))

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
    await user.type(screen.getByLabelText(/full name/i), 'Jordan Lee')
    await user.type(screen.getByLabelText(/^email/i), 'jordan@example.com')
    await user.type(screen.getByLabelText(/^phone/i), '2341230900')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.type(screen.getByLabelText(/principal office address/i), '123 Main St, Austin, TX 78701')
    await user.click(screen.getByRole('button', { name: /continue/i }))
    // Step 4: ownership - fill the single default owner's name (100% is already valid)
    await user.type(screen.getByPlaceholderText(/owner 1 name/i), 'Jordan Lee')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Step 5: Registered agent - appoint someone else, use a PO Box
    await user.click(screen.getByRole('button', { name: /appoint someone else/i }))
    await user.type(screen.getByLabelText(/registered agent name/i), 'Jamie Rivera')
    await user.type(screen.getByLabelText(/registered office address/i), 'PO Box 123, Austin, TX 78701')
    await user.click(screen.getByLabelText(/i confirm this registered agent has consented/i))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByText(/a po box cannot be used here/i)).toBeInTheDocument()
  })
})
