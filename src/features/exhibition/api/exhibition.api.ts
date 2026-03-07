/**
 * Exhibition & sponsorship public API (splash, hero, partners, register interest).
 */
import api from '@/shared/api/client'

export interface SponsoredOrganizationResponse {
  id: string
  name: string
  logoUrl?: string
  videoUrl?: string
  splashImageUrl?: string
  address?: string
  city?: string
  country?: string
  sponsorshipType: string
  basePrice: number
}

export interface RegisterInterestRequest {
  email: string
  phoneNumber?: string
  organizationType: string
  interestType: 'exhibitor' | 'visitor'
  company?: string
  message?: string
}

/** All active sponsored organizations (for partners list and carousel). */
export async function getSponsoredOrganizations(): Promise<SponsoredOrganizationResponse[]> {
  const { data } = await api.get<SponsoredOrganizationResponse[]>('/sponsorships/sponsored-organizations')
  return Array.isArray(data) ? data : []
}

/** Exclusive sponsors only (for splash and hero featured strip). */
export async function getExclusiveOrganizations(): Promise<SponsoredOrganizationResponse[]> {
  const { data } = await api.get<SponsoredOrganizationResponse[]>('/sponsorships/exclusive-organizations')
  return Array.isArray(data) ? data : []
}

/** Exhibition API: register interest, etc. */
export const exhibitionApi = {
  registerInterest(body: RegisterInterestRequest) {
    return api.post('/exhibition/interest', body)
  }
}
