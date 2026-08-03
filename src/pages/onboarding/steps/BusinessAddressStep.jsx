import { MapPin } from 'lucide-react'
import { fieldAria } from '../../../lib/formErrors'

export default function BusinessAddressStep({ wizard }) {
  const { form, set, errors, setErrors, handleFieldChange, markTouched, fieldRefs } = wizard

  return (
    <div className="step-panel">
      <MapPin className="step-icon" /><span>Business address</span>
      <h1>Where is the business located?</h1>
      <label>Principal office address
        <input value={form.principalAddress} onChange={e => handleFieldChange('principalAddress', e.target.value)} onBlur={() => markTouched('principalAddress')} placeholder="Street, city, TX, ZIP" autoComplete="street-address" ref={el => fieldRefs.current.principalAddress = el} {...fieldAria('principalAddress-error', errors.principalAddress)} />
        {errors.principalAddress && <p id="principalAddress-error" className="field-error">{errors.principalAddress}</p>}
      </label>
      <label className="check-control">
        <input type="checkbox" checked={form.mailingSame} onChange={e => { set('mailingSame', e.target.checked); if (e.target.checked) setErrors(er => ({ ...er, mailingAddress: '' })) }} /> Mailing address is the same as the principal address
      </label>
      {!form.mailingSame && <label>Mailing address
        <input value={form.mailingAddress} onChange={e => handleFieldChange('mailingAddress', e.target.value)} onBlur={() => markTouched('mailingAddress')} ref={el => fieldRefs.current.mailingAddress = el} {...fieldAria('mailingAddress-error', errors.mailingAddress)} />
        {errors.mailingAddress && <p id="mailingAddress-error" className="field-error">{errors.mailingAddress}</p>}
      </label>}
      <label className="check-control">
        <input type="checkbox" checked={form.addressPrivacy} onChange={e => set('addressPrivacy', e.target.checked)} /> I&rsquo;d like to explore a virtual business address instead of my home address
      </label>
    </div>
  )
}
