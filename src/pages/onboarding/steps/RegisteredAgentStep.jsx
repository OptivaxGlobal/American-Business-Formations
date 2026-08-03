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
        <label>Registered office address (Texas street address, not a P.O. box)
          <input value={form.registeredOfficeAddress} onChange={e => handleFieldChange('registeredOfficeAddress', e.target.value)} onBlur={() => markTouched('registeredOfficeAddress')} placeholder="Street address, city, TX, ZIP" ref={el => fieldRefs.current.registeredOfficeAddress = el} {...fieldAria('registeredOfficeAddress-error', errors.registeredOfficeAddress)} />
          {errors.registeredOfficeAddress && <p id="registeredOfficeAddress-error" className="field-error">{errors.registeredOfficeAddress}</p>}
        </label>
      </>}
      <label className="check-control terms-check">
        <input type="checkbox" checked={form.registeredAgentConsent} onChange={e => handleFieldChange('registeredAgentConsent', e.target.checked)} ref={el => fieldRefs.current.registeredAgentConsent = el} {...fieldAria('registeredAgentConsent-error', errors.registeredAgentConsent)} /> {form.registeredAgentType === 'abf' ? 'I authorize American Business Formations to serve as my registered agent.' : 'I confirm this registered agent has consented to serve, and I will keep a signed record of that consent.'}
      </label>
      {errors.registeredAgentConsent && <p id="registeredAgentConsent-error" className="field-error">{errors.registeredAgentConsent}</p>}
    </div>
  )
}
