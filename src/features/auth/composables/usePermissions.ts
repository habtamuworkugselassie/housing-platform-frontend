/**
 * Permissions Composable
 * 
 * Business logic for role and permission checking.
 */
import { computed } from 'vue'
import { useAuthStore } from './useAuth'

export function usePermissions() {
  const authStore = useAuthStore()

  const isRealtor = computed(() => authStore.hasRole('REALTOR'))
  const isBanker = computed(() => authStore.hasRole('BANKER'))
  const isBuyer = computed(() => authStore.hasRole('BUYER'))
  const isSupplier = computed(() => authStore.hasRole('SUPPLIER'))
  const isAdmin = computed(() => authStore.hasRole('ADMIN'))

  const canAccessPropertyManagement = computed(() => isRealtor.value)
  const canAccessBanking = computed(() => isBanker.value)
  const canAccessConstruction = computed(() => isRealtor.value)
  const canAccessSupplier = computed(() => isSupplier.value)

  return {
    isRealtor,
    isBanker,
    isBuyer,
    isSupplier,
    isAdmin,
    canAccessPropertyManagement,
    canAccessBanking,
    canAccessConstruction,
    canAccessSupplier,
    hasRole: authStore.hasRole.bind(authStore),
    hasScope: authStore.hasScope.bind(authStore)
  }
}
