import { Link } from 'react-router-dom'
import { FileText, ShieldCheck } from 'lucide-react'
import { fieldAria } from '../../../lib/formErrors'
import { priceToNumber } from '../useOnboardingWizard'

export default function ReviewStep({ wizard }) {
  const { form, errors, handleFieldChange, fieldRefs, addOnCatalog, selectedPlan, stateFee, texas } = wizard

  const selectedAddOns = form.addOns.map(id => addOnCatalog.find(a => a.id === id)).filter(Boolean)
  const estimatedTotal = priceToNumber(selectedPlan.price) + stateFee + selectedAddOns.reduce((s, a) => s + a.price, 0)
  const planRenews = /per year/i.test(selectedPlan.note)
  const recurringAddOns = selectedAddOns.filter(a => a.recurring)

  return (
    <div className="step-panel review-panel">
      <FileText className="step-icon" /><span>Review your plan</span>
      <h1>Confirm your LLC details</h1>
      <div className="review-card">
        <div><small>Business name</small><strong>{form.businessName}</strong></div>
        <div><small>Entity</small><strong>{form.entityType} in Texas</strong></div>
        <div><small>Ownership</small><strong>{form.owners} owner(s), {form.management}</strong></div>
        <div><small>Registered agent</small><strong>{form.registeredAgentType === 'abf' ? 'American Business Formations' : form.registeredAgentName || 'Self / other'}</strong></div>
        <div><small>Organizer</small><strong>{form.organizerType === 'self' ? 'Self' : form.organizerName}</strong></div>
        <div><small>Effective date</small><strong>{form.effectiveDateOption === 'filing' ? 'Upon filing' : form.effectiveDate || 'Delayed'}</strong></div>
        <div><small>Plan</small><strong>{selectedPlan.name} {selectedPlan.price} {selectedPlan.note}</strong></div>
        <div className="full"><small>Selected add-ons</small><div className="tag-row">{form.addOns.length ? form.addOns.map(id => <span key={id}>{addOnCatalog.find(a => a.id === id)?.name}</span>) : <span>None selected</span>}</div></div>
      </div>
      <div className="order-breakdown">
        <div><span>Service plan ({selectedPlan.name})</span><strong>${priceToNumber(selectedPlan.price)}</strong></div>
        <div><span>Texas state filing fee <em>(one-time government fee)</em></span><strong>${stateFee}</strong></div>
        {selectedAddOns.map(a => <div key={a.id}><span>{a.name}{a.recurring ? ` (${a.recurring})` : ''}</span><strong>${a.price}</strong></div>)}
        <div className="order-total"><span>Order total</span><strong>${estimatedTotal}</strong></div>
        {(planRenews || recurringAddOns.length > 0) && <div className="order-renewal">
          <span>Then renews</span>
          <strong>
            {planRenews && `${selectedPlan.price}/year (${selectedPlan.name} plan)`}
            {planRenews && recurringAddOns.length > 0 && ' + '}
            {recurringAddOns.map((a, i) => <span key={a.id}>{i > 0 && ' + '}${a.price}/year ({a.name})</span>)}
          </strong>
        </div>}
      </div>
      {!texas.filingFeeVerified && <p className="onboarding-note"><ShieldCheck size={15} /> The Texas state filing fee shown reflects our current configured rate, pending confirmation against the Texas Secretary of State. Your final total is calculated by our server when you submit.</p>}
      <label className="check-control terms-check">
        <input type="checkbox" checked={form.finalTermsAccepted} onChange={e => handleFieldChange('finalTermsAccepted', e.target.checked)} ref={el => fieldRefs.current.finalTermsAccepted = el} {...fieldAria('finalTermsAccepted-error', errors.finalTermsAccepted)} /> I agree to the Terms of Service, recurring billing terms, and <Link to="/refund-policy" target="_blank" rel="noopener noreferrer">refund and cancellation policy</Link>.
      </label>
      {errors.finalTermsAccepted && <p id="finalTermsAccepted-error" className="field-error">{errors.finalTermsAccepted}</p>}
    </div>
  )
}
