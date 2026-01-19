<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">{{ $t('property.properties') }}</h1>
      <p class="mt-2 text-gray-600">{{ $t('property.browseCollection') }}</p>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        <div class="flex items-end">
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
    <div v-else-if="properties.length" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="property in properties"
        :key="property.id"
        :class="{
          'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer': !property.isSponsored,
          'bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer border-2 border-yellow-400': property.isSponsored && property.sponsorshipType === 'PREMIER',
          'bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer border border-blue-300': property.isSponsored && property.sponsorshipType === 'BASIC'
        }"
        @click="$router.push(`/properties/${property.id}`)"
      >
        <!-- Sponsored Badge -->
        <div v-if="property.isSponsored" class="relative">
          <div
            :class="{
              'bg-yellow-400 text-yellow-900': property.sponsorshipType === 'PREMIER',
              'bg-blue-400 text-blue-900': property.sponsorshipType === 'BASIC'
            }"
            class="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold z-10 shadow-md"
          >
            ⭐ {{ property.sponsorshipType === 'PREMIER' ? 'PREMIER' : 'SPONSORED' }}
          </div>
        </div>
        
        <div class="h-48 bg-gray-200 flex items-center justify-center relative">
          <span v-if="!property.images || property.images.length === 0" class="text-gray-400 text-4xl">🏠</span>
          <img
            v-else
            :src="property.images[0].imageUrl"
            :alt="property.title"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="p-6">
          <div class="flex items-start justify-between mb-2">
            <h3 :class="{
              'text-xl font-semibold text-gray-900': !property.isSponsored,
              'text-xl font-bold text-gray-900': property.isSponsored
            }">{{ property.title }}</h3>
          </div>
          <div class="flex items-center gap-2 mb-2">
            <p :class="{
              'text-2xl font-bold text-primary-600': !property.isSponsored,
              'text-2xl font-extrabold text-primary-700': property.isSponsored
            }">{{ formatPrice(property.priceETB || property.priceUSD, property.priceETB ? 'ETB' : 'USD') }}</p>
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
          <div class="flex items-center text-sm text-gray-500 space-x-4">
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
const pageSize = ref(20)
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
    
    // For public viewing, only show AVAILABLE properties
    if (!filters.value.status) {
      params.status = 'AVAILABLE'
    } else {
      params.status = filters.value.status
    }
    
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
