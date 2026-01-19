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

export interface PropertyManagementRequest {
  status?: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'WITHDRAWN'
  featured?: boolean
}

export interface AdminFilters {
  status?: string
  type?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}
