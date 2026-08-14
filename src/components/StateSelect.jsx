import { stateList } from '../data/states'
import { fieldAria } from '../lib/formErrors'

// A native <select> rather than a custom combobox matches every other
// single-choice field in this app (industry, entity type, management
// structure, effective date option all use plain <select>). A native
// select is already keyboard-accessible, works correctly on mobile with
// the OS's own picker, and supports type-ahead search by typing a
// letter no custom ARIA combobox implementation needed to satisfy those
// requirements, and one less thing to get wrong on touch devices.
export default function StateSelect({ id, label = 'Formation state', value, onChange, onBlur, error, required = true, fieldRef, hint }) {
  return (
    <label htmlFor={id}>
      {label}
      <select
        id={id}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        ref={fieldRef}
        required={required}
        {...fieldAria(`${id}-error`, error)}
      >
        <option value="">Choose a state</option>
        {stateList.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
      </select>
      {hint && !error && <small>{hint}</small>}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </label>
  )
}
