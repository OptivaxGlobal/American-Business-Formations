// Formation-wizard-specific validators: ownership percentages and the
// Texas effective-date rule. State-specific limits (max days out, etc.)
// are read from src/config/texas.js so they live in one place rather than
// being hard-coded in this file or in Onboarding.jsx.
import { invalid, valid, isValidCalendarDate, parseLocalDate, todayLocalISO } from './commonValidation'
import { MESSAGES } from './validationMessages'

export function validateOwnershipPercentage(value) {
  if (value === '' || value === null || value === undefined) return invalid(MESSAGES.percentageInvalid)
  const n = Number(value)
  if (!Number.isFinite(n)) return invalid(MESSAGES.percentageInvalid)
  if (n < 0 || n > 100) return invalid(MESSAGES.percentageRange)
  return valid()
}

export function validateOwnershipTotal(ownerDetails) {
  const total = ownerDetails.reduce((sum, owner) => sum + (Number(owner.percentage) || 0), 0)
  const rounded = Math.round(total * 100) / 100
  if (rounded !== 100) return invalid(MESSAGES.ownershipTotalInvalid)
  return valid({ total: rounded })
}

// maxDaysOut mirrors Texas's rule allowing a delayed effective date up to
// 90 days after filing (see src/config/texas.js requiredFormationFields /
// the onboarding copy) pass a different value for other states later.
export function validateEffectiveDate(value, { maxDaysOut = 90, allowPast = false } = {}) {
  if (!value) return invalid(MESSAGES.dateRequired)
  if (!isValidCalendarDate(value)) return invalid(MESSAGES.dateInvalid)
  const chosen = parseLocalDate(value)
  const today = parseLocalDate(todayLocalISO())
  if (!allowPast && chosen < today) return invalid(MESSAGES.dateNotPast)
  const max = new Date(today)
  max.setDate(max.getDate() + maxDaysOut)
  if (chosen > max) return invalid(MESSAGES.dateTooFarOut(maxDaysOut))
  return valid()
}

// A historical/compliance date (e.g. an existing formation or renewal
// date) must not be set in the future.
export function validateHistoricalDate(value, { required = true } = {}) {
  if (!value) return required ? invalid(MESSAGES.dateRequired) : valid()
  if (!isValidCalendarDate(value)) return invalid(MESSAGES.dateInvalid)
  const chosen = parseLocalDate(value)
  const today = parseLocalDate(todayLocalISO())
  if (chosen > today) return invalid(MESSAGES.dateNotFuture)
  return valid()
}
