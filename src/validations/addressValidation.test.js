import { describe, expect, it } from 'vitest'
import { validateStreetAddress, validateCity, validateZip, isPoBoxAddress } from './addressValidation'

describe('validateStreetAddress', () => {
  it('accepts a valid physical address', () => {
    expect(validateStreetAddress('123 Main St, Suite 200').valid).toBe(true)
  })
  it('rejects an empty required address', () => {
    expect(validateStreetAddress('').valid).toBe(false)
  })
  it('rejects an address that is too short', () => {
    expect(validateStreetAddress('12').valid).toBe(false)
  })
  it('rejects script injection', () => {
    expect(validateStreetAddress('<script>alert(1)</script>').valid).toBe(false)
  })
  it('rejects a PO Box for a registered office address', () => {
    expect(validateStreetAddress('PO Box 123', { disallowPoBox: true }).valid).toBe(false)
  })
  it('recognizes common PO Box phrasings', () => {
    expect(isPoBoxAddress('P.O. Box 55')).toBe(true)
    expect(isPoBoxAddress('Post Office Box 55')).toBe(true)
    expect(isPoBoxAddress('123 Main St')).toBe(false)
  })
  it('allows a PO Box when not disallowed (e.g. mailing address)', () => {
    expect(validateStreetAddress('PO Box 123', { disallowPoBox: false }).valid).toBe(true)
  })
})

describe('validateCity', () => {
  it('accepts a normal city', () => {
    expect(validateCity('Austin').valid).toBe(true)
  })
  it('rejects a numbers-only value', () => {
    expect(validateCity('12345').valid).toBe(false)
  })
  it('rejects an empty required city', () => {
    expect(validateCity('').valid).toBe(false)
  })
})

describe('validateZip', () => {
  it('accepts a 5-digit ZIP', () => {
    expect(validateZip('75001').valid).toBe(true)
  })
  it('accepts a ZIP+4', () => {
    expect(validateZip('75001-1234').valid).toBe(true)
  })
  it('rejects a 4-digit ZIP', () => {
    expect(validateZip('7500').valid).toBe(false)
  })
  it('rejects a ZIP with too many digits', () => {
    expect(validateZip('7500112345').valid).toBe(false)
  })
  it('rejects letters', () => {
    expect(validateZip('ABCDE').valid).toBe(false)
  })
})
