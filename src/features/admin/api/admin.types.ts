/**
 * Admin API Types
 * 
 * Type definitions for admin management API contracts.
 */

// Types for admin management

export interface AdminStats {
  totalUsers: number
  totalOrganizations: number
  totalProperties: number
  totalBuildings: number
  totalProjects: number
  totalLoanApplications: number
  pendingApprovals: number
  activeSponsorships: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'USER_REGISTERED' | 'ORGANIZATION_CREATED' | 'PROPERTY_CREATED' | 'LOAN_APPLIED' | 'ORGANIZATION_APPROVED'
  description: string
  timestamp: string
  userId?: string
  userName?: string
}

export interface UserManagementRequest {
  email?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  roles?: string[]
  enabled?: boolean
}

export interface OrganizationManagementRequest {
  name?: string
  email?: string
  phoneNumber?: string
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string
}

/** Organization types: real estate and construction related */
export type OrganizationType =
  | 'REAL_ESTATE_COMPANY'
  | 'BANK'
  | 'SUPPLIER'
  | 'CONTRACTOR'
  | 'DEVELOPER'
  | 'INSURANCE'
  | 'CONSULTANT'
  | 'ARCHITECT'
  | 'FINISHING_CONTRACTOR'

/** Full organization create/update payload for admin */
export interface OrganizationCreateRequest {
  name: string
  registrationNumber?: string
  type: OrganizationType
  address?: string
  city?: string
  country?: string
  phoneNumber?: string
  email?: string
  website?: string
  description?: string
  primaryContactUserId?: string
  /** When creating as admin: APPROVED, PENDING_APPROVAL, etc. */
  initialStatus?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
}

/** Same fields for update (all optional except what is being changed) */
export interface OrganizationUpdateRequest {
  name?: string
  registrationNumber?: string
  type?: OrganizationType
  address?: string
  city?: string
  country?: string
  phoneNumber?: string
  email?: string
  website?: string
  description?: string
  primaryContactUserId?: string
}

export interface PropertyManagementRequest {
  title?: string
  description?: string
  type?: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CONDOMINIUM' | 'TOWNHOUSE' | 'LAND' | 'COMMERCIAL'
  status?: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'WITHDRAWN'
  priceETB?: number | null
  priceUSD?: number | null
  address?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  bedrooms?: number | null
  bathrooms?: number | null
  area?: number | null
  floorNumber?: number | null
  totalFloors?: number | null
  constructionStatus?: 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION' | 'PLANNED' | 'COMPLETED'
  category?: 'FOR_SALE' | 'FOR_RENTAL'
  constructionPercentage?: number | null
  isFullyFurnished?: boolean
  featured?: boolean
  realEstateCompanyId?: string
  agentId?: string
}

export interface AdminFilters {
  status?: string
  type?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}
