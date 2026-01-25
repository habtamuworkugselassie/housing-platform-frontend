<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Ad Space under NavBar - PREMIER Sponsored Properties (Two Side by Side) -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <AdSpace 
          v-if="currentPremierAds && currentPremierAds.length > 0"
          size="banner" 
          :ad-contents="currentPremierAds"
        />
        <AdSpace v-else size="banner" />
      </div>
    </div>

    <!-- Top Search Bar with Filters -->
    <div class="bg-white shadow-sm border-b sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <!-- Search Filters -->
          <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <!-- Service Type Filter -->
            <div class="relative flex-1 sm:flex-none">
              <select
                v-model="filters.serviceType"
                class="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="">{{ $t('home.serviceType') }}</option>
                <option value="rental">{{ $t('home.rental') }}</option>
                <option value="sale">{{ $t('home.sale') }}</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            <!-- Location Filter -->
            <div class="relative flex-1 sm:flex-none">
              <select
                v-model="filters.location"
                class="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="">{{ $t('home.location') }}</option>
                <option value="Bole">Bole</option>
                <option value="Megenagna">Megenagna</option>
                <option value="Addis Ababa">Addis Ababa</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            <!-- Price Filter -->
            <div class="relative flex-1 sm:flex-none">
              <select
                v-model="filters.priceRange"
                class="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="">{{ $t('home.priceRange') }}</option>
                <option value="0-5000">ብ0 - ብ5,000</option>
                <option value="5000-10000">ብ5,000 - ብ10,000</option>
                <option value="10000-20000">ብ10,000 - ብ20,000</option>
                <option value="20000+">ብ20,000+</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            <!-- Instant Booking Toggle -->
            <label class="flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                v-model="filters.instantBooking"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-xs sm:text-sm text-gray-700">{{ $t('home.instantBooking') }}</span>
            </label>

            <!-- Free Cancellation Toggle -->
            <label class="flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                v-model="filters.freeCancellation"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-xs sm:text-sm text-gray-700">{{ $t('home.freeCancellation') }}</span>
            </label>

            <!-- Clear Filters Button -->
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
            >
              {{ $t('filters.clearFilters') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content: Property List in Two Columns -->
    <div class="min-h-[calc(100vh-88px)] sm:min-h-[calc(100vh-120px)] bg-white">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <!-- Loading State -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div v-for="i in 4" :key="i" class="bg-gray-200 animate-pulse rounded-xl h-96"></div>
        </div>

        <!-- Combined Property and Building Cards in Two Columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div
            v-for="item in combinedList"
            :key="`${item.type}-${item.id}`"
            :data-property-id="item.type === 'property' ? item.id : null"
            :data-building-id="item.type === 'building' ? item.id : null"
            @click="item.type === 'property' ? selectProperty(item) : selectBuilding(item)"
            :class="[
              'rounded-xl shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden border-2',
              item.isSponsored && item.sponsorshipType === 'PREMIER' 
                ? 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-yellow-400 shadow-lg' 
                : item.isSponsored && item.sponsorshipType === 'BASIC'
                ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-300 shadow-md'
                : 'bg-white border-gray-100'
            ]"
          >
            <!-- Sponsored Badge - Prominent Display -->
            <div v-if="item.isSponsored" class="relative">
              <div
                :class="{
                  'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-yellow-900 shadow-2xl': item.sponsorshipType === 'PREMIER',
                  'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 text-blue-900 shadow-xl': item.sponsorshipType === 'BASIC'
                }"
                class="absolute top-3 right-3 px-4 py-2 rounded-full text-xs font-extrabold z-20 flex items-center gap-1.5 animate-pulse border-2 border-white"
              >
                <span v-if="item.sponsorshipType === 'PREMIER'" class="text-base">⭐</span>
                <span v-else class="text-base">✨</span>
                <span class="uppercase tracking-wide">{{ item.sponsorshipType === 'PREMIER' ? 'PREMIER' : 'SPONSORED' }}</span>
              </div>
              <!-- Additional Premier Crown Badge -->
              <div v-if="item.sponsorshipType === 'PREMIER'" class="absolute top-3 left-3 z-20">
                <div class="bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-1">
                  <span>👑</span>
                  <span>FEATURED</span>
                </div>
              </div>
            </div>
            
            <!-- Building Type Badge (for non-sponsored buildings) -->
            <div v-if="item.type === 'building' && !item.isSponsored" class="absolute top-3 left-3 z-20">
              <div class="bg-indigo-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-1">
                <span>🏢</span>
                <span>BUILDING</span>
              </div>
            </div>
            
            <!-- Property/Building Image -->
            <div class="relative h-48 sm:h-56 md:h-64 bg-gray-200 overflow-hidden">
              <img
                v-if="(item.images && item.images.length > 0) || (item.imageUrls && item.imageUrls.length > 0)"
                :src="item.images?.[0]?.imageUrl || item.imageUrls?.[0]"
                :alt="item.title || item.name"
                :class="{
                  'w-full h-full object-cover transition-transform duration-300': true,
                  'brightness-110 contrast-110 scale-105 hover:scale-110': item.isSponsored && item.sponsorshipType === 'PREMIER',
                  'brightness-105 scale-102 hover:scale-105': item.isSponsored && item.sponsorshipType === 'BASIC'
                }"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <svg v-if="item.type === 'property'" class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <svg v-else class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1m-1 4h1m4 0h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
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
              <!-- Price Badge (for properties) or Units Badge (for buildings) -->
              <div 
                v-if="item.type === 'property' && item.priceETB"
                :class="{
                  'bg-white': !item.isSponsored,
                  'bg-yellow-100 border-2 border-yellow-400 shadow-xl': item.isSponsored && item.sponsorshipType === 'PREMIER',
                  'bg-blue-100 border-2 border-blue-400 shadow-lg': item.isSponsored && item.sponsorshipType === 'BASIC'
                }"
                class="absolute top-4 left-4 px-3 py-1.5 rounded-lg shadow-md z-10"
              >
                <div class="flex flex-col">
                  <span 
                    :class="{
                      'text-gray-900': !item.isSponsored,
                      'text-yellow-900 font-extrabold': item.isSponsored && item.sponsorshipType === 'PREMIER',
                      'text-blue-900 font-bold': item.isSponsored && item.sponsorshipType === 'BASIC'
                    }"
                    class="text-lg font-bold"
                  >{{ formatPrice(item.priceETB, 'ETB') }}</span>
                  <span 
                    v-if="item.priceUSD"
                    :class="{
                      'text-gray-700': !item.isSponsored,
                      'text-yellow-700 font-bold': item.isSponsored && item.sponsorshipType === 'PREMIER',
                      'text-blue-700 font-semibold': item.isSponsored && item.sponsorshipType === 'BASIC'
                    }"
                    class="text-sm font-semibold"
                  >{{ formatPrice(item.priceUSD, 'USD') }}</span>
                  <span v-if="item.category === 'FOR_RENTAL'" class="text-xs text-gray-500">/month</span>
                </div>
              </div>
              <!-- Building Units Badge -->
              <div 
                v-else-if="item.type === 'building'"
                class="absolute top-4 left-4 px-3 py-1.5 rounded-lg shadow-md z-10 bg-white"
              >
                <div class="flex flex-col">
                  <span class="text-lg font-bold text-gray-900">{{ item.totalUnits || 0 }} Units</span>
                  <span class="text-xs text-gray-600">{{ item.availableUnits || 0 }} Available</span>
                </div>
              </div>
            </div>

            <!-- Property/Building Details -->
            <div class="p-5">
              <!-- Title and Rating -->
              <div class="flex items-start justify-between mb-2">
                <h3 
                  :class="{
                    'text-lg font-semibold text-gray-900': !item.isSponsored,
                    'text-lg font-extrabold text-gray-900': item.isSponsored && item.sponsorshipType === 'PREMIER',
                    'text-lg font-bold text-gray-900': item.isSponsored && item.sponsorshipType === 'BASIC'
                  }"
                  class="flex-1 pr-2"
                >{{ item.title || item.name }}</h3>
                <div v-if="item.type === 'property'" class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <span class="text-sm font-medium text-gray-700">4.8</span>
                </div>
              </div>

              <!-- Location -->
              <p class="text-sm text-gray-600 mb-3">{{ item.city }}, {{ item.country || 'Ethiopia' }}</p>

              <!-- Property Features (for properties) or Building Info (for buildings) -->
              <div v-if="item.type === 'property'" class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  <span>{{ item.bedrooms || 'N/A' }} beds</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
                  </svg>
                  <span>{{ item.bathrooms || 'N/A' }} baths</span>
                </div>
                <div v-if="item.area" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l9 9m0-9V4m0 4h-4"/>
                  </svg>
                  <span>{{ item.area }} m²</span>
                </div>
              </div>
              
              <!-- Building Features -->
              <div v-else class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <span>{{ item.totalUnits || 0 }} Units</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  <span>{{ item.totalFloors || 'N/A' }} Floors</span>
                </div>
                <div v-if="item.availableUnits" class="flex items-center gap-1">
                  <span class="text-green-600 font-semibold">{{ item.availableUnits }} Available</span>
                </div>
              </div>

              <!-- Property Type/Building Type and Real Estate Company -->
              <div class="flex flex-col gap-2 pt-3 border-t border-gray-100">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-gray-500 uppercase">{{ item.type === 'property' ? (item.propertyType || item.type || 'Apartment') : (item.buildingType || 'Building') }}</span>
                  <div class="flex items-center gap-2" v-if="item.type === 'property' && item.agentName">
                    <span class="text-xs text-gray-600">Agent:</span>
                    <span class="text-xs font-medium text-gray-900">{{ item.agentName }}</span>
                  </div>
                </div>
                <div v-if="item.realEstateCompanyName" class="flex items-center gap-2">
                  <svg class="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <span class="text-xs font-semibold text-primary-600">{{ item.realEstateCompanyName }}</span>
                </div>
              </div>
            </div>
          </div>

        <!-- Empty State -->
        <div v-if="!loading && combinedList.length === 0" class="col-span-full text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
            <p class="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'
