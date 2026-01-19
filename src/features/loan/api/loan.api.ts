/**
 * Loan API Service
 */
import api from '@/shared/api/client'
import type {
  LoanApplicationRequest,
  LoanApplicationResponse,
  LoanApprovalRequest
} from './loan.types'
import type { PaginatedResponse, PageRequest } from '@/shared/types'

export const loanApi = {
  getApplications: async (pageRequest?: PageRequest): Promise<PaginatedResponse<LoanApplicationResponse>> => {
    const params = { ...pageRequest }
    const response = await api.get('/loan-applications', { params })
    return response.data
  },

  getApplicationById: async (id: string): Promise<LoanApplicationResponse> => {
    const response = await api.get(`/loan-applications/${id}`)
    return response.data
  },

  createApplication: async (application: LoanApplicationRequest): Promise<LoanApplicationResponse> => {
    const response = await api.post('/loan-applications', application)
    return response.data
  },

  approveApplication: async (id: string, approval: LoanApprovalRequest): Promise<LoanApplicationResponse> => {
    const response = await api.put(`/loan-applications/${id}/approve`, approval)
    return response.data
  },

  rejectApplication: async (id: string, reason: string): Promise<LoanApplicationResponse> => {
    const response = await api.put(`/loan-applications/${id}/reject`, { rejectionReason: reason })
    return response.data
  }
}
