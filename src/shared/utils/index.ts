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

/** True when backend sends verified: true or when all 8 verification fields are non-empty (trimmed). */
export function isOrganizationVerified(org: {
  verified?: boolean | unknown
  verificationLevel?: string | null
  businessRegistration?: string | null
  license?: string | null
  vatRegistration?: string | null
  tinRegistration?: string | null
  businessRegistrationNumber?: string | null
  licenseNumber?: string | null
  vatNumber?: string | null
  tinNumber?: string | null
} | null | undefined): boolean {
  if (!org) return false
  if (org.verificationLevel === 'FULL') return true
  if (org.verified === true) return true
  const s = (v: string | null | undefined) => (v != null ? String(v).trim() : '')
  return !!(
    s(org.businessRegistration) &&
    s(org.license) &&
    s(org.vatRegistration) &&
    s(org.tinRegistration) &&
    s(org.businessRegistrationNumber) &&
    s(org.licenseNumber) &&
    s(org.vatNumber) &&
    s(org.tinNumber)
  )
}

/** Verification level for badge: FULL, HALF, or null. Prefer API verificationLevel; fallback to verified=true -> FULL. */
export function getVerificationLevel(item: {
  verificationLevel?: string | null
  realEstateCompanyVerificationLevel?: string | null
  verified?: boolean
  realEstateCompanyVerified?: boolean
} | null | undefined): string | null {
  if (!item) return null
  const level =
    (item as { verificationLevel?: string | null }).verificationLevel ??
    (item as { realEstateCompanyVerificationLevel?: string | null }).realEstateCompanyVerificationLevel
  if (level === 'FULL' || level === 'HALF') return level
  if ((item as { verified?: boolean }).verified === true || (item as { realEstateCompanyVerified?: boolean }).realEstateCompanyVerified === true) return 'FULL'
  return null
}
