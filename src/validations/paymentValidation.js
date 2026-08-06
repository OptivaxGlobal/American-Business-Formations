// Package/add-on selection validators, shared by the onboarding wizard.
// There is no card-collection UI in this app payment is arranged
// separately by the support team while online payment is unavailable (see
// docs/part-2-handoff.md), and Stripe's own hosted checkout page handles
// card data entirely off this app's servers once payments are enabled.
import { invalid, valid } from './commonValidation'

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
