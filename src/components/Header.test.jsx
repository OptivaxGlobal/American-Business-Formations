import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from './Header'
import { AllProviders } from '../test/testUtils'

describe('Header', () => {
  it('renders primary navigation links', () => {
    render(<AllProviders><Header/></AllProviders>)
    expect(screen.getByRole('link', { name: /american business formations home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /form an llc/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /start my llc/i }).length).toBeGreaterThan(0)
  })

  it('does not use "Texas" in the primary CTA text', () => {
    render(<AllProviders><Header/></AllProviders>)
    expect(screen.queryByRole('link', { name: /texas/i })).not.toBeInTheDocument()
  })

  it('opens the services mega menu on hover', async () => {
    const user = userEvent.setup()
    render(<AllProviders><Header/></AllProviders>)

    const servicesButton = screen.getByRole('button', { name: /services/i })
    expect(servicesButton).toHaveAttribute('aria-expanded', 'false')

    await user.hover(servicesButton.closest('.nav-dropdown'))
    expect(servicesButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('toggles the mobile navigation drawer', async () => {
    const user = userEvent.setup()
    render(<AllProviders><Header/></AllProviders>)

    const toggle = screen.getByRole('button', { name: /toggle navigation/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })
})
