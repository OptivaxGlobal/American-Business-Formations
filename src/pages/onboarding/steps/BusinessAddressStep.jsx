import { MapPin, Info } from 'lucide-react'
import { fieldAria } from '../../../lib/formErrors'
import { getState } from '../../../data/states'

// The principal business address itself (street/city/ZIP) is collected
// once, on the earlier Business Basics step form.principalLine1/
// principalCity/principalZip are the exact same fields read/written
// there, so nothing here is a second, separate entry. This step confirms
// that address (still editable, in case it needs a correction) and
// collects what Business Basics doesn't: a different mailing address, and
// address-privacy preference.
export default function BusinessAddressStep({ wizard }) {
  const { form, set, errors, setErrors, handleFieldChange, markTouched, fieldRefs } = wizard
  const selectedState = getState(form.state)

  return (
    <div className="step-panel">
      <MapPin className="step-icon" /><span>Business address</span>
      <h1>Confirm your business address</h1>
      <p className="onboarding-note"><Info size={15} /> This is the address you entered on Business Basics. Update it here if anything needs correcting.</p>
      <label>Principal office street address
        <input value={form.principalLine1} onChange={e => handleFieldChange('principalLine1', e.target.value)} onBlur={() => markTouched('principalLine1')} placeholder="123 Main St" autoComplete="address-line1" ref={el => fieldRefs.current.principalLine1 = el} {...fieldAria('principalLine1-error', errors.principalLine1)} />
        {errors.principalLine1 && <p id="principalLine1-error" className="field-error">{errors.principalLine1}</p>}
      </label>
      <div className="form-grid">
        <label>City
          <input value={form.principalCity} onChange={e => handleFieldChange('principalCity', e.target.value)} onBlur={() => markTouched('principalCity')} placeholder="Austin" autoComplete="address-level2" ref={el => fieldRefs.current.principalCity = el} {...fieldAria('principalCity-error', errors.principalCity)} />
          {errors.principalCity && <p id="principalCity-error" className="field-error">{errors.principalCity}</p>}
        </label>
        <label>ZIP code
          <input value={form.principalZip} onChange={e => handleFieldChange('principalZip', e.target.value)} onBlur={() => markTouched('principalZip')} placeholder="78701" inputMode="numeric" autoComplete="postal-code" ref={el => fieldRefs.current.principalZip = el} {...fieldAria('principalZip-error', errors.principalZip)} />
          {errors.principalZip && <p id="principalZip-error" className="field-error">{errors.principalZip}</p>}
        </label>
        <label>State<input value={selectedState?.name || form.state} disabled /></label>
      </div>
      <label className="check-control">
        <input type="checkbox" checked={form.mailingSame} onChange={e => { set('mailingSame', e.target.checked); if (e.target.checked) setErrors(er => ({ ...er, mailingLine1: '', mailingCity: '', mailingZip: '' })) }} /> Mailing address is the same as the principal address
      </label>
      {!form.mailingSame && <>
        <label>Mailing street address
          <input value={form.mailingLine1} onChange={e => handleFieldChange('mailingLine1', e.target.value)} onBlur={() => markTouched('mailingLine1')} autoComplete="address-line1" ref={el => fieldRefs.current.mailingLine1 = el} {...fieldAria('mailingLine1-error', errors.mailingLine1)} />
          {errors.mailingLine1 && <p id="mailingLine1-error" className="field-error">{errors.mailingLine1}</p>}
        </label>
        <div className="form-grid">
          <label>City
            <input value={form.mailingCity} onChange={e => handleFieldChange('mailingCity', e.target.value)} onBlur={() => markTouched('mailingCity')} autoComplete="address-level2" ref={el => fieldRefs.current.mailingCity = el} {...fieldAria('mailingCity-error', errors.mailingCity)} />
            {errors.mailingCity && <p id="mailingCity-error" className="field-error">{errors.mailingCity}</p>}
          </label>
          <label>ZIP code
            <input value={form.mailingZip} onChange={e => handleFieldChange('mailingZip', e.target.value)} onBlur={() => markTouched('mailingZip')} inputMode="numeric" autoComplete="postal-code" ref={el => fieldRefs.current.mailingZip = el} {...fieldAria('mailingZip-error', errors.mailingZip)} />
            {errors.mailingZip && <p id="mailingZip-error" className="field-error">{errors.mailingZip}</p>}
          </label>
        </div>
      </>}
      <label className="check-control">
        <input type="checkbox" checked={form.addressPrivacy} onChange={e => set('addressPrivacy', e.target.checked)} /> I&rsquo;d like to explore a virtual business address instead of my home address
      </label>
    </div>
  )
}
