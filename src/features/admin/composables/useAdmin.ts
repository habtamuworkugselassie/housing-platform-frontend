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
    const result = await execute(
      () => adminApi.getStats(),
      {
        onSuccess: (data) => {
          stats.value = data
        },
        onError: (err) => {
          console.error('Failed to load admin stats:', err)
        }
      }
    )
    
    // Fallback: If onSuccess didn't set it correctly, try to set it from the result
    if (result && !stats.value) {
      stats.value = result
    }
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
  const users = ref<any[]>([])
  const currentPage = ref(0)
  const totalPages = ref(1)

  const loadUsers = async (filters, pageRequest) => {
    // Filter out empty string values
    const cleanFilters = filters ? Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value != null && value !== '')
    ) : {}
    
    const requestParams = { ...pageRequest, page: currentPage.value }
    
    const result = await execute(
      () => adminApi.getUsers(cleanFilters, requestParams),
      {
        onSuccess: (data) => {
          if (data && 'content' in data) {
            // Spring Page response
            users.value = data.content || []
            totalPages.value = data.totalPages || 1
            currentPage.value = data.number || 0
          } else if (Array.isArray(data)) {
            // Direct array response
            users.value = data as any[]
            totalPages.value = 1
            currentPage.value = 0
          } else {
            // Unexpected response format
            users.value = []
            totalPages.value = 1
            currentPage.value = 0
          }
        },
        onError: (err) => {
          console.error('Failed to load users:', err)
          users.value = []
          totalPages.value = 1
        }
      }
    )
    
    // Fallback: If onSuccess didn't set it correctly, try to set it from the result
    if (result && 'content' in result && users.value.length === 0) {
      users.value = result.content || []
      totalPages.value = result.totalPages || 1
      currentPage.value = result.number || 0
    } else if (result && Array.isArray(result) && users.value.length === 0) {
      users.value = result
    }
  }

  const updateUser = async (id, user) => {
    try {
      const res = await adminApi.updateUser(id, user)
      return res.data
    } catch (err) {
      throw err.response?.data || err
    }
  }

  const createUser = async (payload) => {
    try {
      const res = await adminApi.createUser(payload)
      return res.data
    } catch (err) {
      throw err.response?.data || err
    }
  }

  return {
    users,
    loading,
    error,
    currentPage,
    totalPages,
    loadUsers,
    updateUser,
    createUser
  }
}

export function useAdminOrganizations() {
  const { loading, error, execute } = useApi()
  const organizations = ref<any[]>([])

  const loadOrganizations = async (filters) => {
    // Filter out empty string values to avoid sending them as query parameters
    // If all filters are empty, pass empty object to get all organizations
    const cleanFilters = filters ? Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value != null && value !== '')
    ) : {}
    
    // Always make the request, even with empty filters (to get all organizations)
    const result = await execute(
      () => adminApi.getOrganizations(cleanFilters),
      {
        onSuccess: (data) => {
          if (data && 'content' in data) {
            // Spring Page response
            organizations.value = Array.isArray(data.content) ? data.content : []
          } else if (Array.isArray(data)) {
            // Direct array response
            organizations.value = data
          } else if (data) {
            // Single object wrapped in array
            organizations.value = [data]
          } else {
            // No data
            organizations.value = []
          }
        },
        onError: (err) => {
          console.error('Failed to load organizations:', err)
          organizations.value = []
        }
      }
    )
    
    // Fallback: If onSuccess didn't set it correctly, try to set it from the result
    if (result && Array.isArray(result) && organizations.value.length === 0) {
      organizations.value = result
    }
  }

  const approveOrganization = async (id) => {
    const { execute: executeApprove } = useApi()
    return await executeApprove(() => adminApi.approveOrganization(id))
  }

  const rejectOrganization = async (id, reason) => {
    const { execute: executeReject } = useApi()
    return await executeReject(() => adminApi.rejectOrganization(id, reason))
  }

  const createOrganization = async (payload) => {
    // adminApi.createOrganization returns response.data, not AxiosResponse — do not wrap in useApi.execute
    return await adminApi.createOrganization(payload)
  }

  const updateOrganization = async (id, payload) => {
    const { execute: executeUpdate } = useApi()
    return await executeUpdate(() => adminApi.updateOrganization(id, payload))
  }

  const getOrganizationById = async (id) => {
    return await adminApi.getOrganizationById(id)
  }

  const uploadOrganizationMedia = async (id, files, mediaKind = 'IMAGE') => {
    const { execute: executeUpload } = useApi()
    return await executeUpload(() => adminApi.uploadOrganizationMedia(id, files, mediaKind))
  }

  const deleteOrganizationMedia = async (id, attachmentId) => {
    const { execute: executeDelete } = useApi()
    return await executeDelete(() => adminApi.deleteOrganizationMedia(id, attachmentId))
  }

  const uploadOrganizationDocument = async (id, documentType, file) => {
    const { execute: executeUpload } = useApi()
    return await executeUpload(() => adminApi.uploadOrganizationDocument(id, documentType, file))
  }

  const suspendOrganization = async (id, reason) => {
    const { execute: executeSuspend } = useApi()
    return await executeSuspend(() => adminApi.suspendOrganization(id, reason))
  }

  const reactivateOrganization = async (id) => {
    const { execute: executeReactivate } = useApi()
    return await executeReactivate(() => adminApi.reactivateOrganization(id))
  }

  const getActiveSponsorships = async () => {
    return await adminApi.getActiveSponsorships()
  }

  const getSponsorshipApplicationsByOrganization = async (organizationId) => {
    return await adminApi.getSponsorshipApplicationsByOrganization(organizationId)
  }

  const assignOrganizationToSponsorship = async (body) => {
    const { execute: executeAssign } = useApi()
    return await executeAssign(() => adminApi.assignOrganizationToSponsorship(body))
  }

  const approveSponsorshipApplication = async (applicationId, notes) => {
    const { execute: executeApprove } = useApi()
    return await executeApprove(() =>
      adminApi.approveSponsorshipApplication(applicationId, notes)
    )
  }

  const verifyOrganizationForSponsorshipApplication = async (applicationId) => {
    const { execute: executeVerify } = useApi()
    return await executeVerify(() =>
      adminApi.verifyOrganizationForSponsorshipApplication(applicationId)
    )
  }

  const verifyUserForSponsorshipApplication = async (applicationId, body) => {
    const { execute: executeVerify } = useApi()
    return await executeVerify(() =>
      adminApi.verifyUserForSponsorshipApplication(applicationId, body ?? null)
    )
  }

  const rejectSponsorshipApplication = async (applicationId, reason) => {
    const { execute: executeReject } = useApi()
    return await executeReject(() =>
      adminApi.rejectSponsorshipApplication(applicationId, reason)
    )
  }

  const cancelSponsorshipApplication = async (applicationId) => {
    const { execute: executeCancel } = useApi()
    return await executeCancel(() => adminApi.cancelSponsorshipApplication(applicationId))
  }

  return {
    organizations,
    loading,
    error,
    loadOrganizations,
    approveOrganization,
    rejectOrganization,
    suspendOrganization,
    reactivateOrganization,
    createOrganization,
    updateOrganization,
    getOrganizationById,
    uploadOrganizationMedia,
    deleteOrganizationMedia,
    uploadOrganizationDocument,
    getActiveSponsorships,
    getSponsorshipApplicationsByOrganization,
    assignOrganizationToSponsorship,
    approveSponsorshipApplication,
    verifyOrganizationForSponsorshipApplication,
    verifyUserForSponsorshipApplication,
    rejectSponsorshipApplication,
    cancelSponsorshipApplication
  }
}
