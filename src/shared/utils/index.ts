/**
 * Shared Utilities
 * 
 * Re-export utilities for convenience.
 */

export * from '@/utils/currency'
export { formatPrice, getCurrencySymbol, getCurrencyName, getAvailableCurrencies, CURRENCIES } from '@/utils/currency'

/** Organization/company with optional phoneNumbers array or legacy phoneNumber. */
export function formatOrganizationPhones(org: {
  phoneNumbers?: { countryCode?: string; number?: string }[]
  phoneNumber?: string
}): string[] {
  if (org?.phoneNumbers?.length) {
    return org.phoneNumbers
      .map((p) => ((p?.countryCode || '') + (p?.number || '').trim()).trim())
      .filter(Boolean)
  }
  return org?.phoneNumber ? [org.phoneNumber] : []
}
