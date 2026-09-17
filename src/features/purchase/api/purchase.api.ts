/**
 * Purchase Order API Service
 */
import api from '@/shared/api/client'
import type { Currency, PaginatedResponse } from '@/shared/types'
import type {
  AgreementSignatureRequest,
  CreatePurchaseOrderRequest,
  PurchaseAgreementResponse,
  PurchaseOrderResponse,
  PurchaseOrderStatus,
  PurchasePreviewResponse,
  UpdatePurchaseFinancingRequest
} from './purchase.types'

export const purchaseApi = {
  preview: async (propertyId: string, currency?: Currency): Promise<PurchasePreviewResponse> => {
    const response = await api.get<PurchasePreviewResponse>(
      `/properties/${propertyId}/purchase-preview`,
      { params: currency ? { currency } : undefined }
    )
    return response.data
  },

  create: async (request: CreatePurchaseOrderRequest): Promise<PurchaseOrderResponse> => {
    const response = await api.post<PurchaseOrderResponse>('/purchase-orders', request)
    return response.data
  },

  getById: async (id: string): Promise<PurchaseOrderResponse> => {
    const response = await api.get<PurchaseOrderResponse>(`/purchase-orders/${id}`)
    return response.data
  },

  mine: async (params?: {
    status?: PurchaseOrderStatus
    page?: number
    size?: number
  }): Promise<PaginatedResponse<PurchaseOrderResponse>> => {
    const response = await api.get<PaginatedResponse<PurchaseOrderResponse>>('/purchase-orders/me', {
      params
    })
    return response.data
  },

  updateFinancing: async (
    id: string,
    request: UpdatePurchaseFinancingRequest
  ): Promise<PurchaseOrderResponse> => {
    const response = await api.put<PurchaseOrderResponse>(`/purchase-orders/${id}/financing`, request)
    return response.data
  },

  cancel: async (id: string, notes?: string): Promise<PurchaseOrderResponse> => {
    const response = await api.post<PurchaseOrderResponse>(`/purchase-orders/${id}/cancel`, { notes })
    return response.data
  },

  acceptPartialApproval: async (id: string): Promise<PurchaseOrderResponse> => {
    const response = await api.post<PurchaseOrderResponse>(
      `/purchase-orders/${id}/accept-partial-approval`
    )
    return response.data
  },

  convertToCash: async (id: string): Promise<PurchaseOrderResponse> => {
    const response = await api.post<PurchaseOrderResponse>(`/purchase-orders/${id}/convert-to-cash`)
    return response.data
  },

  listAgreements: async (orderId: string): Promise<PurchaseAgreementResponse[]> => {
    const response = await api.get<PurchaseAgreementResponse[]>(`/purchase-orders/${orderId}/agreements`)
    return response.data
  },

  getAgreement: async (orderId: string, agreementId: string): Promise<PurchaseAgreementResponse> => {
    const response = await api.get<PurchaseAgreementResponse>(
      `/purchase-orders/${orderId}/agreements/${agreementId}`
    )
    return response.data
  },

  signAgreement: async (
    orderId: string,
    agreementId: string,
    signature: AgreementSignatureRequest
  ): Promise<PurchaseAgreementResponse> => {
    const response = await api.post<PurchaseAgreementResponse>(
      `/purchase-orders/${orderId}/agreements/${agreementId}/sign`,
      signature
    )
    return response.data
  }
}
