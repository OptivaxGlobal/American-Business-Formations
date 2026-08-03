import { fieldAria } from '../../lib/formErrors'

// See Input.jsx for the shared rationale. `options` is an array of either
// plain strings or { value, label } objects; `placeholder` renders as a
// disabled, unselectable first <option> (never a valid submitted value).
export default function Select({ label, id, error, hint, options = [], placeholder, className = '', ...rest }) {
  const selectId = id || rest.name
  const errorId = error ? `${selectId}-error` : undefined
  return (
    <label className={className}>
      {label}
      <select id={selectId} {...fieldAria(errorId, error)} {...rest}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(opt => {
          const value = typeof opt === 'string' ? opt : opt.value
          const optLabel = typeof opt === 'string' ? opt : opt.label
          return <option key={value} value={value}>{optLabel}</option>
        })}
      </select>
      {error ? <p id={errorId} className="field-error">{error}</p> : hint ? <small>{hint}</small> : null}
    </label>
  )
}
