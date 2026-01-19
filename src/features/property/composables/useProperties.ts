/**
 * Properties Composable
 * 
 * Business logic for managing properties.
 */
import { ref, computed } from 'vue'
import { propertyApi } from '../api/property.api'
import type { PropertyResponse, PropertyFilters } from '../api/property.types'
import type { PageRequest } from '@/shared/types'
import { useApi } from '@/shared/composables/useApi'

export function useProperties() {
  const { loading, error, execute } = useApi<PropertyResponse[]>()
  const properties = ref<PropertyResponse[]>([])
  const currentPage = ref(0)
  const totalPages = ref(1)
  const totalElements = ref(0)

  const loadProperties = async (
    filters?: PropertyFilters,
    pageRequest?: PageRequest
  ): Promise<void> => {
    await execute(
      () => propertyApi.getProperties(filters, { ...pageRequest, page: currentPage.value }),
      {
        onSuccess: (data) => {
          if ('content' in data) {
            properties.value = data.content
            totalPages.value = data.totalPages
            totalElements.value = data.totalElements
          } else {
            properties.value = data as PropertyResponse[]
          }
        }
      }
    )
  }

  const loadPropertyById = async (id: string): Promise<PropertyResponse | null> => {
    const { execute: executeSingle } = useApi<PropertyResponse>()
    return await executeSingle(() => propertyApi.getPropertyById(id))
  }

  const createProperty = async (property: any): Promise<PropertyResponse | null> => {
    const { execute: executeCreate } = useApi<PropertyResponse>()
    return await executeCreate(() => propertyApi.createProperty(property))
  }

  const updateProperty = async (
    id: string,
    property: Partial<any>
  ): Promise<PropertyResponse | null> => {
    const { execute: executeUpdate } = useApi<PropertyResponse>()
    return await executeUpdate(() => propertyApi.updateProperty(id, property))
  }

  const deleteProperty = async (id: string): Promise<void> => {
    const { execute: executeDelete } = useApi<void>()
    await executeDelete(() => propertyApi.deleteProperty(id))
    // Remove from local state
    properties.value = properties.value.filter(p => p.id !== id)
  }

  const searchProperties = async (filters: PropertyFilters): Promise<void> => {
    await execute(
      () => propertyApi.searchProperties(filters),
      {
        onSuccess: (data) => {
          properties.value = data
        }
      }
    )
  }

  const changePage = (page: number) => {
    currentPage.value = page
  }

  const hasMore = computed(() => currentPage.value < totalPages.value - 1)

  return {
    properties,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    hasMore,
    loadProperties,
    loadPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    searchProperties,
    changePage
  }
}
