<template>
  <div class="min-h-screen bg-gray-50">
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
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content: Property List and Map -->
    <div class="flex flex-col lg:flex-row h-[calc(100vh-88px)] sm:h-[calc(100vh-120px)]">
      <!-- Left Side: Property Cards List -->
      <div class="flex-1 overflow-y-auto bg-white order-2 lg:order-1">
        <div class="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <!-- Loading State -->
          <div v-if="loading" class="space-y-6">
            <div v-for="i in 3" :key="i" class="bg-gray-200 animate-pulse rounded-xl h-96"></div>
          </div>

          <!-- Property Cards -->
          <div
            v-for="property in properties"
            :key="property.id"
            :data-property-id="property.id"
            @click="selectProperty(property)"
            :class="[
              'rounded-xl shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden border-2',
              selectedProperty?.id === property.id ? 'border-blue-500 shadow-lg' : '',
              property.isSponsored && property.sponsorshipType === 'PREMIER' 
                ? 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-yellow-400 shadow-lg' 
                : property.isSponsored && property.sponsorshipType === 'BASIC'
                ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-300 shadow-md'
                : 'bg-white border-gray-100'
            ]"
          >
            <!-- Sponsored Badge - Prominent Display -->
            <div v-if="property.isSponsored" class="relative">
              <div
                :class="{
                  'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-yellow-900 shadow-2xl': property.sponsorshipType === 'PREMIER',
                  'bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 text-blue-900 shadow-xl': property.sponsorshipType === 'BASIC'
                }"
                class="absolute top-3 right-3 px-4 py-2 rounded-full text-xs font-extrabold z-20 flex items-center gap-1.5 animate-pulse border-2 border-white"
              >
                <span v-if="property.sponsorshipType === 'PREMIER'" class="text-base">⭐</span>
                <span v-else class="text-base">✨</span>
                <span class="uppercase tracking-wide">{{ property.sponsorshipType === 'PREMIER' ? 'PREMIER' : 'SPONSORED' }}</span>
              </div>
              <!-- Additional Premier Crown Badge -->
              <div v-if="property.sponsorshipType === 'PREMIER'" class="absolute top-3 left-3 z-20">
                <div class="bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-1">
                  <span>👑</span>
                  <span>FEATURED</span>
                </div>
              </div>
            </div>
            
            <!-- Property Image -->
            <div class="relative h-48 sm:h-56 md:h-64 bg-gray-200 overflow-hidden">
              <img
                v-if="property.images && property.images.length > 0"
                :src="property.images[0].imageUrl"
                :alt="property.title"
                :class="{
                  'w-full h-full object-cover transition-transform duration-300': true,
                  'brightness-110 contrast-110 scale-105 hover:scale-110': property.isSponsored && property.sponsorshipType === 'PREMIER',
                  'brightness-105 scale-102 hover:scale-105': property.isSponsored && property.sponsorshipType === 'BASIC'
                }"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
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
              <!-- Price Badge -->
              <div 
                :class="{
                  'bg-white': !property.isSponsored,
                  'bg-yellow-100 border-2 border-yellow-400 shadow-xl': property.isSponsored && property.sponsorshipType === 'PREMIER',
                  'bg-blue-100 border-2 border-blue-400 shadow-lg': property.isSponsored && property.sponsorshipType === 'BASIC'
                }"
                class="absolute top-4 left-4 px-3 py-1.5 rounded-lg shadow-md z-10"
              >
                <div class="flex flex-col">
                  <span 
                    v-if="property.priceETB"
                    :class="{
                      'text-gray-900': !property.isSponsored,
                      'text-yellow-900 font-extrabold': property.isSponsored && property.sponsorshipType === 'PREMIER',
                      'text-blue-900 font-bold': property.isSponsored && property.sponsorshipType === 'BASIC'
                    }"
                    class="text-lg font-bold"
                  >{{ formatPrice(property.priceETB, 'ETB') }}</span>
                  <span 
                    v-if="property.priceUSD"
                    :class="{
                      'text-gray-700': !property.isSponsored,
                      'text-yellow-700 font-bold': property.isSponsored && property.sponsorshipType === 'PREMIER',
                      'text-blue-700 font-semibold': property.isSponsored && property.sponsorshipType === 'BASIC'
                    }"
                    class="text-sm font-semibold"
                  >{{ formatPrice(property.priceUSD, 'USD') }}</span>
                  <span v-if="property.category === 'FOR_RENTAL'" class="text-xs text-gray-500">/month</span>
                </div>
              </div>
            </div>

            <!-- Property Details -->
            <div class="p-5">
              <!-- Title and Rating -->
              <div class="flex items-start justify-between mb-2">
                <h3 
                  :class="{
                    'text-lg font-semibold text-gray-900': !property.isSponsored,
                    'text-lg font-extrabold text-gray-900': property.isSponsored && property.sponsorshipType === 'PREMIER',
                    'text-lg font-bold text-gray-900': property.isSponsored && property.sponsorshipType === 'BASIC'
                  }"
                  class="flex-1 pr-2"
                >{{ property.title }}</h3>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                  <span class="text-sm font-medium text-gray-700">4.8</span>
                </div>
              </div>

              <!-- Location -->
              <p class="text-sm text-gray-600 mb-3">{{ property.city }}, {{ property.country || 'Ethiopia' }}</p>

              <!-- Property Features -->
              <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span>{{ property.bedrooms || 'N/A' }} guests</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  <span>{{ property.bedrooms || 'N/A' }} beds</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
                  </svg>
                  <span>{{ property.bathrooms || 'N/A' }} baths</span>
                </div>
              </div>

              <!-- Property Type and Host -->
              <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                <span class="text-xs font-medium text-gray-500 uppercase">{{ property.type || 'Apartment' }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-600">Hosted by</span>
                  <span class="text-xs font-medium text-gray-900">{{ property.agentName || 'Property Owner' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!loading && properties.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
            <p class="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        </div>
      </div>

      <!-- Right Side: Interactive Map -->
      <div class="hidden lg:block lg:w-1/2 border-l border-gray-200 relative bg-gray-100 order-1 lg:order-2">
        <!-- Map Container -->
        <div class="h-full w-full relative">
          <!-- Map Placeholder (Replace with actual map library like Leaflet or Google Maps) -->
          <div class="h-full w-full bg-gray-200 relative overflow-hidden">
            <!-- Map Background Pattern -->
            <div class="absolute inset-0 opacity-20" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
            
            <!-- Map Title -->
            <div class="absolute top-4 left-4 z-10 bg-white px-4 py-2 rounded-lg shadow-md">
              <h3 class="text-sm font-semibold text-gray-900">Addis Ababa, Ethiopia</h3>
            </div>

            <!-- Property Markers -->
            <div
              v-for="(property, index) in properties"
              :key="property.id"
              :style="{
                position: 'absolute',
                left: `${20 + (index % 3) * 30}%`,
                top: `${30 + (index % 4) * 20}%`,
                transform: 'translate(-50%, -50%)'
              }"
              class="cursor-pointer z-20"
              @click="selectProperty(property)"
            >
              <!-- Price Marker -->
              <div
                :class="[
                  'bg-white px-3 py-1.5 rounded-lg shadow-lg border-2 transition-all',
                  selectedProperty?.id === property.id ? 'border-blue-500 scale-110' : 'border-transparent hover:border-blue-300'
                ]"
              >
                <div class="flex flex-col">
                  <span v-if="property.priceETB" class="text-sm font-bold text-gray-900">{{ formatPrice(property.priceETB, 'ETB') }}</span>
                  <span v-if="property.priceUSD" class="text-xs font-semibold text-gray-600">{{ formatPrice(property.priceUSD, 'USD') }}</span>
                </div>
              </div>
            </div>

            <!-- Selected Search Area Circle (Dashed Blue Boundary) -->
            <div
              class="absolute border-2 border-blue-500 border-dashed rounded-full pointer-events-none z-10"
              :style="{
                left: '30%',
                top: '40%',
                width: '200px',
                height: '200px',
                transform: 'translate(-50%, -50%)'
              }"
            ></div>
          </div>

          <!-- Floating Property Card (Shown when property is selected) -->
          <div
            v-if="selectedProperty"
            class="absolute bottom-6 left-6 right-6 z-30 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
          >
            <div class="flex">
              <!-- Property Image -->
              <div class="w-48 h-40 bg-gray-200 flex-shrink-0">
                <img
                  v-if="selectedProperty.images && selectedProperty.images.length > 0"
                  :src="selectedProperty.images[0].imageUrl"
                  :alt="selectedProperty.title"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
              </div>

              <!-- Property Details -->
              <div class="flex-1 p-4">
                <div class="flex items-start justify-between mb-2">
                  <h4 class="text-lg font-semibold text-gray-900">{{ selectedProperty.title }}</h4>
                  <button
                    @click="selectedProperty = null"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <p class="text-sm text-gray-600 mb-2">{{ selectedProperty.city }}, {{ selectedProperty.country || 'Ethiopia' }}</p>
                <div class="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>{{ selectedProperty.bedrooms || 'N/A' }} beds</span>
                  <span>{{ selectedProperty.bathrooms || 'N/A' }} baths</span>
                  <span>{{ selectedProperty.area || 'N/A' }} m²</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex flex-col">
                    <div class="flex flex-col gap-1">
                      <span v-if="selectedProperty.priceETB" class="text-xl font-bold text-gray-900">{{ formatPrice(selectedProperty.priceETB, 'ETB') }}</span>
                      <span v-if="selectedProperty.priceUSD" class="text-base font-semibold text-gray-600">{{ formatPrice(selectedProperty.priceUSD, 'USD') }}</span>
                    </div>
                    <span v-if="selectedProperty.category === 'FOR_RENTAL'" class="text-sm text-gray-500">/month</span>
                  </div>
                  <router-link
                    :to="`/properties/${selectedProperty.id}`"
                    class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const router = useRouter()
