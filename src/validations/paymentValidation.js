// Checkout/billing validators. In production this app should switch to
// Stripe's own hosted/Elements fields so raw card data never touches this
// app's servers (see section 16 of the validation spec) the format-only
// checks below exist for this demo checkout's own mock card fields, which
// are never persisted or transmitted anywhere they're validated and then
// discarded, never merged into saved form/business/order state.
import { validateFullName } from './contactValidation'
import { validateStreetAddress, validateCity, validateZip } from './addressValidation'
import { digitsOnly, invalid, valid } from './commonValidation'

export function validateBillingName(value) {
  return validateFullName(value, { required: true })
}

export function validateCardName(value) {
  return validateFullName(value, { required: true })
}

// Standard mod-10 checksum used by all major card networks.
function passesLuhnCheck(digits) {
  let sum = 0
  let shouldDouble = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i])
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

export function validateCardNumber(value) {
  const digits = digitsOnly(value)
  if (!digits) return invalid('Enter your card number.')
  if (digits.length < 13 || digits.length > 19) return invalid('Enter a valid card number.')
  if (!passesLuhnCheck(digits)) return invalid('Enter a valid card number.')
  return valid({ normalized: digits })
}

export function validateCardExpiry(value) {
  const raw = String(value ?? '').trim()
  const match = /^(\d{2})\s*\/\s*(\d{2}|\d{4})$/.exec(raw)
  if (!match) return invalid('Enter a valid expiration date (MM/YY).')
  const month = Number(match[1])
  const year = match[2].length === 2 ? 2000 + Number(match[2]) : Number(match[2])
  if (month < 1 || month > 12) return invalid('Enter a valid expiration date (MM/YY).')
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return invalid('This card has expired.')
  }
  return valid()
}

export function validateCardCvc(value) {
  const digits = digitsOnly(value)
  if (!digits) return invalid('Enter your card security code.')
  if (digits.length < 3 || digits.length > 4) return invalid('Enter a valid 3 or 4-digit security code.')
  return valid()
}

export function validateBillingAddress({ street, city, zip }) {
  return {
    street: validateStreetAddress(street, { required: true }),
    city: validateCity(city, { required: true }),
    zip: validateZip(zip, { required: true })
  }
}

export function validateSelectedPlan(planName, catalog) {
  if (!planName || !catalog.some(p => p.name === planName)) return invalid('Select a valid plan.')
  return valid()
}

export function validateSelectedAddOns(addOnIds, catalog) {
  const validIds = new Set(catalog.map(a => a.id))
  const bad = (addOnIds || []).filter(id => !validIds.has(id))
  if (bad.length) return invalid('One or more selected add-ons are not available.')
  return valid()
}
