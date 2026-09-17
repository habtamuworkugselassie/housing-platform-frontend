import { describe, expect, it } from 'vitest'
import { formatPhoneForDisplay, isValidEmail, isValidPhone, normalizePhone } from './phone'

/** These cases mirror the backend PhoneNumberNormalizerTest so client and server agree. */
describe('normalizePhone', () => {
  it.each([
    ['0911223344', '+251911223344'],
    ['911223344', '+251911223344'],
    ['0711223344', '+251711223344'],
    ['251911223344', '+251911223344'],
    ['+251 911 22 33 44', '+251911223344'],
    ['+251-911-223344', '+251911223344'],
    ['00251911223344', '+251911223344'],
    ['+14155552671', '+14155552671']
  ])('normalises %s to %s', (raw, expected) => {
    expect(normalizePhone(raw)).toBe(expected)
  })

  it.each(['', '   ', 'abc', '12345', '+0123456789', '0811223344'])('rejects %j', (raw) => {
    expect(normalizePhone(raw)).toBeNull()
    expect(isValidPhone(raw)).toBe(false)
  })

  it('treats null and undefined as invalid', () => {
    expect(normalizePhone(null)).toBeNull()
    expect(normalizePhone(undefined)).toBeNull()
  })
})

describe('formatPhoneForDisplay', () => {
  it('groups Ethiopian numbers and leaves others alone', () => {
    expect(formatPhoneForDisplay('+251911223344')).toBe('+251 91 122 3344')
    expect(formatPhoneForDisplay('+14155552671')).toBe('+14155552671')
    expect(formatPhoneForDisplay(null)).toBe('')
  })
})

describe('isValidEmail', () => {
  it('is optional but must be well formed when present', () => {
    expect(isValidEmail('')).toBe(true)
    expect(isValidEmail(null)).toBe(true)
    expect(isValidEmail('buyer@example.com')).toBe(true)
    expect(isValidEmail(' buyer@example.com ')).toBe(true)
    expect(isValidEmail('nope')).toBe(false)
    expect(isValidEmail('a@b')).toBe(false)
  })
})
