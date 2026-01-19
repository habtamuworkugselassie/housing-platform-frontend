/**
 * Property Feature Module
 * 
 * Public API for the property feature.
 */

// Composables
export { useProperties } from './composables/useProperties'

// Types
export type {
  PropertyRequest,
  PropertyResponse,
  PropertyFilters
} from './api/property.types'

// API (for advanced use cases)
export { propertyApi } from './api/property.api'

// Composables
export { useBuildings } from './composables/useBuildings'
export type { BuildingRequest, BuildingResponse } from './composables/useBuildings'

// Views (for router)
export { default as PropertiesView } from './views/PropertiesView.vue'
export { default as PropertyDetailsView } from './views/PropertyDetailsView.vue'
export { default as SubmitPropertyView } from './views/SubmitPropertyView.vue'
export { default as HomeView } from './views/HomeView.vue'
export { default as BuildingsView } from './views/BuildingsView.vue'
export { default as BuildingDetailsView } from './views/BuildingDetailsView.vue'
