// Validators for admin-only forms: plan pricing, Texas config numbers, and
// content-management text fields (announcements, testimonials, FAQs).
import { invalid, valid } from './commonValidation'
import { MESSAGES } from './validationMessages'

export function validateInteger(value, { min = -Infinity, max = Infinity, required = true } = {}) {
  if (value === '' || value === null || value === undefined) {
    return required ? invalid(MESSAGES.numberRequired) : valid()
  }
  const n = Number(value)
  if (!Number.isFinite(n) || !Number.isInteger(n)) return invalid(MESSAGES.integerInvalid)
  if (n < min || n > max) return invalid(`Enter a value between ${min} and ${max}.`)
  return valid({ normalized: n })
}

// Accepts admin-entered price strings like "$199", "199", or "199.99" and
// returns the numeric amount plus a "$199.00"-style display string.
export function validatePriceInput(value, { min = 0, max = 100000, required = true } = {}) {
  const raw = String(value ?? '').trim()
  if (!raw) return required ? invalid(MESSAGES.numberRequired) : valid()
  const cleaned = raw.replace(/[$,\s]/g, '')
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return invalid(MESSAGES.moneyInvalid)
  const amount = Number(cleaned)
  if (!Number.isFinite(amount)) return invalid(MESSAGES.moneyInvalid)
  if (amount < min) return invalid(MESSAGES.moneyNegative)
  if (amount > max) return invalid(`Enter an amount of $${max} or less.`)
  return valid({ normalized: amount, display: `$${amount % 1 === 0 ? amount : amount.toFixed(2)}` })
}

export function validateAdminText(value, { required = true, min = 0, max = 2000 } = {}) {
  const text = String(value ?? '').trim()
  if (!text) return required ? invalid(MESSAGES.textRequired) : valid({ normalized: '' })
  if (text.length < min) return invalid(MESSAGES.textTooShort(min))
  if (text.length > max) return invalid(MESSAGES.textTooLong(max))
  return valid({ normalized: text })
}
