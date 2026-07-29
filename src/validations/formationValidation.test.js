import { describe, expect, it } from 'vitest'
import { validateOwnershipPercentage, validateOwnershipTotal, validateEffectiveDate, validateHistoricalDate } from './formationValidation'
import { todayLocalISO } from './commonValidation'

describe('validateOwnershipPercentage', () => {
  it('accepts 0', () => { expect(validateOwnershipPercentage(0).valid).toBe(true) })
  it('accepts 100', () => { expect(validateOwnershipPercentage(100).valid).toBe(true) })
  it('rejects a negative value', () => { expect(validateOwnershipPercentage(-5).valid).toBe(false) })
  it('rejects a value over 100', () => { expect(validateOwnershipPercentage(101).valid).toBe(false) })
  it('rejects an empty value', () => { expect(validateOwnershipPercentage('').valid).toBe(false) })
})

describe('validateOwnershipTotal', () => {
  it('accepts owners totaling 100%', () => {
    expect(validateOwnershipTotal([{ percentage: 60 }, { percentage: 40 }]).valid).toBe(true)
  })
  it('rejects owners not totaling 100%', () => {
    expect(validateOwnershipTotal([{ percentage: 60 }, { percentage: 30 }]).valid).toBe(false)
  })
})

describe('validateEffectiveDate', () => {
  it('rejects an empty date', () => {
    expect(validateEffectiveDate('').valid).toBe(false)
  })
  it('rejects an impossible calendar date', () => {
    expect(validateEffectiveDate('2025-02-30').valid).toBe(false)
  })
  it('rejects a past date', () => {
    expect(validateEffectiveDate('2000-01-01').valid).toBe(false)
  })
  it('rejects a date more than 90 days out', () => {
    const future = new Date()
    future.setDate(future.getDate() + 200)
    const iso = future.toISOString().slice(0, 10)
    expect(validateEffectiveDate(iso, { maxDaysOut: 90 }).valid).toBe(false)
  })
  it('accepts today', () => {
    expect(validateEffectiveDate(todayLocalISO()).valid).toBe(true)
  })
  it('accepts a date within the allowed window', () => {
    const future = new Date()
    future.setDate(future.getDate() + 30)
    const iso = future.toISOString().slice(0, 10)
    expect(validateEffectiveDate(iso, { maxDaysOut: 90 }).valid).toBe(true)
  })
})

describe('validateHistoricalDate', () => {
  it('rejects a future date', () => {
    const future = new Date()
    future.setDate(future.getDate() + 5)
    expect(validateHistoricalDate(future.toISOString().slice(0, 10)).valid).toBe(false)
  })
  it('accepts a past date', () => {
    expect(validateHistoricalDate('2020-01-01').valid).toBe(true)
  })
})
