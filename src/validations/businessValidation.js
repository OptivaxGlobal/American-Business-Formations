// Business-identity validators: legal/DBA business name (re-exported from
// the existing src/lib/businessName.js so there is one implementation) plus
// EIN normalization/formatting/masking.
export { normalizeBusinessName, validateBusinessName } from '../lib/businessName'
import { invalid, valid } from './commonValidation'
import { MESSAGES } from './validationMessages'

export function normalizeEIN(value) {
  return String(value ?? '').replace(/\D/g, '')
}

// Display format XX-XXXXXXX. Returns the raw input unchanged if it isn't
// exactly 9 digits so partial/invalid input isn't silently mangled.
export function formatEIN(value) {
  const digits = normalizeEIN(value)
  if (digits.length !== 9) return String(value ?? '')
  return `${digits.slice(0, 2)}-${digits.slice(2)}`
}

// Never display a full EIN unnecessarily last 4 digits only.
export function maskEIN(value) {
  const digits = normalizeEIN(value)
  if (digits.length !== 9) return ''
  return `XX-XXX${digits.slice(-4)}`
}

export function validateEIN(value, { required = true } = {}) {
  const raw = String(value ?? '')
  if (!raw.trim()) return required ? invalid(MESSAGES.einRequired) : valid({ normalized: '' })
  if (/[a-zA-Z]/.test(raw)) return invalid(MESSAGES.einInvalid)
  const digits = normalizeEIN(raw)
  if (digits.length !== 9) return invalid(MESSAGES.einInvalid)
  return valid({ normalized: digits, formatted: formatEIN(digits) })
}
