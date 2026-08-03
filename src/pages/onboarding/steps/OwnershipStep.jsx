import { Users } from 'lucide-react'
import { fieldAria } from '../../../lib/formErrors'

export default function OwnershipStep({ wizard }) {
  const { form, set, errors, touched, fieldRefs, setOwnerCount, setOwnerField, markOwnerTouched, ownerPercentTotal } = wizard

  return (
    <div className="step-panel">
      <Users className="step-icon" /><span>Ownership & management</span>
      <h1>How will the business be owned?</h1>
      <label>Number of owners or members
        <select value={form.owners} onChange={e => setOwnerCount(e.target.value)}>
          <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4+">4+</option>
        </select>
      </label>
      <div className="radio-cards">
        <button type="button" className={form.management === 'Member-managed' ? 'selected' : ''} onClick={() => set('management', 'Member-managed')}><strong>Member-managed</strong><span>Owners participate in day-to-day decisions.</span></button>
        <button type="button" className={form.management === 'Manager-managed' ? 'selected' : ''} onClick={() => set('management', 'Manager-managed')}><strong>Manager-managed</strong><span>Selected managers handle operations.</span></button>
      </div>
      {form.owners !== '4+' && <div className="owner-rows">
        <div className="owner-rows-head"><span>Owner</span><span>Ownership %</span></div>
        {form.ownerDetails.map((o, i) => <div key={i}>
          <div className="owner-row">
            <label className="sr-only" htmlFor={`ownerName${i}`}>Owner {i + 1} name</label>
            <input id={`ownerName${i}`} value={o.name} onChange={e => { setOwnerField(i, 'name', e.target.value); if (touched[`ownerName${i}`]) markOwnerTouched(i) }} onBlur={() => markOwnerTouched(i)} placeholder={`Owner ${i + 1} name`} ref={el => fieldRefs.current[`ownerName${i}`] = el} {...fieldAria(`ownerName${i}-error`, errors[`ownerName${i}`])} />
            <label className="sr-only" htmlFor={`ownerPct${i}`}>Owner {i + 1} ownership percentage</label>
            <input id={`ownerPct${i}`} type="number" min="0" max="100" value={o.percentage} onChange={e => { setOwnerField(i, 'percentage', e.target.value); if (touched[`ownerPct${i}`]) markOwnerTouched(i) }} onBlur={() => markOwnerTouched(i)} ref={el => fieldRefs.current[`ownerPct${i}`] = el} {...fieldAria(`ownerPct${i}-error`, errors[`ownerPct${i}`])} />
          </div>
          {errors[`ownerName${i}`] && <p id={`ownerName${i}-error`} className="field-error">{errors[`ownerName${i}`]}</p>}
          {errors[`ownerPct${i}`] && <p id={`ownerPct${i}-error`} className="field-error">{errors[`ownerPct${i}`]}</p>}
        </div>)}
        <div className={`owner-total ${ownerPercentTotal === 100 ? 'ok' : 'error'}`}>Total: {ownerPercentTotal}% {ownerPercentTotal !== 100 && '(must equal 100%)'}</div>
        {errors.ownerTotal && <p className="field-error">{errors.ownerTotal}</p>}
      </div>}
      {form.owners === '4+' && <p className="onboarding-note"><Users size={15} /> Ownership percentages for 4 or more owners will be collected during document preparation.</p>}
    </div>
  )
}
