/**
 * Loan API Types
 */
import type { Currency } from '@/shared/types'

export interface LoanApplicationRequest {
  creditProductId: string
  requestedAmount: number
  requestedTenureMonths: number
  currency: Currency
  purpose?: string
  propertyId?: string
}

export interface LoanApplicationResponse {
  id: string
  creditProductId: string
  creditProduct?: any
  requestedAmount: number
  requestedTenureMonths: number
  currency: Currency
  approvedAmount?: number
  approvedTenureMonths?: number
  approvedInterestRate?: number
  approvedCurrency?: Currency
  purpose?: string
  propertyId?: string
  status: string
  rejectionReason?: string
  approvalNotes?: string
  appliedDate: string
}

export interface LoanApprovalRequest {
  approvedAmount: number
  approvedTenureMonths: number
  approvedInterestRate: number
  approvedCurrency: Currency
  approvalNotes?: string
}
