/**
 * Property API Types
 * 
 * Type definitions for property API contracts.
 */

import type { Currency } from '@/shared/types'

export interface PropertyRequest {
  title: string
  description?: string
  propertyType: string
  category: 'FOR_SALE' | 'FOR_RENTAL'
  priceETB?: number
  priceUSD?: number
  address: string
  city: string
  state?: string
  country: string
  zipCode?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  floorNumber?: number
  totalFloors?: number
  constructionStatus?: string
  constructionPercentage?: number
  isFullyFurnished?: boolean
  buildingId?: string
  imageUrls?: string[]
}

export interface PropertyResponse {
  id: string
  title: string
  description?: string
  propertyType: string
  category: 'FOR_SALE' | 'FOR_RENTAL'
  priceETB?: number
  priceUSD?: number
  address: string
  city: string
  state?: string
  country: string
  zipCode?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  floorNumber?: number
  totalFloors?: number
  constructionStatus?: string
  constructionPercentage?: number
  isFullyFurnished?: boolean
  status: string
  buildingId?: string
  imageUrls?: string[]
  images?: Array<{ imageUrl: string }>
  realEstateCompanyId?: string
  realEstateCompanyName?: string
  isSponsored?: boolean
  sponsorshipType?: 'PREMIER' | 'BASIC'
  createdAt: string
  updatedAt: string
}

export interface PropertyFilters {
  city?: string
  status?: string
  category?: string
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  currency?: Currency
}
