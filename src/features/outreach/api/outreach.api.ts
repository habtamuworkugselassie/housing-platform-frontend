/** Admin API for the partner/exhibitor outreach sequencer. */
import api from '@/shared/api/client'

export type OutreachStatus =
  | 'NEW' | 'QUEUED' | 'SENT' | 'FOLLOWED_UP' | 'REPLIED' | 'REGISTERED' | 'OPTED_OUT' | 'BOUNCED' | 'PAUSED'

export interface OutreachContact {
  id: string
  name: string
  contactName: string | null
  sector: string
  templateKey: string | null
  effectiveTemplateKey: string
  email: string
  phone: string | null
  website: string | null
  city: string | null
  locale: string
  confidence: string | null
  sourceUrl: string | null
  notes: string | null
  hook: string | null
  owner: string | null
  status: OutreachStatus
  step: number
  nextActionAt: string | null
  lastSentAt: string | null
  repliedAt: string | null
  threadId: string | null
  lastError: string | null
  createdAt: string
  updatedAt: string
}

export interface OutreachPage {
  content: OutreachContact[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface OutreachStats {
  byStatus: Record<OutreachStatus, number>
  sentToday: number
  sentLastHour: number
  dailyCap: number
  hourlyCap: number
  enabled: boolean
  mailConfigured: boolean
  replyReaderConfigured: boolean
  insideSendWindow: boolean
  senderEmail: string
  replyTo: string
  timezone: string
  sendWindowStart: number
  sendWindowEnd: number
  followUpAfterDays: number
}

export interface OutreachTemplate {
  id: string
  templateKey: string
  locale: string
  subject: string
  body: string
}

export interface OutreachPreview {
  to: string
  subject: string
  body: string
  html: string
  templateKey: string
  locale: string
  attachments: string[]
}

export interface OutreachMessage {
  id: string
  step: number
  subject: string
  body: string
  sentAt: string
}

export interface SendNowRequest {
  subject: string
  body: string
  includePackages: boolean
  attachBrochure: boolean
  attachSponsorship: boolean
  attachAgreement: boolean
  scheduleFollowUp: boolean
}

export interface ImportResult {
  added: number
  updated: number
  skippedInvalid: number
  skippedProtected: number
  problems: string[]
}

export const outreachApi = {
  async stats(): Promise<OutreachStats> {
    return (await api.get<OutreachStats>('/admin/outreach/stats')).data
  },
  async importCsv(file: File): Promise<ImportResult> {
    const form = new FormData()
    form.append('file', file)
    return (await api.post<ImportResult>('/admin/outreach/contacts/import', form)).data
  },
  async list(params: { status?: OutreachStatus | ''; sector?: string; q?: string; page?: number; size?: number } = {}): Promise<OutreachPage> {
    const query: Record<string, unknown> = { page: params.page ?? 0, size: params.size ?? 50 }
    if (params.status) query.status = params.status
    if (params.sector) query.sector = params.sector
    if (params.q) query.q = params.q
    return (await api.get<OutreachPage>('/admin/outreach/contacts', { params: query })).data
  },
  async update(id: string, body: Partial<Pick<OutreachContact, 'contactName' | 'templateKey' | 'locale' | 'hook' | 'owner' | 'notes' | 'phone' | 'status'>>): Promise<OutreachContact> {
    return (await api.patch<OutreachContact>(`/admin/outreach/contacts/${id}`, body)).data
  },
  async queue(ids: string[]): Promise<number> {
    return (await api.post<{ queued: number }>('/admin/outreach/contacts/queue', { ids })).data.queued
  },
  async pause(ids: string[]): Promise<number> {
    return (await api.post<{ paused: number }>('/admin/outreach/contacts/pause', { ids })).data.paused
  },
  async preview(id: string, step = 1): Promise<OutreachPreview> {
    return (await api.get<OutreachPreview>(`/admin/outreach/contacts/${id}/preview`, { params: { step } })).data
  },
  async render(id: string, body: { subject: string; body: string; includePackages: boolean }): Promise<string> {
    return (await api.post<string>(`/admin/outreach/contacts/${id}/render`, body, { responseType: 'text' })).data
  },
  async messages(id: string): Promise<OutreachMessage[]> {
    return (await api.get<OutreachMessage[]>(`/admin/outreach/contacts/${id}/messages`)).data
  },
  async sendTest(id: string, to: string, step = 1): Promise<void> {
    await api.post(`/admin/outreach/contacts/${id}/send-test`, { to, step })
  },
  async sendNow(id: string, body: SendNowRequest): Promise<OutreachContact> {
    return (await api.post<OutreachContact>(`/admin/outreach/contacts/${id}/send`, body)).data
  },
  async templates(): Promise<OutreachTemplate[]> {
    return (await api.get<OutreachTemplate[]>('/admin/outreach/templates')).data
  },
  async updateTemplate(id: string, body: { subject: string; body: string }): Promise<OutreachTemplate> {
    return (await api.put<OutreachTemplate>(`/admin/outreach/templates/${id}`, body)).data
  },
  async sync(): Promise<void> {
    await api.post('/admin/outreach/sync')
  }
}
