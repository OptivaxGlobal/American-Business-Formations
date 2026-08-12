import { Info, ShieldCheck } from 'lucide-react'
import { priceToNumber } from '../useOnboardingWizard'

export default function PaymentStep({ wizard }) {
  const { form, addOnCatalog, selectedPlan, stateFee, selectedState } = wizard
  const selectedAddOns = form.addOns.map(id => addOnCatalog.find(a => a.id === id)).filter(Boolean)
  const orderTotal = priceToNumber(selectedPlan.price) + stateFee + selectedAddOns.reduce((s, a) => s + a.price, 0)

  return (
    <div className="step-panel review-panel">
      <ShieldCheck className="step-icon" /><span>Submit order</span>
      <h1>Submit your formation order</h1>
      <div className="alert-banner info">
        <Info size={20} />
        <p style={{ margin: 0 }}>Online payment is temporarily unavailable. No card information is requested or collected here submitting your order lets our team contact you directly to arrange secure payment and next steps.</p>
      </div>
      <div className="order-breakdown">
        <div><span>Formation state</span><strong>{selectedState?.name || form.state}</strong></div>
        <div><span>Service plan ({selectedPlan.name})</span><strong>${priceToNumber(selectedPlan.price)}</strong></div>
        <div><span>{selectedState?.name || 'State'} state filing fee <em>(one-time government fee)</em></span><strong>${stateFee}</strong></div>
        {selectedAddOns.map(a => <div key={a.id}><span>{a.name}{a.recurring ? ` (${a.recurring})` : ''}</span><strong>${a.price}</strong></div>)}
        <div className="order-total"><span>Order total</span><strong>${orderTotal}</strong></div>
      </div>
      <p className="onboarding-note"><ShieldCheck size={15} /> Your order total is recalculated and confirmed by our server when you submit no amount shown here is charged automatically.</p>
    </div>
  )
}
