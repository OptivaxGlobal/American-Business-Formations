import { Users } from 'lucide-react'
import { fieldAria } from '../../../lib/formErrors'

export default function ContactInfoStep({ wizard }) {
  const { form, errors, handleFieldChange, markTouched, fieldRefs } = wizard

  return (
    <div className="step-panel">
      <Users className="step-icon" /><span>Contact information</span>
      <h1>How should we reach you?</h1>
      <label>Full name
        <input value={form.fullName} onChange={e => handleFieldChange('fullName', e.target.value)} onBlur={() => markTouched('fullName')} placeholder="Jordan Lee" autoComplete="name" ref={el => fieldRefs.current.fullName = el} {...fieldAria('fullName-error', errors.fullName)} />
        {errors.fullName && <p id="fullName-error" className="field-error">{errors.fullName}</p>}
      </label>
      <label>Email
        <input type="email" value={form.email} onChange={e => handleFieldChange('email', e.target.value)} onBlur={() => markTouched('email')} placeholder="you@example.com" autoComplete="email" ref={el => fieldRefs.current.email = el} {...fieldAria('contact-email-error', errors.email)} />
        {errors.email && <p id="contact-email-error" className="field-error">{errors.email}</p>}
      </label>
      <label>Phone
        <input type="tel" inputMode="tel" value={form.phone} onChange={e => handleFieldChange('phone', e.target.value)} onBlur={() => markTouched('phone')} placeholder="(555) 555-5555" autoComplete="tel" ref={el => fieldRefs.current.phone = el} {...fieldAria('phone-error', errors.phone)} />
        {errors.phone && <p id="phone-error" className="field-error">{errors.phone}</p>}
      </label>
      <label>Preferred contact method
        <select value={form.commPref} onChange={e => handleFieldChange('commPref', e.target.value)} onBlur={() => markTouched('commPref')} ref={el => fieldRefs.current.commPref = el} {...fieldAria('commPref-error', errors.commPref)}>
          <option value="email">Email</option><option value="phone">Phone</option><option value="sms">Text message</option>
        </select>
        {errors.commPref && <p id="commPref-error" className="field-error">{errors.commPref}</p>}
      </label>
    </div>
  )
}
