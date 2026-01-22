<template>
  <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
    <div class="mb-4 sm:mb-6 lg:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ $t('property.properties') }}</h1>
      <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">{{ $t('property.browseCollection') }}</p>
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

    <!-- Properties Grid -->
    <div v-else-if="properties.length" class="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="property in properties"
        :key="property.id"
        :class="{
          'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer': !property.isSponsored,
          'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer border-2 border-yellow-400 ring-2 ring-yellow-200': property.isSponsored && property.sponsorshipType === 'PREMIER',
          'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer border-2 border-blue-300': property.isSponsored && property.sponsorshipType === 'BASIC'
        }"
        @click="$router.push(`/properties/${property.id}`)"
      >
        <!-- Sponsored Badge - Prominent Display -->
        <div v-if="property.isSponsored" class="relative">
          <div
            :class="{
              'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-yellow-900 shadow-2xl': property.sponsorshipType === 'PREMIER',
              'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 text-blue-900 shadow-xl': property.sponsorshipType === 'BASIC'
            }"
            class="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs font-extrabold z-20 flex items-center gap-1 sm:gap-1.5 animate-pulse border-2 border-white"
          >
            <span v-if="property.sponsorshipType === 'PREMIER'" class="text-sm sm:text-base">⭐</span>
            <span v-else class="text-sm sm:text-base">✨</span>
            <span class="hidden sm:inline uppercase tracking-wide">{{ property.sponsorshipType === 'PREMIER' ? 'PREMIER' : 'SPONSORED' }}</span>
            <span class="sm:hidden uppercase">{{ property.sponsorshipType === 'PREMIER' ? 'P' : 'S' }}</span>
          </div>
          <!-- Additional Premier Crown Badge -->
          <div v-if="property.sponsorshipType === 'PREMIER'" class="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
            <div class="bg-yellow-400 text-yellow-900 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-1">
              <span class="text-xs sm:text-sm">👑</span>
              <span class="hidden sm:inline">FEATURED</span>
            </div>
          </div>
        </div>
        
        <div class="h-40 sm:h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
          <span v-if="!property.images || property.images.length === 0" class="text-gray-400 text-4xl">🏠</span>
          <img
            v-else
            :src="property.images[0].imageUrl"
            :alt="property.title"
            :class="{
              'w-full h-full object-cover transition-transform duration-300': true,
              'brightness-110 contrast-110 scale-105 hover:scale-110': property.isSponsored && property.sponsorshipType === 'PREMIER',
              'brightness-105 scale-102 hover:scale-105': property.isSponsored && property.sponsorshipType === 'BASIC'
            }"
          />
          <!-- Sponsored Overlay Gradient - More Prominent -->
          <div 
            v-if="property.isSponsored"
            :class="{
              'absolute inset-0 bg-gradient-to-t from-yellow-400/30 via-yellow-300/10 to-transparent': property.sponsorshipType === 'PREMIER',
              'absolute inset-0 bg-gradient-to-t from-blue-400/25 via-blue-300/10 to-transparent': property.sponsorshipType === 'BASIC'
            }"
          ></div>
          <!-- Premier Glow Effect -->
          <div 
            v-if="property.isSponsored && property.sponsorshipType === 'PREMIER'"
            class="absolute inset-0 bg-gradient-to-r from-yellow-200/20 via-transparent to-amber-200/20 animate-pulse"
          ></div>
        </div>
        <div class="p-4 sm:p-6">
          <div class="flex items-start justify-between mb-2">
            <h3 :class="{
              'text-lg sm:text-xl font-semibold text-gray-900': !property.isSponsored,
              'text-lg sm:text-xl font-extrabold text-gray-900': property.isSponsored && property.sponsorshipType === 'PREMIER',
              'text-lg sm:text-xl font-bold text-gray-900': property.isSponsored && property.sponsorshipType === 'BASIC'
            }" class="flex-1 pr-2">{{ property.title }}</h3>
          </div>
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <div class="flex flex-col gap-1">
              <p v-if="property.priceETB" :class="{
                'text-xl sm:text-2xl font-bold text-primary-600': !property.isSponsored,
                'text-xl sm:text-2xl font-extrabold text-yellow-700': property.isSponsored && property.sponsorshipType === 'PREMIER',
                'text-xl sm:text-2xl font-bold text-blue-700': property.isSponsored && property.sponsorshipType === 'BASIC'
              }">{{ formatPrice(property.priceETB, 'ETB') }}</p>
              <p v-if="property.priceUSD" :class="{
                'text-base sm:text-lg font-semibold text-gray-600': !property.isSponsored,
                'text-base sm:text-lg font-bold text-yellow-600': property.isSponsored && property.sponsorshipType === 'PREMIER',
                'text-base sm:text-lg font-semibold text-blue-600': property.isSponsored && property.sponsorshipType === 'BASIC'
              }">{{ formatPrice(property.priceUSD, 'USD') }}</p>
              <p v-if="!property.priceETB && !property.priceUSD" class="text-base sm:text-lg text-gray-500">
                {{ $t('property.priceNotSet') }}
              </p>
            </div>
            <span v-if="property.category" :class="{
              'bg-blue-100 text-blue-800': property.category === 'FOR_SALE',
              'bg-green-100 text-green-800': property.category === 'FOR_RENTAL'
            }" class="px-2 py-0.5 rounded text-xs font-medium">
              {{ property.category === 'FOR_SALE' ? 'Sale' : 'Rental' }}
            </span>
            <span v-if="property.isFullyFurnished" class="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">
              Furnished
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-2">
            📍 {{ property.city }}, {{ property.country }}
          </p>
          <div v-if="property.constructionPercentage !== null && property.constructionPercentage !== undefined" class="mb-2">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">Construction:</span>
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-primary-600 h-2 rounded-full transition-all"
                  :style="{ width: property.constructionPercentage + '%' }"
                ></div>
              </div>
              <span class="text-xs text-gray-600">{{ property.constructionPercentage }}%</span>
            </div>
          </div>
          <p v-if="property.realEstateCompanyName" class="text-xs text-gray-500 mb-2">
            By {{ property.realEstateCompanyName }}
          </p>
          <div class="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-2 sm:gap-4">
            <span v-if="property.bedrooms">🛏️ {{ property.bedrooms }} beds</span>
            <span v-if="property.bathrooms">🚿 {{ property.bathrooms }} baths</span>
            <span v-if="property.area">📐 {{ property.area }} sqm</span>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <span
              :class="{
                'bg-green-100 text-green-800': property.status === 'AVAILABLE',
                'bg-yellow-100 text-yellow-800': property.status === 'RESERVED',
                'bg-gray-100 text-gray-800': property.status === 'SOLD'
              }"
              class="inline-block px-2 py-1 text-xs font-semibold rounded"
            >
              {{ property.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <p class="text-gray-600">No properties found. Try adjusting your filters.</p>
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
    
    const response = await api.get('/properties', { params })
    properties.value = response.data.content || response.data
    if (response.data.totalPages !== undefined) {
      totalPages.value = response.data.totalPages
    }
  } catch (err) {
    console.error('Failed to load properties:', err)
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
