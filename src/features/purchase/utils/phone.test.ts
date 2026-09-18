import { describe, expect, it } from 'vitest'
import { formatPhoneForDisplay, isValidEmail, isValidPhone, normalizePhone, splitPhone, joinPhone } from './phone'

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

describe('splitPhone / joinPhone (country-code selector)', () => {
  it('splits an E.164 number into the longest matching dial code and the rest', () => {
    expect(splitPhone('+251911223344')).toEqual({ countryCode: '+251', national: '911223344' })
    expect(splitPhone('+1 415 555 1234')).toEqual({ countryCode: '+1', national: '4155551234' })
    expect(splitPhone('+44 7911 123456')).toEqual({ countryCode: '+44', national: '7911123456' })
    expect(splitPhone('00971501234567')).toEqual({ countryCode: '+971', national: '501234567' })
  })

  it('selects Ethiopia for local forms and keeps the national digits without the trunk 0', () => {
    expect(splitPhone('0911223344')).toEqual({ countryCode: '+251', national: '911223344' })
    expect(splitPhone('0711223344')).toEqual({ countryCode: '+251', national: '711223344' })
    expect(splitPhone('251911223344')).toEqual({ countryCode: '+251', national: '911223344' })
  })

  it('falls back to Ethiopia and keeps unknown codes whole so nothing typed is lost', () => {
    expect(splitPhone('')).toEqual({ countryCode: '+251', national: '' })
    expect(splitPhone(null)).toEqual({ countryCode: '+251', national: '' })
    expect(splitPhone('+99912345678')).toEqual({ countryCode: '+251', national: '+99912345678' })
    expect(splitPhone('12345', '+1')).toEqual({ countryCode: '+1', national: '12345' })
  })

  it('joins the selector and national number, dropping a trunk 0 except for Italy', () => {
    expect(joinPhone('+251', '911 223 344')).toBe('+251911223344')
    expect(joinPhone('+251', '0911223344')).toBe('+251911223344')
    expect(joinPhone('+44', '07911 123456')).toBe('+447911123456')
    expect(joinPhone('+39', '06 1234 5678')).toBe('+390612345678')
    expect(joinPhone('+1', '(415) 555-1234')).toBe('+14155551234')
  })

  it('lets a full international number typed into the national box win over the selector', () => {
    expect(joinPhone('+251', '+14155551234')).toBe('+14155551234')
    expect(joinPhone('+251', '0044 7911 123456')).toBe('+447911123456')
  })

  it('returns an empty string when there is nothing to store, so "required" still fires', () => {
    expect(joinPhone('+251', '')).toBe('')
    expect(joinPhone('+251', '  ')).toBe('')
    expect(joinPhone('+251', '0')).toBe('')
    expect(joinPhone('+251', null)).toBe('')
  })

  it('round-trips through the backend normaliser rules', () => {
    for (const raw of ['+251911223344', '0911223344', '+14155551234', '+447911123456']) {
      const parts = splitPhone(raw)
      expect(normalizePhone(joinPhone(parts.countryCode, parts.national))).toBe(normalizePhone(raw))
    }
  })
})
