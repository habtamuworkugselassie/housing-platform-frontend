import api from '@/shared/api/client'
import type { PaginatedResponse } from '@/shared/types'

export type PropertyDocumentType = 'TITLE_DEED' | 'LEASE_AGREEMENT' | 'BUILDING_PERMIT' | 'OCCUPANCY_PERMIT' | 'OTHER'
export type PropertyDocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export const PROPERTY_DOCUMENT_TYPES: PropertyDocumentType[] = [
  'TITLE_DEED',
  'LEASE_AGREEMENT',
  'BUILDING_PERMIT',
  'OCCUPANCY_PERMIT',
  'OTHER'
]

export interface PropertyDocument {
  id: string
  propertyId: string
  propertyTitle?: string | null
  documentType: PropertyDocumentType
  documentTypeLabel: string
  documentNumber: string | null
  issuingAuthority: string | null
  issuedOn: string | null
  description: string | null
  fileName: string
  contentType: string | null
  sizeBytes: number | null
  sha256: string | null
  status: PropertyDocumentStatus
  reviewNote: string | null
  reviewedAt: string | null
  createdAt: string
}

export interface PropertyDocumentUpload {
  documentType: PropertyDocumentType
  documentNumber?: string
  issuingAuthority?: string
  issuedOn?: string
  description?: string
}

/** Official property documents: seller management, admin review, and buyer viewing. */
export const documentsApi = {
  list: async (propertyId: string): Promise<PropertyDocument[]> =>
    (await api.get<PropertyDocument[]>(`/properties/${propertyId}/documents`)).data,

  upload: async (propertyId: string, file: File, details: PropertyDocumentUpload): Promise<PropertyDocument> => {
    const form = new FormData()
    form.append('file', file)
    for (const [key, value] of Object.entries(details)) {
      if (value != null && String(value).trim() !== '') form.append(key, String(value).trim())
    }
    return (await api.post<PropertyDocument>(`/properties/${propertyId}/documents`, form)).data
  },

  remove: async (propertyId: string, documentId: string): Promise<void> => {
    await api.delete(`/properties/${propertyId}/documents/${documentId}`)
  },

  managerFilePath: (propertyId: string, documentId: string) => `/properties/${propertyId}/documents/${documentId}/file`,

  // ---- admin
  adminList: async (status: PropertyDocumentStatus | null, page = 0, size = 25): Promise<PaginatedResponse<PropertyDocument>> =>
    (await api.get<PaginatedResponse<PropertyDocument>>('/admin/property-documents', { params: { status: status ?? undefined, page, size } })).data,

  verify: async (documentId: string, note?: string): Promise<PropertyDocument> =>
    (await api.post<PropertyDocument>(`/admin/property-documents/${documentId}/verify`, { note: note || null })).data,

  reject: async (documentId: string, note: string): Promise<PropertyDocument> =>
    (await api.post<PropertyDocument>(`/admin/property-documents/${documentId}/reject`, { note })).data,

  adminFilePath: (documentId: string) => `/admin/property-documents/${documentId}/file`,

  // ---- buyers (verified documents only)
  previewFilePath: (propertyId: string, documentId: string) => `/properties/${propertyId}/purchase-preview/documents/${documentId}/file`,

  forOrder: async (orderId: string): Promise<PropertyDocument[]> =>
    (await api.get<PropertyDocument[]>(`/purchase-orders/${orderId}/documents`)).data,

  orderFilePath: (orderId: string, documentId: string) => `/purchase-orders/${orderId}/documents/${documentId}/file`
}
