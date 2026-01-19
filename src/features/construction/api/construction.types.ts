/**
 * Construction API Types
 */
import type { Currency } from '@/shared/types'

export interface ConstructionProjectRequest {
  name: string
  description?: string
  type: string
  currency: Currency
  budget?: number
  startDate?: string
  plannedEndDate?: string
  locationAddress?: string
  locationCity?: string
  locationCountry?: string
}

export interface ConstructionProjectResponse {
  id: string
  name: string
  description?: string
  type: string
  status: string
  currency: Currency
  budget?: number
  totalCost?: number
  startDate?: string
  plannedEndDate?: string
  locationAddress?: string
  locationCity?: string
  locationCountry?: string
  overallCompletionPercentage?: number
  completedPhases?: number
  totalPhases?: number
  phases?: ConstructionPhaseResponse[]
}

export interface ConstructionPhaseRequest {
  name: string
  description?: string
  type: string
  sequence: number
  budget?: number
  plannedEndDate?: string
  notes?: string
}

export interface ConstructionPhaseResponse {
  id: string
  name: string
  description?: string
  type: string
  sequence: number
  status: string
  budget?: number
  actualCost?: number
  completionPercentage?: number
  startDate?: string
  plannedEndDate?: string
  notes?: string
}

export interface MaterialOrderRequest {
  supplierId: string
  projectId?: string
  currency: Currency
  expectedDeliveryDate?: string
  taxAmount?: number
  shippingCost?: number
  deliveryAddress?: string
  notes?: string
  items: MaterialOrderItemRequest[]
}

export interface MaterialOrderItemRequest {
  materialName: string
  category: string
  unit: string
  quantity: number
  unitPrice: number
}

export interface MaterialOrderResponse {
  id: string
  orderNumber: string
  supplierId: string
  supplierName?: string
  projectId?: string
  projectName?: string
  status: string
  currency: Currency
  totalAmount: number
  orderDate: string
  expectedDeliveryDate?: string
  items?: MaterialOrderItemResponse[]
}

export interface MaterialOrderItemResponse {
  id: string
  materialName: string
  category: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface MaterialInventoryRequest {
  materialName: string
  category: string
  quantityOnHand: number
  unit: string
  unitPrice: number
  currency: Currency
  reorderLevel?: number
  location?: string
  notes?: string
}

export interface MaterialInventoryResponse {
  id: string
  materialName: string
  category: string
  quantityOnHand: number
  unit: string
  unitPrice: number
  currency: Currency
  reorderLevel?: number
  location?: string
  notes?: string
}

export interface MaterialUsageRequest {
  projectId?: string
  phaseId?: string
  materialName: string
  category: string
  quantity: number
  unit: string
  unitCost: number
  currency: Currency
  usageDate: string
  location?: string
  notes?: string
}

export interface MaterialUsageResponse {
  id: string
  projectId?: string
  projectName?: string
  phaseId?: string
  phaseName?: string
  materialName: string
  category: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  currency: Currency
  usageDate: string
  location?: string
  notes?: string
}
