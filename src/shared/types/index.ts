/**
 * Shared Types
 * 
 * Common types used across multiple features.
 */

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface PageRequest {
  page?: number
  size?: number
  sort?: string
}

export interface ApiError {
  message: string
  error?: string
  statusCode?: number
  timestamp?: string
  path?: string
}

export type Currency = 'ETB' | 'USD'

export interface Price {
  amount: number
  currency: Currency
}
