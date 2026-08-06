import { describe, expect, it } from 'vitest'
import { validateSelectedPlan, validateSelectedAddOns } from './paymentValidation'

describe('validateSelectedPlan / validateSelectedAddOns', () => {
  const catalog = [{ name: 'Accelerated' }, { name: 'Complete' }]
  const addOnCatalog = [{ id: 'ein-assist' }, { id: 'compliance' }]
  it('accepts a plan in the catalog', () => { expect(validateSelectedPlan('Accelerated', catalog).valid).toBe(true) })
  it('rejects a plan not in the catalog', () => { expect(validateSelectedPlan('Enterprise', catalog).valid).toBe(false) })
  it('accepts add-ons in the catalog', () => { expect(validateSelectedAddOns(['ein-assist'], addOnCatalog).valid).toBe(true) })
  it('rejects add-ons not in the catalog', () => { expect(validateSelectedAddOns(['fake-addon'], addOnCatalog).valid).toBe(false) })
})
