import { Check, Minus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAddOn } from '../data/pricing'

// Shared Virtual Office vs Mail Forwarding comparison reused on both
// /virtual-office and the generic Mail Forwarding service page (see
// ServicePage.jsx's slug === 'mail-forwarding' special case) so the two
// services are never described inconsistently in two different places.
// Prices always come from src/data/pricing.js, never restated here.
export default function AddressServiceComparison({ current }) {
  const virtualOffice = getAddOn('virtual-office')
  const mailForwarding = getAddOn('mail-forwarding')
  const plans = [
    {
      slug: 'virtual-office', name: 'Virtual Office', price: virtualOffice.price, addOn: virtualOffice,
      description: 'Best when you need a lease agreement for your business address.',
      features: ['Professional business address', 'Unique suite number', 'Lease agreement', 'Unlimited document scanning', 'Online mail access'],
      missing: []
    },
    {
      slug: 'mail-forwarding', name: 'Mail Forwarding', price: mailForwarding.price, addOn: mailForwarding,
      description: 'Best when you need the address and mail handling, without a lease agreement.',
      features: ['Professional business address', 'Unique suite number', 'Unlimited document scanning', 'Online mail access'],
      missing: ['Lease agreement']
    }
  ]
  return (
    <div className="pricing-grid">
      {plans.map(plan => (
        <article className={`price-card${plan.slug === current ? ' popular' : ''}`} key={plan.slug}>
          <div className="price-card-head">
            {plan.slug === current && <span className="popular-label">You&rsquo;re viewing this one</span>}
            <h3>{plan.name}</h3>
            <div className="price"><strong>${plan.price}</strong><span>per month, per entity</span></div>
          </div>
          <div className="price-card-body">
            <p>{plan.description}</p>
            <Link className={`btn ${plan.slug === current ? 'btn-outline' : 'btn-primary'} btn-block`} to={`/${plan.slug}`}>
              {plan.slug === current ? 'You are here' : `Learn about ${plan.name}`}
            </Link>
            <ul>
              {plan.features.map(f => <li key={f}><Check size={18}/>{f}</li>)}
              {plan.missing.map(f => <li className="muted" key={f}><Minus size={18}/>{f}</li>)}
            </ul>
          </div>
        </article>
      ))}
    </div>
  )
}
