import { Check, Minus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal'

// Prices below are service-fee-only placeholders pending owner confirmation.
// The state filing fee is never included in these numbers and is always
// itemized separately during onboarding and at checkout. Feature entries can
// be a plain string or a { text, to } object the { to } ones render as an
// internal link to the service page that actually delivers that feature.
export const defaultPlans = [
  {
    name: 'Foundation', theme: 'launch', price: '$150', note: 'one-time service fee + state filing fee',
    description: 'A straightforward formation starting point.',
    features: [
      'Guided LLC formation questionnaire',
      { text: 'Certificate of Formation preparation and filing', to: '/business-formation-filings' },
      'Formation status tracking in your dashboard',
      'Digital document center'
    ],
    missing: ['Registered agent service', 'Compliance reminders', 'EIN filing assistance']
  },
  {
    name: 'Accelerated', theme: 'essential', price: '$200', note: 'one-time service fee + state filing fee', popular: true,
    description: 'Formation plus the registered agent and compliance support most new LLCs need.',
    features: [
      'Everything in Foundation',
      { text: 'One year of registered agent service included', to: '/registered-agent' },
      { text: 'Compliance deadline reminders', to: '/texas-compliance' },
      { text: 'Operating agreement draft', to: '/operating-agreement' }
    ],
    missing: ['EIN filing assistance', 'DBA / assumed name filing']
  },
  {
    name: 'Complete', theme: 'growth', price: '$250', note: 'one-time service fee + state filing fee',
    description: 'Our most complete package, covering formation, compliance, and your federal tax ID.',
    features: [
      'Everything in Accelerated',
      { text: 'Domestic EIN filing included', to: '/ein' },
      { text: 'DBA / assumed name filing', to: '/texas-dba' },
      { text: 'Formation documents vault', to: '/formation-kit' },
      'Priority support'
    ],
    missing: []
  }
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
        <ul>{plan.features.map(item => {
          const text = typeof item === 'string' ? item : item.text
          const to = typeof item === 'string' ? null : item.to
          return <li key={text}><Check size={18}/>{to ? <Link to={to}>{text}</Link> : text}</li>
        })}{plan.missing.map(item => <li className="muted" key={item}><Minus size={18}/>{item}</li>)}</ul>
      </div>
    </Reveal>
  ))}</div>
}
