// Validators for street/city/ZIP fields, shared by the business address,
// registered-office, organizer, mailing, and billing-address forms.
import { trimCollapse, valid, invalid } from './commonValidation'
import { MESSAGES } from './validationMessages'

const PO_BOX_RE = /^\s*(?:p\.?\s*o\.?\s*box|post\s*office\s*box)/i

export function isPoBoxAddress(value) {
  return PO_BOX_RE.test(String(value ?? ''))
}

const DANGEROUS_RE = /<\s*script|javascript:/i

export function validateStreetAddress(value, { required = true, disallowPoBox = false } = {}) {
  const street = trimCollapse(value)
  if (!street) return required ? invalid(MESSAGES.addressRequired) : valid({ normalized: '' })
  if (DANGEROUS_RE.test(street)) return invalid(MESSAGES.addressInvalid)
  if (street.length < 3) return invalid(MESSAGES.addressTooShort)
  if (street.length > 150) return invalid(MESSAGES.addressTooLong)
  if (disallowPoBox && isPoBoxAddress(street)) return invalid(MESSAGES.poBoxNotAllowed)
  return valid({ normalized: street })
}

const CITY_ALLOWED = /^[\p{L}][\p{L} '.-]*$/u

export function validateCity(value, { required = true } = {}) {
  const city = trimCollapse(value)
  if (!city) return required ? invalid(MESSAGES.cityRequired) : valid({ normalized: '' })
  if (city.length < 2) return invalid(MESSAGES.cityTooShort)
  if (city.length > 100) return invalid(MESSAGES.cityTooLong)
  if (!CITY_ALLOWED.test(city)) return invalid(MESSAGES.cityInvalid)
  return valid({ normalized: city })
}

const ZIP_RE = /^\d{5}(-\d{4})?$/

export function validateZip(value, { required = true } = {}) {
  const zip = String(value ?? '').trim()
  if (!zip) return required ? invalid(MESSAGES.zipRequired) : valid({ normalized: '' })
  if (!ZIP_RE.test(zip)) return invalid(MESSAGES.zipInvalid)
  return valid({ normalized: zip })
}
