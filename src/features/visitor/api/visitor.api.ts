/** Expo visitor pre-registration and QR badges. */
import api from '@/shared/api/client'

export type VisitorType =
  | 'HOMEBUYER' | 'INVESTOR' | 'DIASPORA' | 'DEVELOPER' | 'CONTRACTOR' | 'SUPPLIER'
  | 'BANK_FINANCE' | 'ARCHITECT_CONSULTANT' | 'GOVERNMENT' | 'MEDIA' | 'STUDENT' | 'OTHER'

export const VISITOR_TYPES: VisitorType[] = [
  'HOMEBUYER', 'INVESTOR', 'DIASPORA', 'DEVELOPER', 'CONTRACTOR', 'SUPPLIER',
  'BANK_FINANCE', 'ARCHITECT_CONSULTANT', 'GOVERNMENT', 'MEDIA', 'STUDENT', 'OTHER'
]

export type VisitorStatus = 'REGISTERED' | 'CHECKED_IN' | 'CANCELLED'

export interface VisitorRegisterRequest {
  fullName: string
  email: string
  phone?: string
  organization?: string
  visitorType?: VisitorType | string
  interests?: string
  locale?: string
  source?: string
  website?: string
}

export interface VisitorBadge {
  code: string
  fullName: string
  organization: string | null
  visitorType: VisitorType
  status: VisitorStatus
  locale: string
  checkedInAt: string | null
  createdAt: string | null
  badgeUrl: string
  qrUrl: string
  alreadyRegistered: boolean
}

export interface AdminVisitor {
  id: string
  code: string
  fullName: string
  email: string
  phone: string | null
  organization: string | null
  visitorType: VisitorType
  interests: string | null
  locale: string
  status: VisitorStatus
  source: string | null
  checkedInAt: string | null
  checkedInBy: string | null
  badgeSentAt: string | null
  createdAt: string
}

export interface AdminVisitorPage {
  content: AdminVisitor[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface VisitorStats {
  total: number
  checkedIn: number
  today: number
  checkedInToday: number
  last7Days: number
  byType: Record<string, number>
  byDay: { day: string; count: number }[]
}

/** Absolute URL of the QR image for a code (relative API base resolves against the site). */
export function visitorQrUrl(code: string, size = 440): string {
  const base = (api.defaults.baseURL || '/api/v1').replace(/\/$/, '')
  return `${base}/visitors/${encodeURIComponent(code)}/qr.png?size=${size}`
}

export const visitorApi = {
  async register(body: VisitorRegisterRequest): Promise<VisitorBadge> {
    return (await api.post<VisitorBadge>('/visitors/register', body)).data
  },
  async badge(code: string): Promise<VisitorBadge> {
    return (await api.get<VisitorBadge>(`/visitors/${encodeURIComponent(code)}`)).data
  },
  async adminStats(): Promise<VisitorStats> {
    return (await api.get<VisitorStats>('/admin/visitors/stats')).data
  },
  async adminList(params: { q?: string; status?: VisitorStatus | ''; type?: VisitorType | ''; page?: number; size?: number } = {}): Promise<AdminVisitorPage> {
    const query: Record<string, unknown> = { page: params.page ?? 0, size: params.size ?? 50 }
    if (params.q) query.q = params.q
    if (params.status) query.status = params.status
    if (params.type) query.type = params.type
    return (await api.get<AdminVisitorPage>('/admin/visitors', { params: query })).data
  },
  async checkIn(code: string): Promise<AdminVisitor> {
    return (await api.post<AdminVisitor>('/admin/visitors/check-in', { code })).data
  },
  async setStatus(id: string, status: VisitorStatus): Promise<AdminVisitor> {
    return (await api.put<AdminVisitor>(`/admin/visitors/${id}/status`, { status })).data
  },
  async resend(id: string): Promise<void> {
    await api.post(`/admin/visitors/${id}/resend`)
  },
  exportUrl(): string {
    const base = (api.defaults.baseURL || '/api/v1').replace(/\/$/, '')
    return `${base}/admin/visitors/export.csv`
  },
  async exportCsv(): Promise<Blob> {
    return (await api.get<Blob>('/admin/visitors/export.csv', { responseType: 'blob' })).data
  }
}
