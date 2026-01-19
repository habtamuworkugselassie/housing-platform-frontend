/**
 * Construction Feature Module
 */
export { constructionApi } from './api/construction.api'
export type {
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
} from './api/construction.types'

// Views
export { default as ConstructionProjectsView } from './views/ConstructionProjectsView.vue'
export { default as ConstructionProjectDetailsView } from './views/ConstructionProjectDetailsView.vue'
export { default as MaterialOrdersView } from './views/MaterialOrdersView.vue'
export { default as MaterialInventoryView } from './views/MaterialInventoryView.vue'
export { default as MaterialUsageView } from './views/MaterialUsageView.vue'
export { default as ConstructionDashboardView } from './views/ConstructionDashboardView.vue'
export { default as SupplierDashboardView } from './views/SupplierDashboardView.vue'
