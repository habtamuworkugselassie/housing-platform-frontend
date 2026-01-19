/**
 * Admin API Service
 * 
 * API client for admin management endpoints.
 */
import api from '@/shared/api/client'
import type {
  AdminStats,
  UserManagementRequest,
  OrganizationManagementRequest,
  PropertyManagementRequest,
  AdminFilters
} from './admin.types'
// Pagination types
interface PageRequest {
  page?: number
  size?: number
  sort?: string
}

interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const adminApi = {
  /**
   * Get admin dashboard statistics
   */
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats')
    return response.data
  },

  /**
   * Get all users with pagination and filters
   */
  getUsers: async (filters, pageRequest) => {
    const params = { ...filters, ...pageRequest }
    const response = await api.get('/users', { params })
    return response.data
  },

  /**
   * Update user (admin)
   */
  updateUser: async (id: string, user: UserManagementRequest): Promise<any> => {
    const response = await api.put(`/users/${id}`, user)
    return response.data
  },

  /**
   * Get all organizations with filters
   */
  getOrganizations: async (filters?: AdminFilters): Promise<any[]> => {
    const response = await api.get('/organizations', { params: filters })
    return response.data
  },

  /**
   * Approve organization
   */
  approveOrganization: async (id: string): Promise<any> => {
    const response = await api.put(`/organizations/${id}/approve`)
    return response.data
  },

  /**
   * Reject organization
   */
  rejectOrganization: async (id: string, reason: string): Promise<any> => {
    const response = await api.put(`/organizations/${id}/reject`, { reason })
    return response.data
  },

  /**
   * Get all properties with filters
   */
  getProperties: async (filters, pageRequest) => {
    const params = { ...filters, ...pageRequest }
    const response = await api.get('/properties', { params })
    return response.data
  },

  /**
   * Update property (admin)
   */
  updateProperty: async (id: string, property: PropertyManagementRequest): Promise<any> => {
    const response = await api.put(`/properties/${id}`, property)
    return response.data
  },

  /**
   * Get all buildings
   */
  getBuildings: async (filters?: AdminFilters): Promise<any[]> => {
    const response = await api.get('/buildings', { params: filters })
    return response.data
  },

  /**
   * Get all construction projects
   */
  getConstructionProjects: async (filters, pageRequest) => {
    const params = { ...filters, ...pageRequest }
    const response = await api.get('/construction-projects', { params })
    return response.data
  },

  /**
   * Get all loan applications
   */
  getLoanApplications: async (filters, pageRequest) => {
    const params = { ...filters, ...pageRequest }
    const response = await api.get('/loan-applications', { params })
    return response.data
  },

  /**
   * Get all credit products
   */
  getCreditProducts: async (filters?: AdminFilters): Promise<any[]> => {
    const response = await api.get('/credit-products', { params: filters })
    return response.data
  }
}
