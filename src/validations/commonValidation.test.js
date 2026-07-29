import { describe, expect, it } from 'vitest'
import { isValidCalendarDate, validateUrl, validateFile, validateText, validateRequiredCheckbox, validateRequiredSelect } from './commonValidation'

describe('isValidCalendarDate', () => {
  it('accepts a real date', () => { expect(isValidCalendarDate('2025-03-15')).toBe(true) })
  it('rejects February 30', () => { expect(isValidCalendarDate('2025-02-30')).toBe(false) })
  it('rejects a malformed string', () => { expect(isValidCalendarDate('not-a-date')).toBe(false) })
})

describe('validateUrl', () => {
  it('accepts a valid https URL', () => { expect(validateUrl('https://example.com').valid).toBe(true) })
  it('accepts a valid http URL', () => { expect(validateUrl('http://www.example.com').valid).toBe(true) })
  it('rejects a plain string', () => { expect(validateUrl('example', { required: true }).valid).toBe(false) })
  it('rejects a javascript: scheme', () => { expect(validateUrl('javascript:alert(1)', { required: true }).valid).toBe(false) })
  it('rejects a malformed scheme', () => { expect(validateUrl('htp://example.com', { required: true }).valid).toBe(false) })
})

describe('validateFile', () => {
  const makeFile = (name, type, size) => ({ name, type, size })
  it('accepts an allowed PDF under the size limit', () => {
    const file = makeFile('doc.pdf', 'application/pdf', 1024)
    expect(validateFile(file, { allowedExtensions: ['pdf'], allowedTypes: ['application/pdf'], maxSizeBytes: 10 * 1024 * 1024 }).valid).toBe(true)
  })
  it('rejects a disallowed extension', () => {
    const file = makeFile('virus.exe', 'application/octet-stream', 1024)
    expect(validateFile(file, { allowedExtensions: ['pdf', 'jpg', 'png'] }).valid).toBe(false)
  })
  it('rejects a file over the size limit', () => {
    const file = makeFile('big.pdf', 'application/pdf', 20 * 1024 * 1024)
    expect(validateFile(file, { allowedExtensions: ['pdf'], maxSizeBytes: 10 * 1024 * 1024 }).valid).toBe(false)
  })
  it('rejects a missing required file', () => {
    expect(validateFile(null, { required: true }).valid).toBe(false)
  })
})

describe('validateText', () => {
  it('rejects spaces-only input', () => {
    expect(validateText('     ', { required: true }).valid).toBe(false)
  })
  it('rejects script tags', () => {
    expect(validateText('<script>alert(1)</script>', { required: true }).valid).toBe(false)
  })
  it('enforces a minimum length', () => {
    expect(validateText('hi', { required: true, min: 10 }).valid).toBe(false)
  })
})

describe('validateRequiredCheckbox / validateRequiredSelect', () => {
  it('requires the checkbox to be checked', () => {
    expect(validateRequiredCheckbox(false).valid).toBe(false)
    expect(validateRequiredCheckbox(true).valid).toBe(true)
  })
  it('rejects a value outside the allowed list (placeholder tampering)', () => {
    expect(validateRequiredSelect('', ['Member-managed', 'Manager-managed']).valid).toBe(false)
    expect(validateRequiredSelect('hacked-value', ['Member-managed', 'Manager-managed']).valid).toBe(false)
    expect(validateRequiredSelect('Member-managed', ['Member-managed', 'Manager-managed']).valid).toBe(true)
  })
})
