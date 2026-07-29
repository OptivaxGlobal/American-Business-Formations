import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BusinessNameStartForm from './BusinessNameStartForm'
import { AllProviders } from '../test/testUtils'

describe('BusinessNameStartForm', () => {
  it('shows a validation error for an empty submission', async () => {
    const user = userEvent.setup()
    render(<AllProviders><BusinessNameStartForm/></AllProviders>)

    await user.click(screen.getByRole('button', { name: /get started/i }))

    expect(await screen.findByText(/please enter your business name/i)).toBeInTheDocument()
  })

  it('navigates to the onboarding flow with a valid business name', async () => {
    const user = userEvent.setup()
    render(<AllProviders><BusinessNameStartForm/></AllProviders>)

    await user.type(screen.getByLabelText(/enter your business name/i), 'Bright Path Studio')
    await user.click(screen.getByRole('button', { name: /get started/i }))

    expect(screen.queryByText(/please enter your business name/i)).not.toBeInTheDocument()
  })
})
