/**
 * Buildings Composable
 */
import { ref } from 'vue'
import api from '@/shared/api/client'
import { useApi } from '@/shared/composables/useApi'

export interface BuildingRequest {
  name: string
  description?: string
  address: string
  city: string
  state?: string
  country: string
  zipCode?: string
  totalFloors: number
  totalUnits: number
  buildingType: string
  category: string
  status: string
  constructionPercentage?: number
  isFullyFurnished?: boolean
  yearBuilt?: number
  amenities?: string
  facilities?: string
}

export interface BuildingResponse {
  id: string
  name: string
  description?: string
  address: string
  city: string
  state?: string
  country: string
  zipCode?: string
  totalFloors: number
  totalUnits: number
  buildingType: string
  category: string
  status: string
  constructionPercentage?: number
  isFullyFurnished?: boolean
  yearBuilt?: number
  amenities?: string
  facilities?: string
  realEstateCompanyId: string
}

export function useBuildings() {
  const { loading, error, execute } = useApi()
  const buildings = ref<BuildingResponse[]>([])

  const loadBuildings = async () => {
    await execute(
      () => api.get('/buildings'),
      {
        onSuccess: (data) => {
          buildings.value = Array.isArray(data) ? data : (data.content || [])
        }
      }
    )
  }

  const loadBuildingById = async (id: string): Promise<BuildingResponse | null> => {
    const { execute: executeSingle } = useApi<BuildingResponse>()
    return await executeSingle(() => api.get(`/buildings/${id}`))
  }

  const createBuilding = async (building: BuildingRequest): Promise<BuildingResponse | null> => {
    const { execute: executeCreate } = useApi<BuildingResponse>()
    return await executeCreate(() => api.post('/buildings', building))
  }

  const updateBuilding = async (id: string, building: Partial<BuildingRequest>): Promise<BuildingResponse | null> => {
    const { execute: executeUpdate } = useApi<BuildingResponse>()
    return await executeUpdate(() => api.put(`/buildings/${id}`, building))
  }

  return {
    buildings,
    loading,
    error,
    loadBuildings,
    loadBuildingById,
    createBuilding,
    updateBuilding
  }
}
