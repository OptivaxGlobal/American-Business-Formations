import { CreditCard, Check } from 'lucide-react'

export default function PackageStep({ wizard }) {
  const { form, set, plans } = wizard

  return (
    <div className="step-panel review-panel">
      <CreditCard className="step-icon" /><span>Package</span>
      <h1>Choose the plan that fits your business</h1>
      <div className="pricing-grid onboarding-pricing">
        {plans.map(p => <button type="button" key={p.name} className={`price-card price-${p.theme} ${form.plan === p.name ? 'selected-plan' : ''}`} onClick={() => set('plan', p.name)}>
          <div className="price-card-head">
            {p.popular && <span className="popular-label">Most popular</span>}
            <h3>{p.name}</h3>
            <div className="price"><strong>{p.price}</strong><span>{p.note}</span></div>
          </div>
          <div className="price-card-body">
            <p>{p.description}</p>
            {form.plan === p.name && <span className="plan-selected-badge"><Check size={16} /> Selected</span>}
          </div>
        </button>)}
      </div>
    </div>
  )
}
