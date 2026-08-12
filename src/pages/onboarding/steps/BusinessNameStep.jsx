import { Building2, ShieldCheck } from 'lucide-react'
import { validateBusinessName } from '../../../lib/businessName'
import { fieldAria } from '../../../lib/formErrors'
import StateSelect from '../../../components/StateSelect'
import { getState } from '../../../data/states'

export default function BusinessNameStep({ wizard }) {
  const { form, set, errors, setErrors, nameError, setNameError, touched, markTouched, fieldRefs, handleFieldChange } = wizard
  const selectedState = getState(form.state)

  return (
    <div className="step-panel">
      <Building2 className="step-icon" /><span>Business name</span>
      <h1>Let&rsquo;s confirm your business name</h1>
      <p>Review the name you entered, choose the state you're forming in, or make changes before continuing. This is a preliminary review only the state's Secretary of State (or equivalent filing authority) determines final availability.</p>
      <StateSelect
        id="formation-state"
        value={form.state}
        onChange={v => handleFieldChange('state', v)}
        onBlur={() => markTouched('state')}
        error={errors.state}
        fieldRef={el => fieldRefs.current.state = el}
        hint="LLC formation is available in 21 states."
      />
      <label>Proposed business name
        <input
          value={form.businessName}
          onChange={e => {
            const v = e.target.value
            set('businessName', v)
            if (nameError && validateBusinessName(v).valid) setNameError('')
            if (touched.businessName) {
              const r = validateBusinessName(v)
              setErrors(er => ({ ...er, businessName: r.valid ? '' : r.message }))
            }
          }}
          onBlur={() => {
            const v = validateBusinessName(form.businessName)
            setNameError(v.valid ? '' : v.message)
            markTouched('businessName')
          }}
          placeholder="Example: North Ridge Consulting LLC"
          maxLength={80}
          ref={el => fieldRefs.current.businessName = el}
          {...fieldAria('business-name-error', errors.businessName || nameError)}
        />
      </label>
      <div aria-live="polite">{(errors.businessName || nameError) && <p id="business-name-error" className="field-error">{errors.businessName || nameError}</p>}</div>
      <label>Alternate name (optional)<input value={form.altName} onChange={e => set('altName', e.target.value)} placeholder="A backup option if your first choice is unavailable" /></label>
      <label className="check-control"><input type="checkbox" checked={form.nameFinalized} onChange={e => set('nameFinalized', e.target.checked)} /> This name is finalized</label>
      <label>Industry
        <select value={form.industry} onChange={e => wizard.handleFieldChange('industry', e.target.value)} onBlur={() => markTouched('industry')} ref={el => fieldRefs.current.industry = el} {...fieldAria('industry-error', errors.industry)}>
          <option value="">Choose an industry</option>
          <option>Professional Services</option><option>Ecommerce</option><option>Technology</option>
          <option>Construction</option><option>Food & Hospitality</option><option>Health & Wellness</option>
          <option>Creative Services</option><option>Other</option>
        </select>
        {errors.industry && <p id="industry-error" className="field-error">{errors.industry}</p>}
      </label>
      <p className="onboarding-note"><ShieldCheck size={15} /> This is a preliminary name review only. Final availability is determined by {selectedState ? selectedState.filingAuthority : "your state's filing authority"} when your formation document is filed no name is guaranteed.</p>
    </div>
  )
}
