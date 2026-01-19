<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="mt-4 text-gray-600">Loading property details...</p>
    </div>

    <div v-else-if="property" class="bg-white shadow rounded-lg overflow-hidden">
      <!-- Property Images -->
      <div class="h-96 bg-gray-200 flex items-center justify-center">
        <span v-if="!property.images || property.images.length === 0" class="text-gray-400 text-6xl">🏠</span>
        <img
          v-else
          :src="property.images[0].imageUrl"
          :alt="property.title"
          class="w-full h-full object-cover"
        />
      </div>

      <div class="p-8">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ property.title }}</h1>
            <div class="flex flex-col gap-2">
              <p v-if="property.priceETB" class="text-3xl font-bold text-primary-600">
                {{ formatPrice(property.priceETB, 'ETB') }}
              </p>
              <p v-if="property.priceUSD" class="text-2xl font-semibold text-gray-600">
                {{ formatPrice(property.priceUSD, 'USD') }}
              </p>
              <p v-if="!property.priceETB && !property.priceUSD" class="text-lg text-gray-500">
                {{ $t('property.priceNotSet') }}
              </p>
            </div>
          </div>
          <span
            :class="{
              'bg-green-100 text-green-800': property.status === 'AVAILABLE',
              'bg-yellow-100 text-yellow-800': property.status === 'RESERVED',
              'bg-gray-100 text-gray-800': property.status === 'SOLD'
            }"
            class="px-4 py-2 text-sm font-semibold rounded"
          >
            {{ property.status }}
          </span>
        </div>

        <!-- Property Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
            <dl class="space-y-3">
              <div class="flex">
                <dt class="text-sm font-medium text-gray-500 w-32">Type:</dt>
                <dd class="text-sm text-gray-900">{{ property.type }}</dd>
              </div>
              <div class="flex" v-if="property.bedrooms">
                <dt class="text-sm font-medium text-gray-500 w-32">Bedrooms:</dt>
                <dd class="text-sm text-gray-900">{{ property.bedrooms }}</dd>
              </div>
              <div class="flex" v-if="property.bathrooms">
                <dt class="text-sm font-medium text-gray-500 w-32">Bathrooms:</dt>
                <dd class="text-sm text-gray-900">{{ property.bathrooms }}</dd>
              </div>
              <div class="flex" v-if="property.area">
                <dt class="text-sm font-medium text-gray-500 w-32">Area:</dt>
                <dd class="text-sm text-gray-900">{{ property.area }} sqm</dd>
              </div>
              <div class="flex" v-if="property.floorNumber">
                <dt class="text-sm font-medium text-gray-500 w-32">Floor:</dt>
                <dd class="text-sm text-gray-900">{{ property.floorNumber }}{{ property.totalFloors ? ` of ${property.totalFloors}` : '' }}</dd>
              </div>
              <div class="flex">
                <dt class="text-sm font-medium text-gray-500 w-32">Construction:</dt>
                <dd class="text-sm text-gray-900">{{ property.constructionStatus }}</dd>
              </div>
              <div class="flex" v-if="property.constructionPercentage !== null && property.constructionPercentage !== undefined">
                <dt class="text-sm font-medium text-gray-500 w-32">Progress:</dt>
                <dd class="text-sm text-gray-900">{{ property.constructionPercentage }}%</dd>
              </div>
              <div class="flex">
                <dt class="text-sm font-medium text-gray-500 w-32">Category:</dt>
                <dd class="text-sm text-gray-900">
                  <span :class="{
                    'bg-blue-100 text-blue-800': property.category === 'FOR_SALE',
                    'bg-green-100 text-green-800': property.category === 'FOR_RENTAL'
                  }" class="px-2 py-1 rounded text-xs font-medium">
                    {{ property.category === 'FOR_SALE' ? 'For Sale' : 'For Rental' }}
                  </span>
                </dd>
              </div>
              <div class="flex" v-if="property.isFullyFurnished">
                <dt class="text-sm font-medium text-gray-500 w-32">Furnished:</dt>
                <dd class="text-sm text-gray-900">
                  <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">Fully Furnished</span>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('property.location') }}</h3>
            <dl class="space-y-3">
              <div class="flex">
                <dt class="text-sm font-medium text-gray-500 w-32">{{ $t('property.address') }}:</dt>
                <dd class="text-sm text-gray-900">{{ property.address }}</dd>
              </div>
              <div class="flex">
                <dt class="text-sm font-medium text-gray-500 w-32">{{ $t('property.city') }}:</dt>
                <dd class="text-sm text-gray-900">{{ property.city }}</dd>
              </div>
              <div class="flex" v-if="property.state">
                <dt class="text-sm font-medium text-gray-500 w-32">{{ $t('property.state') }}:</dt>
                <dd class="text-sm text-gray-900">{{ property.state }}</dd>
              </div>
              <div class="flex">
                <dt class="text-sm font-medium text-gray-500 w-32">{{ $t('property.country') }}:</dt>
                <dd class="text-sm text-gray-900">{{ property.country }}</dd>
              </div>
              <div class="flex" v-if="property.zipCode">
                <dt class="text-sm font-medium text-gray-500 w-32">{{ $t('property.zipCode') }}:</dt>
                <dd class="text-sm text-gray-900">{{ property.zipCode }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Description -->
        <div class="mb-8" v-if="property.description">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('property.description') }}</h3>
          <p class="text-gray-700 whitespace-pre-line">{{ property.description }}</p>
        </div>

        <!-- Company Information -->
        <div v-if="company" class="border-t pt-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Real Estate Company</h3>
          <div class="bg-gray-50 rounded-lg p-6">
            <h4 class="text-xl font-semibold text-gray-900 mb-2">{{ company.name }}</h4>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="company.email">
                <dt class="text-sm font-medium text-gray-500">Email:</dt>
                <dd class="text-sm text-gray-900">{{ company.email }}</dd>
              </div>
              <div v-if="company.phoneNumber">
                <dt class="text-sm font-medium text-gray-500">Phone:</dt>
                <dd class="text-sm text-gray-900">{{ company.phoneNumber }}</dd>
              </div>
              <div v-if="company.address">
                <dt class="text-sm font-medium text-gray-500">Address:</dt>
                <dd class="text-sm text-gray-900">{{ company.address }}, {{ company.city }}, {{ company.country }}</dd>
              </div>
              <div v-if="company.website">
                <dt class="text-sm font-medium text-gray-500">Website:</dt>
                <dd class="text-sm text-gray-900">
                  <a :href="company.website" target="_blank" class="text-primary-600 hover:text-primary-700">{{ company.website }}</a>
                </dd>
              </div>
            </dl>
            <p v-if="company.description" class="mt-4 text-sm text-gray-700">{{ company.description }}</p>
          </div>
        </div>

        <!-- Financing Offers -->
        <div v-if="financingOffers.length" class="border-t pt-8 mt-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('property.financingOptions') }}</h3>
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
        
        <div v-else class="border-t pt-8 mt-8">
          <div class="text-center py-8 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-500">{{ $t('property.noFinancingOptions') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-600">Property not found.</p>
      <router-link to="/properties" class="mt-4 inline-block text-primary-600 hover:text-primary-700">
        ← Back to Properties
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/shared/api/client'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const route = useRoute()
const { t } = useI18n()
const property = ref(null)
const company = ref(null)
const financingOffers = ref([])
const loading = ref(true)

const loadProperty = async () => {
  try {
    const response = await api.get(`/properties/${route.params.id}`)
    property.value = response.data

    // Load company information
    if (property.value.realEstateCompanyId) {
      try {
        const companyResponse = await api.get(`/organizations/${property.value.realEstateCompanyId}`)
        company.value = companyResponse.data
      } catch (err) {
        console.error('Failed to load company:', err)
      }
    }

    // Load financing offers
    try {
      const offersResponse = await api.get(`/properties/${route.params.id}/financing-offers`)
      financingOffers.value = offersResponse.data
    } catch (err) {
      console.error('Failed to load financing offers:', err)
    }
  } catch (err) {
    console.error('Failed to load property:', err)
  } finally {
    loading.value = false
  }
}

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

onMounted(() => {
  loadProperty()
})
</script>
