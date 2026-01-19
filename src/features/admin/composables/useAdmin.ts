/**
 * Admin Composable
 * 
 * Business logic for admin management.
 */
import { ref, computed } from 'vue'
import { adminApi } from '../api/admin.api'
import type { AdminStats, AdminFilters } from '../api/admin.types'
// PageRequest type
interface PageRequest {
  page?: number
  size?: number
  sort?: string
}
import { useApi } from '@/shared/composables/useApi'

export function useAdmin() {
  const { loading, error, execute } = useApi<AdminStats>()
  const stats = ref<AdminStats | null>(null)

  const loadStats = async (): Promise<void> => {
    await execute(
      () => adminApi.getStats(),
      {
        onSuccess: (data) => {
          stats.value = data
        }
      }
    )
  }

  return {
    stats,
    loading,
    error,
    loadStats
  }
}

export function useAdminUsers() {
  const { loading, error, execute } = useApi()
  const users = ref([])
  const currentPage = ref(0)
  const totalPages = ref(1)

  const loadUsers = async (filters, pageRequest) => {
    await execute(
      () => adminApi.getUsers(filters, { ...pageRequest, page: currentPage.value }),
      {
        onSuccess: (data) => {
          if ('content' in data) {
            users.value = data.content
            totalPages.value = data.totalPages
          } else {
            users.value = data as any[]
          }
        }
      }
    )
  }

  const updateUser = async (id, user) => {
    const { execute: executeUpdate } = useApi()
    return await executeUpdate(() => adminApi.updateUser(id, user))
  }

  return {
    users,
    loading,
    error,
    currentPage,
    totalPages,
    loadUsers,
    updateUser
  }
}

export function useAdminOrganizations() {
  const { loading, error, execute } = useApi()
  const organizations = ref<any[]>([])

  const loadOrganizations = async (filters) => {
    await execute(
      () => adminApi.getOrganizations(filters),
      {
        onSuccess: (data) => {
          organizations.value = data
        }
      }
    )
  }

  const approveOrganization = async (id) => {
    const { execute: executeApprove } = useApi()
    return await executeApprove(() => adminApi.approveOrganization(id))
  }

  const rejectOrganization = async (id, reason) => {
    const { execute: executeReject } = useApi()
    return await executeReject(() => adminApi.rejectOrganization(id, reason))
  }

  return {
    organizations,
    loading,
    error,
    loadOrganizations,
    approveOrganization,
    rejectOrganization
  }
}
