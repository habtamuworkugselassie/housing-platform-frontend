/**
 * Exhibition & sponsorship public API (splash, hero, partners, register interest).
 */
import api from '@/shared/api/client'

export interface SponsoredOrganizationResponse {
  id: string
  name: string
  logoUrl?: string
  videoUrl?: string
  /** First IMAGE from organization media (splash / hero). */
  splashImageUrl?: string
  address?: string
  city?: string
  country?: string
  sponsorshipType: string
  basePrice: number
}

/** Active sponsorship tier for public pricing / benefits (exhibition page). */
export interface PublicSponsorshipPackage {
  id: string
  name: string
  description?: string
  type: string
  basePrice: number
  features?: string
  notes?: string
  status: string
}

export async function getActiveSponsorshipPackages(): Promise<PublicSponsorshipPackage[]> {
  const { data } = await api.get<PublicSponsorshipPackage[]>('/sponsorships/active')
  return Array.isArray(data) ? data : []
}

export interface RegisterInterestRequest {
  email: string
  phoneNumber?: string
  organizationType: string
  interestType: 'exhibitor' | 'visitor'
  /** Required when interestType is exhibitor (active sponsorship package id). */
  sponsorshipId?: string
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
