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
  latitude?: number | null
  longitude?: number | null
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
  latitude?: number
  longitude?: number
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
  /** Primary contact phone for the real estate (e.g. +251 91 123 4567). */
  realEstateCompanyPhone?: string
  /** True when the real estate company is fully verified (all 8 fields). */
  realEstateCompanyVerified?: boolean
  /** Verification level: NONE, HALF, FULL. Use for blue check badge (Verified / Half verified). */
  realEstateCompanyVerificationLevel?: string
  isSponsored?: boolean
  sponsorshipType?: 'EXCLUSIVE' | 'PLATINUM' | 'PREMIUM' | 'GOLD' | 'SILVER' | 'SPECIAL'
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
