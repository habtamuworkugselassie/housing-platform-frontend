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
  depositAmount: number | null
  checkoutAvailable: boolean
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
  organizationId?: string | null
  organizationName?: string | null
  exhibitorInvitedAt?: string | null
}

/** What a signed-in exhibitor sees of its own reservations. */
export interface ExhibitorReservation {
  reference: string
  packageName: string
  packageType: string | null
  amount: number
  amountPaid: number
  currency: string
  status: ReservationStatus
  boothCodes: string[]
  boothsIncluded: number
  email: string
  paidAt: string | null
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

export type ReservationPaymentMethod = 'TELEBIRR' | 'CBE_BIRR' | 'MPESA' | 'AWASH_BIRR' | 'CARD'
export const RESERVATION_PAYMENT_METHODS: ReservationPaymentMethod[] = ['TELEBIRR', 'CBE_BIRR', 'MPESA', 'AWASH_BIRR', 'CARD']

export interface ReservationPaymentView {
  txRef: string
  purpose: 'DEPOSIT' | 'BALANCE'
  amount: number
  currency: string
  status: 'PENDING' | 'PAID' | 'FAILED'
  checkoutUrl: string | null
  method: string | null
  paidAt: string | null
  createdAt: string
}

export interface ReservationStatusView {
  reference: string
  packageName: string
  company: string
  contactName: string
  amount: number
  amountPaid: number
  outstanding: number
  depositAmount: number
  depositPercent: number
  onlineMax: number
  nextOnlineAmount: number
  depositPaid: boolean
  currency: string
  status: ReservationStatus
  locale: string
  boothCodes: string[]
  checkoutAvailable: boolean
  payments: ReservationPaymentView[]
  bankAccounts: { bank: string; number: string }[]
  payee: string
}

export interface ReservationCheckoutResponse {
  txRef: string
  checkoutUrl: string
  amount: number
  currency: string
  purpose: 'DEPOSIT' | 'BALANCE'
}

export interface AdminReservationCreate {
  sponsorshipId: string
  /** Existing organization to attach; omitted means find by email or create one. */
  organizationId?: string
  company: string
  contactName: string
  email: string
  phone?: string
  tin?: string
  boothPreference?: string
  message?: string
  locale?: string
  boothCodes?: string[]
  status?: ReservationStatus
  amount?: number
  amountPaid?: number
  adminNotes?: string
  assignedTo?: string
  sendEmail?: boolean
}

export const reservationApi = {
  async create(body: AdminReservationCreate): Promise<AdminReservation> {
    return (await api.post<AdminReservation>('/admin/sponsorship-reservations', body)).data
  },
  async reserve(body: ReserveRequest): Promise<ReservationConfirmation> {
    return (await api.post<ReservationConfirmation>('/sponsorship-reservations', body)).data
  },
  async status(reference: string, email: string, refresh = false): Promise<ReservationStatusView> {
    return (await api.get<ReservationStatusView>(`/sponsorship-reservations/${encodeURIComponent(reference)}`, { params: { email, refresh } })).data
  },
  async checkout(reference: string, email: string, purpose: 'DEPOSIT' | 'BALANCE', method?: ReservationPaymentMethod | null): Promise<ReservationCheckoutResponse> {
    return (await api.post<ReservationCheckoutResponse>(`/sponsorship-reservations/${encodeURIComponent(reference)}/checkout`, { email, purpose, method: method || undefined })).data
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
  /** Creates the exhibitor account for a paid reservation, or sends the invitation again. */
  async exhibitorAccount(id: string): Promise<AdminReservation> {
    return (await api.post<AdminReservation>(`/admin/sponsorship-reservations/${id}/exhibitor-account`)).data
  },
  /** Attaches an organization to every reservation that still has none. */
  async linkOrganizations(): Promise<{ linked: number }> {
    return (await api.post<{ linked: number }>('/admin/sponsorship-reservations/link-organizations')).data
  },
  async mine(): Promise<ExhibitorReservation[]> {
    return (await api.get<ExhibitorReservation[]>('/sponsorship-reservations/mine')).data
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
