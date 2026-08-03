import { fieldAria } from '../../lib/formErrors'

// Thin wrapper standardizing the label+input+error markup already used
// throughout the app's validated forms (see src/validations/*, src/lib/formErrors.js).
// Existing forms (Login/Signup/Contact/Onboarding/etc.) already implement this
// pattern correctly and are NOT migrated onto this component — it's here for
// any new form so the aria-invalid/aria-describedby wiring is never hand-rolled
// incorrectly again.
export default function Input({ label, id, error, hint, className = '', ...rest }) {
  const inputId = id || rest.name
  const errorId = error ? `${inputId}-error` : undefined
  return (
    <label className={className}>
      {label}
      <input id={inputId} {...fieldAria(errorId, error)} {...rest} />
      {error ? <p id={errorId} className="field-error">{error}</p> : hint ? <small>{hint}</small> : null}
    </label>
  )
}
