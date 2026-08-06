import { UserCheck } from 'lucide-react'
import { fieldAria } from '../../../lib/formErrors'

export default function OrganizerStep({ wizard }) {
  const { form, set, errors, handleFieldChange, markTouched, fieldRefs } = wizard

  return (
    <div className="step-panel">
      <UserCheck className="step-icon" /><span>Organizer</span>
      <h1>Who is organizing this LLC?</h1>
      <p>The organizer signs the Certificate of Formation to create the LLC this can be an owner, an attorney, or anyone you authorize.</p>
      <div className="radio-cards">
        <button type="button" className={form.organizerType === 'self' ? 'selected' : ''} onClick={() => set('organizerType', 'self')}><strong>I am the organizer</strong><span>Use your contact information from this application.</span></button>
        <button type="button" className={form.organizerType === 'other' ? 'selected' : ''} onClick={() => set('organizerType', 'other')}><strong>Someone else is the organizer</strong><span>Provide their name and address.</span></button>
      </div>
      {form.organizerType === 'other' && <>
        <label>Organizer name
          <input value={form.organizerName} onChange={e => handleFieldChange('organizerName', e.target.value)} onBlur={() => markTouched('organizerName')} placeholder="Full name" ref={el => fieldRefs.current.organizerName = el} {...fieldAria('organizerName-error', errors.organizerName)} />
          {errors.organizerName && <p id="organizerName-error" className="field-error">{errors.organizerName}</p>}
        </label>
        <label>Organizer street address
          <input value={form.organizerLine1} onChange={e => handleFieldChange('organizerLine1', e.target.value)} onBlur={() => markTouched('organizerLine1')} placeholder="123 Main St" autoComplete="address-line1" ref={el => fieldRefs.current.organizerLine1 = el} {...fieldAria('organizerLine1-error', errors.organizerLine1)} />
          {errors.organizerLine1 && <p id="organizerLine1-error" className="field-error">{errors.organizerLine1}</p>}
        </label>
        <div className="form-grid">
          <label>City
            <input value={form.organizerCity} onChange={e => handleFieldChange('organizerCity', e.target.value)} onBlur={() => markTouched('organizerCity')} autoComplete="address-level2" ref={el => fieldRefs.current.organizerCity = el} {...fieldAria('organizerCity-error', errors.organizerCity)} />
            {errors.organizerCity && <p id="organizerCity-error" className="field-error">{errors.organizerCity}</p>}
          </label>
          <label>ZIP code
            <input value={form.organizerZip} onChange={e => handleFieldChange('organizerZip', e.target.value)} onBlur={() => markTouched('organizerZip')} inputMode="numeric" autoComplete="postal-code" ref={el => fieldRefs.current.organizerZip = el} {...fieldAria('organizerZip-error', errors.organizerZip)} />
            {errors.organizerZip && <p id="organizerZip-error" className="field-error">{errors.organizerZip}</p>}
          </label>
        </div>
      </>}
    </div>
  )
}
