import { useEffect, useState } from 'react'
import { MapPin, Lock } from 'lucide-react'
import { fieldAria } from '../../../lib/formErrors'
import { getState } from '../../../data/states'
import { getStateRequirements, getEntityTypeOptions } from '../../../config/stateRequirements'
import { loadStateGeography } from '../../../lib/geography'
import Combobox from '../../../components/ui/Combobox'

export default function BusinessBasicsStep({ wizard }) {
  const { form, set, errors, handleFieldChange, markTouched, fieldRefs } = wizard
  const selectedState = getState(form.state)
  const requirements = getStateRequirements(form.state)
  const entityOptions = getEntityTypeOptions(form.state)

  // City suggestions are scoped to the selected formation state (loaded
  // lazily see src/lib/geography.js) and re-loaded whenever the state
  // changes; the state itself is fixed here (locked on the previous
  // step), never re-selected on this page.
  const [geo, setGeo] = useState({ cities: [], loading: true, unavailable: false })
  useEffect(() => {
    let cancelled = false
    setGeo(g => ({ ...g, loading: true }))
    loadStateGeography(form.state).then(result => {
      if (!cancelled) setGeo({ ...result, loading: false })
    })
    return () => { cancelled = true }
  }, [form.state])

  return (
    <div className="step-panel">
      <MapPin className="step-icon" /><span>Business basics</span>
      <h1>Tell us about your business</h1>
      <div className="state-lock-badge"><Lock size={14} /> Selected formation state: {selectedState?.name || form.state}</div>
      <p className="hero-availability-note" style={{ margin: '-8px 0 18px' }}>LLC formation is currently available across all 50 states, Washington, D.C. &amp; Puerto Rico. Change your state or jurisdiction on the previous step.</p>
      <label>Business purpose
        <input value={form.purpose} onChange={e => handleFieldChange('purpose', e.target.value)} onBlur={() => markTouched('purpose')} placeholder="Example: Provide marketing consulting services" ref={el => fieldRefs.current.purpose = el} {...fieldAria('purpose-error', errors.purpose)} />
        {errors.purpose && <p id="purpose-error" className="field-error">{errors.purpose}</p>}
      </label>
      <label>Business street address
        <input value={form.principalLine1} onChange={e => handleFieldChange('principalLine1', e.target.value)} onBlur={() => markTouched('principalLine1')} placeholder="123 Main Street, Suite 200" autoComplete="address-line1" ref={el => fieldRefs.current.principalLine1 = el} {...fieldAria('principalLine1-error', errors.principalLine1)} />
        {errors.principalLine1 && <p id="principalLine1-error" className="field-error">{errors.principalLine1}</p>}
      </label>
      <div className="form-grid">
        <Combobox
          id="principalCity"
          label="City"
          value={form.principalCity}
          onChange={v => handleFieldChange('principalCity', v)}
          onBlur={() => markTouched('principalCity')}
          options={geo.cities}
          loading={geo.loading}
          unavailable={geo.unavailable}
          placeholder={`Start typing a ${selectedState?.name || ''} city…`}
          error={errors.principalCity}
          hint={requirements?.cityRequirement?.note}
          inputRef={el => fieldRefs.current.principalCity = el}
          autoComplete="address-level2"
        />
        <label>ZIP code
          <input value={form.principalZip} onChange={e => handleFieldChange('principalZip', e.target.value)} onBlur={() => markTouched('principalZip')} placeholder="78701" inputMode="numeric" autoComplete="postal-code" ref={el => fieldRefs.current.principalZip = el} {...fieldAria('principalZip-error', errors.principalZip)} />
          {errors.principalZip && <p id="principalZip-error" className="field-error">{errors.principalZip}</p>}
        </label>
      </div>
      <label>Expected launch date
        <input type="date" value={form.launchDate} onChange={e => handleFieldChange('launchDate', e.target.value)} onBlur={() => markTouched('launchDate')} ref={el => fieldRefs.current.launchDate = el} {...fieldAria('launchDate-error', errors.launchDate)} />
        {errors.launchDate && <p id="launchDate-error" className="field-error">{errors.launchDate}</p>}
      </label>
      <span id="entity-type-label" className="onboarding-field-label">Entity type</span>
      <div className="radio-cards" role="group" aria-labelledby="entity-type-label">
        {entityOptions.map(opt => (
          <button
            type="button"
            key={opt.id}
            className={`${form.entityType === opt.id ? 'selected' : ''}${!opt.available ? ' is-unavailable' : ''}`}
            disabled={!opt.available}
            aria-disabled={!opt.available}
            title={!opt.available ? opt.reason : undefined}
            onClick={() => opt.available && set('entityType', opt.id)}
          >
            <strong>{opt.shortLabel}</strong>
            <span>{opt.available ? opt.description : `Not available in ${selectedState?.name || 'this state'}.`}</span>
            {!opt.available && opt.reason && <em className="entity-unavailable-reason">{opt.reason}</em>}
          </button>
        ))}
      </div>
      {errors.entityType && <p className="field-error">{errors.entityType}</p>}
    </div>
  )
}
