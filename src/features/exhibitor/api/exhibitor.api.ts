/** The exhibitor portal: a sponsor's own organization profile and media. */
import api from '@/shared/api/client'

export type MediaReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface OrganizationMedia {
  id: string
  url: string
  caption: string | null
  displayOrder: number
  isPrimary: boolean
  mediaKind: 'IMAGE' | 'VIDEO' | 'LOGO'
  reviewStatus: MediaReviewStatus
  reviewNote: string | null
  organizationId?: string | null
  organizationName?: string | null
  createdAt?: string | null
}

export interface MyOrganization {
  id: string
  name: string
  type: string
  status: string
  address: string | null
  city: string | null
  country: string | null
  description: string | null
  email: string | null
  website: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  youtubeUrl: string | null
  phoneNumbers: { countryCode: string; number: string }[] | null
  logoUrl: string | null
  media: OrganizationMedia[] | null
  isSponsored?: boolean | null
  sponsorshipType?: string | null
}

export interface OrganizationProfileUpdate {
  name: string
  type: string
  description?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  email?: string | null
  website?: string | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  linkedinUrl?: string | null
  twitterUrl?: string | null
  youtubeUrl?: string | null
  phoneNumbers?: { countryCode: string; number: string }[]
}

export const ORGANIZATION_TYPES = [
  'SUPPLIER',
  'CONTRACTOR',
  'DEVELOPER',
  'REAL_ESTATE_COMPANY',
  'CONSULTANT_ARCHITECT',
  'FINISHING_CONTRACTOR',
  'BANK',
  'INSURANCE',
  'MEDIA_COMPANY'
]

export const exhibitorApi = {
  /** Null when the signed-in user manages no organization. */
  async myOrganization(): Promise<MyOrganization | null> {
    try {
      return (await api.get<MyOrganization>('/organizations/mine')).data
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 404) return null
      throw e
    }
  },
  async updateProfile(id: string, body: OrganizationProfileUpdate): Promise<MyOrganization> {
    return (await api.put<MyOrganization>(`/organizations/${id}`, body)).data
  },
  async upload(id: string, files: File[], mediaKind: 'LOGO' | 'IMAGE' | 'VIDEO'): Promise<MyOrganization> {
    const form = new FormData()
    files.forEach((f) => form.append('files', f))
    form.append('mediaKind', mediaKind)
    return (await api.post<MyOrganization>(`/organizations/${id}/media`, form)).data
  },
  async remove(id: string, attachmentId: string): Promise<MyOrganization> {
    return (await api.delete<MyOrganization>(`/organizations/${id}/media/${attachmentId}`)).data
  },
  /** Admin: items exhibitors uploaded that still wait for a decision. */
  async pendingMedia(): Promise<OrganizationMedia[]> {
    return (await api.get<OrganizationMedia[]>('/organizations/media-reviews/pending')).data
  },
  async review(organizationId: string, attachmentId: string, status: MediaReviewStatus, note?: string): Promise<void> {
    await api.patch(`/organizations/${organizationId}/media/${attachmentId}/review`, { status, note: note || null })
  }
}