import { AdSpace } from '@/shared/components'
import { useAds } from '@/shared/composables/useAds'

const router = useRouter()
const authStore = useAuthStore()
const { loadAllAds, topAds, getRandomTopAd } = useAds()

const properties = ref([])
const buildings = ref([])
const combinedList = ref([])
const loading = ref(false)
const currentPremierAdIndex = ref(0)

// Get current top ads (two ads side by side, rotates through available ads)
// These are ads with the highest base_price
const currentPremierAds = computed(() => {
  if (topAds.value.length === 0) return []
  
  const ads = []
  const startIndex = currentPremierAdIndex.value % topAds.value.length
  
  // Get two ads, wrapping around if needed
  for (let i = 0; i < 2; i++) {
    const index = (startIndex + i) % topAds.value.length
    ads.push(topAds.value[index])
  }
  
  return ads
})

const filters = ref({
  serviceType: '',
  location: '',
  priceRange: '',
  instantBooking: false,
  freeCancellation: false
})

const loadProperties = async () => {
  loading.value = true
  try {
    // Load properties
    const params = {
      page: 0,
      size: 100, // Load more to allow client-side filtering
      status: 'AVAILABLE'
    }

    // Apply location filter
    if (filters.value.location) {
      params.city = filters.value.location
    }

    const propertiesResponse = await api.get('/properties', { params })
    let propertiesData = propertiesResponse.data.content || propertiesResponse.data || []
    
    // Apply service type filter (category) on properties
    if (filters.value.serviceType) {
      const category = filters.value.serviceType === 'rental' ? 'FOR_RENTAL' : 'FOR_SALE'
      propertiesData = propertiesData.filter(p => p.category === category)
    }
    
    properties.value = propertiesData
    
    // Load buildings
    const buildingsParams = {}
    if (filters.value.location) {
      buildingsParams.city = filters.value.location
    }
    
    const buildingsResponse = await api.get('/buildings', { params: buildingsParams })
    let buildingsData = Array.isArray(buildingsResponse.data) ? buildingsResponse.data : []
    
    // Apply service type filter on buildings
    if (filters.value.serviceType) {
      const category = filters.value.serviceType === 'rental' ? 'FOR_RENTAL' : 'FOR_SALE'
      buildingsData = buildingsData.filter(b => b.category === category)
    }
    
    buildings.value = buildingsData
    
    // Combine properties and buildings
    let combined = [
      ...properties.value.map(p => ({ ...p, type: 'property' })),
      ...buildings.value.map(b => ({ ...b, type: 'building', title: b.name }))
    ]
    
    // Apply price range filter (client-side)
    if (filters.value.priceRange) {
      combined = combined.filter(item => {
        if (item.type === 'building') {
          // Buildings don't have prices, skip price filter for them
          return true
        }
        
        const price = item.priceETB || 0
        const range = filters.value.priceRange
        
        if (range === '0-5000') {
          return price >= 0 && price <= 5000
        } else if (range === '5000-10000') {
          return price > 5000 && price <= 10000
        } else if (range === '10000-20000') {
          return price > 10000 && price <= 20000
        } else if (range === '20000+') {
          return price > 20000
        }
        
        return true
      })
    }
    
    // Note: instantBooking and freeCancellation filters are not implemented
    // as these fields don't exist in the current data model
    
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
    console.error('Failed to load properties/buildings:', err)
    combinedList.value = []
  } finally {
    loading.value = false
  }
}

