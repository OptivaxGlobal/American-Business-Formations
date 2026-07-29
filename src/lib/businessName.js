const ALLOWED_CHARACTERS = /^[\p{L}\p{N} '’&.,-]+$/u
const HAS_LETTER = /\p{L}/u

export function normalizeBusinessName(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

export function validateBusinessName(value) {
  const name = normalizeBusinessName(value)
  if (!name) return { valid: false, message: 'Please enter your business name.' }
  if (name.length < 2) return { valid: false, message: 'Business name must contain at least 2 characters.' }
  if (name.length > 80) return { valid: false, message: 'Business name must be 80 characters or fewer.' }
  if (!HAS_LETTER.test(name) || !ALLOWED_CHARACTERS.test(name)) {
    return { valid: false, message: 'Please enter a valid business name.' }
  }
  return { valid: true, message: '' }
}
