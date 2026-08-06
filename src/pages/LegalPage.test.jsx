import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import LegalPage from './LegalPage'
import { AllProviders } from '../test/testUtils'
import { legalPages } from '../data/legal'

// Regression guard for a real production incident: the live deployment
// served the Legal Disclaimer's content on every legal route (stale/mixed
// `dist` build), even though the source data below was already correct.
// These tests assert each route resolves to its OWN distinct title, H1,
// canonical URL, and intro text not another legal page's content.
const ROUTES = Object.keys(legalPages)

describe('LegalPage routes', () => {
  it('covers all 7 required legal routes', () => {
    expect(ROUTES.sort()).toEqual([
      '/accessibility', '/cookie-policy', '/disclaimer', '/do-not-sell',
      '/privacy', '/refund-policy', '/terms'
    ])
  })

  it.each(ROUTES)('%s renders its own title, H1, canonical, and intro', async (path) => {
    render(<AllProviders initialEntries={[path]}><LegalPage/></AllProviders>)
    const page = legalPages[path]

    expect(await screen.findByRole('heading', { level: 1, name: page.title })).toBeInTheDocument()
    expect(document.title).toContain(page.title)

    const canonical = document.head.querySelector('link[rel="canonical"]')
    expect(canonical).toBeTruthy()
    expect(canonical.getAttribute('href')).toBe(`https://americanbusinessformations.com${path}`)

    expect(screen.getByText(page.intro)).toBeInTheDocument()

    // No other route's title or intro should leak onto this page.
    for (const otherPath of ROUTES) {
      if (otherPath === path) continue
      const other = legalPages[otherPath]
      if (other.title !== page.title) expect(screen.queryByRole('heading', { level: 1, name: other.title })).not.toBeInTheDocument()
      if (other.intro !== page.intro) expect(screen.queryByText(other.intro)).not.toBeInTheDocument()
    }
  })

  it('every route has a unique title and a unique intro (meta description source)', () => {
    const titles = ROUTES.map(p => legalPages[p].title)
    const intros = ROUTES.map(p => legalPages[p].intro)
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(intros).size).toBe(intros.length)
  })
})
