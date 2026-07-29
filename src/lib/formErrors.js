// Small shared helpers for wiring validation results into accessible form
// UI (aria-invalid / aria-describedby / focus-first-invalid-field). Kept
// separate from src/validations/* because this is UI plumbing, not a
// validation rule.

// Spreadable props for an <input>/<select>/<textarea> given its error id
// and current error message (or empty string/undefined when valid).
export function fieldAria(id, message) {
  return message
    ? { 'aria-invalid': 'true', 'aria-describedby': id }
    : { 'aria-invalid': 'false' }
}

// Focuses and scrolls to the first field (in `order`) that has a truthy
// entry in `errors`, using the DOM node registered in `refs.current[key]`.
export function focusFirstInvalid(refs, errors, order) {
  for (const key of order) {
    if (errors[key]) {
      const el = refs.current?.[key]
      if (el && typeof el.focus === 'function') {
        el.focus()
        el.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
      }
      return key
    }
  }
  return null
}

export function hasAnyError(errors) {
  return Object.values(errors).some(Boolean)
}
