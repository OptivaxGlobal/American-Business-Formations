import { IdCard, ShieldCheck } from 'lucide-react'
import { fieldAria } from '../../../lib/formErrors'

export default function EinAssistanceStep({ wizard }) {
  const { form, set, errors, handleFieldChange, markTouched, fieldRefs } = wizard

  return (
    <div className="step-panel">
      <IdCard className="step-icon" /><span>EIN assistance</span>
      <h1>Do you need a federal tax ID (EIN)?</h1>
      <label className="check-control"><input type="checkbox" checked={form.needsEIN} onChange={e => set('needsEIN', e.target.checked)} /> I need an EIN for this business</label>
      <label className="check-control"><input type="checkbox" checked={form.expectEmployees} onChange={e => set('expectEmployees', e.target.checked)} /> I expect to have employees</label>
      <label className="check-control"><input type="checkbox" checked={form.needsBanking} onChange={e => set('needsBanking', e.target.checked)} /> I need this for opening a business bank account</label>
      <label>Responsible party full name
        <input value={form.responsibleParty} onChange={e => handleFieldChange('responsibleParty', e.target.value)} onBlur={() => markTouched('responsibleParty')} placeholder="The individual responsible for the business" ref={el => fieldRefs.current.responsibleParty = el} {...fieldAria('responsibleParty-error', errors.responsibleParty)} />
        {errors.responsibleParty && <p id="responsibleParty-error" className="field-error">{errors.responsibleParty}</p>}
      </label>
      <p className="onboarding-note"><ShieldCheck size={15} /> The IRS issues EINs directly at no cost. We never collect Social Security Numbers or ITINs through this form that information, if needed, is gathered through a separate secure process.</p>
    </div>
  )
}
