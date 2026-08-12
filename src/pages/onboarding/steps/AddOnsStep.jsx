import { Check, Info } from 'lucide-react'

const ADDRESS_SERVICE_IDS = ['virtual-office', 'mail-forwarding']

export default function AddOnsStep({ wizard }) {
  const { form, addOnCatalog, toggleAddOn } = wizard
  const addressServices = addOnCatalog.filter(a => ADDRESS_SERVICE_IDS.includes(a.id))
  const otherAddOns = addOnCatalog.filter(a => !ADDRESS_SERVICE_IDS.includes(a.id))

  return (
    <div className="step-panel">
      <span>Additional services</span>
      <h1>Would you like to add any of these?</h1>
      <p>Nothing is preselected. Add only what your business needs.</p>

      {addressServices.length > 0 && <>
        <h3 style={{ margin: '28px 0 4px' }}>Business address services</h3>
        <p className="onboarding-note"><Info size={15}/> Do you need a lease agreement with your business address? Choose one — Virtual Office and Mail Forwarding are alternatives, not a bundle.</p>
        <div className="addon-grid">
          {addressServices.map(a => <button type="button" key={a.id} className={form.addOns.includes(a.id) ? 'selected' : ''} onClick={() => toggleAddOn(a.id)}>
            <span>{form.addOns.includes(a.id) ? <Check /> : '+'}</span><strong>{a.name}</strong><em>${a.price}/{/month/i.test(a.recurring) ? 'mo' : 'yr'}</em>
          </button>)}
        </div>
      </>}

      <h3 style={{ margin: '28px 0 4px' }}>Other services</h3>
      <div className="addon-grid">
        {otherAddOns.map(a => <button type="button" key={a.id} className={form.addOns.includes(a.id) ? 'selected' : ''} onClick={() => toggleAddOn(a.id)}>
          <span>{form.addOns.includes(a.id) ? <Check /> : '+'}</span><strong>{a.name}</strong><em>${a.price}</em>
        </button>)}
      </div>
    </div>
  )
}
