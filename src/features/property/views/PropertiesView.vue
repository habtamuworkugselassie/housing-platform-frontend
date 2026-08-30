<template>
  <div class="public-page listing-directory min-h-screen bg-violet-50">
    <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
    <div class="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{{ t('property.propertiesAndBuildings') }}</h1>
        <p class="mt-1 text-sm text-gray-500 sm:text-base">{{ t('property.browsePropertiesBuildings') }}</p>
      </div>
      <p v-if="!loading" class="text-sm font-medium text-gray-500">
        {{ combinedList.length }} {{ combinedList.length === 1 ? 'result' : 'results' }}
      </p>
    </div>

    <!-- Filters toolbar -->
    <div class="mb-6 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div class="flex-1">
          <label for="city" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $t('property.city') }}</label>
          <div class="relative">
            <span class="material-icons pointer-events-none absolute left-3 top-1/2 !text-[18px] -translate-y-1/2 text-gray-400" aria-hidden="true">search</span>
            <input
              id="city"
              v-model="filters.city"
              type="text"
              :placeholder="$t('property.filterByCity')"
              class="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
              @input="loadProperties"
            />
          </div>
        </div>
        <div class="sm:w-52">
          <label for="status" class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $t('property.status') }}</label>
          <select
            id="status"
            v-model="filters.status"
            class="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
            @change="loadProperties"
          >
            <option value="">{{ $t('filters.all') }}</option>
            <option value="AVAILABLE">{{ $t('property.available') }}</option>
            <option value="RESERVED">{{ $t('property.reserved') }}</option>
            <option value="SOLD">{{ $t('property.sold') }}</option>
          </select>
        </div>
        <button
          @click="clearFilters"
          class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-primary-400 hover:bg-primary-50 sm:w-auto"
        >
          <span class="material-icons !text-[16px]" aria-hidden="true">restart_alt</span>
          {{ $t('filters.clearFilters') }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200"></div>
      <p class="mt-4 text-gray-500">{{ $t('filters.loadingProperties') }}</p>
    </div>

    <!-- Properties and Buildings Grid -->
    <div v-else-if="combinedList.length" class="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ListingCard
        v-for="item in combinedList"
        :key="`${item.type}-${item.id}`"
        :item="item"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">{{ $t('property.noPropertiesOrBuildings') }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <nav class="flex space-x-2">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 0"
          class="px-4 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:bg-primary-300"
        >
          {{ $t('common.previous') }}
        </button>
        <span class="px-4 py-2 text-sm text-gray-600">
          {{ $t('common.page') }} {{ currentPage + 1 }} {{ $t('common.of') }} {{ totalPages }}
        </span>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= totalPages - 1"
          class="px-4 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:bg-primary-300"
        >
          {{ $t('common.next') }}
        </button>
      </nav>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api, { mediaUrl } from '@/shared/api/client'
import { formatPrice as formatCurrencyPrice, getVerificationLevel } from '@/shared/utils'
import { ListingCard } from '@/shared/components'
import {
  isPremierListingTier,
  isGoldListingTier,
  listingSortTierRank
} from '@/shared/utils/sponsorshipTier'

const { t } = useI18n()
const route = useRoute()
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
    
    combined.sort((a, b) => {
      const aPriority = a.isSponsored ? listingSortTierRank(a.sponsorshipType) : 100
      const bPriority = b.isSponsored ? listingSortTierRank(b.sponsorshipType) : 100

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

function queryParamString(q) {
  if (q == null) return ''
  const s = Array.isArray(q) ? q[0] : q
  return typeof s === 'string' ? s.trim() : ''
}

function applyFiltersFromRoute() {
  const city = queryParamString(route.query.city)
  const statusRaw = queryParamString(route.query.status).toUpperCase()
  const status =
    statusRaw === 'AVAILABLE' || statusRaw === 'RESERVED' || statusRaw === 'SOLD' ? statusRaw : ''
  filters.value = { city, status }
  currentPage.value = 0
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
  applyFiltersFromRoute()
  loadProperties()
})

watch(
  () => [route.query.city, route.query.status],
  () => {
    applyFiltersFromRoute()
    loadProperties()
  }
)
</script>
