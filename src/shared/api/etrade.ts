/**
 * eTrade (Ministry of Trade, https://etrade.gov.et) business lookup by TIN, proxied by the backend
 * (GET /api/v1/etrade/...). The backend handles the portal's TLS quirks, Referer requirement and
 * caching; the frontend only renders.
 */
import api from './client'

export type EtradeLicenseStatus = 'ACTIVE' | 'EXPIRED' | 'NOT_YET_VALID' | 'UNKNOWN'

export interface EtradeLegalCondition {
  code: string
  name?: string | null
  nameAmharic?: string | null
}

export interface EtradeAssociate {
  name?: string | null
  nameAmharic?: string | null
  position?: string | null
  mobilePhone?: string | null
  regularPhone?: string | null
  photoDataUrl?: string | null
}

export interface EtradeSector {
  code?: number | null
  description?: string | null
}

export interface EtradeLicensedBusiness {
  id?: string | null
  tradeName?: string | null
  tradeNameAmharic?: string | null
  licenseNumber?: string | null
  dateRegistered?: string | null
  dateRegisteredRaw?: string | null
  renewalDate?: string | null
  renewalDateRaw?: string | null
  renewedFrom?: string | null
  renewedFromRaw?: string | null
  renewedTo?: string | null
  renewedToRaw?: string | null
  licenseStatus: EtradeLicenseStatus
  sectors: EtradeSector[]
}

export interface EtradeBusinessDetails {
  tin: string
  businessName?: string | null
  businessNameAmharic?: string | null
  legalCondition?: EtradeLegalCondition | null
  registrationNumber?: string | null
  registrationDate?: string | null
  registrationDateRaw?: string | null
  paidUpCapital?: number | null
  associates: EtradeAssociate[]
  businesses: EtradeLicensedBusiness[]
  hasActiveLicense: boolean
  fetchedAt?: string | null
  sourceUrl?: string | null
}

export interface EtradeVerificationChecks {
  nameMatches?: boolean | null
  licenseNumberMatches?: boolean | null
  registrationNumberMatches?: boolean | null
  licenseActive?: boolean | null
}

export interface EtradeOrganizationVerification {
  organizationId: string
  tin: string
  found: boolean
  details?: EtradeBusinessDetails | null
  checks?: EtradeVerificationChecks | null
}

/** Ten digits, separators tolerated; mirrors the backend rule so we can validate before calling. */
export function normalizeTin(raw: string | null | undefined): string | null {
  const digits = (raw ?? '').replace(/[\s\-/.]/g, '')
  return /^\d{10}$/.test(digits) ? digits : null
}

export const etradeApi = {
  /** 404 when eTrade has no record for the TIN; 400 for a malformed TIN; 502 when eTrade is down. */
  async lookupBusiness(tin: string, includePhotos = false): Promise<EtradeBusinessDetails> {
    const { data } = await api.get(`/etrade/businesses/${encodeURIComponent(tin)}`, {
      params: includePhotos ? { includePhotos: true } : undefined
    })
    return data
  },

  /** Admin or the organization's own members. */
  async verifyOrganization(organizationId: string): Promise<EtradeOrganizationVerification> {
    const { data } = await api.get(`/etrade/organizations/${organizationId}/verification`)
    return data
  }
}

/** Human-readable message for a failed lookup. */
export function etradeErrorMessage(err: any, t: (key: string) => string): string {
  const status = err?.response?.status
  if (status === 404) return t('etrade.notFound')
  if (status === 400) return err?.response?.data?.message || t('etrade.invalidTin')
  if (status === 502 || status === 503 || status === 504) return t('etrade.unavailable')
  if (status === 403) return t('etrade.forbidden')
  return err?.response?.data?.message || t('etrade.failed')
}
