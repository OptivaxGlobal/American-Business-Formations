import { describe, expect, it } from 'vitest'
import { validateCardName, validateCardNumber, validateCardExpiry, validateCardCvc, validateSelectedPlan, validateSelectedAddOns } from './paymentValidation'

describe('validateCardName', () => {
  it('accepts a normal name', () => { expect(validateCardName('Jordan Lee').valid).toBe(true) })
  it('rejects an empty name', () => { expect(validateCardName('').valid).toBe(false) })
  it('rejects a numbers-only name', () => { expect(validateCardName('12345').valid).toBe(false) })
})

describe('validateCardNumber', () => {
  it('accepts the standard Stripe test number', () => {
    expect(validateCardNumber('4242 4242 4242 4242').valid).toBe(true)
  })
  it('rejects an empty value', () => { expect(validateCardNumber('').valid).toBe(false) })
  it('rejects a number that fails the Luhn checksum', () => {
    expect(validateCardNumber('4242 4242 4242 4241').valid).toBe(false)
  })
  it('rejects a number that is too short', () => { expect(validateCardNumber('4242').valid).toBe(false) })
  it('rejects letters', () => { expect(validateCardNumber('abcd efgh ijkl mnop').valid).toBe(false) })
})

describe('validateCardExpiry', () => {
  it('accepts a future MM/YY date', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 2)
    const mm = String(future.getMonth() + 1).padStart(2, '0')
    const yy = String(future.getFullYear()).slice(-2)
    expect(validateCardExpiry(`${mm}/${yy}`).valid).toBe(true)
  })
  it('rejects a malformed value', () => { expect(validateCardExpiry('13/99').valid).toBe(false) })
  it('rejects an invalid month', () => { expect(validateCardExpiry('13/30').valid).toBe(false) })
  it('rejects an expired date', () => { expect(validateCardExpiry('01/20').valid).toBe(false) })
})

describe('validateCardCvc', () => {
  it('accepts a 3-digit code', () => { expect(validateCardCvc('123').valid).toBe(true) })
  it('accepts a 4-digit code', () => { expect(validateCardCvc('1234').valid).toBe(true) })
  it('rejects a 2-digit code', () => { expect(validateCardCvc('12').valid).toBe(false) })
  it('rejects letters', () => { expect(validateCardCvc('abc').valid).toBe(false) })
})

describe('validateSelectedPlan / validateSelectedAddOns', () => {
  const catalog = [{ name: 'Accelerated' }, { name: 'Complete' }]
  const addOnCatalog = [{ id: 'ein-assist' }, { id: 'compliance' }]
  it('accepts a plan in the catalog', () => { expect(validateSelectedPlan('Accelerated', catalog).valid).toBe(true) })
  it('rejects a plan not in the catalog', () => { expect(validateSelectedPlan('Enterprise', catalog).valid).toBe(false) })
  it('accepts add-ons in the catalog', () => { expect(validateSelectedAddOns(['ein-assist'], addOnCatalog).valid).toBe(true) })
  it('rejects add-ons not in the catalog', () => { expect(validateSelectedAddOns(['fake-addon'], addOnCatalog).valid).toBe(false) })
})
