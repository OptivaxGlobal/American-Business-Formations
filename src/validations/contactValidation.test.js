import { describe, expect, it } from 'vitest'
import {
  validateFullName, validateEmail, validateEmailConfirmation,
  validatePhone, formatPhone, normalizePhoneDigits, validatePreferredContactMethod,
  validateInternationalPhone
} from './contactValidation'

describe('validateFullName', () => {
  it('accepts a normal name', () => {
    expect(validateFullName('Mark Anderson').valid).toBe(true)
  })
  it('accepts a hyphenated name', () => {
    expect(validateFullName('Mary-Jane Smith').valid).toBe(true)
  })
  it('accepts an apostrophe name', () => {
    expect(validateFullName("O'Connor").valid).toBe(true)
  })
  it('accepts a name with a period', () => {
    expect(validateFullName('John A. Smith').valid).toBe(true)
  })
  it('rejects a numbers-only name', () => {
    expect(validateFullName('123456').valid).toBe(false)
  })
  it('rejects a symbols-only name', () => {
    expect(validateFullName('@@@@').valid).toBe(false)
  })
  it('rejects a single character', () => {
    expect(validateFullName('A').valid).toBe(false)
  })
  it('rejects an empty value when required', () => {
    expect(validateFullName('').valid).toBe(false)
  })
  it('allows an empty value when not required', () => {
    expect(validateFullName('', { required: false }).valid).toBe(true)
  })
  it('collapses repeated internal spaces', () => {
    expect(validateFullName('Mark   Anderson').normalized).toBe('Mark Anderson')
  })
  it('does not force case changes', () => {
    expect(validateFullName('mcKENZIE smith').normalized).toBe('mcKENZIE smith')
  })
})

describe('validateEmail', () => {
  it('accepts a normal email', () => {
    expect(validateEmail('aliyananderson@gmail.com').valid).toBe(true)
  })
  it('accepts mixed-case local part', () => {
    expect(validateEmail('Mark.Anderson@company.com').valid).toBe(true)
  })
  it('accepts a plus-addressed email', () => {
    expect(validateEmail('support+formation@example.co').valid).toBe(true)
  })
  it('rejects a missing @', () => {
    expect(validateEmail('aliyananderson').valid).toBe(false)
  })
  it('rejects a missing domain', () => {
    expect(validateEmail('aliyan@').valid).toBe(false)
  })
  it('rejects a missing local part', () => {
    expect(validateEmail('@gmail.com').valid).toBe(false)
  })
  it('rejects a space instead of @', () => {
    expect(validateEmail('aliyan gmail.com').valid).toBe(false)
  })
  it('rejects a missing domain extension', () => {
    expect(validateEmail('aliyan@gmail').valid).toBe(false)
  })
  it('rejects consecutive dots', () => {
    expect(validateEmail('aliyan..anderson@gmail.com').valid).toBe(false)
  })
  it('rejects an email over 254 characters', () => {
    expect(validateEmail(`${'a'.repeat(250)}@gmail.com`).valid).toBe(false)
  })
  it('lowercases the domain but preserves local-part case', () => {
    expect(validateEmail('Mark.Anderson@Company.COM').normalized).toBe('Mark.Anderson@company.com')
  })
})

describe('validateEmailConfirmation', () => {
  it('matches identical emails ignoring surrounding spaces', () => {
    expect(validateEmailConfirmation('a@b.com', ' a@b.com ').valid).toBe(true)
  })
  it('rejects mismatched emails', () => {
    expect(validateEmailConfirmation('a@b.com', 'c@b.com').valid).toBe(false)
  })
})

describe('validatePhone / normalizePhoneDigits / formatPhone', () => {
  it('accepts a plain 10-digit number', () => {
    const result = validatePhone('2341230900')
    expect(result.valid).toBe(true)
    expect(result.normalized).toBe('+12341230900')
  })
  it('accepts a formatted number', () => {
    expect(validatePhone('(234) 123-0900').valid).toBe(true)
  })
  it('accepts a +1-prefixed number', () => {
    const result = validatePhone('+1 234-123-0900')
    expect(result.valid).toBe(true)
    expect(result.normalized).toBe('+12341230900')
  })
  it('rejects fewer than 10 digits', () => {
    expect(validatePhone('23412309').valid).toBe(false)
  })
  it('rejects more than 10 US digits', () => {
    expect(validatePhone('234123090012').valid).toBe(false)
  })
  it('rejects more than 10 digits even with spacing', () => {
    expect(validatePhone('234 123 0900 12').valid).toBe(false)
  })
  it('rejects letters', () => {
    expect(validatePhone('abc1234567').valid).toBe(false)
  })
  it('rejects an empty value when required', () => {
    expect(validatePhone('').valid).toBe(false)
  })
  it('formats a normalized number for display', () => {
    expect(formatPhone('2341230900')).toBe('(234) 123-0900')
  })
  it('strips formatting characters', () => {
    expect(normalizePhoneDigits('(234) 123-0900')).toBe('2341230900')
  })
})

describe('validateInternationalPhone', () => {
  it('accepts a UK number with country code', () => {
    const result = validateInternationalPhone('+44 20 7946 0958')
    expect(result.valid).toBe(true)
    expect(result.normalized).toBe('+442079460958')
  })
  it('accepts a US number with country code', () => {
    expect(validateInternationalPhone('+1 234 123 0900').valid).toBe(true)
  })
  it('rejects a number missing the leading +', () => {
    expect(validateInternationalPhone('442079460958').valid).toBe(false)
  })
  it('rejects too few digits', () => {
    expect(validateInternationalPhone('+123456').valid).toBe(false)
  })
  it('rejects too many digits', () => {
    expect(validateInternationalPhone('+1234567890123456').valid).toBe(false)
  })
  it('rejects letters', () => {
    expect(validateInternationalPhone('+44abc7946098').valid).toBe(false)
  })
  it('rejects an empty value when required', () => {
    expect(validateInternationalPhone('').valid).toBe(false)
  })
  it('allows an empty value when not required', () => {
    expect(validateInternationalPhone('', { required: false }).valid).toBe(true)
  })
})

describe('validatePreferredContactMethod', () => {
  it('accepts an allowed value', () => {
    expect(validatePreferredContactMethod('email', ['email', 'phone']).valid).toBe(true)
  })
  it('rejects a value outside the allowed list', () => {
    expect(validatePreferredContactMethod('carrier-pigeon', ['email', 'phone']).valid).toBe(false)
  })
  it('rejects an empty value', () => {
    expect(validatePreferredContactMethod('', ['email', 'phone']).valid).toBe(false)
  })
})
