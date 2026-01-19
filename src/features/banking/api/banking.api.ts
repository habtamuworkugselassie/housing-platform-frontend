/**
 * Banking API Service
 */
import api from '@/shared/api/client'
import type {
  CreditProductRequest,
  CreditProductResponse,
  FinancingOfferRequest,
  FinancingOfferResponse
} from './banking.types'
import type { PaginatedResponse } from '@/shared/types'

export const bankingApi = {
  // Credit Products
  getCreditProducts: async (bankId?: string): Promise<CreditProductResponse[]> => {
    const params = bankId ? { bankId } : {}
    const response = await api.get('/credit-products', { params })
    return response.data
  },

  getCreditProductById: async (id: string): Promise<CreditProductResponse> => {
    const response = await api.get(`/credit-products/${id}`)
    return response.data
  },

  createCreditProduct: async (product: CreditProductRequest): Promise<CreditProductResponse> => {
    const response = await api.post('/credit-products', product)
    return response.data
  },

  updateCreditProduct: async (id: string, product: Partial<CreditProductRequest>): Promise<CreditProductResponse> => {
    const response = await api.put(`/credit-products/${id}`, product)
    return response.data
  },

  // Financing Offers
  getFinancingOffers: async (bankId?: string): Promise<FinancingOfferResponse[]> => {
    const params = bankId ? { bankId } : {}
    const response = await api.get('/financing-offers', { params })
    return response.data
  },

  createFinancingOffer: async (offer: FinancingOfferRequest): Promise<FinancingOfferResponse> => {
    const response = await api.post('/financing-offers', offer)
    return response.data
  },

  updateFinancingOffer: async (id: string, offer: Partial<FinancingOfferRequest>): Promise<FinancingOfferResponse> => {
    const response = await api.put(`/financing-offers/${id}`, offer)
    return response.data
  },

  deleteFinancingOffer: async (id: string): Promise<void> => {
    await api.delete(`/financing-offers/${id}`)
  }
}
