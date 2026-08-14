import { ShieldCheck, PenLine } from 'lucide-react'
import { fieldAria } from '../../../lib/formErrors'
import { getState } from '../../../data/states'
import { getStateRequirements } from '../../../config/stateRequirements'

export default function RegisteredAgentStep({ wizard }) {
  const { form, set, errors, handleFieldChange, markTouched, fieldRefs } = wizard
  const selectedState = getState(form.state)
  const stateName = selectedState?.name || 'your formation state'
  const raRequirements = getStateRequirements(form.state)?.registeredAgentRequirements

  return (
    <div className="step-panel">
      <ShieldCheck className="step-icon" /><span>Registered agent</span>
      <h1>Who will serve as your registered agent?</h1>
      <p>State law requires a registered agent with a physical street address in {stateName} a P.O. box alone is not enough.</p>
      <div className="radio-cards">
        <button type="button" className={form.registeredAgentType === 'abf' ? 'selected' : ''} onClick={() => set('registeredAgentType', 'abf')}><strong>American Business Formations</strong><span>Use our registered agent service.</span></button>
        <button type="button" className={form.registeredAgentType === 'self' ? 'selected' : ''} onClick={() => set('registeredAgentType', 'self')}><strong>Appoint myself</strong><span>I have an eligible street address in {stateName}.</span></button>
        <button type="button" className={form.registeredAgentType === 'other' ? 'selected' : ''} onClick={() => set('registeredAgentType', 'other')}><strong>Appoint someone else</strong><span>An individual or eligible business entity.</span></button>
      </div>
      {form.registeredAgentType !== 'abf' && <>
        <label>Registered agent name
          <input value={form.registeredAgentName} onChange={e => handleFieldChange('registeredAgentName', e.target.value)} onBlur={() => markTouched('registeredAgentName')} placeholder="Full name or entity name" ref={el => fieldRefs.current.registeredAgentName = el} {...fieldAria('registeredAgentName-error', errors.registeredAgentName)} />
          {errors.registeredAgentName && <p id="registeredAgentName-error" className="field-error">{errors.registeredAgentName}</p>}
        </label>
        <label>Registered office street address (a street address in {stateName}, not a P.O. box)
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

      <label>
        <PenLine size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} aria-hidden="true" />Typed signature (your full legal name)
        <input value={form.registeredAgentSignerName} onChange={e => handleFieldChange('registeredAgentSignerName', e.target.value)} onBlur={() => markTouched('registeredAgentSignerName')} placeholder="Type your full legal name to sign electronically" ref={el => fieldRefs.current.registeredAgentSignerName = el} {...fieldAria('registeredAgentSignerName-error', errors.registeredAgentSignerName)} />
        {errors.registeredAgentSignerName && <p id="registeredAgentSignerName-error" className="field-error">{errors.registeredAgentSignerName}</p>}
      </label>
      <p className="onboarding-note"><ShieldCheck size={15} /> Typing your name above and confirming the checkbox is your electronic signature. We record the signer name, consent timestamp, and this acceptance record securely with your formation file{raRequirements?.consentFiledWithState ? '.' : ' it is kept on file by American Business Formations and is not itself filed with the state.'}</p>
    </div>
  )
}
