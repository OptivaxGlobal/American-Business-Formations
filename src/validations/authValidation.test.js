import { describe, expect, it } from 'vitest'
import { validatePassword, validatePasswordConfirmation, validateLoginPassword } from './authValidation'

describe('validatePassword', () => {
  it('accepts a strong password', () => {
    expect(validatePassword('Str0ng!Pass').valid).toBe(true)
  })
  it('rejects a password under 8 characters', () => {
    expect(validatePassword('Sh0rt!').valid).toBe(false)
  })
  it('rejects a password missing an uppercase letter', () => {
    expect(validatePassword('str0ng!pass').valid).toBe(false)
  })
  it('rejects a password missing a lowercase letter', () => {
    expect(validatePassword('STR0NG!PASS').valid).toBe(false)
  })
  it('rejects a password missing a number', () => {
    expect(validatePassword('Strong!Pass').valid).toBe(false)
  })
  it('rejects a password missing a special character', () => {
    expect(validatePassword('Str0ngPass').valid).toBe(false)
  })
  it('does not silently trim the password', () => {
    expect(validatePassword('  Str0ng!Pass  ').valid).toBe(true)
  })
})

describe('validatePasswordConfirmation', () => {
  it('accepts a matching confirmation', () => {
    expect(validatePasswordConfirmation('Str0ng!Pass', 'Str0ng!Pass').valid).toBe(true)
  })
  it('rejects a mismatched confirmation', () => {
    expect(validatePasswordConfirmation('Str0ng!Pass', 'Different1!').valid).toBe(false)
  })
  it('rejects an empty confirmation', () => {
    expect(validatePasswordConfirmation('Str0ng!Pass', '').valid).toBe(false)
  })
})

describe('validateLoginPassword', () => {
  it('accepts any non-empty password (no strength rule on login)', () => {
    expect(validateLoginPassword('anything').valid).toBe(true)
  })
  it('rejects an empty password', () => {
    expect(validateLoginPassword('').valid).toBe(false)
  })
})
