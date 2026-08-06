import { ShieldCheck } from 'lucide-react'
import { fieldAria } from '../../../lib/formErrors'

export default function RegisteredAgentStep({ wizard }) {
  const { form, set, errors, handleFieldChange, markTouched, fieldRefs } = wizard

  return (
    <div className="step-panel">
      <ShieldCheck className="step-icon" /><span>Registered agent</span>
      <h1>Who will serve as your registered agent?</h1>
      <p>Texas law requires a registered agent with a physical Texas street address a P.O. box alone is not enough.</p>
      <div className="radio-cards">
        <button type="button" className={form.registeredAgentType === 'abf' ? 'selected' : ''} onClick={() => set('registeredAgentType', 'abf')}><strong>American Business Formations</strong><span>Use our registered agent service.</span></button>
        <button type="button" className={form.registeredAgentType === 'self' ? 'selected' : ''} onClick={() => set('registeredAgentType', 'self')}><strong>Appoint myself</strong><span>I have an eligible Texas street address.</span></button>
        <button type="button" className={form.registeredAgentType === 'other' ? 'selected' : ''} onClick={() => set('registeredAgentType', 'other')}><strong>Appoint someone else</strong><span>An individual or eligible business entity.</span></button>
      </div>
      {form.registeredAgentType !== 'abf' && <>
        <label>Registered agent name
          <input value={form.registeredAgentName} onChange={e => handleFieldChange('registeredAgentName', e.target.value)} onBlur={() => markTouched('registeredAgentName')} placeholder="Full name or entity name" ref={el => fieldRefs.current.registeredAgentName = el} {...fieldAria('registeredAgentName-error', errors.registeredAgentName)} />
          {errors.registeredAgentName && <p id="registeredAgentName-error" className="field-error">{errors.registeredAgentName}</p>}
        </label>
        <label>Registered office street address (Texas street address, not a P.O. box)
          <input value={form.registeredOfficeLine1} onChange={e => handleFieldChange('registeredOfficeLine1', e.target.value)} onBlur={() => markTouched('registeredOfficeLine1')} placeholder="123 Main St" autoComplete="address-line1" ref={el => fieldRefs.current.registeredOfficeLine1 = el} {...fieldAria('registeredOfficeLine1-error', errors.registeredOfficeLine1)} />
          {errors.registeredOfficeLine1 && <p id="registeredOfficeLine1-error" className="field-error">{errors.registeredOfficeLine1}</p>}
        </label>
        <div className="form-grid">
          <label>City
            <input value={form.registeredOfficeCity} onChange={e => handleFieldChange('registeredOfficeCity', e.target.value)} onBlur={() => markTouched('registeredOfficeCity')} placeholder="Austin" autoComplete="address-level2" ref={el => fieldRefs.current.registeredOfficeCity = el} {...fieldAria('registeredOfficeCity-error', errors.registeredOfficeCity)} />
            {errors.registeredOfficeCity && <p id="registeredOfficeCity-error" className="field-error">{errors.registeredOfficeCity}</p>}
          </label>
          <label>ZIP code
            <input value={form.registeredOfficeZip} onChange={e => handleFieldChange('registeredOfficeZip', e.target.value)} onBlur={() => markTouched('registeredOfficeZip')} placeholder="78701" inputMode="numeric" autoComplete="postal-code" ref={el => fieldRefs.current.registeredOfficeZip = el} {...fieldAria('registeredOfficeZip-error', errors.registeredOfficeZip)} />
            {errors.registeredOfficeZip && <p id="registeredOfficeZip-error" className="field-error">{errors.registeredOfficeZip}</p>}
          </label>
        </div>
      </>}
      <label className="check-control terms-check">
        <input type="checkbox" checked={form.registeredAgentConsent} onChange={e => handleFieldChange('registeredAgentConsent', e.target.checked)} ref={el => fieldRefs.current.registeredAgentConsent = el} {...fieldAria('registeredAgentConsent-error', errors.registeredAgentConsent)} /> {form.registeredAgentType === 'abf' ? 'I authorize American Business Formations to serve as my registered agent.' : 'I confirm this registered agent has consented to serve, and I will keep a signed record of that consent.'}
      </label>
      {errors.registeredAgentConsent && <p id="registeredAgentConsent-error" className="field-error">{errors.registeredAgentConsent}</p>}
    </div>
  )
}
