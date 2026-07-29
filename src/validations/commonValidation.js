// Generic, field-agnostic validation helpers shared by every validator in
// src/validations/*. Keep this file free of any single field's business
// rules those live in contactValidation.js, addressValidation.js, etc.
import { MESSAGES } from './validationMessages'

export function collapseSpaces(value) {
  return String(value ?? '').replace(/\s+/g, ' ')
}

export function trimCollapse(value) {
  return collapseSpaces(String(value ?? '').trim())
}

export function isBlank(value) {
  return trimCollapse(value).length === 0
}

export function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export function valid(extra = {}) {
  return { valid: true, message: '', ...extra }
}

export function invalid(message) {
  return { valid: false, message }
}

// Runs [predicate, message] pairs in order and returns the first failure,
// or a passing result if every predicate is truthy.
export function firstFailure(checks) {
  for (const [predicate, message] of checks) {
    if (!predicate) return invalid(message)
  }
  return valid()
}

export function todayLocalISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Parses a 'YYYY-MM-DD' <input type="date"> value as a local calendar date
// (no UTC/timezone shifting), or null if the string isn't well-formed.
export function parseLocalDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''))
  if (!match) return null
  const [, y, m, d] = match.map(Number)
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null
  return date
}

export function isValidCalendarDate(value) {
  return parseLocalDate(value) !== null
}

export function validateRequiredSelect(value, allowedValues, { message = MESSAGES.selectionRequired } = {}) {
  if (!value || !allowedValues.includes(value)) return invalid(message)
  return valid()
}

export function validateRequiredCheckbox(checked, { message = MESSAGES.consentRequired } = {}) {
  return checked ? valid() : invalid(message)
}

const DANGEROUS_CONTENT = /<\s*script|<\s*\/\s*script|javascript:|on\w+\s*=/i

export function containsDangerousMarkup(value) {
  return DANGEROUS_CONTENT.test(String(value ?? ''))
}

export function validateText(value, { required = true, min = 0, max = 10000, label = 'This field' } = {}) {
  const text = String(value ?? '').trim()
  if (!text) return required ? invalid(MESSAGES.textRequired) : valid({ normalized: '' })
  if (containsDangerousMarkup(text)) return invalid(`${label} contains characters that are not allowed.`)
  if (text.length < min) return invalid(MESSAGES.textTooShort(min))
  if (text.length > max) return invalid(MESSAGES.textTooLong(max))
  return valid({ normalized: text })
}

const HTTP_URL_RE = /^https?:\/\/[^\s<>"']+\.[^\s<>"']+$/i

export function validateUrl(value, { required = false } = {}) {
  const url = String(value ?? '').trim()
  if (!url) return required ? invalid(MESSAGES.urlInvalid) : valid({ normalized: '' })
  if (/\s/.test(url) || /^javascript:/i.test(url) || !/^https?:\/\//i.test(url) || !HTTP_URL_RE.test(url)) {
    return invalid(MESSAGES.urlInvalid)
  }
  return valid({ normalized: url })
}

export function validateFile(file, { required = true, allowedTypes = [], allowedExtensions = [], maxSizeBytes = 10 * 1024 * 1024 } = {}) {
  if (!file) return required ? invalid(MESSAGES.fileRequired) : valid()
  const name = String(file.name || '')
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : ''
  if (allowedExtensions.length && !allowedExtensions.includes(ext)) {
    return invalid(MESSAGES.fileTypeInvalid(allowedExtensions.join(', ').toUpperCase()))
  }
  if (allowedTypes.length && file.type && !allowedTypes.includes(file.type)) {
    return invalid(MESSAGES.fileTypeInvalid(allowedExtensions.join(', ').toUpperCase() || 'supported'))
  }
  if (file.size > maxSizeBytes) {
    return invalid(MESSAGES.fileTooLarge(Math.round(maxSizeBytes / (1024 * 1024))))
  }
  return valid()
}
