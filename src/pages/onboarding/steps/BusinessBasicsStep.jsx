import { MapPin, Lock } from 'lucide-react'
import { fieldAria } from '../../../lib/formErrors'
import { getState } from '../../../data/states'

export default function BusinessBasicsStep({ wizard }) {
  const { form, set, errors, handleFieldChange, markTouched, fieldRefs } = wizard
  const selectedState = getState(form.state)

  return (
    <div className="step-panel">
      <MapPin className="step-icon" /><span>Business basics</span>
      <h1>Tell us about your business</h1>
      <div className="state-lock-badge"><Lock size={14} /> State: {selectedState?.name || form.state}</div>
      <p className="hero-availability-note" style={{ margin: '-8px 0 18px' }}>LLC formation is currently available in 21 states. Change your state on the previous step.</p>
      <label>Business purpose
        <input value={form.purpose} onChange={e => handleFieldChange('purpose', e.target.value)} onBlur={() => markTouched('purpose')} placeholder="Example: Provide marketing consulting services" ref={el => fieldRefs.current.purpose = el} {...fieldAria('purpose-error', errors.purpose)} />
        {errors.purpose && <p id="purpose-error" className="field-error">{errors.purpose}</p>}
      </label>
      <div className="form-grid">
        <label>County
          <input value={form.county} onChange={e => handleFieldChange('county', e.target.value)} onBlur={() => markTouched('county')} placeholder="Example: Travis County" ref={el => fieldRefs.current.county = el} {...fieldAria('county-error', errors.county)} />
          {errors.county && <p id="county-error" className="field-error">{errors.county}</p>}
        </label>
        <label>City
          <input value={form.city} onChange={e => handleFieldChange('city', e.target.value)} onBlur={() => markTouched('city')} placeholder="Example: Austin" ref={el => fieldRefs.current.city = el} {...fieldAria('city-error', errors.city)} />
          {errors.city && <p id="city-error" className="field-error">{errors.city}</p>}
        </label>
      </div>
      <label>Expected launch date
        <input type="date" value={form.launchDate} onChange={e => handleFieldChange('launchDate', e.target.value)} onBlur={() => markTouched('launchDate')} ref={el => fieldRefs.current.launchDate = el} {...fieldAria('launchDate-error', errors.launchDate)} />
        {errors.launchDate && <p id="launchDate-error" className="field-error">{errors.launchDate}</p>}
      </label>
      <div className="radio-cards">
        <button type="button" className={form.entityType === 'LLC' ? 'selected' : ''} onClick={() => set('entityType', 'LLC')}><strong>LLC</strong><span>A flexible structure for most small businesses.</span></button>
        <button type="button" className={form.entityType === 'Series LLC' ? 'selected' : ''} onClick={() => set('entityType', 'Series LLC')}><strong>Series LLC</strong><span>Separate series under one parent LLC for more complex structures.</span></button>
      </div>
    </div>
  )
}
