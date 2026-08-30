<template>
  <div class="building-details-page min-h-screen bg-violet-50 pb-14">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900">
    <div class="mb-6">
      <button
        @click="$router.back()"
        class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        {{ $t('common.back') }}
      </button>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{{ building?.name || $t('building.buildingDetails') }}</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-700">{{ error }}</p>
    </div>

    <!-- Building Details -->
    <div v-if="!loading && building" class="space-y-6">
      <!-- Building Info Card -->
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-2xl font-semibold text-gray-900">{{ building.name }}</h2>
            <p class="text-sm text-gray-500 mt-1">{{ building.address }}, {{ building.city }}, {{ building.country }}</p>
          </div>
          <span :class="[
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
            getStatusColor(building.status)
          ]">
            {{ building.status }}
          </span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div>
            <label class="text-xs font-medium text-gray-500">{{ $t('building.totalUnits') }}</label>
            <p class="text-lg font-semibold text-gray-900">{{ building.totalUnits }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500">{{ $t('building.available') }}</label>
            <p class="text-lg font-semibold text-green-600">{{ building.availableUnits || 0 }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500">{{ $t('building.occupied') }}</label>
            <p class="text-lg font-semibold text-gray-700">{{ building.occupiedUnits || 0 }}</p>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500">{{ $t('building.totalFloors') }}</label>
            <p class="text-lg font-semibold text-gray-900">{{ building.totalFloors }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label class="text-xs font-medium text-gray-500">{{ $t('building.category') }}</label>
            <p class="text-sm mt-1">
              <span :class="{
                'bg-blue-100 text-blue-700': building.category === 'FOR_SALE',
                'bg-green-100 text-green-700': building.category === 'FOR_RENTAL'
              }" class="px-2 py-1 rounded text-xs font-medium">
                {{ building.category === 'FOR_SALE' ? $t('common.forSale') : $t('common.forRental') }}
              </span>
            </p>
          </div>
          <div v-if="building.constructionPercentage !== null && building.constructionPercentage !== undefined">
            <label class="text-xs font-medium text-gray-500">{{ $t('building.constructionProgress') }}</label>
            <div class="mt-1">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-primary-500 h-2 rounded-full transition-all"
                    :style="{ width: building.constructionPercentage + '%' }"
                  ></div>
                </div>
                <span class="text-xs text-gray-500">{{ building.constructionPercentage }}%</span>
              </div>
            </div>
          </div>
          <div v-if="building.isFullyFurnished">
            <label class="text-xs font-medium text-gray-500">{{ $t('building.furnishing') }}</label>
            <p class="text-sm mt-1">
              <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">{{ $t('common.fullyFurnished') }}</span>
            </p>
          </div>
        </div>

        <div v-if="building.description" class="mt-4">
          <label class="text-sm font-medium text-gray-500">{{ $t('property.description') }}</label>
          <p class="text-sm text-gray-700 mt-1">{{ building.description }}</p>
        </div>

        <div v-if="building.amenities" class="mt-4">
          <label class="text-sm font-medium text-gray-500">{{ $t('building.amenities') }}</label>
          <p class="text-sm text-gray-700 mt-1">{{ building.amenities }}</p>
        </div>

        <div v-if="building.facilities" class="mt-4">
          <label class="text-sm font-medium text-gray-500">{{ $t('building.facilities') }}</label>
          <p class="text-sm text-gray-700 mt-1">{{ building.facilities }}</p>
        </div>

        <div v-if="building.yearBuilt" class="mt-4">
          <label class="text-sm font-medium text-gray-500">{{ $t('building.yearBuilt') }}</label>
          <p class="text-sm text-gray-700 mt-1">{{ building.yearBuilt }}</p>
        </div>
      </div>

      <!-- Map Section: only show when building has coordinates -->
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">{{ $t('building.locationMap') }}</h3>
        <OsmMap
          v-if="building.latitude != null && building.longitude != null"
          :latitude="building.latitude"
          :longitude="building.longitude"
          :marker-title="building.name"
          height="400px"
          :zoom="15"
        />
        <a
          v-if="building.latitude != null && building.longitude != null"
          :href="googleMapsDirectionsUrl(building.latitude, building.longitude)"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 transition-colors text-sm font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          {{ $t('common.openInGoogleMaps') || 'Open in Google Maps' }}
        </a>
        <div
          v-else
          class="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center"
          style="height: 400px;"
        >
          <p class="text-gray-500 px-4">{{ $t('property.locationNotAvailable') || 'Location not available' }}</p>
        </div>
      </div>

      <!-- Company Information Section -->
      <div v-if="company" class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">{{ $t('property.realEstateCompany') }}</h3>
        <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h4 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2 flex-wrap">
            {{ company.name }}
            <VerifiedBadge :level="getVerificationLevel(company)" size="sm" />
          </h4>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="company.email">
              <dt class="text-sm font-medium text-gray-500 mb-1">{{ $t('auth.email') }}:</dt>
              <dd class="text-sm text-gray-700">
                <a :href="`mailto:${company.email}`" class="text-primary-600 hover:underline">{{ company.email }}</a>
              </dd>
            </div>
            <div v-if="companyPhones.length">
              <dt class="text-sm font-medium text-gray-500 mb-1">{{ $t('building.phoneLabel') }}:</dt>
              <dd class="text-sm text-gray-700">
                <template v-for="(phone, i) in companyPhones" :key="i">
                  <span v-if="i > 0">, </span>
                  <a :href="`tel:${phone}`" class="text-primary-600 hover:underline">{{ phone }}</a>
                </template>
              </dd>
            </div>
            <div v-if="company.address" class="md:col-span-2">
              <dt class="text-sm font-medium text-gray-500 mb-1">{{ $t('property.address') }}:</dt>
              <dd class="text-sm text-gray-700">{{ company.address }}{{ company.city ? `, ${company.city}` : '' }}{{ company.country ? `, ${company.country}` : '' }}</dd>
            </div>
            <div v-if="company.website" class="md:col-span-2">
              <dt class="text-sm font-medium text-gray-500 mb-1">{{ $t('building.websiteLabel') }}:</dt>
              <dd class="text-sm text-gray-700">
                <a :href="company.website" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">{{ company.website }}</a>
              </dd>
            </div>
            <div v-if="hasSocialOnOrg(company)" class="md:col-span-2">
              <dt class="sr-only">Social profiles</dt>
              <dd class="m-0 p-0">
                <OrganizationSocialLinks
                  :facebook-url="company.facebookUrl"
                  :instagram-url="company.instagramUrl"
                  :linkedin-url="company.linkedinUrl"
                  :twitter-url="company.twitterUrl"
                  :youtube-url="company.youtubeUrl"
                />
              </dd>
            </div>
          </dl>
          <p v-if="company.description" class="mt-4 text-sm text-gray-600">{{ company.description }}</p>
        </div>
      </div>

      <!-- Financing Offers Section -->
      <div v-if="financingOffers.length" class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">{{ $t('property.financingOptions') }}</h3>
        <div class="space-y-4">
          <div
            v-for="offer in financingOffers"
            :key="offer.id"
            class="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-primary-300 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h4 class="text-lg font-semibold text-gray-900">{{ offer.creditProductName || 'Financing Offer' }}</h4>
                  <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    {{ $t('banking.active') }}
                  </span>
                </div>
                <p v-if="offer.creditProductDescription" class="text-sm text-gray-600 mb-3">{{ offer.creditProductDescription }}</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div v-if="offer.maxLoanToValueRatio">
                    <label class="text-xs font-medium text-gray-500">{{ $t('loan.ltvRatio') }}</label>
                    <p class="text-sm font-semibold text-gray-900 mt-1">{{ (offer.maxLoanToValueRatio * 100).toFixed(0) }}%</p>
                  </div>
                </div>

                <div v-if="offer.specialTerms" class="mt-3 p-3 bg-white rounded border border-gray-200">
                  <label class="text-xs font-medium text-gray-500">{{ $t('loan.specialTerms') }}</label>
                  <p class="text-sm text-gray-600 mt-1">{{ offer.specialTerms }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Units Section -->
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-900">{{ $t('building.unitsWithCount', { count: units.length }) }}</h3>
          <router-link
            v-if="authStore.hasRole('REALTOR')"
            :to="`/submit-property?buildingId=${building.id}`"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm transition-colors"
          >
            + {{ $t('building.addUnit') }}
          </router-link>
        </div>

        <div v-if="unitsLoading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
        </div>

        <div v-else-if="units.length === 0" class="text-center py-8 text-gray-500">
          <p>{{ $t('building.noUnits') }}</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="unit in units"
            :key="unit.id"
            @click="$router.push(`/properties/${unit.id}`)"
            class="border border-gray-200 rounded-xl p-4 hover:border-primary-400 hover:shadow-md transition-all cursor-pointer"
          >
            <div class="flex items-start justify-between mb-2 flex-wrap gap-1">
              <h4 class="font-semibold text-gray-900 flex items-center gap-1.5 flex-wrap min-w-0">
                {{ unit.title }}
                <VerifiedBadge :level="getVerificationLevel(unit)" size="sm" />
              </h4>
              <span :class="[
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  getPropertyStatusColor(unit.status)
                ]">
                {{ unit.status }}
              </span>
            </div>

            <p v-if="unit.unitNumber" class="text-xs text-gray-500 mb-2">Unit: {{ unit.unitNumber }}</p>
            <div class="flex flex-col gap-1">
              <p v-if="unit.priceETB" class="text-lg font-bold text-primary-700">
                {{ formatPrice(unit.priceETB, 'ETB') }}
                <span v-if="unit.category === 'FOR_RENTAL'" class="text-sm text-gray-500 font-normal">/month</span>
              </p>
              <p v-if="unit.priceUSD" class="text-base font-semibold text-gray-600">
                {{ formatPrice(unit.priceUSD, 'USD') }}
                <span v-if="unit.category === 'FOR_RENTAL'" class="text-xs text-gray-500 font-normal">/month</span>
              </p>
            </div>

            <div class="mt-2 flex gap-4 text-xs text-gray-500">
              <span v-if="unit.bedrooms">{{ unit.bedrooms }} bed</span>
              <span v-if="unit.bathrooms">{{ unit.bathrooms }} bath</span>
              <span v-if="unit.area">{{ unit.area }} m²</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/shared/api/client'
import {
  truncateMetaDescription,
  getPublicSiteUrl,
  setJsonLdById,
  removeJsonLdById
} from '@/utils/seo'
import { useDynamicSeo } from '@/shared/composables/useDynamicSeo'
import { useAuthStore } from '@/features/auth'
import { formatPrice as formatCurrencyPrice, formatOrganizationPhones, getVerificationLevel } from '@/shared/utils'
import { VerifiedBadge, OsmMap } from '@/shared/components'
import OrganizationSocialLinks from '@/shared/components/OrganizationSocialLinks.vue'

const route = useRoute()
const authStore = useAuthStore()

const BUILDING_JSON_LD_ID = 'dynamic-building-jsonld'

const loading = ref(false)
const unitsLoading = ref(false)
const error = ref('')
const building = ref(null)

const seoOptions = ref({})
useDynamicSeo(seoOptions)
const units = ref([])
const financingOffers = ref([])
const company = ref(null)
const companyPhones = computed(() => formatOrganizationPhones(company.value || {}))

function hasSocialOnOrg(org) {
  if (!org) return false
  return ['facebookUrl', 'instagramUrl', 'linkedinUrl', 'twitterUrl', 'youtubeUrl'].some((k) =>
    String(org[k] || '').trim()
  )
}

function syncBuildingSeo(b) {
  if (!b) return
  const title = `${b.name} | Ethio Build Connect`
  const locationLine = [b.address, b.city, b.country].filter(Boolean).join(', ')
  const description = truncateMetaDescription(
    (b.description && String(b.description).trim()) ||
      [b.status, locationLine].filter(Boolean).join(' · ') ||
      'Building details on Ethio Build Connect.'
  )
  seoOptions.value = {
    title,
    description,
    pagePath: `/buildings/${b.id}`
  }
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    name: b.name,
    url: `${getPublicSiteUrl()}/buildings/${b.id}`
  }
  if (locationLine) {
    ld.address = {
      '@type': 'PostalAddress',
      streetAddress: b.address || undefined,
      addressLocality: b.city || undefined,
      addressCountry: b.country || undefined
    }
  }
  setJsonLdById(BUILDING_JSON_LD_ID, ld)
}

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

    await nextTick()
    syncBuildingSeo(building.value)
  } catch (err) {
    console.error('Failed to load building:', err)
    error.value = err.response?.data?.message || 'Failed to load building'
    building.value = null
    removeJsonLdById(BUILDING_JSON_LD_ID)
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
    PLANNED: 'bg-gray-100 text-gray-700 border-gray-200',
    UNDER_CONSTRUCTION: 'bg-primary-100 text-primary-700 border-primary-200',
    COMPLETED: 'bg-green-100 text-green-700 border-green-200',
    RENOVATION: 'bg-blue-100 text-blue-700 border-blue-200'
  }
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
}

const getPropertyStatusColor = (status) => {
  const colors = {
    AVAILABLE: 'bg-green-100 text-green-700',
    SOLD: 'bg-red-100 text-red-700',
    RESERVED: 'bg-primary-100 text-primary-700',
    WITHDRAWN: 'bg-gray-100 text-gray-700'
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

const googleMapsDirectionsUrl = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

onMounted(() => {
  loadBuilding()
  loadUnits()
  loadFinancingOffers()
})

watch(
  () => route.params.id,
  () => {
    removeJsonLdById(BUILDING_JSON_LD_ID)
    loadBuilding()
    loadUnits()
    loadFinancingOffers()
  }
)

onUnmounted(() => {
  removeJsonLdById(BUILDING_JSON_LD_ID)
})
</script>