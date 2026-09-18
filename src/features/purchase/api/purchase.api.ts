/**
 * Purchase Order API Service
 */
import api from '@/shared/api/client'
import type { Currency, PaginatedResponse } from '@/shared/types'
import type {
  AgreementSignatureRequest,
  CreatePurchaseOrderRequest,
  DepositCheckoutResponse,
  PurchaseDepositResponse,
  PurchaseAgreementResponse,
  PurchaseOrderResponse,
  PurchaseOrderStatus,
  PurchasePreviewResponse,
  UpdatePurchaseFinancingRequest,
  AdminPurchaseOrderFilter,
  PurchaseOrderStatsResponse
} from './purchase.types'

export const purchaseApi = {
  // ---- seller (realtor / agent)

  /** Orders placed on my company's listings, newest first. */
  received: async (params?: {
    status?: PurchaseOrderStatus | ''
    page?: number
    size?: number
  }): Promise<PaginatedResponse<PurchaseOrderResponse>> => {
    const query: Record<string, string | number> = {}
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== undefined && value !== null && value !== '') query[key] = value as string | number
    }
    const response = await api.get<PaginatedResponse<PurchaseOrderResponse>>('/purchase-orders/received', {
      params: query
    })
    return response.data
  },

  /** Orders on one of my listings. */
  forProperty: async (propertyId: string, status?: PurchaseOrderStatus): Promise<PurchaseOrderResponse[]> => {
    const response = await api.get<PurchaseOrderResponse[]>(`/purchase-orders/by-property/${propertyId}`, {
      params: status ? { status } : {}
    })
    return response.data
  },

  /** Seller accepts a PENDING_SELLER_REVIEW order (reserves the property). */
  accept: async (id: string, notes?: string): Promise<PurchaseOrderResponse> => {
    const response = await api.post<PurchaseOrderResponse>(`/purchase-orders/${id}/accept`, notes ? { notes } : {})
    return response.data
  },

  /** Seller rejects a PENDING_SELLER_REVIEW order; a reason is required. */
  reject: async (id: string, reason: string): Promise<PurchaseOrderResponse> => {
    const response = await api.post<PurchaseOrderResponse>(`/purchase-orders/${id}/reject`, { reason })
    return response.data
  },

  /** Seller confirms payment on an AWAITING_PAYMENT order and closes the sale. */
  complete: async (id: string, paymentReference?: string): Promise<PurchaseOrderResponse> => {
    const response = await api.post<PurchaseOrderResponse>(
      `/purchase-orders/${id}/complete`,
      paymentReference ? { paymentReference } : {}
    )
    return response.data
  },

  /** Admin: every order on the platform, newest first. Empty filter values are not sent. */
  adminSearch: async (
    filter: AdminPurchaseOrderFilter = {},
    params: { page?: number; size?: number } = {}
  ): Promise<PaginatedResponse<PurchaseOrderResponse>> => {
    const query: Record<string, string | number> = {}
    for (const [key, value] of Object.entries({ ...filter, ...params })) {
      if (value !== undefined && value !== null && value !== '') query[key] = value as string | number
    }
    const response = await api.get<PaginatedResponse<PurchaseOrderResponse>>('/admin/purchase-orders', {
      params: query
    })
    return response.data
  },

  /** Admin: counts per status for the overview chips. */
  adminStats: async (): Promise<PurchaseOrderStatsResponse> => {
    const response = await api.get<PurchaseOrderStatsResponse>('/admin/purchase-orders/stats')
    return response.data
  },

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

  /** Starts (or resumes) the reservation-deposit checkout at the payment provider. */
  startDepositCheckout: async (orderId: string): Promise<DepositCheckoutResponse> => {
    const response = await api.post<DepositCheckoutResponse>(`/purchase-orders/${orderId}/deposit/checkout`)
    return response.data
  },

  /** Asks the server to confirm the deposit with the provider after the buyer returns. */
  confirmDeposit: async (orderId: string): Promise<PurchaseDepositResponse> => {
    const response = await api.post<PurchaseDepositResponse>(`/purchase-orders/${orderId}/deposit/confirm`)
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
