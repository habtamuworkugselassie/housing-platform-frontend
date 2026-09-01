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
  partnerRole?: 'SPONSOR' | 'MEDIA_PARTNER'
  visibilityScope?: 'EXHIBITION' | 'PLATFORM' | 'BOTH'
  contributionMode?: 'CASH' | 'IN_KIND' | 'HYBRID'
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
  partnerRole?: 'SPONSOR' | 'MEDIA_PARTNER'
  visibilityScope?: 'EXHIBITION' | 'PLATFORM' | 'BOTH'
  contributionMode?: 'CASH' | 'IN_KIND' | 'HYBRID'
}

export async function getActiveSponsorshipPackages(): Promise<PublicSponsorshipPackage[]> {
  const { data } = await api.get<PublicSponsorshipPackage[]>('/sponsorships/active')
  return Array.isArray(data)
    ? data.filter(pkg => !pkg.visibilityScope || pkg.visibilityScope === 'EXHIBITION' || pkg.visibilityScope === 'BOTH')
    : []
}

export interface RegisterInterestRequest {
  email: string
  phoneNumber?: string
  organizationType: string
  interestType: 'exhibitor' | 'visitor' | 'partner'
  partnerRole?: 'SPONSOR' | 'MEDIA_PARTNER'
  visibilityScope?: 'EXHIBITION' | 'PLATFORM' | 'BOTH'
  contributionMode?: 'CASH' | 'IN_KIND' | 'HYBRID'
  /** Required for exhibitors; optional for partners. */
  sponsorshipId?: string
  company?: string
  message?: string
}

/** All active sponsored organizations (for partners list and carousel). */
export async function getSponsoredOrganizations(): Promise<SponsoredOrganizationResponse[]> {
  const { data } = await api.get<SponsoredOrganizationResponse[]>('/sponsorships/sponsored-organizations')
  return Array.isArray(data)
    ? data.filter(org => !org.visibilityScope || org.visibilityScope === 'EXHIBITION' || org.visibilityScope === 'BOTH')
    : []
}

/** Exclusive sponsors only (for splash and hero featured strip). */
export async function getExclusiveOrganizations(): Promise<SponsoredOrganizationResponse[]> {
  const { data } = await api.get<SponsoredOrganizationResponse[]>('/sponsorships/exclusive-organizations')
  return Array.isArray(data) ? data : []
}

/** An approved visitor video-feedback clip (public feed). */
export interface VideoFeedbackItem {
  id: string
  submitterName: string
  submitterRole?: 'VISITOR' | 'EXHIBITOR'
  companyName?: string
  caption?: string
  videoUrl: string
  createdAt: string
}

/** A live (or approved) broadcast. */
export interface LiveBroadcastItem {
  id: string
  title: string
  broadcasterName: string
  broadcasterRole?: 'VISITOR' | 'EXHIBITOR' | 'ORGANIZER'
  companyName?: string
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'LIVE' | 'ENDED'
  hlsUrl?: string
}

/** What a client needs to connect to LiveKit. */
export interface LiveTokenResponse {
  url: string
  token: string
  room: string
  hlsUrl?: string
}

export interface GoLiveRequest {
  name: string
  email?: string
  role?: 'VISITOR' | 'EXHIBITOR' | 'ORGANIZER'
  company?: string
  title: string
}

/** Exhibition API: register interest, video feedback, live broadcasting, etc. */
export const exhibitionApi = {
  registerInterest(body: RegisterInterestRequest) {
    return api.post('/exhibition/interest', body)
  },

  // --- Live broadcasting (gated go-live) ------------------------------------
  async requestGoLive(body: GoLiveRequest): Promise<LiveBroadcastItem> {
    const { data } = await api.post<LiveBroadcastItem>('/exhibition/live/request', body)
    return data
  },
  async getBroadcast(id: string): Promise<LiveBroadcastItem> {
    const { data } = await api.get<LiveBroadcastItem>(`/exhibition/live/${id}`)
    return data
  },
  async getPublishToken(id: string): Promise<LiveTokenResponse> {
    const { data } = await api.get<LiveTokenResponse>(`/exhibition/live/${id}/publish-token`)
    return data
  },
  async getViewerToken(id: string, name?: string): Promise<LiveTokenResponse> {
    const { data } = await api.get<LiveTokenResponse>(`/exhibition/live/${id}/viewer-token`, {
      params: name ? { name } : undefined,
    })
    return data
  },
  async listLiveBroadcasts(): Promise<LiveBroadcastItem[]> {
    const { data } = await api.get('/exhibition/live')
    return Array.isArray(data) ? data : []
  },
  /** Anonymous visitor submits a short video (multipart: name, email, caption?, file). */
  submitVideoFeedback(form: FormData) {
    return api.post<VideoFeedbackItem>('/exhibition/video-feedback', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  /** Public feed of approved clips (Spring Page). */
  async listApprovedVideoFeedback(size = 12): Promise<VideoFeedbackItem[]> {
    const { data } = await api.get('/exhibition/video-feedback', { params: { size } })
    const content = data?.content ?? (Array.isArray(data) ? data : [])
    return Array.isArray(content) ? content : []
  }
}
