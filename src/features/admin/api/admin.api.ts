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
  UserCreateRequest,
  OrganizationManagementRequest,
  OrganizationCreateRequest,
  OrganizationUpdateRequest,
  PropertyManagementRequest,
  AdminFilters,
  DisplaySettings
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
   * Create user (admin only). Any role including ADMIN is allowed.
   */
  createUser: async (body: UserCreateRequest): Promise<any> => {
    const response = await api.post('/users', body)
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
   * Returns full AxiosResponse so useApi.execute can extract response.data (updated organization).
   */
  uploadOrganizationMedia: async (
    id: string,
    files: File[],
    mediaKind: 'LOGO' | 'IMAGE' | 'VIDEO' = 'IMAGE'
  ): Promise<AxiosResponse<any>> => {
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    formData.append('mediaKind', mediaKind)
    // Do not set Content-Type: let the browser set multipart/form-data with boundary
    const response = await api.post(`/organizations/${id}/media`, formData)
    return response
  },

  /**
   * Delete organization media attachment.
   * Returns full AxiosResponse so useApi.execute can extract response.data (updated organization).
   */
  deleteOrganizationMedia: async (id: string, attachmentId: string): Promise<AxiosResponse<any>> => {
    const response = await api.delete(`/organizations/${id}/media/${attachmentId}`)
    return response
  },

  /**
   * Upload organization document (business registration, license, VAT, TIN).
   * documentType: BUSINESS_REGISTRATION | LICENSE | VAT_REGISTRATION | TIN_REGISTRATION.
   */
  uploadOrganizationDocument: async (
    id: string,
    documentType: 'BUSINESS_REGISTRATION' | 'LICENSE' | 'VAT_REGISTRATION' | 'TIN_REGISTRATION',
    file: File
  ): Promise<AxiosResponse<any>> => {
    const formData = new FormData()
    formData.append('documentType', documentType)
    formData.append('file', file)
    const response = await api.post(`/organizations/${id}/documents`, formData)
    return response
  },

  /**
   * Suspend organization (admin only)
   */
  suspendOrganization: async (id: string, reason?: string): Promise<any> => {
    const response = await api.put(`/organizations/${id}/suspend`, reason != null ? { reason } : {})
    return response.data
  },

  /**
   * Reactivate suspended organization and its sponsorship applications (admin only)
   */
  reactivateOrganization: async (id: string): Promise<any> => {
    const response = await api.put(`/organizations/${id}/reactivate`)
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
   * Cancel approved sponsorship application (admin)
   */
  cancelSponsorshipApplication: async (applicationId: string): Promise<void> => {
    await api.put(`/sponsorships/applications/${applicationId}/cancel`)
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
   * Get property by ID (full details including images)
   */
  getPropertyById: async (id: string): Promise<any> => {
    const response = await api.get(`/properties/${id}`)
    return response.data
  },

  /**
   * Create property (admin can create for any real estate company)
   */
  createProperty: async (property: PropertyManagementRequest): Promise<any> => {
    const response = await api.post('/properties', property)
    return response.data
  },

  /**
   * Update property (admin can update any property)
   */
  updateProperty: async (id: string, property: PropertyManagementRequest): Promise<any> => {
    const response = await api.put(`/properties/${id}`, property)
    return response.data
  },

  /**
   * Upload property media (images/videos)
   */
  uploadPropertyMedia: async (propertyId: string, files: File[]): Promise<any> => {
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    // Do not set Content-Type: let the browser set multipart/form-data with boundary
    const response = await api.post(`/properties/${propertyId}/images`, formData)
    return response.data
  },

  /**
   * Create simplified property financing offer (bank + coverage percentage)
   */
  createPropertyFinancingOffer: async (
    propertyId: string,
    bankId: string,
    coveragePercentage: number
  ): Promise<any> => {
    const response = await api.post(
      `/properties/${propertyId}/financing-offers`,
      { coveragePercentage },
      { params: { bankId } }
    )
    return response.data
  },

  /**
   * Get financing offers linked to a property
   */
  getPropertyFinancingOffers: async (propertyId: string): Promise<any[]> => {
    const response = await api.get(`/properties/${propertyId}/financing-offers`)
    return Array.isArray(response.data) ? response.data : []
  },

  /**
   * Delete property image
   */
  deletePropertyImage: async (propertyId: string, imageId: string): Promise<any> => {
    const response = await api.delete(`/properties/${propertyId}/images/${imageId}`)
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
   * Create building (admin can create for any real estate company)
   */
  createBuilding: async (companyId: string, building: any): Promise<any> => {
    const response = await api.post(`/buildings/companies/${companyId}`, building)
    return response.data
  },

  /**
   * Update building (admin can update any building)
   */
  updateBuilding: async (companyId: string, buildingId: string, building: any): Promise<any> => {
    const response = await api.put(`/buildings/${buildingId}/companies/${companyId}`, building)
    return response.data
  },

  /**
   * Delete building
   */
  deleteBuilding: async (companyId: string, buildingId: string): Promise<void> => {
    await api.delete(`/buildings/${buildingId}/companies/${companyId}`)
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
  },

  /** Landing page carousel / sidebar rotation timings (admin) */
  getDisplaySettings: async (): Promise<DisplaySettings> => {
    const response = await api.get<DisplaySettings>('/admin/display-settings')
    return response.data
  },

  updateDisplaySettings: async (body: DisplaySettings): Promise<DisplaySettings> => {
    const response = await api.put<DisplaySettings>('/admin/display-settings', body)
    return response.data
  }
}
