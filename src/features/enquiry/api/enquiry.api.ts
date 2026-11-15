/**
 * Listing enquiries: the guest-friendly "ask about this listing / contact this company" forms
 * on property and organization pages, and the admin follow-up list.
 */
import api from '@/shared/api/client'

export interface ListingEnquiryRequest {
  propertyId?: string
  organizationId?: string
  name: string
  email: string
  phoneNumber?: string
  message: string
  pageUrl?: string
  /** Visitor's language, en or am; the receipt is sent in it. */
  locale?: 'en' | 'am'
  /** Honeypot; must stay empty. */
  website?: string
}

export type ListingEnquiryStatus = 'NEW' | 'CONTACTED' | 'CLOSED'

export interface ListingEnquiry {
  id: string | null
  subjectType: 'PROPERTY' | 'ORGANIZATION' | null
  propertyId: string | null
  organizationId: string | null
  organizationName: string | null
  subjectTitle: string | null
  name: string
  email: string
  phoneNumber: string | null
  message: string
  status: ListingEnquiryStatus
  pageUrl: string | null
  locale: string | null
  createdAt: string
  updatedAt: string
}

export interface ListingEnquiryPage {
  content: ListingEnquiry[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export const enquiryApi = {
  async submit(body: ListingEnquiryRequest): Promise<ListingEnquiry> {
    const res = await api.post<ListingEnquiry>('/enquiries', body)
    return res.data
  },

  async adminList(params: { status?: ListingEnquiryStatus | ''; page?: number; size?: number } = {}): Promise<ListingEnquiryPage> {
    const query: Record<string, unknown> = { page: params.page ?? 0, size: params.size ?? 25 }
    if (params.status) query.status = params.status
    const res = await api.get<ListingEnquiryPage>('/admin/enquiries', { params: query })
    return res.data
  },

  async adminCountNew(): Promise<number> {
    const res = await api.get<{ newCount: number }>('/admin/enquiries/count')
    return res.data?.newCount ?? 0
  },

  async adminUpdateStatus(id: string, status: ListingEnquiryStatus): Promise<ListingEnquiry> {
    const res = await api.put<ListingEnquiry>(`/admin/enquiries/${id}/status`, { status })
    return res.data
  }
}