const authStore = useAuthStore()

const properties = ref([])
const loading = ref(false)
const selectedProperty = ref(null)

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
    const params = {
      page: 0,
      size: 20,
      status: 'AVAILABLE'
    }

    if (filters.value.location) {
      params.city = filters.value.location
    }

    const response = await api.get('/properties', { params })
    properties.value = response.data.content || response.data || []
    
    // Add mock data for demonstration if no properties
    if (properties.value.length === 0) {
      properties.value = generateMockProperties()
    }
  } catch (err) {
    console.error('Failed to load properties:', err)
    // Use mock data on error
    properties.value = generateMockProperties()
  } finally {
    loading.value = false
  }
}

const generateMockProperties = () => {
  return [
    {
      id: 1,
      title: 'Modern Apartment in Bole',
      city: 'Addis Ababa',
      country: 'Ethiopia',
      price: 8500,
      bedrooms: 2,
      bathrooms: 1,
      area: 75,
      type: 'APARTMENT',
      agentName: 'John Doe',
      images: []
    },
    {
      id: 2,
      title: 'Spacious Villa in Megenagna',
      city: 'Addis Ababa',
      country: 'Ethiopia',
      price: 15000,
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      type: 'VILLA',
      agentName: 'Sarah Smith',
      images: []
    },
    {
      id: 3,
      title: 'Cozy Studio Apartment',
      city: 'Addis Ababa',
      country: 'Ethiopia',
      price: 5000,
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      type: 'APARTMENT',
      agentName: 'Mike Johnson',
      images: []
    }
  ]
}

const selectProperty = (property) => {
  selectedProperty.value = property
  // Scroll to top of property list to show selected property
  const propertyElement = document.querySelector(`[data-property-id="${property.id}"]`)
  if (propertyElement) {
    propertyElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

// Watch for filter changes
watch(filters, () => {
  loadProperties()
}, { deep: true })

onMounted(() => {
  loadProperties()
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