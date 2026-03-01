/**
 * Exhibition API – register interest (exhibitor/visitor)
 */
import api from '@/shared/api/client'

export type ExhibitionOrganizationType =
  | 'REAL_ESTATE_COMPANY'
  | 'SUPPLIER'
  | 'CONTRACTOR'
  | 'DEVELOPER'
  | 'CONSULTANT'
  | 'ARCHITECT'
  | 'FINISHING_CONTRACTOR'

export interface ExhibitionInterestRequest {
  email: string
  interestType: 'exhibitor' | 'visitor'
  phoneNumber?: string
  organizationType: ExhibitionOrganizationType
  company?: string
  message?: string
}

export interface ExhibitionInterestResponse {
  id: string
  email: string
  phoneNumber?: string
  interestType: string
  company?: string
  message?: string
  organizationId?: string
}

export const exhibitionApi = {
  registerInterest: async (
    body: ExhibitionInterestRequest
  ): Promise<ExhibitionInterestResponse> => {
    const response = await api.post<ExhibitionInterestResponse>(
      '/exhibition/interest',
      body
    )
    return response.data
  }
}
