/** Sponsorship package reservations: the sponsor form and the admin pipeline. */
import api from '@/shared/api/client'

export type ReservationStatus = 'REQUESTED' | 'AGREEMENT_SENT' | 'SIGNED' | 'DEPOSIT_PAID' | 'PAID' | 'CANCELLED'
export const RESERVATION_STATUSES: ReservationStatus[] = ['REQUESTED', 'AGREEMENT_SENT', 'SIGNED', 'DEPOSIT_PAID', 'PAID', 'CANCELLED']

export type BoothStatus = 'AVAILABLE' | 'HELD' | 'SOLD' | 'BLOCKED'
export type BoothType = 'STANDARD' | 'CORNER' | 'PREMIUM'

export interface Booth {
  code: string
  block: string
  col: number
  row: number
  boothType: BoothType
  sizeSqm: number
  status: BoothStatus
  reservationId?: string | null
  holdExpiresAt?: string | null
  notes?: string | null
}

export interface BoothMapData {
  booths: Booth[]
  counts: Record<string, number>
  holdBusinessDays: number
}

/** Booths a package carries (mirrors the backend). */
export function boothsForPackage(type?: string | null): number {
  switch (String(type || '').toUpperCase()) {
    case 'EXCLUSIVE': return 6
    case 'PLATINUM': case 'PREMIUM': return 3
    case 'GOLD': return 2
    case 'SILVER': return 1
    case 'SPECIAL': return 0
    default: return 1
  }
}

/** Booth types a package may take (mirrors the backend). */
export function boothTypesForPackage(type?: string | null): BoothType[] {
  switch (String(type || '').toUpperCase()) {
    case 'EXCLUSIVE': case 'PLATINUM': case 'PREMIUM': return ['PREMIUM', 'CORNER', 'STANDARD']
    default: return ['CORNER', 'STANDARD']
  }
}

export interface ReserveRequest {
  sponsorshipId: string
  boothCodes?: string[]
  company: string
  contactName: string
  email: string
  phone?: string
  tin?: string
  boothPreference?: string
  message?: string
  locale?: string
  source?: string
  website?: string
}

export interface ReservationConfirmation {
  reference: string
  packageName: string
  amount: number
  currency: string
  status: ReservationStatus
  email: string
  bankAccounts: { bank: string; number: string }[]
  payee: string
  boothCodes: string[]
  boothsIncluded: number
}

export interface AdminReservation {
  id: string
  reference: string
  sponsorshipId: string | null
  packageName: string
  packageType: string | null
  amount: number
  currency: string
  company: string
  contactName: string
  email: string
  phone: string | null
  tin: string | null
  boothPreference: string | null
  message: string | null
  locale: string
  status: ReservationStatus
  amountPaid: number
  adminNotes: string | null
  assignedTo: string | null
  source: string | null
  agreementSentAt: string | null
  signedAt: string | null
  paidAt: string | null
  lastReminderAt: string | null
  reminderCount: number
  statusChangedAt: string
  createdAt: string
  updatedAt: string
  boothCodes: string[]
  boothsIncluded: number
}

export interface AdminReservationPage {
  content: AdminReservation[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface Pipeline {
  openCount: number
  openValue: number
  paidValue: number
  byStatus: Record<string, { count: number; value: number; paid: number }>
  booths: Record<string, number>
}

export interface AdminReservationUpdate {
  status?: ReservationStatus
  amountPaid?: number
  amount?: number
  adminNotes?: string
  assignedTo?: string
  boothPreference?: string
}

export const reservationApi = {
  async reserve(body: ReserveRequest): Promise<ReservationConfirmation> {
    return (await api.post<ReservationConfirmation>('/sponsorship-reservations', body)).data
  },
  async pipeline(): Promise<Pipeline> {
    return (await api.get<Pipeline>('/admin/sponsorship-reservations/pipeline')).data
  },
  async list(params: { q?: string; status?: ReservationStatus | ''; page?: number; size?: number } = {}): Promise<AdminReservationPage> {
    const query: Record<string, unknown> = { page: params.page ?? 0, size: params.size ?? 50 }
    if (params.q) query.q = params.q
    if (params.status) query.status = params.status
    return (await api.get<AdminReservationPage>('/admin/sponsorship-reservations', { params: query })).data
  },
  async update(id: string, body: AdminReservationUpdate): Promise<AdminReservation> {
    return (await api.patch<AdminReservation>(`/admin/sponsorship-reservations/${id}`, body)).data
  },
  async sendAgreement(id: string): Promise<void> {
    await api.post(`/admin/sponsorship-reservations/${id}/send-agreement`)
  },
  async remind(id: string): Promise<AdminReservation> {
    return (await api.post<AdminReservation>(`/admin/sponsorship-reservations/${id}/remind`)).data
  },
  async boothMap(): Promise<BoothMapData> {
    return (await api.get<BoothMapData>('/sponsorship-reservations/booths')).data
  },
  async adminBooths(): Promise<Booth[]> {
    return (await api.get<Booth[]>('/admin/sponsorship-reservations/booths')).data
  },
  async updateBooth(code: string, body: { status?: BoothStatus; boothType?: BoothType; notes?: string }): Promise<Booth> {
    return (await api.patch<Booth>(`/admin/sponsorship-reservations/booths/${encodeURIComponent(code)}`, body)).data
  },
  async assignBooths(id: string, codes: string[]): Promise<AdminReservation> {
    return (await api.put<AdminReservation>(`/admin/sponsorship-reservations/${id}/booths`, { codes })).data
  }
}
