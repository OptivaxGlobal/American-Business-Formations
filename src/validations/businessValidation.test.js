import { describe, expect, it } from 'vitest'
import { validateBusinessName, validateEIN, normalizeEIN, formatEIN, maskEIN } from './businessValidation'

describe('validateBusinessName (re-exported)', () => {
  it('accepts a normal business name', () => {
    expect(validateBusinessName('Anderson Consulting LLC').valid).toBe(true)
  })
  it('rejects a symbols-only name', () => {
    expect(validateBusinessName('@@@@@').valid).toBe(false)
  })
  it('rejects a numbers-only name', () => {
    expect(validateBusinessName('123456').valid).toBe(false)
  })
  it('rejects script injection', () => {
    expect(validateBusinessName('<script>alert(1)</script>').valid).toBe(false)
  })
})

describe('validateEIN', () => {
  it('accepts a formatted EIN', () => {
    expect(validateEIN('12-3456789').valid).toBe(true)
  })
  it('accepts an unformatted EIN', () => {
    expect(validateEIN('123456789').valid).toBe(true)
  })
  it('rejects letters', () => {
    expect(validateEIN('12-345678A').valid).toBe(false)
  })
  it('rejects too few digits', () => {
    expect(validateEIN('1234567').valid).toBe(false)
  })
  it('rejects too many digits', () => {
    expect(validateEIN('1234567890').valid).toBe(false)
  })
})

describe('EIN normalization helpers', () => {
  it('normalizes to digits only', () => {
    expect(normalizeEIN('12-3456789')).toBe('123456789')
  })
  it('formats as XX-XXXXXXX', () => {
    expect(formatEIN('123456789')).toBe('12-3456789')
  })
  it('masks all but the last 4 digits', () => {
    expect(maskEIN('123456789')).toBe('XX-XXX6789')
  })
})
