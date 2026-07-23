import { Check, Minus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal'

export const defaultPlans = [
  { name: 'Launch', theme: 'launch', price: '$0', note: 'plus state fee', description: 'A straightforward formation starting point.', features: ['LLC formation intake', 'Standard processing queue', 'Digital document center', 'Business checklist'], missing: ['Annual compliance support', 'Operating agreement', 'Branding tools'] },
  { name: 'Essential', theme: 'essential', price: '$199', note: 'per year + state fee', popular: true, description: 'Formation plus core compliance support.', features: ['Everything in Launch', 'Priority processing queue', 'Operating agreement request', 'Annual compliance reminders', 'Funding profile access', 'Business coaching resources'], missing: ['Website and domain tools'] },
  { name: 'Growth', theme: 'growth', price: '$249', note: 'per year + state fee', description: 'A broader toolkit for launching and growing.', features: ['Everything in Essential', 'Domain planning tools', 'Website project intake', 'Logo brief builder', 'Business email setup request', 'Digital business card profile'], missing: [] }
]

// Admin-editable override, saved from /admin/plans. Falls back to the
// defaults above when no admin edits have been made in this browser.
export function loadPlans() {
  try {
    const stored = JSON.parse(localStorage.getItem('abf-admin-plans'))
    if (Array.isArray(stored) && stored.length) return stored
  } catch { /* fall through to defaults */ }
  return defaultPlans
}

export const plans = loadPlans()

export default function PricingCards() {
  const activePlans = loadPlans()
  return <div className="pricing-grid">{activePlans.map((plan, i) => (
    <Reveal as="article" delay={i} className={`price-card price-${plan.theme} ${plan.popular ? 'popular' : ''}`} key={plan.name}>
      <div className="price-card-head">
        {plan.popular && <span className="popular-label">Most popular</span>}
        <h3>{plan.name}</h3>
        <div className="price"><strong>{plan.price}</strong><span>{plan.note}</span></div>
      </div>
      <div className="price-card-body">
        <p>{plan.description}</p>
        <Link className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} btn-block`} to="/start">Choose {plan.name}</Link>
        <ul>{plan.features.map(item => <li key={item}><Check size={18}/>{item}</li>)}{plan.missing.map(item => <li className="muted" key={item}><Minus size={18}/>{item}</li>)}</ul>
      </div>
    </Reveal>
  ))}</div>
}
