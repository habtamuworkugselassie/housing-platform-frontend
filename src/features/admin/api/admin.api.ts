/**
 * Admin API Service
 * 
 * API client for admin management endpoints.
 */
import api from '@/shared/api/client'
import type { AxiosResponse } from 'axios'
import type {
  AdminStats,
  UserManagementRequest,
  OrganizationManagementRequest,
  OrganizationCreateRequest,
  OrganizationUpdateRequest,
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
   * Returns the full AxiosResponse so useApi.execute can extract response.data
   */
  getStats: async (): Promise<AxiosResponse<AdminStats>> => {
    const response = await api.get('/admin/stats')
    return response
  },

  /**
   * Get all users with pagination and filters
   * Returns the full AxiosResponse so useApi.execute can extract response.data
   */
  getUsers: async (filters, pageRequest): Promise<AxiosResponse<any>> => {
    const params = { ...filters, ...pageRequest }
    const response = await api.get('/users', { params })
    return response
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
   * Returns the full AxiosResponse so useApi.execute can extract response.data
   */
  getOrganizations: async (filters?: AdminFilters): Promise<AxiosResponse<any[]>> => {
    const response = await api.get('/organizations', { params: filters || {} })
    return response
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
    const response = await api.put(`/organizations/${id}/reject`, reason ? { reason } : {})
    return response.data
  },

  /**
   * Create organization (admin only) – register organization with full details (e.g. REAL_ESTATE_COMPANY, BANK, SUPPLIER, CONTRACTOR, DEVELOPER)
   */
  createOrganization: async (body: OrganizationCreateRequest): Promise<any> => {
    const response = await api.post('/admin/organizations', body)
    return response.data
  },

  /**
   * Update organization (admin can update any organization)
   */
  updateOrganization: async (id: string, body: OrganizationUpdateRequest): Promise<any> => {
    const response = await api.put(`/organizations/${id}`, body)
    return response.data
  },

  /**
   * Get organization by ID (includes logo and media)
   */
  getOrganizationById: async (id: string): Promise<any> => {
    const response = await api.get(`/organizations/${id}`)
    return response.data
  },

  /**
   * Upload organization media (logo, images, videos). Use FormData: files + mediaKind (LOGO | IMAGE | VIDEO).
   */
  uploadOrganizationMedia: async (
    id: string,
    files: File[],
    mediaKind: 'LOGO' | 'IMAGE' | 'VIDEO' = 'IMAGE'
  ): Promise<any> => {
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    formData.append('mediaKind', mediaKind)
    const response = await api.post(`/organizations/${id}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  /**
   * Delete organization media attachment
   */
  deleteOrganizationMedia: async (id: string, attachmentId: string): Promise<any> => {
    const response = await api.delete(`/organizations/${id}/media/${attachmentId}`)
    return response.data
  },

  /**
   * Suspend organization (admin only)
   */
  suspendOrganization: async (id: string, reason?: string): Promise<any> => {
    const response = await api.put(`/organizations/${id}/suspend`, reason != null ? { reason } : {})
    return response.data
  },

  /**
   * Get active sponsorship packages (for assign dropdown)
   */
  getActiveSponsorships: async (): Promise<any[]> => {
    const response = await api.get('/sponsorships/active')
    return response.data
  },

  /**
   * Get sponsorship applications for an organization (admin)
   */
  getSponsorshipApplicationsByOrganization: async (organizationId: string): Promise<any[]> => {
    const response = await api.get(`/sponsorships/applications/organization/${organizationId}`)
    return response.data
  },

  /**
   * Assign organization to sponsorship (admin) – create application, optional auto-approve
   */
  assignOrganizationToSponsorship: async (body: {
    organizationId: string
    sponsorshipId: string
    startDate: string
    endDate: string
    notes?: string
    amount?: number
    paymentReference?: string
    autoApprove?: boolean
  }): Promise<any> => {
    const response = await api.post('/sponsorships/applications/admin', body)
    return response.data
  },

  /**
   * Approve sponsorship application (admin)
   */
  approveSponsorshipApplication: async (applicationId: string, notes?: string): Promise<any> => {
    const response = await api.put(`/sponsorships/applications/${applicationId}/approve`, {
      notes: notes ?? 'Approved by admin'
    })
    return response.data
  },

  /**
   * Reject sponsorship application (admin)
   */
  rejectSponsorshipApplication: async (applicationId: string, reason: string): Promise<any> => {
    const response = await api.put(`/sponsorships/applications/${applicationId}/reject`, {
      reason
    })
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
