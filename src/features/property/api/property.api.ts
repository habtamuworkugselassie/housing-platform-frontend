/**
 * Property API Service
 * 
 * API client for property endpoints.
 */
import api from '@/shared/api/client'
import type { PropertyRequest, PropertyResponse, PropertyFilters } from './property.types'
import type { PaginatedResponse, PageRequest } from '@/shared/types'

export const propertyApi = {
  /**
   * Get all properties with pagination and filters
   */
  getProperties: async (
    filters?: PropertyFilters,
    pageRequest?: PageRequest
  ): Promise<PaginatedResponse<PropertyResponse>> => {
    const params = {
      ...filters,
      ...pageRequest
    }
    const response = await api.get<PaginatedResponse<PropertyResponse>>('/properties', { params })
    return response.data
  },

  /**
   * Get property by ID
   */
  getPropertyById: async (id: string): Promise<PropertyResponse> => {
    const response = await api.get<PropertyResponse>(`/properties/${id}`)
    return response.data
  },

  /**
   * Create new property
   */
  createProperty: async (property: PropertyRequest): Promise<PropertyResponse> => {
    const response = await api.post<PropertyResponse>('/properties', property)
    return response.data
  },

  /**
   * Update property
   */
  updateProperty: async (id: string, property: Partial<PropertyRequest>): Promise<PropertyResponse> => {
    const response = await api.put<PropertyResponse>(`/properties/${id}`, property)
    return response.data
  },

  /**
   * Delete property
   */
  deleteProperty: async (id: string): Promise<void> => {
    await api.delete(`/properties/${id}`)
  },

  /**
   * Search properties
   */
  searchProperties: async (filters: PropertyFilters): Promise<PropertyResponse[]> => {
    const response = await api.get<PropertyResponse[]>('/properties/search', { params: filters })
    return response.data
  }
}
