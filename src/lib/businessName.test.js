import { describe, expect, it } from 'vitest'
import { normalizeBusinessName, validateBusinessName } from './businessName'

describe('normalizeBusinessName', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeBusinessName('  Bright   Path Studio  ')).toBe('Bright Path Studio')
  })

  it('handles nullish input safely', () => {
    expect(normalizeBusinessName(undefined)).toBe('')
    expect(normalizeBusinessName(null)).toBe('')
  })
})

describe('validateBusinessName', () => {
  it('rejects an empty name', () => {
    expect(validateBusinessName('').valid).toBe(false)
  })

  it('rejects a name that is too short', () => {
    expect(validateBusinessName('A').valid).toBe(false)
  })

  it('rejects a name over 80 characters', () => {
    expect(validateBusinessName('A'.repeat(81)).valid).toBe(false)
  })

  it('rejects a name with no letters', () => {
    expect(validateBusinessName('12345').valid).toBe(false)
  })

  it('rejects disallowed characters', () => {
    expect(validateBusinessName('Bright Path <script>').valid).toBe(false)
  })

  it('accepts a normal business name', () => {
    const result = validateBusinessName('Bright Path Studio LLC')
    expect(result.valid).toBe(true)
    expect(result.message).toBe('')
  })

  it('accepts names with common punctuation', () => {
    expect(validateBusinessName("O'Malley & Sons, LLC").valid).toBe(true)
  })
})
