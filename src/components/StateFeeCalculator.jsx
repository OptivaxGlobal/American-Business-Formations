import { useState } from 'react'
import StateSelect from './StateSelect'
import { getState, STATE_FEE_DISCLAIMER } from '../data/states'
import { defaultPlans } from './PricingCards'
import { priceToNumber } from '../pages/onboarding/useOnboardingWizard'

// A live preview only real pricing is always computed and validated
// server-side at checkout (see checkout.py) never trust this component's
// arithmetic for an actual order. Lets a visitor see how the total changes
// by state before ever starting the wizard, per the pricing page's own
// "select a state, see the total change" requirement.
export default function StateFeeCalculator() {
  const [stateCode, setStateCode] = useState('TX')
  const [planName, setPlanName] = useState(defaultPlans[1].name)
  const selectedState = getState(stateCode)
  const plan = defaultPlans.find(p => p.name === planName) || defaultPlans[1]
  const serviceFee = priceToNumber(plan.price)
  const stateFee = selectedState?.llcFormationFee ?? 0
  const total = serviceFee + stateFee

  return (
    <div className="state-fee-calculator">
      <div className="state-fee-calculator-controls">
        <StateSelect id="pricing-state" value={stateCode} onChange={setStateCode} required={false} hint={null} />
        <label htmlFor="pricing-plan">Package
          <select id="pricing-plan" value={planName} onChange={e => setPlanName(e.target.value)}>
            {defaultPlans.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </label>
      </div>
      <div className="order-breakdown">
        <div><span>Our service fee ({plan.name})</span><strong>${serviceFee}</strong></div>
        <div><span>{selectedState ? `${selectedState.name} state filing fee` : 'State filing fee'} <em>(one-time government fee)</em></span><strong>${stateFee}</strong></div>
        <div className="order-total"><span>Total</span><strong>${total}</strong></div>
      </div>
      {selectedState?.note && <p className="onboarding-note">{selectedState.note}</p>}
      <p className="onboarding-note">{STATE_FEE_DISCLAIMER}</p>
    </div>
  )
}
