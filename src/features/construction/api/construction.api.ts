/**
 * Construction API Service
 */
import api from '@/shared/api/client'
import type {
  ConstructionProjectRequest,
  ConstructionProjectResponse,
  ConstructionPhaseRequest,
  ConstructionPhaseResponse,
  MaterialOrderRequest,
  MaterialOrderResponse,
  MaterialInventoryRequest,
  MaterialInventoryResponse,
  MaterialUsageRequest,
  MaterialUsageResponse
} from './construction.types'
import type { PaginatedResponse, PageRequest } from '@/shared/types'

export const constructionApi = {
  // Projects
  getProjects: async (status?: string, pageRequest?: PageRequest): Promise<PaginatedResponse<ConstructionProjectResponse>> => {
    const params = { ...pageRequest }
    if (status) params.status = status
    const response = await api.get('/construction-projects', { params })
    return response.data
  },

  getProjectById: async (id: string): Promise<ConstructionProjectResponse> => {
    const response = await api.get(`/construction-projects/${id}`)
    return response.data
  },

  createProject: async (project: ConstructionProjectRequest): Promise<ConstructionProjectResponse> => {
    const response = await api.post('/construction-projects', project)
    return response.data
  },

  updateProjectStatus: async (id: string, status: string): Promise<void> => {
    await api.put(`/construction-projects/${id}/status`, null, { params: { status } })
  },

  // Phases
  createPhase: async (projectId: string, phase: ConstructionPhaseRequest): Promise<ConstructionPhaseResponse> => {
    const response = await api.post(`/construction-projects/${projectId}/phases`, phase)
    return response.data
  },

  updatePhase: async (projectId: string, phaseId: string, phase: Partial<ConstructionPhaseRequest>): Promise<ConstructionPhaseResponse> => {
    const response = await api.put(`/construction-projects/${projectId}/phases/${phaseId}`, phase)
    return response.data
  },

  updatePhaseCompletion: async (projectId: string, phaseId: string, completionPercentage: number): Promise<void> => {
    await api.put(`/construction-projects/${projectId}/phases/${phaseId}/completion`, null, {
      params: { completionPercentage }
    })
  },

  // Material Orders
  getOrders: async (filters?: any, pageRequest?: PageRequest): Promise<PaginatedResponse<MaterialOrderResponse>> => {
    const params = { ...filters, ...pageRequest }
    const response = await api.get('/material-orders', { params })
    return response.data
  },

  getOrderById: async (id: string): Promise<MaterialOrderResponse> => {
    const response = await api.get(`/material-orders/${id}`)
    return response.data
  },

  createOrder: async (order: MaterialOrderRequest): Promise<MaterialOrderResponse> => {
    const response = await api.post('/material-orders', order)
    return response.data
  },

  // Material Inventory
  getInventory: async (filters?: any): Promise<MaterialInventoryResponse[]> => {
    const response = await api.get('/material-inventory', { params: filters })
    return response.data
  },

  createInventory: async (inventory: MaterialInventoryRequest): Promise<MaterialInventoryResponse> => {
    const response = await api.post('/material-inventory', inventory)
    return response.data
  },

  updateInventory: async (id: string, inventory: Partial<MaterialInventoryRequest>): Promise<MaterialInventoryResponse> => {
    const response = await api.put(`/material-inventory/${id}`, inventory)
    return response.data
  },

  adjustInventory: async (id: string, adjustment: { adjustmentType: string; quantity: number; reason?: string }): Promise<void> => {
    await api.post(`/material-inventory/${id}/adjust`, adjustment)
  },

  // Material Usage
  getUsage: async (filters?: any, pageRequest?: PageRequest): Promise<PaginatedResponse<MaterialUsageResponse>> => {
    const params = { ...filters, ...pageRequest }
    const response = await api.get('/material-usage', { params })
    return response.data
  },

  createUsage: async (usage: MaterialUsageRequest): Promise<MaterialUsageResponse> => {
    const response = await api.post('/material-usage', usage)
    return response.data
  },

  updateUsage: async (id: string, usage: Partial<MaterialUsageRequest>): Promise<MaterialUsageResponse> => {
    const response = await api.put(`/material-usage/${id}`, usage)
    return response.data
  }
}
