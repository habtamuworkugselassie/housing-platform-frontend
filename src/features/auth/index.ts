/**
 * Auth Feature Module
 * 
 * Public API for the auth feature.
 * This is the only way other features should import from auth.
 */

// Store
export { useAuthStore } from './composables/useAuth'

// Composables
export { usePermissions } from './composables/usePermissions'

// Types
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User
} from './api/auth.types'

// Views (for router)
export { default as LoginView } from './views/LoginView.vue'
export { default as RegisterView } from './views/RegisterView.vue'
