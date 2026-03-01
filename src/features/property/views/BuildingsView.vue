<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">{{ $t('building.buildings') }}</h1>
        <p class="mt-2 text-sm text-gray-400">{{ isManagementMode ? $t('building.manageBuildings') : $t('building.browseBuildings') }}</p>
      </div>
      <button
        v-if="isManagementMode && organization"
        @click="showCreateModal = true"
        class="px-4 py-2 bg-white text-black rounded-lg hover:bg-yellow-400 font-medium transition-colors"
      >
        + {{ $t('building.addBuilding') }}
      </button>
    </div>

    <!-- Filters (Public Mode) -->
    <div v-if="!isManagementMode" class="mb-6 bg-zinc-900 border border-white/10 p-4 rounded-lg">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label for="cityFilter" class="block text-sm font-medium text-gray-300">{{ $t('property.city') }}</label>
          <input
            id="cityFilter"
            v-model="filters.city"
            type="text"
            :placeholder="$t('property.filterByCity')"
            class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            @input="loadBuildings"
          />
        </div>
        <div>
          <label for="buildingTypeFilter" class="block text-sm font-medium text-gray-300">{{ $t('building.buildingTypeLabel') }}</label>
          <select
            id="buildingTypeFilter"
            v-model="filters.buildingType"
            class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            @change="loadBuildings"
          >
            <option value="">{{ $t('filters.all') }}</option>
            <option value="APARTMENT_COMPLEX">{{ $t('building.apartmentComplex') }}</option>
            <option value="CONDOMINIUM">{{ $t('building.condominium') }}</option>
            <option value="RESIDENTIAL_COMPLEX">{{ $t('building.residentialComplex') }}</option>
            <option value="MIXED_USE">{{ $t('building.mixedUse') }}</option>
            <option value="COMMERCIAL_RESIDENTIAL">{{ $t('building.commercialResidential') }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors"
          >
            {{ $t('filters.clearFilters') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-900/40 border border-red-500/30 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-200">{{ error }}</p>
    </div>

    <!-- Buildings Grid -->
    <div v-if="!loading" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="building in buildings"
        :key="building.id"
        @click="viewBuilding(building.id)"
        :class="[
          'rounded-lg border p-6 transition-all cursor-pointer hover:border-yellow-400 hover:bg-yellow-500/20',
          building.isSponsored && building.sponsorshipType === 'PREMIER' 
            ? 'bg-zinc-900 border-2 border-yellow-400' 
            : building.isSponsored && building.sponsorshipType === 'BASIC'
            ? 'bg-zinc-900 border-2 border-blue-400/60'
            : 'bg-zinc-900 border border-white/10'
        ]"
      >
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">{{ building.name }}</h3>
          <div class="flex items-center gap-2">
            <!-- Sponsored Badge -->
            <span 
              v-if="building.isSponsored"
              :class="{
                'bg-yellow-500/40 text-yellow-200': building.sponsorshipType === 'PREMIER',
                'bg-blue-500/40 text-blue-200': building.sponsorshipType === 'BASIC'
              }"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
            >
              <span v-if="building.sponsorshipType === 'PREMIER'" class="mr-1">⭐</span>
              <span v-else class="mr-1">✨</span>
              {{ building.sponsorshipType === 'PREMIER' ? $t('property.premier') : $t('property.sponsored') }}
            </span>
            <span :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              getStatusColor(building.status)
            ]">
              {{ building.status }}
            </span>
          </div>
        </div>
        
        <p class="text-sm text-gray-400 mb-4">{{ building.address }}, {{ building.city }}</p>
        
        <!-- Real Estate Company Name -->
        <div v-if="building.realEstateCompanyName" class="mb-3 flex items-center gap-2">
          <svg class="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <span class="text-xs font-semibold text-yellow-400">{{ building.realEstateCompanyName }}</span>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label class="text-xs font-medium text-gray-400">{{ $t('building.totalUnitsLabel') }}</label>
            <p class="text-sm font-semibold text-white">{{ building.totalUnits }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-400">{{ $t('building.floorsLabel') }}</label>
            <p class="text-sm font-semibold text-white">{{ building.totalFloors }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-400">{{ $t('building.availableLabel') }}</label>
            <p class="text-sm font-semibold text-green-400">{{ building.availableUnits || 0 }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-400">{{ $t('building.occupiedLabel') }}</label>
            <p class="text-sm font-semibold text-gray-300">{{ building.occupiedUnits || 0 }}</p>
          </div>
        </div>

        <!-- Management Actions (only in management mode) -->
        <div v-if="isManagementMode" class="mt-4 flex gap-2">
          <button
            @click.stop="editBuilding(building)"
            class="flex-1 px-3 py-1 text-sm bg-white/10 text-white border border-white/20 rounded hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors"
          >
            {{ $t('common.edit') }}
          </button>
          <button
            @click.stop="viewBuilding(building.id)"
            class="flex-1 px-3 py-1 text-sm bg-white text-black rounded hover:bg-yellow-400 transition-colors"
          >
            {{ $t('building.viewUnits') }}
          </button>
        </div>
        
        <!-- Public View Action -->
        <div v-else class="mt-4">
          <button
            @click.stop="viewBuilding(building.id)"
            class="w-full px-3 py-2 text-sm bg-white text-black rounded hover:bg-yellow-400 transition-colors"
          >
            {{ $t('building.viewDetails') }}
          </button>
        </div>
      </div>

      <div v-if="buildings.length === 0" class="col-span-full text-center py-12 bg-zinc-900 border border-white/10 rounded-lg">
        <p class="text-sm text-gray-400">{{ $t('building.noBuildings') }}</p>
        <button
          v-if="isManagementMode && organization"
          @click="showCreateModal = true"
          class="mt-4 px-4 py-2 bg-white text-black rounded-lg hover:bg-yellow-400 transition-colors"
        >
          {{ $t('building.createFirstBuilding') }}
        </button>
      </div>
    </div>

    <!-- Create/Edit Building Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
      @click.self="closeModal"
    >
      <div class="relative mx-auto p-5 border border-white/10 w-full max-w-2xl shadow-lg rounded-md bg-zinc-900 text-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-white mb-4">
            {{ showEditModal ? $t('building.editBuilding') : $t('building.createBuilding') }}
          </h3>
          
          <form @submit.prevent="submitBuilding" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300">{{ $t('building.buildingName') }} *</label>
              <input
                v-model="buildingForm.name"
                type="text"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300">{{ $t('property.description') }}</label>
              <textarea
                v-model="buildingForm.description"
                rows="3"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300">{{ $t('property.address') }} *</label>
                <input
                  v-model="buildingForm.address"
                  type="text"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300">{{ $t('property.city') }} *</label>
                <input
                  v-model="buildingForm.city"
                  type="text"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300">{{ $t('property.state') }}</label>
                <input
                  v-model="buildingForm.state"
                  type="text"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300">{{ $t('property.country') }} *</label>
                <input
                  v-model="buildingForm.country"
                  type="text"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300">{{ $t('property.zipCode') }}</label>
              <input
                v-model="buildingForm.zipCode"
                type="text"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300">{{ $t('building.totalFloors') }} *</label>
                <input
                  v-model.number="buildingForm.totalFloors"
                  type="number"
                  min="1"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300">{{ $t('building.totalUnits') }} *</label>
                <input
                  v-model.number="buildingForm.totalUnits"
                  type="number"
                  min="1"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
              <label class="block text-sm font-medium text-gray-300">{{ $t('building.buildingType') }} *</label>
              <select
                v-model="buildingForm.buildingType"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
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
              <label class="block text-sm font-medium text-gray-300">{{ $t('property.category') }} *</label>
              <select
                v-model="buildingForm.category"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
              >
                <option value="">{{ $t('submitProperty.selectCategory') }}</option>
                <option value="FOR_SALE">{{ $t('property.forSale') }}</option>
                <option value="FOR_RENTAL">{{ $t('property.forRental') }}</option>
              </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
              <label class="block text-sm font-medium text-gray-300">{{ $t('property.status') }}</label>
              <select
                v-model="buildingForm.status"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
              >
                <option value="PLANNED">{{ $t('building.planned') }}</option>
                <option value="UNDER_CONSTRUCTION">{{ $t('building.underConstruction') }}</option>
                <option value="COMPLETED">{{ $t('building.completed') }}</option>
                <option value="RENOVATION">{{ $t('building.renovation') }}</option>
              </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300">{{ $t('property.constructionPercentage') }} (%)</label>
                <input
                  v-model.number="buildingForm.constructionPercentage"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>

            <div class="flex items-center">
              <input
                id="isFullyFurnished"
                v-model="buildingForm.isFullyFurnished"
                type="checkbox"
                class="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-white/30 rounded"
              />
              <label for="isFullyFurnished" class="ml-2 block text-sm text-gray-300">
                {{ $t('property.isFullyFurnished') }}
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300">{{ $t('building.yearBuilt') }}</label>
              <input
                v-model.number="buildingForm.yearBuilt"
                type="number"
                min="1800"
                :max="new Date().getFullYear()"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300">{{ $t('building.amenities') }}</label>
              <textarea
                v-model="buildingForm.amenities"
                rows="2"
                :placeholder="$t('building.amenitiesPlaceholder')"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300">{{ $t('building.facilities') }}</label>
              <textarea
                v-model="buildingForm.facilities"
                rows="2"
                :placeholder="$t('building.facilitiesPlaceholder')"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-white/20 rounded-md text-white hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 disabled:opacity-50 transition-colors"
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
import { ref, computed, onMounted } from 'vue'
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
const filters = ref({
  city: '',
  buildingType: ''
})

// Determine if we're in management mode (authenticated realtor with organization)
const isManagementMode = computed(() => {
  return authStore.isAuthenticated && authStore.hasRole('REALTOR') && organization.value !== null
})

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
  loading.value = true
  error.value = ''
  
  try {
    // If in management mode, load organization buildings
    if (isManagementMode.value) {
      if (!organization.value) {
        await loadOrganization()
      }
      
      if (!organization.value) {
        error.value = 'No organization found. Please register as an agent or create a company.'
        return
      }
      
      const response = await api.get(`/buildings/companies/${organization.value.id}`)
      buildings.value = response.data || []
    } else {
      // Public mode: load all buildings with optional filters
      const params = {}
      if (filters.value.city) {
        params.city = filters.value.city
      }
      if (filters.value.buildingType) {
        params.buildingType = filters.value.buildingType
      }
      
      const response = await api.get('/buildings', { params })
      buildings.value = Array.isArray(response.data) ? response.data : []
    }
  } catch (err) {
    console.error('Failed to load buildings:', err)
    error.value = err.response?.data?.message || 'Failed to load buildings'
    buildings.value = []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = { city: '', buildingType: '' }
  loadBuildings()
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
    PLANNED: 'bg-gray-500/30 text-gray-300',
    UNDER_CONSTRUCTION: 'bg-yellow-500/30 text-yellow-200',
    COMPLETED: 'bg-green-500/30 text-green-200',
    RENOVATION: 'bg-blue-500/30 text-blue-200'
  }
  return colors[status] || 'bg-gray-500/30 text-gray-300'
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

onMounted(async () => {
  // Try to load organization if user is authenticated realtor
  if (authStore.isAuthenticated && authStore.hasRole('REALTOR')) {
    await loadOrganization()
  }
  // Load buildings (will determine mode based on organization)
  await loadBuildings()
})
</script>