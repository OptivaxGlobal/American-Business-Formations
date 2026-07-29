// Checkout/billing validators. Card fields are intentionally NOT validated
// here production billing must use Stripe's own hosted/Elements fields so
// raw card data never touches this app's servers or state (see section 16
// of the validation spec) this module only covers billing name/address
// and catalog-membership checks (never trust a plan/add-on id chosen
// client-side without checking it against the real catalog).
import { validateFullName } from './contactValidation'
import { validateStreetAddress, validateCity, validateZip } from './addressValidation'
import { invalid, valid } from './commonValidation'

export function validateBillingName(value) {
  return validateFullName(value, { required: true })
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
