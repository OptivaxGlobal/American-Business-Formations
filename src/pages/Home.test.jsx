import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './Home'
import { AllProviders } from '../test/testUtils'

describe('Home page', () => {
  it('renders the hero headline and primary CTA', () => {
    render(<AllProviders><Home/></AllProviders>)

    expect(screen.getByRole('heading', { level: 1, name: /make your business official/i })).toBeInTheDocument()
    expect(screen.getByText('Texas', { selector: '.state-lock-badge' })).toBeInTheDocument()
  })

  it('renders the four-step process section', () => {
    render(<AllProviders><Home/></AllProviders>)
    expect(screen.getByText(/four steps to a filed llc/i)).toBeInTheDocument()
  })

  it('does not repeat "Texas" in the feature cards below the hero', () => {
    render(<AllProviders><Home/></AllProviders>)
    expect(screen.getByText('Guided Formation')).toBeInTheDocument()
    expect(screen.getByText('Compliance Reminders')).toBeInTheDocument()
  })
})
