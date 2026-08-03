import { fieldAria } from '../../lib/formErrors'

// See Input.jsx for the shared rationale.
export default function Textarea({ label, id, error, hint, className = '', ...rest }) {
  const textareaId = id || rest.name
  const errorId = error ? `${textareaId}-error` : undefined
  return (
    <label className={className}>
      {label}
      <textarea id={textareaId} {...fieldAria(errorId, error)} {...rest} />
      {error ? <p id={errorId} className="field-error">{error}</p> : hint ? <small>{hint}</small> : null}
    </label>
  )
}
