import { Calendar, ShieldCheck } from 'lucide-react'
import { fieldAria } from '../../../lib/formErrors'

export default function EffectiveDateStep({ wizard }) {
  const { form, set, errors, setErrors, handleFieldChange, markTouched, fieldRefs } = wizard

  return (
    <div className="step-panel">
      <Calendar className="step-icon" /><span>Effective date</span>
      <h1>When should your LLC take effect?</h1>
      <div className="radio-cards">
        <button type="button" className={form.effectiveDateOption === 'filing' ? 'selected' : ''} onClick={() => { set('effectiveDateOption', 'filing'); setErrors(er => ({ ...er, effectiveDate: '' })) }}><strong>Effective upon filing</strong><span>Your LLC exists as soon as the state approves it.</span></button>
        <button type="button" className={form.effectiveDateOption === 'delayed' ? 'selected' : ''} onClick={() => set('effectiveDateOption', 'delayed')}><strong>Delayed effective date</strong><span>Choose a future date, up to 90 days out.</span></button>
      </div>
      {form.effectiveDateOption === 'delayed' && <label>Requested effective date
        <input type="date" value={form.effectiveDate} min={new Date().toISOString().slice(0, 10)} max={new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10)} onChange={e => handleFieldChange('effectiveDate', e.target.value)} onBlur={() => markTouched('effectiveDate')} ref={el => fieldRefs.current.effectiveDate = el} {...fieldAria('effectiveDate-error', errors.effectiveDate)} />
        {errors.effectiveDate && <p id="effectiveDate-error" className="field-error">{errors.effectiveDate}</p>}
      </label>}
      <p className="onboarding-note"><ShieldCheck size={15} /> Texas allows a delayed effective date up to 90 days after filing. Most businesses choose to be effective immediately upon filing.</p>
    </div>
  )
}
