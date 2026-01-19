<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{{ $t('building.buildings') }}</h1>
        <p class="mt-2 text-sm text-gray-600">{{ $t('building.manageBuildings') }}</p>
      </div>
      <button
        v-if="organization"
        @click="showCreateModal = true"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
      >
        + {{ $t('building.addBuilding') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-800">{{ error }}</p>
    </div>

    <!-- Buildings Grid -->
    <div v-if="!loading" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="building in buildings"
        :key="building.id"
        @click="viewBuilding(building.id)"
        class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ building.name }}</h3>
          <span :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            getStatusColor(building.status)
          ]">
            {{ building.status }}
          </span>
        </div>
        
        <p class="text-sm text-gray-600 mb-4">{{ building.address }}, {{ building.city }}</p>
        
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label class="text-xs font-medium text-gray-500">Total Units</label>
            <p class="text-sm font-semibold text-gray-900">{{ building.totalUnits }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500">Floors</label>
            <p class="text-sm font-semibold text-gray-900">{{ building.totalFloors }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500">Available</label>
            <p class="text-sm font-semibold text-green-600">{{ building.availableUnits || 0 }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500">Occupied</label>
            <p class="text-sm font-semibold text-gray-600">{{ building.occupiedUnits || 0 }}</p>
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button
            @click.stop="editBuilding(building)"
            class="flex-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            {{ $t('common.edit') }}
          </button>
          <button
            @click.stop="viewBuilding(building.id)"
            class="flex-1 px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded hover:bg-primary-200"
          >
            {{ $t('building.viewUnits') }}
          </button>
        </div>
      </div>

      <div v-if="buildings.length === 0" class="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p class="text-sm text-gray-500">{{ $t('building.noBuildings') }}</p>
        <button
          v-if="organization"
          @click="showCreateModal = true"
          class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          {{ $t('building.createFirstBuilding') }}
        </button>
      </div>
    </div>

    <!-- Create/Edit Building Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showEditModal ? 'Edit Building' : 'Create Building' }}
          </h3>
          
          <form @submit.prevent="submitBuilding" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('building.buildingName') }} *</label>
              <input
                v-model="buildingForm.name"
                type="text"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('property.description') }}</label>
              <textarea
                v-model="buildingForm.description"
                rows="3"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('property.address') }} *</label>
                <input
                  v-model="buildingForm.address"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('property.city') }} *</label>
                <input
                  v-model="buildingForm.city"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('property.state') }}</label>
                <input
                  v-model="buildingForm.state"
                  type="text"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('property.country') }} *</label>
                <input
                  v-model="buildingForm.country"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('property.zipCode') }}</label>
              <input
                v-model="buildingForm.zipCode"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('building.totalFloors') }} *</label>
                <input
                  v-model.number="buildingForm.totalFloors"
                  type="number"
                  min="1"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('building.totalUnits') }} *</label>
                <input
                  v-model.number="buildingForm.totalUnits"
                  type="number"
                  min="1"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('building.buildingType') }} *</label>
              <select
                v-model="buildingForm.buildingType"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">{{ $t('propertyTypes.selectType') }}</option>
                <option value="APARTMENT_COMPLEX">{{ $t('building.apartmentComplex') }}</option>
                <option value="CONDOMINIUM">{{ $t('building.condominium') }}</option>
                <option value="RESIDENTIAL_COMPLEX">{{ $t('building.residentialComplex') }}</option>
                <option value="MIXED_USE">{{ $t('building.mixedUse') }}</option>
                <option value="COMMERCIAL_RESIDENTIAL">{{ $t('building.commercialResidential') }}</option>
              </select>
              </div>
              <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('property.category') }} *</label>
              <select
                v-model="buildingForm.category"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">{{ $t('submitProperty.selectCategory') }}</option>
                <option value="FOR_SALE">{{ $t('property.forSale') }}</option>
                <option value="FOR_RENTAL">{{ $t('property.forRental') }}</option>
              </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('property.status') }}</label>
              <select
                v-model="buildingForm.status"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="PLANNED">{{ $t('building.planned') }}</option>
                <option value="UNDER_CONSTRUCTION">{{ $t('building.underConstruction') }}</option>
                <option value="COMPLETED">{{ $t('building.completed') }}</option>
                <option value="RENOVATION">{{ $t('building.renovation') }}</option>
              </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('property.constructionPercentage') }} (%)</label>
                <input
                  v-model.number="buildingForm.constructionPercentage"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div class="flex items-center">
              <input
                id="isFullyFurnished"
                v-model="buildingForm.isFullyFurnished"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="isFullyFurnished" class="ml-2 block text-sm text-gray-700">
                {{ $t('property.isFullyFurnished') }}
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('building.yearBuilt') }}</label>
              <input
                v-model.number="buildingForm.yearBuilt"
                type="number"
                min="1800"
                :max="new Date().getFullYear()"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('building.amenities') }}</label>
              <textarea
                v-model="buildingForm.amenities"
                rows="2"
                :placeholder="$t('building.amenitiesPlaceholder')"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('building.facilities') }}</label>
              <textarea
                v-model="buildingForm.facilities"
                rows="2"
                :placeholder="$t('building.facilitiesPlaceholder')"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {{ submitting ? $t('common.loading') : (showEditModal ? $t('common.update') : $t('common.create')) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const buildings = ref([])
const organization = ref(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingBuilding = ref(null)

const buildingForm = ref({
  name: '',
  description: '',
  address: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  totalFloors: 1,
  totalUnits: 1,
  buildingType: '',
  category: '',
  status: 'PLANNED',
  constructionPercentage: null,
  isFullyFurnished: false,
  yearBuilt: null,
  amenities: '',
  facilities: ''
})

const loadOrganization = async () => {
  try {
    const agentResponse = await api.get('/real-estate-agents/me')
    if (agentResponse.data?.organizationId) {
      const orgResponse = await api.get(`/organizations/${agentResponse.data.organizationId}`)
      organization.value = orgResponse.data
    } else if (agentResponse.data?.organization) {
      organization.value = agentResponse.data.organization
    }
  } catch (err) {
    if (err.response?.status === 404) {
      try {
        const orgResponse = await api.get('/organizations/my-company')
        organization.value = orgResponse.data
      } catch (orgErr) {
        console.error('Failed to load organization:', orgErr)
      }
    }
  }
}

const loadBuildings = async () => {
  if (!organization.value) {
    await loadOrganization()
  }
  
  if (!organization.value) {
    error.value = 'No organization found. Please register as an agent or create a company.'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const response = await api.get(`/buildings/companies/${organization.value.id}`)
    buildings.value = response.data
  } catch (err) {
    console.error('Failed to load buildings:', err)
    error.value = err.response?.data?.message || 'Failed to load buildings'
  } finally {
    loading.value = false
  }
}

const submitBuilding = async () => {
  if (!organization.value) {
    alert('No organization found')
    return
  }

  submitting.value = true
  try {
    if (showEditModal.value && editingBuilding.value) {
      await api.put(`/buildings/${editingBuilding.value.id}/companies/${organization.value.id}`, buildingForm.value)
    } else {
      await api.post(`/buildings/companies/${organization.value.id}`, buildingForm.value)
    }
    closeModal()
    loadBuildings()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to save building')
  } finally {
    submitting.value = false
  }
}

const editBuilding = (building) => {
  editingBuilding.value = building
  buildingForm.value = {
    name: building.name,
    description: building.description || '',
    address: building.address,
    city: building.city,
    state: building.state || '',
    country: building.country,
    zipCode: building.zipCode || '',
    totalFloors: building.totalFloors,
    totalUnits: building.totalUnits,
    buildingType: building.buildingType,
    category: building.category,
    status: building.status,
    constructionPercentage: building.constructionPercentage,
    isFullyFurnished: building.isFullyFurnished || false,
    yearBuilt: building.yearBuilt,
    amenities: building.amenities || '',
    facilities: building.facilities || ''
  }
  showEditModal.value = true
}

const viewBuilding = (buildingId) => {
  router.push(`/buildings/${buildingId}`)
}

const getStatusColor = (status) => {
  const colors = {
    PLANNED: 'bg-gray-100 text-gray-800',
    UNDER_CONSTRUCTION: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    RENOVATION: 'bg-blue-100 text-blue-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingBuilding.value = null
  buildingForm.value = {
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    totalFloors: 1,
    totalUnits: 1,
    buildingType: '',
    category: '',
    status: 'PLANNED',
    constructionPercentage: null,
    isFullyFurnished: false,
    yearBuilt: null,
    amenities: '',
    facilities: ''
  }
}

onMounted(() => {
  loadBuildings()
})
</script>