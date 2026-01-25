<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
    <div class="mb-4 sm:mb-6 lg:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Properties & Buildings</h1>
      <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Browse available properties and buildings</p>
    </div>

    <!-- Filters -->
    <div class="mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700">{{ $t('property.city') }}</label>
          <input
            id="city"
            v-model="filters.city"
            type="text"
            :placeholder="$t('property.filterByCity')"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            @input="loadProperties"
          />
        </div>
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">{{ $t('property.status') }}</label>
          <select
            id="status"
            v-model="filters.status"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            @change="loadProperties"
          >
            <option value="">{{ $t('filters.all') }}</option>
            <option value="AVAILABLE">{{ $t('property.available') }}</option>
            <option value="RESERVED">{{ $t('property.reserved') }}</option>
            <option value="SOLD">{{ $t('property.sold') }}</option>
          </select>
        </div>
        <div class="flex items-end sm:col-span-2 lg:col-span-1">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {{ $t('filters.clearFilters') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="mt-4 text-gray-600">{{ $t('filters.loadingProperties') }}</p>
    </div>

    <!-- Properties and Buildings Grid -->
    <div v-else-if="combinedList.length" class="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="item in combinedList"
        :key="`${item.type}-${item.id}`"
        :class="{
          'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer': !item.isSponsored,
          'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer border-2 border-yellow-400 ring-2 ring-yellow-200': item.isSponsored && item.sponsorshipType === 'PREMIER',
          'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer border-2 border-blue-300': item.isSponsored && item.sponsorshipType === 'BASIC'
        }"
        @click="item.type === 'property' ? $router.push(`/properties/${item.id}`) : $router.push(`/buildings/${item.id}`)"
      >
        <!-- Type Badge (Building) -->
        <div v-if="item.type === 'building'" class="absolute top-2 left-2 z-20">
          <div class="bg-indigo-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-1">
            <span>🏢</span>
            <span>BUILDING</span>
          </div>
        </div>
        
        <!-- Sponsored Badge - Prominent Display -->
        <div v-if="item.isSponsored" class="relative">
          <div
            :class="{
              'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-yellow-900 shadow-2xl': item.sponsorshipType === 'PREMIER',
              'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 text-blue-900 shadow-xl': item.sponsorshipType === 'BASIC'
            }"
            class="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs font-extrabold z-20 flex items-center gap-1 sm:gap-1.5 animate-pulse border-2 border-white"
          >
            <span v-if="item.sponsorshipType === 'PREMIER'" class="text-sm sm:text-base">⭐</span>
            <span v-else class="text-sm sm:text-base">✨</span>
            <span class="hidden sm:inline uppercase tracking-wide">{{ item.sponsorshipType === 'PREMIER' ? 'PREMIER' : 'SPONSORED' }}</span>
            <span class="sm:hidden uppercase">{{ item.sponsorshipType === 'PREMIER' ? 'P' : 'S' }}</span>
          </div>
          <!-- Additional Premier Crown Badge -->
          <div v-if="item.sponsorshipType === 'PREMIER' && item.type === 'property'" class="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
            <div class="bg-yellow-400 text-yellow-900 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-1">
              <span class="text-xs sm:text-sm">👑</span>
              <span class="hidden sm:inline">FEATURED</span>
            </div>
          </div>
        </div>
        
        <div class="h-40 sm:h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
          <span v-if="!item.images && !item.imageUrls" class="text-gray-400 text-4xl">{{ item.type === 'property' ? '🏠' : '🏢' }}</span>
          <img
            v-else
            :src="item.images?.[0]?.imageUrl || item.imageUrls?.[0]"
            :alt="item.title || item.name"
            :class="{
              'w-full h-full object-cover transition-transform duration-300': true,
              'brightness-110 contrast-110 scale-105 hover:scale-110': item.isSponsored && item.sponsorshipType === 'PREMIER',
              'brightness-105 scale-102 hover:scale-105': item.isSponsored && item.sponsorshipType === 'BASIC'
            }"
          />
          <!-- Sponsored Overlay Gradient - More Prominent -->
          <div 
            v-if="item.isSponsored"
            :class="{
              'absolute inset-0 bg-gradient-to-t from-yellow-400/30 via-yellow-300/10 to-transparent': item.sponsorshipType === 'PREMIER',
              'absolute inset-0 bg-gradient-to-t from-blue-400/25 via-blue-300/10 to-transparent': item.sponsorshipType === 'BASIC'
            }"
          ></div>
          <!-- Premier Glow Effect -->
          <div 
            v-if="item.isSponsored && item.sponsorshipType === 'PREMIER'"
            class="absolute inset-0 bg-gradient-to-r from-yellow-200/20 via-transparent to-amber-200/20 animate-pulse"
          ></div>
        </div>
        <div class="p-4 sm:p-6">
          <div class="flex items-start justify-between mb-2">
            <h3 :class="{
              'text-lg sm:text-xl font-semibold text-gray-900': !item.isSponsored,
              'text-lg sm:text-xl font-extrabold text-gray-900': item.isSponsored && item.sponsorshipType === 'PREMIER',
              'text-lg sm:text-xl font-bold text-gray-900': item.isSponsored && item.sponsorshipType === 'BASIC'
            }" class="flex-1 pr-2">{{ item.title || item.name }}</h3>
          </div>
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <!-- Property Price -->
            <div v-if="item.type === 'property'" class="flex flex-col gap-1">
              <p v-if="item.priceETB" :class="{
                'text-xl sm:text-2xl font-bold text-primary-600': !item.isSponsored,
                'text-xl sm:text-2xl font-extrabold text-yellow-700': item.isSponsored && item.sponsorshipType === 'PREMIER',
                'text-xl sm:text-2xl font-bold text-blue-700': item.isSponsored && item.sponsorshipType === 'BASIC'
              }">{{ formatPrice(item.priceETB, 'ETB') }}</p>
              <p v-if="item.priceUSD" :class="{
                'text-base sm:text-lg font-semibold text-gray-600': !item.isSponsored,
                'text-base sm:text-lg font-bold text-yellow-600': item.isSponsored && item.sponsorshipType === 'PREMIER',
                'text-base sm:text-lg font-semibold text-blue-600': item.isSponsored && item.sponsorshipType === 'BASIC'
              }">{{ formatPrice(item.priceUSD, 'USD') }}</p>
              <p v-if="!item.priceETB && !item.priceUSD" class="text-base sm:text-lg text-gray-500">
                {{ $t('property.priceNotSet') }}
              </p>
            </div>
            <!-- Building Units Info -->
            <div v-else class="flex flex-col gap-1">
              <p class="text-xl sm:text-2xl font-bold text-primary-600">{{ item.totalUnits || 0 }} Units</p>
              <p class="text-sm text-gray-600">{{ item.availableUnits || 0 }} Available</p>
            </div>
            <span v-if="item.category" :class="{
              'bg-blue-100 text-blue-800': item.category === 'FOR_SALE',
              'bg-green-100 text-green-800': item.category === 'FOR_RENTAL'
            }" class="px-2 py-0.5 rounded text-xs font-medium">
              {{ item.category === 'FOR_SALE' ? 'Sale' : 'Rental' }}
            </span>
            <span v-if="item.isFullyFurnished" class="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">
              Furnished
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-2">
            📍 {{ item.city }}, {{ item.country }}
          </p>
          <div v-if="item.constructionPercentage !== null && item.constructionPercentage !== undefined" class="mb-2">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">Construction:</span>
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-primary-600 h-2 rounded-full transition-all"
                  :style="{ width: item.constructionPercentage + '%' }"
                ></div>
              </div>
              <span class="text-xs text-gray-600">{{ item.constructionPercentage }}%</span>
            </div>
          </div>
          <div v-if="item.realEstateCompanyName" class="flex items-center gap-2 mb-2">
            <svg class="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span class="text-xs font-semibold text-primary-600">{{ item.realEstateCompanyName }}</span>
          </div>
          <!-- Property Features -->
          <div v-if="item.type === 'property'" class="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-2 sm:gap-4">
            <span v-if="item.bedrooms">🛏️ {{ item.bedrooms }} beds</span>
            <span v-if="item.bathrooms">🚿 {{ item.bathrooms }} baths</span>
            <span v-if="item.area">📐 {{ item.area }} sqm</span>
          </div>
          <!-- Building Features -->
          <div v-else class="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-2 sm:gap-4">
            <span>🏢 {{ item.totalUnits || 0 }} Units</span>
            <span v-if="item.totalFloors">📊 {{ item.totalFloors }} Floors</span>
            <span v-if="item.availableUnits" class="text-green-600 font-semibold">{{ item.availableUnits }} Available</span>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <span
              :class="{
                'bg-green-100 text-green-800': item.status === 'AVAILABLE' || item.status === 'COMPLETED',
                'bg-yellow-100 text-yellow-800': item.status === 'RESERVED' || item.status === 'UNDER_CONSTRUCTION',
                'bg-gray-100 text-gray-800': item.status === 'SOLD' || item.status === 'PLANNED'
              }"
              class="inline-block px-2 py-1 text-xs font-semibold rounded"
            >
              {{ item.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <p class="text-gray-600">No properties or buildings found. Try adjusting your filters.</p>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <nav class="flex space-x-2">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 0"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <span class="px-4 py-2 text-sm text-gray-700">
          Page {{ currentPage + 1 }} of {{ totalPages }}
        </span>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= totalPages - 1"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/shared/api/client'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const properties = ref([])
const buildings = ref([])
const combinedList = ref([])
const loading = ref(false)
const currentPage = ref(0)
const pageSize = ref(20) // Reasonable page size for better performance
const totalPages = ref(0)

const filters = ref({
  city: '',
  status: ''
})

const loadProperties = async () => {
  loading.value = true
  try {
    // Load properties
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    
    if (filters.value.city) {
      params.city = filters.value.city
    }
    
    // Only apply status filter if explicitly set
    // Backend will handle public vs authenticated filtering
    if (filters.value.status) {
      params.status = filters.value.status
    }
    // Don't set default status - let backend decide based on authentication
    
    const propertiesResponse = await api.get('/properties', { params })
    properties.value = propertiesResponse.data.content || propertiesResponse.data || []
    if (propertiesResponse.data.totalPages !== undefined) {
      totalPages.value = propertiesResponse.data.totalPages
    }
    
    // Load buildings
    const buildingsParams = {}
    if (filters.value.city) {
      buildingsParams.city = filters.value.city
    }
    
    try {
      const buildingsResponse = await api.get('/buildings', { params: buildingsParams })
      buildings.value = Array.isArray(buildingsResponse.data) ? buildingsResponse.data : []
    } catch (err) {
      console.error('Failed to load buildings:', err)
      buildings.value = []
    }
    
    // Combine properties and buildings
    const combined = [
      ...properties.value.map(p => ({ ...p, type: 'property' })),
      ...buildings.value.map(b => ({ ...b, type: 'building', title: b.name }))
    ]
    
    // Sort by sponsorship (PREMIER first, then BASIC, then none), then by creation date
    combined.sort((a, b) => {
      // Sponsorship priority (works for both properties and buildings)
      const aPriority = a.isSponsored && a.sponsorshipType === 'PREMIER' ? 0 : 
                       a.isSponsored && a.sponsorshipType === 'BASIC' ? 1 : 2
      const bPriority = b.isSponsored && b.sponsorshipType === 'PREMIER' ? 0 : 
                       b.isSponsored && b.sponsorshipType === 'BASIC' ? 1 : 2
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      
      // Then by creation date (newest first)
      const aDate = new Date(a.createdAt || 0)
      const bDate = new Date(b.createdAt || 0)
      return bDate - aDate
    })
    
    combinedList.value = combined
  } catch (err) {
    console.error('Failed to load properties:', err)
    combinedList.value = []
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.value = { city: '', status: '' }
  currentPage.value = 0
  loadProperties()
}

const changePage = (page) => {
  currentPage.value = page
  loadProperties()
}

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

onMounted(() => {
  loadProperties()
})
</script>
