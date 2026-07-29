// Password validators for signup / reset / change-password / admin account
// forms. Login intentionally uses the lighter `validateLoginPassword`
// (presence only) rather than strength rules a login form must never
// reject a correct existing password just because it predates today's
// complexity policy.
import { invalid, valid } from './commonValidation'
import { MESSAGES } from './validationMessages'

const HAS_UPPER = /[A-Z]/
const HAS_LOWER = /[a-z]/
const HAS_NUMBER = /\d/
const HAS_SPECIAL = /[^A-Za-z0-9]/

export function validatePassword(value, { required = true } = {}) {
  const password = String(value ?? '')
  if (!password) return required ? invalid(MESSAGES.passwordRequired) : valid()
  if (password.length < 8) return invalid(MESSAGES.passwordTooShort)
  if (password.length > 128) return invalid(MESSAGES.passwordTooLong)
  if (!HAS_UPPER.test(password) || !HAS_LOWER.test(password) || !HAS_NUMBER.test(password) || !HAS_SPECIAL.test(password)) {
    return invalid(MESSAGES.passwordWeak)
  }
  return valid()
}

export function validatePasswordConfirmation(password, confirmPassword) {
  if (!confirmPassword) return invalid(MESSAGES.confirmPasswordRequired)
  if (password !== confirmPassword) return invalid(MESSAGES.passwordMismatch)
  return valid()
}

export function validateLoginPassword(value) {
  return value ? valid() : invalid(MESSAGES.passwordRequired)
}
