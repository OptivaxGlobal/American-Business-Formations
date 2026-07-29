import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Contact from './Contact'
import { AllProviders } from '../test/testUtils'

describe('Contact page', () => {
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

  it('allows progression with all valid values', async () => {
    const user = userEvent.setup()
    render(<AllProviders><Contact/></AllProviders>)

    await user.type(screen.getByLabelText(/first name/i), 'Jamie')
    await user.type(screen.getByLabelText(/last name/i), 'Rivera')
    await user.type(screen.getByLabelText(/^email/i), 'jamie@example.com')
    await user.type(screen.getByLabelText(/message/i), 'I have a question about registered agents.')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText(/message has been received/i)).toBeInTheDocument()
  })
})
