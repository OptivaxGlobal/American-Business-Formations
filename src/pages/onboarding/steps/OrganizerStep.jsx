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
        <label>Organizer address
          <input value={form.organizerAddress} onChange={e => handleFieldChange('organizerAddress', e.target.value)} onBlur={() => markTouched('organizerAddress')} placeholder="Street, city, state, ZIP" ref={el => fieldRefs.current.organizerAddress = el} {...fieldAria('organizerAddress-error', errors.organizerAddress)} />
          {errors.organizerAddress && <p id="organizerAddress-error" className="field-error">{errors.organizerAddress}</p>}
        </label>
      </>}
    </div>
  )
}
