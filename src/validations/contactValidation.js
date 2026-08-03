// Validators for person-identifying contact fields: full name, email,
// phone, and preferred-contact-method selects. Reused across the contact
// form, onboarding wizard (contact/organizer/registered-agent/EIN steps),
// auth forms, and dashboard/admin forms wherever a person's name or reach
// method is collected.
import { trimCollapse, digitsOnly, valid, invalid } from './commonValidation'
import { MESSAGES } from './validationMessages'

const HAS_LETTER = /\p{L}/u
// Letters (incl. accented/international), spaces, hyphens, apostrophes
// (straight or curly), and periods (e.g. "John A. Smith").
const NAME_ALLOWED = /^[\p{L}\p{M} '’.-]+$/u

export function normalizeFullName(value) {
  return trimCollapse(value)
}

export function validateFullName(value, { required = true } = {}) {
  const name = normalizeFullName(value)
  if (!name) return required ? invalid(MESSAGES.nameRequired) : valid({ normalized: '' })
  if (name.length < 2) return invalid(MESSAGES.nameTooShort)
  if (name.length > 100) return invalid(MESSAGES.nameTooLong)
  if (!HAS_LETTER.test(name) || !NAME_ALLOWED.test(name)) return invalid(MESSAGES.nameInvalid)
  return valid({ normalized: name })
}

export function normalizeEmail(value) {
  const email = String(value ?? '').trim()
  const at = email.lastIndexOf('@')
  if (at === -1) return email
  return email.slice(0, at) + '@' + email.slice(at + 1).toLowerCase()
}

// Deliberately not a single giant "one true regex" the length/whitespace/
// consecutive-dot checks run first with their own messages, and the shape
// check is intentionally permissive (RFC 5322-ish) rather than rejecting
// legitimate but unusual addresses.
const EMAIL_SHAPE_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/

export function validateEmail(value, { required = true } = {}) {
  const raw = String(value ?? '')
  const email = raw.trim()
  if (!email) return required ? invalid(MESSAGES.emailRequired) : valid({ normalized: '' })
  if (/\s/.test(email)) return invalid(MESSAGES.emailInvalid)
  if (email.length > 254) return invalid(MESSAGES.emailInvalid)
  if (email.includes('..')) return invalid(MESSAGES.emailInvalid)
  if ((email.match(/@/g) || []).length !== 1) return invalid(MESSAGES.emailInvalid)
  if (!EMAIL_SHAPE_RE.test(email)) return invalid(MESSAGES.emailInvalid)
  return valid({ normalized: normalizeEmail(email) })
}

export function validateEmailConfirmation(email, confirmEmail) {
  const a = normalizeEmail(email).toLowerCase()
  const b = normalizeEmail(confirmEmail).toLowerCase()
  if (!confirmEmail) return invalid(MESSAGES.emailRequired)
  if (a !== b) return invalid(MESSAGES.emailMismatch)
  return valid()
}

// Strips spaces, parens, hyphens, dots, and an optional leading country
// code (+1 / 1) so the result is either '' or exactly the national digits.
export function normalizePhoneDigits(value) {
  let digits = digitsOnly(value)
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1)
  return digits
}

export function validatePhone(value, { required = true } = {}) {
  const raw = String(value ?? '')
  if (!raw.trim()) return required ? invalid(MESSAGES.phoneRequired) : valid({ normalized: '' })
  if (/[a-zA-Z]/.test(raw)) return invalid(MESSAGES.phoneInvalid)
  const digits = normalizePhoneDigits(raw)
  if (digits.length !== 10) return invalid(MESSAGES.phoneInvalid)
  return valid({ normalized: `+1${digits}`, formatted: formatPhone(digits) })
}

// Stored format: +1XXXXXXXXXX. Display format: (XXX) XXX-XXXX.
export function formatPhone(value) {
  const digits = normalizePhoneDigits(value)
  if (digits.length !== 10) return String(value ?? '')
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

// E.164 shape: a leading '+', then 8-15 digits total (country code + national
// number), no spaces/punctuation once normalized. Not wired into any wizard
// step today no international-founder flow exists to call it from but kept
// alongside validatePhone so a future international intake path has a
// ready-made validator rather than inventing one under time pressure.
const E164_RE = /^\+[1-9]\d{7,14}$/

export function validateInternationalPhone(value, { required = true } = {}) {
  const raw = String(value ?? '').trim()
  if (!raw) return required ? invalid(MESSAGES.phoneRequired) : valid({ normalized: '' })
  if (/[a-zA-Z]/.test(raw)) return invalid(MESSAGES.internationalPhoneInvalid)
  if (!raw.startsWith('+')) return invalid(MESSAGES.internationalPhoneInvalid)
  const normalized = '+' + digitsOnly(raw)
  if (!E164_RE.test(normalized)) return invalid(MESSAGES.internationalPhoneInvalid)
  return valid({ normalized })
}

export function validatePreferredContactMethod(value, allowedMethods) {
  if (!value || !allowedMethods.includes(value)) return invalid(MESSAGES.contactMethodRequired)
  return valid()
}

// Section 17 conditional rule: whichever method is preferred must itself
// resolve to a valid value for that channel.
export function validateContactMethodRequirement(preferredMethod, { email, phone }) {
  if (preferredMethod === 'email') return validateEmail(email, { required: true })
  if (preferredMethod === 'phone' || preferredMethod === 'sms') return validatePhone(phone, { required: true })
  return valid()
}
