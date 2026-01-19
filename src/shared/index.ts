/**
 * Shared Module
 * 
 * Public API for shared utilities, components, and types.
 */

// API
export { default as api } from './api/client'

// Composables
export { useApi } from './composables/useApi'
export type { UseApiOptions } from './composables/useApi'

// Types
export type {
  PaginatedResponse,
  PageRequest,
  ApiError,
  Currency,
  Price
} from './types'

// Components
export { NavBar } from './components'

// Utils
export * from './utils'
