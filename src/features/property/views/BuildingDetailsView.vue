<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
    <div class="mb-6">
      <button
        @click="$router.back()"
        class="text-white hover:text-yellow-400 font-medium mb-4"
      >
        ← {{ $t('common.back') }}
      </button>
      <h1 class="text-3xl font-bold text-white">{{ building?.name || $t('building.buildingDetails') }}</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-900/40 border border-red-500/30 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-200">{{ error }}</p>
    </div>

    <!-- Building Details -->
    <div v-if="!loading && building" class="space-y-6">
      <!-- Building Info Card -->
      <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-2xl font-semibold text-white">{{ building.name }}</h2>
            <p class="text-sm text-gray-400 mt-1">{{ building.address }}, {{ building.city }}, {{ building.country }}</p>
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
            <label class="text-xs font-medium text-gray-400">{{ $t('building.totalUnits') }}</label>
            <p class="text-lg font-semibold text-white">{{ building.totalUnits }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-400">{{ $t('building.available') }}</label>
            <p class="text-lg font-semibold text-green-400">{{ building.availableUnits || 0 }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-400">{{ $t('building.occupied') }}</label>
            <p class="text-lg font-semibold text-gray-300">{{ building.occupiedUnits || 0 }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-400">{{ $t('building.totalFloors') }}</label>
            <p class="text-lg font-semibold text-white">{{ building.totalFloors }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label class="text-xs font-medium text-gray-400">{{ $t('building.category') }}</label>
            <p class="text-sm mt-1">
              <span :class="{
                'bg-blue-500/30 text-blue-200': building.category === 'FOR_SALE',
                'bg-green-500/30 text-green-200': building.category === 'FOR_RENTAL'
              }" class="px-2 py-1 rounded text-xs font-medium">
                {{ building.category === 'FOR_SALE' ? $t('common.forSale') : $t('common.forRental') }}
              </span>
            </p>
          </div>
          <div v-if="building.constructionPercentage !== null && building.constructionPercentage !== undefined">
            <label class="text-xs font-medium text-gray-400">{{ $t('building.constructionProgress') }}</label>
            <div class="mt-1">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-white/20 rounded-full h-2">
                  <div 
                    class="bg-yellow-400 h-2 rounded-full transition-all"
                    :style="{ width: building.constructionPercentage + '%' }"
                  ></div>
                </div>
                <span class="text-xs text-gray-400">{{ building.constructionPercentage }}%</span>
              </div>
            </div>
          </div>
          <div v-if="building.isFullyFurnished">
            <label class="text-xs font-medium text-gray-400">{{ $t('building.furnishing') }}</label>
            <p class="text-sm mt-1">
              <span class="px-2 py-1 bg-purple-500/30 text-purple-200 rounded text-xs font-medium">{{ $t('common.fullyFurnished') }}</span>
            </p>
          </div>
        </div>

        <div v-if="building.description" class="mt-4">
          <label class="text-sm font-medium text-gray-400">{{ $t('property.description') }}</label>
          <p class="text-sm text-white mt-1">{{ building.description }}</p>
        </div>

        <div v-if="building.amenities" class="mt-4">
          <label class="text-sm font-medium text-gray-400">{{ $t('building.amenities') }}</label>
          <p class="text-sm text-white mt-1">{{ building.amenities }}</p>
        </div>

        <div v-if="building.facilities" class="mt-4">
          <label class="text-sm font-medium text-gray-400">{{ $t('building.facilities') }}</label>
          <p class="text-sm text-white mt-1">{{ building.facilities }}</p>
        </div>

        <div v-if="building.yearBuilt" class="mt-4">
          <label class="text-sm font-medium text-gray-400">{{ $t('building.yearBuilt') }}</label>
          <p class="text-sm text-white mt-1">{{ building.yearBuilt }}</p>
        </div>
      </div>

      <!-- Map Section -->
      <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 mb-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
        <h3 class="text-xl font-semibold text-white mb-4">{{ $t('building.locationMap') }}</h3>
        <div class="bg-white/10 rounded-lg overflow-hidden" style="height: 400px; position: relative;">
          <!-- Map Placeholder (Replace with actual map library like Leaflet or Google Maps) -->
          <div class="h-full w-full relative bg-white/5">
            <!-- Map Background Pattern -->
            <div class="absolute inset-0 opacity-20" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
            
            <!-- Map Title -->
            <div class="absolute top-4 left-4 z-10 bg-zinc-900 border border-white/10 px-4 py-2 rounded-lg">
              <h4 class="text-sm font-semibold text-white">{{ building.city }}{{ building.country ? `, ${building.country}` : '' }}</h4>
              <p class="text-xs text-gray-400 mt-1">{{ building.address }}</p>
            </div>

            <!-- Building Marker -->
            <div
              class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
              style="transform: translate(-50%, -50%);"
            >
              <!-- Marker Pin -->
              <div class="bg-yellow-500 text-black px-4 py-2 rounded-lg border-2 border-white">
                <div class="flex flex-col items-center">
                  <svg class="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-xs font-bold">{{ building.name }}</span>
                  <span class="text-xs font-semibold mt-1">{{ building.totalUnits || 0 }} Units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Company Information Section -->
      <div v-if="company" class="bg-zinc-900 border border-white/10 rounded-lg p-6 mb-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
        <h3 class="text-xl font-semibold text-white mb-4">Real Estate Company</h3>
        <div class="bg-white/5 rounded-lg p-6 border border-white/10">
          <h4 class="text-lg font-semibold text-white mb-3">{{ company.name }}</h4>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="company.email">
              <dt class="text-sm font-medium text-gray-400 mb-1">Email:</dt>
              <dd class="text-sm text-white">
                <a :href="`mailto:${company.email}`" class="text-yellow-400 hover:underline">{{ company.email }}</a>
              </dd>
            </div>
            <div v-if="company.phoneNumber">
              <dt class="text-sm font-medium text-gray-400 mb-1">Phone:</dt>
              <dd class="text-sm text-white">
                <a :href="`tel:${company.phoneNumber}`" class="text-yellow-400 hover:underline">{{ company.phoneNumber }}</a>
              </dd>
            </div>
            <div v-if="company.address" class="md:col-span-2">
              <dt class="text-sm font-medium text-gray-400 mb-1">Address:</dt>
              <dd class="text-sm text-white">{{ company.address }}{{ company.city ? `, ${company.city}` : '' }}{{ company.country ? `, ${company.country}` : '' }}</dd>
            </div>
            <div v-if="company.website" class="md:col-span-2">
              <dt class="text-sm font-medium text-gray-400 mb-1">Website:</dt>
              <dd class="text-sm text-white">
                <a :href="company.website" target="_blank" rel="noopener noreferrer" class="text-yellow-400 hover:underline">{{ company.website }}</a>
              </dd>
            </div>
          </dl>
          <p v-if="company.description" class="mt-4 text-sm text-gray-300">{{ company.description }}</p>
        </div>
      </div>

      <!-- Financing Offers Section -->
      <div v-if="financingOffers.length" class="bg-zinc-900 border border-white/10 rounded-lg p-6 mb-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
        <h3 class="text-xl font-semibold text-white mb-4">{{ $t('property.financingOptions') }}</h3>
        <div class="space-y-4">
          <div
            v-for="offer in financingOffers"
            :key="offer.id"
            class="bg-white/5 rounded-lg p-6 border border-white/10 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h4 class="text-lg font-semibold text-white">{{ offer.creditProductName || 'Financing Offer' }}</h4>
                  <span class="px-2 py-1 bg-green-500/30 text-green-200 rounded text-xs font-medium">
                    {{ $t('banking.active') }}
                  </span>
                </div>
                <p v-if="offer.creditProductDescription" class="text-sm text-gray-300 mb-3">{{ offer.creditProductDescription }}</p>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div v-if="offer.interestRate || offer.specialInterestRate">
                    <label class="text-xs font-medium text-gray-400">{{ $t('loan.interestRate') }}</label>
                    <p class="text-lg font-bold text-yellow-400 mt-1">
                      {{ (offer.specialInterestRate || offer.interestRate) }}%
                    </p>
                  </div>
                  <div v-if="offer.maxLoanAmount">
                    <label class="text-xs font-medium text-gray-400">{{ $t('loan.maxLoanAmount') }}</label>
                    <p class="text-sm font-semibold text-white mt-1">{{ formatPrice(offer.maxLoanAmount, offer.currency || 'ETB') }}</p>
                  </div>
                  <div v-if="offer.maxTenureMonths">
                    <label class="text-xs font-medium text-gray-400">{{ $t('loan.maxTenure') }}</label>
                    <p class="text-sm font-semibold text-white mt-1">{{ offer.maxTenureMonths }} {{ $t('loan.tenureMonths') }}</p>
                  </div>
                  <div v-if="offer.maxLoanToValueRatio">
                    <label class="text-xs font-medium text-gray-400">{{ $t('loan.ltvRatio') }}</label>
                    <p class="text-sm font-semibold text-white mt-1">{{ (offer.maxLoanToValueRatio * 100).toFixed(0) }}%</p>
                  </div>
                </div>
                
                <div v-if="offer.specialTerms" class="mt-3 p-3 bg-white/5 rounded border border-white/10">
                  <label class="text-xs font-medium text-gray-400">{{ $t('loan.specialTerms') }}</label>
                  <p class="text-sm text-gray-300 mt-1">{{ offer.specialTerms }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Units Section -->
      <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-white">Units ({{ units.length }})</h3>
          <router-link
            v-if="authStore.hasRole('REALTOR')"
            :to="`/submit-property?buildingId=${building.id}`"
            class="px-4 py-2 bg-white text-black rounded-lg hover:bg-yellow-400 text-sm transition-colors"
          >
            + Add Unit
          </router-link>
        </div>

        <div v-if="unitsLoading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
        </div>

        <div v-else-if="units.length === 0" class="text-center py-8 text-gray-400">
          <p>No units in this building yet</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="unit in units"
            :key="unit.id"
            @click="$router.push(`/properties/${unit.id}`)"
            class="border border-white/10 rounded-lg p-4 hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors cursor-pointer"
          >
            <div class="flex items-start justify-between mb-2">
              <h4 class="font-semibold text-white">{{ unit.title }}</h4>
              <span :class="[
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                getPropertyStatusColor(unit.status)
              ]">
                {{ unit.status }}
              </span>
            </div>
            
            <p v-if="unit.unitNumber" class="text-xs text-gray-400 mb-2">Unit: {{ unit.unitNumber }}</p>
            <div class="flex flex-col gap-1">
              <p v-if="unit.priceETB" class="text-lg font-bold text-yellow-400">
                {{ formatPrice(unit.priceETB, 'ETB') }}
                <span v-if="unit.category === 'FOR_RENTAL'" class="text-sm text-gray-400 font-normal">/month</span>
              </p>
              <p v-if="unit.priceUSD" class="text-base font-semibold text-gray-300">
                {{ formatPrice(unit.priceUSD, 'USD') }}
                <span v-if="unit.category === 'FOR_RENTAL'" class="text-xs text-gray-400 font-normal">/month</span>
              </p>
            </div>
            
            <div class="mt-2 flex gap-4 text-xs text-gray-400">
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
const company = ref(null)

const loadBuilding = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get(`/buildings/${route.params.id}`)
    building.value = response.data
    units.value = response.data.units || []
    
    // Load company information if available
    if (building.value.realEstateCompanyId) {
      try {
        const companyResponse = await api.get(`/organizations/${building.value.realEstateCompanyId}`)
        company.value = companyResponse.data
      } catch (err) {
        console.error('Failed to load company:', err)
      }
    }
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
    PLANNED: 'bg-gray-500/30 text-gray-300',
    UNDER_CONSTRUCTION: 'bg-yellow-500/30 text-yellow-200',
    COMPLETED: 'bg-green-500/30 text-green-200',
    RENOVATION: 'bg-blue-500/30 text-blue-200'
  }
  return colors[status] || 'bg-gray-500/30 text-gray-300'
}

const getPropertyStatusColor = (status) => {
  const colors = {
    AVAILABLE: 'bg-green-500/30 text-green-200',
    SOLD: 'bg-red-500/30 text-red-200',
    RESERVED: 'bg-yellow-500/30 text-yellow-200',
    WITHDRAWN: 'bg-gray-500/30 text-gray-300'
  }
  return colors[status] || 'bg-gray-500/30 text-gray-300'
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