const selectBuilding = (building) => {
  router.push(`/buildings/${building.id}`)
}

const selectProperty = (property) => {
  if (property.type === 'building') {
    selectBuilding(property)
    return
  }
  // Navigate directly to property details page
  router.push(`/properties/${property.id}`)
}

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return filters.value.serviceType !== '' ||
         filters.value.location !== '' ||
         filters.value.priceRange !== '' ||
         filters.value.instantBooking ||
         filters.value.freeCancellation
})

// Clear all filters
const clearFilters = () => {
  filters.value = {
    serviceType: '',
    location: '',
    priceRange: '',
    instantBooking: false,
    freeCancellation: false
  }
}

// Watch for filter changes with debounce
let filterTimeout = null
watch(filters, () => {
  // Clear existing timeout
  if (filterTimeout) {
    clearTimeout(filterTimeout)
  }
  
  // Debounce filter changes to avoid too many API calls
  filterTimeout = setTimeout(() => {
    loadProperties()
  }, 300)
}, { deep: true })

// Rotate premier ads every 10 seconds
let adRotationInterval = null

onMounted(() => {
  loadProperties()
  loadAllAds(20).then(() => {
    // Start rotating top ads (highest base_price) every 10 seconds
    adRotationInterval = setInterval(() => {
      if (topAds.value.length > 0) {
        currentPremierAdIndex.value = (currentPremierAdIndex.value + 1) % topAds.value.length
      }
    }, 10000)
  })
})

// Cleanup interval and timeout on unmount
onUnmounted(() => {
  if (adRotationInterval) {
    clearInterval(adRotationInterval)
  }
  if (filterTimeout) {
    clearTimeout(filterTimeout)
  }
})
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>