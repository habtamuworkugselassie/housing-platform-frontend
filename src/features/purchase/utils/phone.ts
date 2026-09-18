/**
 * Contact-phone validation, mirroring the backend's PhoneNumberNormalizer so the form
 * rejects exactly what the server would reject and shows the number as it will be stored.
 *
 * Accepted: +2519XXXXXXXX / +2517XXXXXXXX, 09XXXXXXXX / 07XXXXXXXX, 2519…, 00251…, and any other
 * well-formed international number (+ followed by 8–15 digits).
 */
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from '@/shared/data/countryCodes'

const E164 = /^\+[1-9][0-9]{7,14}$/
const ETHIOPIAN_LOCAL = /^0?([79][0-9]{8})$/
const ETHIOPIAN_INTL_NO_PLUS = /^251([79][0-9]{8})$/

export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  let digits = raw.trim().replace(/[\s\-().]/g, '')
  if (digits.startsWith('00')) digits = '+' + digits.slice(2)

  const local = ETHIOPIAN_LOCAL.exec(digits)
  if (local) return '+251' + local[1]
  const intl = ETHIOPIAN_INTL_NO_PLUS.exec(digits)
  if (intl) return '+251' + intl[1]
  if (E164.test(digits)) return digits
  return null
}

export function isValidPhone(raw: string | null | undefined): boolean {
  return normalizePhone(raw) !== null
}

/** Human-friendly display of an E.164 Ethiopian number: +251 91 122 3344. */
export function formatPhoneForDisplay(e164: string | null | undefined): string {
  if (!e164) return ''
  const m = /^\+251([79])([0-9]{1})([0-9]{3})([0-9]{4})$/.exec(e164)
  if (m) return `+251 ${m[1]}${m[2]} ${m[3]} ${m[4]}`
  return e164
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(raw: string | null | undefined): boolean {
  if (!raw) return true // optional
  return EMAIL.test(raw.trim())
}

export interface PhoneParts {
  /** Dial code as the selector shows it, e.g. "+251". */
  countryCode: string
  /** The rest of the digits as typed; starts with "+" only when the dial code is not in our list. */
  national: string
}

/** Longest dial codes first so "+251" wins over "+25" / "+2". */
const DIAL_CODES = [...new Set(COUNTRY_CODES.map((c) => c.code))].sort((a, b) => b.length - a.length)

/**
 * Split a stored or typed number into the country-code selector value and the national part.
 * Ethiopian local forms select +251; an international number selects its country when we know
 * the code and otherwise stays whole in the national box so nothing the buyer typed is lost.
 */
export function splitPhone(raw: string | null | undefined, fallbackCountryCode = DEFAULT_COUNTRY_CODE): PhoneParts {
  if (!raw || !raw.trim()) return { countryCode: fallbackCountryCode, national: '' }
  let digits = raw.trim().replace(/[\s\-().]/g, '')
  if (digits.startsWith('00')) digits = '+' + digits.slice(2)

  if (digits.startsWith('+')) {
    const code = DIAL_CODES.find((c) => digits.startsWith(c))
    if (code) return { countryCode: code, national: digits.slice(code.length) }
    return { countryCode: fallbackCountryCode, national: digits }
  }
  const local = ETHIOPIAN_LOCAL.exec(digits)
  if (local) return { countryCode: '+251', national: local[1] }
  const intl = ETHIOPIAN_INTL_NO_PLUS.exec(digits)
  if (intl) return { countryCode: '+251', national: intl[1] }
  return { countryCode: fallbackCountryCode, national: digits }
}

/**
 * Recombine selector + national number into the single string the store and API use.
 * A leading trunk "0" is dropped (0911… under +251 becomes +251911…), except for Italy where
 * the 0 is part of the number. A full "+…" or "00…" number typed into the national box wins
 * over the selector, so pasting an international number just works.
 */
export function joinPhone(countryCode: string, national: string | null | undefined): string {
  let n = (national ?? '').trim().replace(/[\s\-().]/g, '')
  if (!n) return ''
  if (n.startsWith('00')) n = '+' + n.slice(2)
  if (n.startsWith('+')) return n
  if (countryCode !== '+39') n = n.replace(/^0+/, '')
  if (!n) return ''
  return countryCode + n
}
