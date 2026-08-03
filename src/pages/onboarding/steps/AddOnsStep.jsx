import { Check } from 'lucide-react'

export default function AddOnsStep({ wizard }) {
  const { form, addOnCatalog, toggleAddOn } = wizard

  return (
    <div className="step-panel">
      <span>Additional services</span>
      <h1>Would you like to add any of these?</h1>
      <p>Nothing is preselected. Add only what your business needs.</p>
      <div className="addon-grid">
        {addOnCatalog.map(a => <button type="button" key={a.id} className={form.addOns.includes(a.id) ? 'selected' : ''} onClick={() => toggleAddOn(a.id)}>
          <span>{form.addOns.includes(a.id) ? <Check /> : '+'}</span><strong>{a.name}</strong><em>${a.price}</em>
        </button>)}
      </div>
    </div>
  )
}
