/**
 * Contact-phone validation, mirroring the backend's PhoneNumberNormalizer so the form
 * rejects exactly what the server would reject and shows the number as it will be stored.
 *
 * Accepted: +2519XXXXXXXX / +2517XXXXXXXX, 09XXXXXXXX / 07XXXXXXXX, 2519…, 00251…, and any other
 * well-formed international number (+ followed by 8–15 digits).
 */
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
