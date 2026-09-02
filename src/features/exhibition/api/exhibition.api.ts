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
  recordingUrl?: string
}

/** A viewer's request to co-host (publish into) a live broadcast. */
export interface CohostRequestItem {
  id: string
  displayName: string
  participantIdentity: string
  status: 'PENDING' | 'APPROVED' | 'DENIED'
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
  /**
   * Broadcaster ends their own stream: stops recording/simulcast egress, closes the
   * room and marks it ENDED. Called when they hit "Stop broadcasting" or leave the page.
   */
  async endBroadcast(id: string): Promise<void> {
    await api.post(`/exhibition/live/${id}/end`)
  },
  /**
   * Reliable end-on-unload: a normal request is cancelled when the tab closes, so use
   * sendBeacon (survives unload) with a POST the backend accepts unauthenticated for
   * this broadcast id. Falls back to a keepalive fetch where Beacon is unavailable.
   */
  endBroadcastBeacon(id: string): void {
    const url = `${api.defaults.baseURL || ''}/exhibition/live/${id}/end`
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(url, new Blob([], { type: 'text/plain' }))) {
        return
      }
    } catch {
      /* fall through to fetch */
    }
    try {
      fetch(url, { method: 'POST', keepalive: true, credentials: 'include' }).catch(() => {})
    } catch {
      /* best-effort */
    }
  },
  /** Anonymous visitor submits a short video (multipart: name, email, caption?, file). */
  submitVideoFeedback(form: FormData) {
    return api.post<VideoFeedbackItem>('/exhibition/video-feedback', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  // --- Co-hosting (approved viewers publish into the live room) --------------
  /** Viewer asks to co-host a live broadcast; returns the pending request. */
  async requestCohost(id: string, name?: string): Promise<CohostRequestItem> {
    const { data } = await api.post<CohostRequestItem>(
      `/exhibition/live/${id}/cohost/request`,
      null,
      { params: name ? { name } : undefined },
    )
    return data
  },
  /** Broadcaster: pending co-host requests to moderate. */
  async listCohostRequests(id: string): Promise<CohostRequestItem[]> {
    const { data } = await api.get(`/exhibition/live/${id}/cohost/requests`)
    return Array.isArray(data) ? data : []
  },
  async approveCohost(id: string, requestId: string): Promise<CohostRequestItem> {
    const { data } = await api.post<CohostRequestItem>(
      `/exhibition/live/${id}/cohost/${requestId}/approve`,
    )
    return data
  },
  async denyCohost(id: string, requestId: string): Promise<CohostRequestItem> {
    const { data } = await api.post<CohostRequestItem>(
      `/exhibition/live/${id}/cohost/${requestId}/deny`,
    )
    return data
  },
  /** Viewer polls for the publish token once approved. */
  async getCohostToken(id: string, requestId: string): Promise<LiveTokenResponse> {
    const { data } = await api.get<LiveTokenResponse>(
      `/exhibition/live/${id}/cohost/${requestId}/token`,
    )
    return data
  },

  /** Public feed of approved clips (Spring Page). */
  async listApprovedVideoFeedback(size = 12): Promise<VideoFeedbackItem[]> {
    const { data } = await api.get('/exhibition/video-feedback', { params: { size } })
    const content = data?.content ?? (Array.isArray(data) ? data : [])
    return Array.isArray(content) ? content : []
  }
}
