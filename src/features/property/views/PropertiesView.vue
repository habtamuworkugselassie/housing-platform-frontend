<template>
  <div class="public-page listing-directory min-h-screen">
    <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
    <div class="mb-4 sm:mb-6 lg:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ t('property.propertiesAndBuildings') }}</h1>
      <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-400">{{ t('property.browsePropertiesBuildings') }}</p>
    </div>

    <!-- Filters -->
    <div class="mb-4 sm:mb-6 bg-zinc-900 border border-white/10 p-3 sm:p-4 rounded-lg">
      <div class="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label for="city" class="block text-sm font-medium text-gray-300">{{ $t('property.city') }}</label>
          <input
            id="city"
            v-model="filters.city"
            type="text"
            :placeholder="$t('property.filterByCity')"
            class="mt-1 block w-full border border-white/20 bg-white/5 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            @input="loadProperties"
          />
        </div>
        <div>
          <label for="status" class="block text-sm font-medium text-gray-300">{{ $t('property.status') }}</label>
          <select
            id="status"
            v-model="filters.status"
            class="mt-1 block w-full border border-white/20 bg-white/5 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
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
            class="w-full px-4 py-2 rounded-md text-sm font-medium bg-white text-black hover:bg-primary-100"
          >
            {{ $t('filters.clearFilters') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white/15"></div>
      <p class="mt-4 text-gray-400">{{ $t('filters.loadingProperties') }}</p>
    </div>

    <!-- Properties and Buildings Grid -->
    <div v-else-if="combinedList.length" class="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="item in combinedList"
        :key="`${item.type}-${item.id}`"
        :class="{
          'bg-zinc-900 border border-white/10 rounded-lg overflow-hidden transition-all cursor-pointer hover:border-primary-400/60 hover:bg-primary-900/20': !item.isSponsored,
          'bg-zinc-900 border-2 border-gold-400/70 rounded-lg overflow-hidden transition-all cursor-pointer hover:bg-primary-900/20': item.isSponsored && isPremierListingTier(item.sponsorshipType),
          'bg-zinc-900 border-2 border-blue-400/60 rounded-lg overflow-hidden transition-all cursor-pointer hover:border-primary-400/60 hover:bg-primary-900/20': item.isSponsored && isGoldListingTier(item.sponsorshipType)
        }"
        @click="item.type === 'property' ? $router.push(`/properties/${item.id}`) : $router.push(`/buildings/${item.id}`)"
      >
        <!-- Type Badge (Building) -->
        <div v-if="item.type === 'building'" class="absolute top-2 left-2 z-20">
          <div class="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg ring-1 ring-white/40 flex items-center gap-1">
            <span class="material-icons !text-[14px] leading-none" aria-hidden="true">apartment</span>
            <span>{{ $t('common.buildingBadge') }}</span>
          </div>
        </div>
        
        <!-- Sponsored Badge - Prominent Display -->
        <div v-if="item.isSponsored" class="relative">
          <div
            :class="{
              'bg-primary-950 text-gold-300 shadow-lg': isPremierListingTier(item.sponsorshipType),
              'bg-gold-400 text-primary-950 shadow-lg': isGoldListingTier(item.sponsorshipType)
            }"
            class="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs font-extrabold z-20 flex items-center gap-1 sm:gap-1.5 ring-1 ring-white/40"
          >
            <span class="material-icons !text-[14px] leading-none" aria-hidden="true">star</span>
            <span class="hidden sm:inline uppercase tracking-wide">{{ isPremierListingTier(item.sponsorshipType) ? $t('property.premier') : (isGoldListingTier(item.sponsorshipType) ? 'GOLD' : $t('property.sponsored')) }}</span>
            <span class="sm:hidden uppercase">{{ isPremierListingTier(item.sponsorshipType) ? 'P' : 'S' }}</span>
          </div>
        </div>
        
        <div class="h-40 sm:h-48 bg-zinc-800 flex items-center justify-center relative overflow-hidden">
          <span v-if="!item.images && !item.imageUrls" class="material-icons text-gray-500 !text-5xl" aria-hidden="true">{{ item.type === 'property' ? 'home' : 'apartment' }}</span>
          <img
            v-else
            :src="mediaUrl(item.images?.[0]?.imageUrl || item.imageUrls?.[0])"
            :alt="item.title || item.name"
            :class="{
              'w-full h-full object-cover transition-transform duration-300': true,
              'brightness-110 contrast-110 scale-105 hover:scale-110': item.isSponsored && isPremierListingTier(item.sponsorshipType),
              'brightness-105 scale-102 hover:scale-105': item.isSponsored && isGoldListingTier(item.sponsorshipType)
            }"
          />
          <!-- Sponsored Overlay Gradient - More Prominent -->
          <div 
            v-if="item.isSponsored"
            :class="{
              'absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent': isPremierListingTier(item.sponsorshipType),
              'absolute inset-0 bg-gradient-to-t from-blue-400/25 via-blue-300/10 to-transparent': isGoldListingTier(item.sponsorshipType)
            }"
          ></div>
        </div>
        <div class="p-4 sm:p-6">
          <div class="flex items-start justify-between mb-2 gap-2 flex-wrap">
            <h3 class="flex-1 min-w-0 text-lg sm:text-xl font-semibold text-white flex items-center gap-2 flex-wrap">
              {{ item.title || item.name }}
              <VerifiedBadge :level="getVerificationLevel(item)" size="sm" />
            </h3>
          </div>
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <!-- Property Price -->
            <div v-if="item.type === 'property'" class="flex flex-col gap-1">
              <p v-if="item.priceETB" class="text-xl sm:text-2xl font-bold text-gold-300">{{ formatPrice(item.priceETB, 'ETB') }}</p>
              <p v-if="item.priceUSD" class="text-base sm:text-lg font-semibold text-gray-400">{{ formatPrice(item.priceUSD, 'USD') }}</p>
              <p v-if="!item.priceETB && !item.priceUSD" class="text-base sm:text-lg text-gray-500">
                {{ $t('property.priceNotSet') }}
              </p>
            </div>
            <!-- Building Units Info -->
            <div v-else class="flex flex-col gap-1">
              <p class="text-xl sm:text-2xl font-bold text-gold-300">{{ item.totalUnits || 0 }} {{ $t('property.unitsCount') }}</p>
              <p class="text-sm text-gray-400">{{ item.availableUnits || 0 }} {{ $t('property.availableCount') }}</p>
            </div>
            <span v-if="item.category" :class="{
              'bg-blue-500/30 text-blue-200': item.category === 'FOR_SALE',
              'bg-green-500/30 text-green-200': item.category === 'FOR_RENTAL'
            }" class="px-2 py-0.5 rounded text-xs font-medium">
              {{ item.category === 'FOR_SALE' ? $t('property.saleShort') : $t('property.rentalShort') }}
            </span>
            <span v-if="item.isFullyFurnished" class="px-2 py-0.5 bg-purple-500/30 text-purple-200 rounded text-xs font-medium">
              {{ $t('property.furnished') }}
            </span>
          </div>
          <p class="text-sm text-gray-400 mb-2">
            <span class="material-icons !text-[15px] leading-none align-[-2px]" aria-hidden="true">location_on</span> {{ item.city }}, {{ item.country }}
          </p>
          <div v-if="item.constructionPercentage !== null && item.constructionPercentage !== undefined" class="mb-2">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">{{ $t('property.constructionLabel') }}:</span>
              <div class="flex-1 bg-zinc-700 rounded-full h-2">
                <div 
                  class="bg-violet-950 h-2 rounded-full transition-all"
                  :style="{ width: item.constructionPercentage + '%' }"
                ></div>
              </div>
              <span class="text-xs text-gray-400">{{ item.constructionPercentage }}%</span>
            </div>
          </div>
          <div v-if="item.realEstateCompanyName" class="flex items-center gap-2 mb-2 flex-wrap">
            <svg class="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            <span class="text-xs font-semibold text-gray-200">{{ item.realEstateCompanyName }}</span>
          </div>
          <!-- Property Features -->
          <div v-if="item.type === 'property'" class="flex flex-wrap items-center text-xs sm:text-sm text-gray-400 gap-2 sm:gap-4">
            <span v-if="item.bedrooms"><span class="material-icons !text-[15px] leading-none align-[-2px]" aria-hidden="true">bed</span> {{ item.bedrooms }} {{ $t('property.beds') }}</span>
            <span v-if="item.bathrooms"><span class="material-icons !text-[15px] leading-none align-[-2px]" aria-hidden="true">shower</span> {{ item.bathrooms }} {{ $t('property.baths') }}</span>
            <span v-if="item.area"><span class="material-icons !text-[15px] leading-none align-[-2px]" aria-hidden="true">square_foot</span> {{ item.area }} {{ $t('property.areaUnit') }}</span>
          </div>
          <!-- Building Features -->
          <div v-else class="flex flex-wrap items-center text-xs sm:text-sm text-gray-400 gap-2 sm:gap-4">
            <span><span class="material-icons !text-[15px] leading-none align-[-2px]" aria-hidden="true">apartment</span> {{ item.totalUnits || 0 }} {{ $t('property.unitsCount') }}</span>
            <span v-if="item.totalFloors"><span class="material-icons !text-[15px] leading-none align-[-2px]" aria-hidden="true">layers</span> {{ item.totalFloors }} {{ $t('building.floorsLabel') }}</span>
            <span v-if="item.availableUnits" class="text-green-400 font-semibold">{{ item.availableUnits }} {{ $t('property.availableCount') }}</span>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <span
              :class="{
                'bg-green-500/30 text-green-200': item.status === 'AVAILABLE' || item.status === 'COMPLETED',
                'bg-primary-500/30 text-primary-200': item.status === 'RESERVED' || item.status === 'UNDER_CONSTRUCTION',
                'bg-gray-500/30 text-gray-300': item.status === 'SOLD' || item.status === 'PLANNED'
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
      <p class="text-gray-400">{{ $t('property.noPropertiesOrBuildings') }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <nav class="flex space-x-2">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 0"
          class="px-4 py-2 rounded-md text-sm font-medium bg-white text-black hover:bg-primary-100 disabled:opacity-50 disabled:bg-white/50"
        >
          {{ $t('common.previous') }}
        </button>
        <span class="px-4 py-2 text-sm text-gray-300">
          {{ $t('common.page') }} {{ currentPage + 1 }} {{ $t('common.of') }} {{ totalPages }}
        </span>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= totalPages - 1"
          class="px-4 py-2 rounded-md text-sm font-medium bg-white text-black hover:bg-primary-100 disabled:opacity-50 disabled:bg-white/50"
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
import { VerifiedBadge } from '@/shared/components'
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
