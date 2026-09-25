/**
 * Purchase Order API Service
 */
import api from '@/shared/api/client'
import type { Currency, PaginatedResponse } from '@/shared/types'
import type {
  AgreementSignatureRequest,
  CreatePurchaseOrderRequest,
  BalanceInstalmentLine,
  BalancePurpose,
  DepositCheckoutResponse,
  DepositPaymentMethod,
  ProviderBankAccount,
  PurchaseBalanceResponse,
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

  preview: async (propertyId: string, currency?: Currency, depositCurrency?: Currency): Promise<PurchasePreviewResponse> => {
    const params: Record<string, string> = {}
    if (currency) params.currency = currency
    if (depositCurrency) params.depositCurrency = depositCurrency
    const response = await api.get<PurchasePreviewResponse>(
      `/properties/${propertyId}/purchase-preview`,
      { params: Object.keys(params).length ? params : undefined }
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
  startDepositCheckout: async (orderId: string, paymentMethod?: DepositPaymentMethod | null): Promise<DepositCheckoutResponse> => {
    const response = await api.post<DepositCheckoutResponse>(
      `/purchase-orders/${orderId}/deposit/checkout`,
      paymentMethod ? { paymentMethod } : undefined
    )
    return response.data
  },

  /** Asks the server to confirm the deposit with the provider after the buyer returns. */
  confirmDeposit: async (orderId: string): Promise<PurchaseDepositResponse> => {
    const response = await api.post<PurchaseDepositResponse>(`/purchase-orders/${orderId}/deposit/confirm`)
    return response.data
  },

  // ---- balance (paid to the provider after the deposit)
  getBalance: async (orderId: string): Promise<PurchaseBalanceResponse> =>
    (await api.get<PurchaseBalanceResponse>(`/purchase-orders/${orderId}/balance`)).data,

  payBalanceOnline: async (orderId: string, amount: number, paymentMethod: DepositPaymentMethod | null, purpose: BalancePurpose = 'BALANCE'): Promise<DepositCheckoutResponse> =>
    (await api.post<DepositCheckoutResponse>(`/purchase-orders/${orderId}/balance/checkout`, { amount, paymentMethod, purpose })).data,

  confirmBalance: async (orderId: string): Promise<PurchaseBalanceResponse> =>
    (await api.post<PurchaseBalanceResponse>(`/purchase-orders/${orderId}/balance/confirm`)).data,

  reportBalanceTransfer: async (orderId: string, input: { amount: number; reference: string; paidOn?: string; slip: File; purpose?: BalancePurpose }): Promise<PurchaseBalanceResponse> => {
    const form = new FormData()
    if (input.purpose) form.append('purpose', input.purpose)
    form.append('amount', String(input.amount))
    form.append('reference', input.reference)
    if (input.paidOn) form.append('paidOn', input.paidOn)
    form.append('slip', input.slip)
    return (await api.post<PurchaseBalanceResponse>(`/purchase-orders/${orderId}/balance/transfers`, form)).data
  },

  balanceSlipPath: (orderId: string, paymentId: string) => `/purchase-orders/${orderId}/balance/payments/${paymentId}/slip`,

  setBalanceSchedule: async (orderId: string, instalments: BalanceInstalmentLine[]): Promise<PurchaseBalanceResponse> =>
    (await api.put<PurchaseBalanceResponse>(`/purchase-orders/${orderId}/balance/schedule`, { instalments })).data,

  reviewBalanceTransfer: async (orderId: string, paymentId: string, approve: boolean, note?: string): Promise<PurchaseBalanceResponse> =>
    (await api.post<PurchaseBalanceResponse>(`/purchase-orders/${orderId}/balance/payments/${paymentId}/review`, { approve, note: note || null })).data,

  recordBalancePayment: async (orderId: string, input: { amount: number; reference: string; paidOn?: string | null; note?: string; purpose?: BalancePurpose }): Promise<PurchaseBalanceResponse> =>
    (await api.post<PurchaseBalanceResponse>(`/purchase-orders/${orderId}/balance/payments`, input)).data,

  /** Admin: markup % and VAT rate charged on top of the price (placed orders keep theirs). */
  getFeeRates: async (): Promise<{ markupPercent: number; vatRate: number }> =>
    (await api.get<{ markupPercent: number; vatRate: number }>('/admin/purchase-settings/fees')).data,

  setFeeRates: async (rates: { markupPercent: number; vatRate: number }): Promise<{ markupPercent: number; vatRate: number }> =>
    (await api.put<{ markupPercent: number; vatRate: number }>('/admin/purchase-settings/fees', rates)).data,

  /** Admin: the provider's account buyers transfer the balance to. */
  getBankAccount: async (): Promise<ProviderBankAccount | null> =>
    (await api.get<ProviderBankAccount | null>('/admin/purchase-settings/bank-account')).data || null,

  setBankAccount: async (account: ProviderBankAccount): Promise<ProviderBankAccount | null> =>
    (await api.put<ProviderBankAccount | null>('/admin/purchase-settings/bank-account', account)).data || null,

  /** Admin: birr per USD for deposits paid in USD by card; null means USD is off. */
  getUsdRate: async (): Promise<{ etbPerUsd: number | null }> => {
    const response = await api.get<{ etbPerUsd: number | null }>('/admin/purchase-settings/usd-rate')
    return response.data
  },

  setUsdRate: async (etbPerUsd: number | null): Promise<{ etbPerUsd: number | null }> => {
    const response = await api.put<{ etbPerUsd: number | null }>('/admin/purchase-settings/usd-rate', { etbPerUsd })
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
