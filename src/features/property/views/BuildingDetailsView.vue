<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6">
      <button
        @click="$router.back()"
        class="text-primary-600 hover:text-primary-700 font-medium mb-4"
      >
        ← Back
      </button>
      <h1 class="text-3xl font-bold text-gray-900">{{ building?.name || 'Building Details' }}</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-800">{{ error }}</p>
    </div>

    <!-- Building Details -->
    <div v-if="!loading && building" class="space-y-6">
      <!-- Building Info Card -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-2xl font-semibold text-gray-900">{{ building.name }}</h2>
            <p class="text-sm text-gray-600 mt-1">{{ building.address }}, {{ building.city }}, {{ building.country }}</p>
          </div>
          <span :class="[
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            getStatusColor(building.status)
          ]">
            {{ building.status }}
          </span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <label class="text-xs font-medium text-gray-500">Total Units</label>
            <p class="text-lg font-semibold text-gray-900">{{ building.totalUnits }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500">Available</label>
            <p class="text-lg font-semibold text-green-600">{{ building.availableUnits || 0 }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500">Occupied</label>
            <p class="text-lg font-semibold text-gray-600">{{ building.occupiedUnits || 0 }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500">Total Floors</label>
            <p class="text-lg font-semibold text-gray-900">{{ building.totalFloors }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label class="text-xs font-medium text-gray-500">Category</label>
            <p class="text-sm text-gray-900 mt-1">
              <span :class="{
                'bg-blue-100 text-blue-800': building.category === 'FOR_SALE',
                'bg-green-100 text-green-800': building.category === 'FOR_RENTAL'
              }" class="px-2 py-1 rounded text-xs font-medium">
                {{ building.category === 'FOR_SALE' ? 'For Sale' : 'For Rental' }}
              </span>
            </p>
          </div>
          <div v-if="building.constructionPercentage !== null && building.constructionPercentage !== undefined">
            <label class="text-xs font-medium text-gray-500">Construction Progress</label>
            <div class="mt-1">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-primary-600 h-2 rounded-full transition-all"
                    :style="{ width: building.constructionPercentage + '%' }"
                  ></div>
                </div>
                <span class="text-xs text-gray-600">{{ building.constructionPercentage }}%</span>
              </div>
            </div>
          </div>
          <div v-if="building.isFullyFurnished">
            <label class="text-xs font-medium text-gray-500">Furnishing</label>
            <p class="text-sm text-gray-900 mt-1">
              <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">Fully Furnished</span>
            </p>
          </div>
        </div>

        <div v-if="building.description" class="mt-4">
          <label class="text-sm font-medium text-gray-700">Description</label>
          <p class="text-sm text-gray-900 mt-1">{{ building.description }}</p>
        </div>

        <div v-if="building.amenities" class="mt-4">
          <label class="text-sm font-medium text-gray-700">Amenities</label>
          <p class="text-sm text-gray-900 mt-1">{{ building.amenities }}</p>
        </div>

        <div v-if="building.facilities" class="mt-4">
          <label class="text-sm font-medium text-gray-700">Facilities</label>
          <p class="text-sm text-gray-900 mt-1">{{ building.facilities }}</p>
        </div>

        <div v-if="building.yearBuilt" class="mt-4">
          <label class="text-sm font-medium text-gray-700">Year Built</label>
          <p class="text-sm text-gray-900 mt-1">{{ building.yearBuilt }}</p>
        </div>
      </div>

      <!-- Financing Offers Section -->
      <div v-if="financingOffers.length" class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">{{ $t('property.financingOptions') }}</h3>
        <div class="space-y-4">
          <div
            v-for="offer in financingOffers"
            :key="offer.id"
            class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h4 class="text-lg font-semibold text-gray-900">{{ offer.creditProductName || 'Financing Offer' }}</h4>
                  <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    {{ $t('banking.active') }}
                  </span>
                </div>
                <p v-if="offer.creditProductDescription" class="text-sm text-gray-700 mb-3">{{ offer.creditProductDescription }}</p>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div v-if="offer.interestRate || offer.specialInterestRate">
                    <label class="text-xs font-medium text-gray-500">{{ $t('loan.interestRate') }}</label>
                    <p class="text-lg font-bold text-primary-600 mt-1">
                      {{ (offer.specialInterestRate || offer.interestRate) }}%
                    </p>
                  </div>
                  <div v-if="offer.maxLoanAmount">
                    <label class="text-xs font-medium text-gray-500">{{ $t('loan.maxLoanAmount') }}</label>
                    <p class="text-sm font-semibold text-gray-900 mt-1">{{ formatPrice(offer.maxLoanAmount, offer.currency || 'ETB') }}</p>
                  </div>
                  <div v-if="offer.maxTenureMonths">
                    <label class="text-xs font-medium text-gray-500">{{ $t('loan.maxTenure') }}</label>
                    <p class="text-sm font-semibold text-gray-900 mt-1">{{ offer.maxTenureMonths }} {{ $t('loan.tenureMonths') }}</p>
                  </div>
                  <div v-if="offer.maxLoanToValueRatio">
                    <label class="text-xs font-medium text-gray-500">{{ $t('loan.ltvRatio') }}</label>
                    <p class="text-sm font-semibold text-gray-900 mt-1">{{ (offer.maxLoanToValueRatio * 100).toFixed(0) }}%</p>
                  </div>
                </div>
                
                <div v-if="offer.specialTerms" class="mt-3 p-3 bg-white rounded border border-blue-100">
                  <label class="text-xs font-medium text-gray-500">{{ $t('loan.specialTerms') }}</label>
                  <p class="text-sm text-gray-700 mt-1">{{ offer.specialTerms }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Units Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-900">Units ({{ units.length }})</h3>
          <router-link
            v-if="authStore.hasRole('REALTOR')"
            :to="`/submit-property?buildingId=${building.id}`"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
          >
            + Add Unit
          </router-link>
        </div>

        <div v-if="unitsLoading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>

        <div v-else-if="units.length === 0" class="text-center py-8 text-gray-500">
          <p>No units in this building yet</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="unit in units"
            :key="unit.id"
            @click="$router.push(`/properties/${unit.id}`)"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex items-start justify-between mb-2">
              <h4 class="font-semibold text-gray-900">{{ unit.title }}</h4>
              <span :class="[
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                getPropertyStatusColor(unit.status)
              ]">
                {{ unit.status }}
              </span>
            </div>
            
            <p v-if="unit.unitNumber" class="text-xs text-gray-500 mb-2">Unit: {{ unit.unitNumber }}</p>
            <p class="text-lg font-bold text-primary-600">
              {{ formatPrice(unit.priceETB || unit.priceUSD, unit.priceETB ? 'ETB' : 'USD') }}
              <span v-if="unit.category === 'FOR_RENTAL'" class="text-sm text-gray-500 font-normal">/month</span>
            </p>
            
            <div class="mt-2 flex gap-4 text-xs text-gray-600">
              <span v-if="unit.bedrooms">{{ unit.bedrooms }} bed</span>
              <span v-if="unit.bathrooms">{{ unit.bathrooms }} bath</span>
              <span v-if="unit.area">{{ unit.area }} m²</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const unitsLoading = ref(false)
const error = ref('')
const building = ref(null)
const units = ref([])
const financingOffers = ref([])

const loadBuilding = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get(`/buildings/${route.params.id}`)
    building.value = response.data
    units.value = response.data.units || []
  } catch (err) {
    console.error('Failed to load building:', err)
    error.value = err.response?.data?.message || 'Failed to load building'
  } finally {
    loading.value = false
  }
}

const loadUnits = async () => {
  unitsLoading.value = true
  try {
    const response = await api.get(`/buildings/${route.params.id}/units`)
    units.value = response.data
  } catch (err) {
    console.error('Failed to load units:', err)
  } finally {
    unitsLoading.value = false
  }
}

const loadFinancingOffers = async () => {
  try {
    const response = await api.get(`/buildings/${route.params.id}/financing-offers`)
    financingOffers.value = response.data || []
  } catch (err) {
    console.error('Failed to load financing offers:', err)
  }
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

const getPropertyStatusColor = (status) => {
  const colors = {
    AVAILABLE: 'bg-green-100 text-green-800',
    SOLD: 'bg-red-100 text-red-800',
    RESERVED: 'bg-yellow-100 text-yellow-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

onMounted(() => {
  loadBuilding()
  loadUnits()
  loadFinancingOffers()
})
</script>