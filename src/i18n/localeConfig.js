/**
 * Supported UI languages (expandable). Labels are fixed for the selector itself
 * so users always recognize their language.
 */
export const LOCALE_OPTIONS = [
  {
    code: 'en',
    shortLabel: 'EN',
    labelEn: 'English',
    labelNative: 'English',
    flag: '🇬🇧'
  },
  {
    code: 'am',
    shortLabel: 'አማ',
    labelEn: 'Amharic',
    labelNative: 'አማርኛ',
    flag: '🇪🇹'
  },
  {
    code: 'om',
    shortLabel: 'Om',
    labelEn: 'Afaan Oromo',
    labelNative: 'Afaan Oromoo',
    flag: '🇪🇹'
  },
  {
    code: 'ar',
    shortLabel: 'عر',
    labelEn: 'Arabic',
    labelNative: 'العربية',
    flag: '🇸🇦'
  }
]

const CODES = new Set(LOCALE_OPTIONS.map((o) => o.code))

export function isValidLocale(code) {
  return typeof code === 'string' && CODES.has(code)
}

export function normalizeLocale(code) {
  if (isValidLocale(code)) return code
  return 'en'
}

export function getLocaleOption(code) {
  return LOCALE_OPTIONS.find((o) => o.code === code) ?? LOCALE_OPTIONS[0]
}

/** Sync <html lang> and dir (RTL for Arabic). */
export function applyDocumentLocale(locale) {
  const code = normalizeLocale(locale)
  const root = document.documentElement
  root.setAttribute('lang', code)
  root.setAttribute('dir', code === 'ar' ? 'rtl' : 'ltr')
}
