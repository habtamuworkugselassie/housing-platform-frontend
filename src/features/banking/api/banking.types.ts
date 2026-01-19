/**
 * Banking API Types
 */
import type { Currency } from '@/shared/types'

export interface CreditProductRequest {
  name: string
  description?: string
  currency: Currency
  maxLoanAmount: number
  minLoanAmount?: number
  interestRate: number
  maxTenureMonths: number
  minTenureMonths?: number
  ltvRatio?: number
  specialTerms?: string
}

export interface CreditProductResponse {
  id: string
  name: string
  description?: string
  currency: Currency
  maxLoanAmount: number
  minLoanAmount?: number
  interestRate: number
  maxTenureMonths: number
  minTenureMonths?: number
  ltvRatio?: number
  specialTerms?: string
  status: string
  bankId: string
  bankName?: string
}

export interface FinancingOfferRequest {
  creditProductId: string
  propertyId?: string
  buildingId?: string
  specialInterestRate?: number
  specialLtvRatio?: number
  additionalTerms?: string
}

export interface FinancingOfferResponse {
  id: string
  creditProductId: string
  creditProduct?: CreditProductResponse
  propertyId?: string
  buildingId?: string
  specialInterestRate?: number
  specialLtvRatio?: number
  additionalTerms?: string
  status: string
}
