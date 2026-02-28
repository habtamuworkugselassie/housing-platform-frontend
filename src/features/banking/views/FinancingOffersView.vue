<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">{{ $t('banking.financingOffers') }}</h1>
        <p class="mt-2 text-sm text-gray-400">{{ $t('banking.managePropertyFinancingOffers') }}</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-white text-black rounded-lg hover:bg-yellow-400 font-medium transition-colors"
      >
        + {{ $t('banking.createFinancingOffer') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-900/40 border border-red-500/30 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-200">{{ error }}</p>
    </div>

    <!-- Financing Offers List -->
    <div v-if="!loading" class="grid grid-cols-1 gap-6">
      <div
        v-for="offer in offers"
        :key="offer.id"
        class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-white">
                {{ $t('banking.offer') }} #{{ offer.id.substring(0, 8) }}
              </h3>
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                offer.status === 'ACTIVE' ? 'bg-green-500/30 text-green-200' :
                offer.status === 'PENDING_APPROVAL' ? 'bg-yellow-500/30 text-yellow-200' :
                offer.status === 'EXPIRED' ? 'bg-red-500/30 text-red-200' :
                'bg-gray-500/30 text-gray-300'
              ]">
                {{ offer.status }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label class="text-xs font-medium text-gray-400">{{ $t('banking.creditProduct') }}</label>
                <p class="text-sm text-white mt-1">{{ getProductName(offer.creditProductId) }}</p>
              </div>
              <div v-if="offer.propertyId">
                <label class="text-xs font-medium text-gray-400">{{ $t('banking.propertyId') }}</label>
                <p class="text-sm text-white mt-1">{{ offer.propertyId.substring(0, 8) }}...</p>
              </div>
              <div v-if="offer.buildingId">
                <label class="text-xs font-medium text-gray-400">{{ $t('banking.buildingId') }}</label>
                <p class="text-sm text-white mt-1">{{ offer.buildingId.substring(0, 8) }}...</p>
              </div>
              <div v-if="offer.specialInterestRate">
                <label class="text-xs font-medium text-gray-400">{{ $t('banking.specialInterestRate') }}</label>
                <p class="text-sm text-white mt-1">{{ offer.specialInterestRate }}%</p>
              </div>
              <div v-if="offer.specialLTVRatio">
                <label class="text-xs font-medium text-gray-400">{{ $t('banking.specialLtvRatio') }}</label>
                <p class="text-sm text-white mt-1">{{ (offer.specialLTVRatio * 100).toFixed(0) }}%</p>
              </div>
            </div>

            <div v-if="offer.specialTerms" class="mt-4">
              <label class="text-xs font-medium text-gray-400">{{ $t('loan.specialTerms') }}</label>
              <p class="text-sm text-white mt-1">{{ offer.specialTerms }}</p>
            </div>
          </div>
          
          <div class="ml-4 flex gap-2">
            <button
              @click="editOffer(offer)"
              class="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {{ $t('common.edit') }}
            </button>
            <button
              @click="deleteOffer(offer.id)"
              class="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              {{ $t('common.delete') }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="offers.length === 0" class="text-center py-12 bg-zinc-900 border border-white/10 rounded-lg">
        <p class="text-sm text-gray-400">{{ $t('banking.noFinancingOffersYet') }}</p>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingOffer"
      class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 w-full max-w-2xl">
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6">
          <h3 class="text-lg font-medium text-white mb-4">
            {{ editingOffer ? $t('banking.editFinancingOffer') : $t('banking.createFinancingOffer') }}
          </h3>
          
          <form @submit.prevent="saveOffer" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400">{{ $t('banking.creditProduct') }} *</label>
              <select
                v-model="offerForm.creditProductId"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2"
              >
                <option value="">{{ $t('loan.selectCreditProduct') }}</option>
                <option
                  v-for="product in creditProducts"
                  :key="product.id"
                  :value="product.id"
                >
                  {{ product.name }} ({{ product.interestRate }}%)
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400">{{ $t('banking.linkTo') }} *</label>
              <select
                v-model="linkType"
                @change="clearSelection"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2"
              >
                <option value="none">{{ $t('banking.noneGeneralOffer') }}</option>
                <option value="property">{{ $t('property.properties') }}</option>
                <option value="building">{{ $t('building.buildings') }}</option>
              </select>
            </div>

            <!-- Property Search -->
            <div v-if="linkType === 'property'">
              <label class="block text-sm font-medium text-gray-400 mb-2">
                {{ $t('banking.searchSelectProperties') }} *
                <span class="text-xs font-normal text-gray-500">({{ $t('banking.youCanSelectMultiple') }})</span>
              </label>
              
              <!-- Search Filters -->
              <div class="grid grid-cols-2 gap-2 mb-3">
                <input
                  v-model="propertySearch.companyName"
                  type="text"
                  :placeholder="$t('banking.companyName') + '...'"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2 text-sm"
                  @input="debouncedSearchProperties"
                />
                <input
                  v-model="propertySearch.city"
                  type="text"
                  :placeholder="$t('property.city') + '...'"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2 text-sm"
                  @input="debouncedSearchProperties"
                />
                <input
                  v-model="propertySearch.title"
                  type="text"
                  :placeholder="$t('banking.propertyTitle') + '...'"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2 text-sm"
                  @input="debouncedSearchProperties"
                />
                <input
                  v-model="propertySearch.country"
                  type="text"
                  :placeholder="$t('property.country') + '...'"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2 text-sm"
                  @input="debouncedSearchProperties"
                />
              </div>
              
              <!-- Search Results -->
              <div class="relative">
                <div v-if="propertySearchLoading" class="text-center py-4 text-sm text-gray-500">
                  {{ $t('banking.searching') }}
                </div>
                <div v-else-if="propertySearchResults.length === 0 && propertySearchPerformed" class="text-center py-4 text-sm text-gray-500">
                  {{ $t('banking.noPropertiesFound') }}
                </div>
                <div v-else-if="propertySearchResults.length > 0" class="max-h-60 overflow-y-auto border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
                  <div
                    v-for="property in propertySearchResults"
                    :key="property.id"
                    @click="togglePropertySelection(property)"
                    :class="[
                      'p-3 border-b border-white/10 hover:bg-yellow-500/20 cursor-pointer transition-colors',
                      selectedProperties.includes(property.id) ? 'bg-yellow-500/20 border-yellow-400' : ''
                    ]"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <input
                            type="checkbox"
                            :checked="selectedProperties.includes(property.id)"
                            @click.stop="togglePropertySelection(property)"
                            class="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-white/30 rounded"
                          />
                          <h4 class="font-semibold text-white">{{ property.title }}</h4>
                        </div>
                        <p class="text-xs text-gray-600 mt-1 ml-6">
                          {{ property.city }}, {{ property.country || 'Ethiopia' }}
                          <span v-if="property.realEstateCompanyName"> • {{ property.realEstateCompanyName }}</span>
                        </p>
                        <div class="flex flex-col gap-1 mt-1 ml-6">
                          <p v-if="property.priceETB" class="text-sm font-medium text-primary-600">{{ formatPrice(property.priceETB, 'ETB') }}</p>
                          <p v-if="property.priceUSD" class="text-xs font-semibold text-gray-600">{{ formatPrice(property.priceUSD, 'USD') }}</p>
                        </div>
                        <div v-if="property.bedrooms || property.bathrooms || property.area" class="text-xs text-gray-500 mt-1 ml-6">
                          <span v-if="property.bedrooms">{{ property.bedrooms }} bed</span>
                          <span v-if="property.bathrooms"> • {{ property.bathrooms }} bath</span>
                          <span v-if="property.area"> • {{ property.area }} m²</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-4 text-sm text-gray-500">
                  {{ $t('banking.enterSearchCriteriaProperties') }}
                </div>
              </div>
              
              <!-- Selected Properties Summary -->
              <div v-if="selectedProperties.length > 0" class="mt-3 p-3 bg-yellow-500/10 rounded-md border border-yellow-400/50">
                <p class="text-sm font-medium text-gray-400 mb-2">
                  {{ $t('banking.selected') }}: {{ selectedProperties.length }} {{ selectedProperties.length === 1 ? $t('banking.property') : $t('banking.properties') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="propertyId in selectedProperties"
                    :key="propertyId"
                    class="inline-flex items-center px-2 py-1 bg-blue-500/30 text-blue-200 rounded text-xs font-medium"
                  >
                    {{ getPropertyDisplayName(propertyId) }}
                    <button
                      @click.stop="togglePropertySelection({ id: propertyId })"
                      class="ml-1 text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <!-- Building Search -->
            <div v-if="linkType === 'building'">
              <label class="block text-sm font-medium text-gray-400 mb-2">
                {{ $t('banking.searchSelectBuildings') }} *
                <span class="text-xs font-normal text-gray-500">({{ $t('banking.youCanSelectMultiple') }})</span>
              </label>
              
              <!-- Search Filters -->
              <div class="grid grid-cols-2 gap-2 mb-3">
                <input
                  v-model="buildingSearch.companyName"
                  type="text"
                  :placeholder="$t('banking.companyName') + '...'"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2 text-sm"
                  @input="debouncedSearchBuildings"
                />
                <input
                  v-model="buildingSearch.city"
                  type="text"
                  :placeholder="$t('property.city') + '...'"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2 text-sm"
                  @input="debouncedSearchBuildings"
                />
                <input
                  v-model="buildingSearch.name"
                  type="text"
                  :placeholder="$t('banking.buildingName') + '...'"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2 text-sm"
                  @input="debouncedSearchBuildings"
                />
                <input
                  v-model="buildingSearch.country"
                  type="text"
                  :placeholder="$t('property.country') + '...'"
                  class="block w-full border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2 text-sm"
                  @input="debouncedSearchBuildings"
                />
              </div>
              
              <!-- Search Results -->
              <div class="relative">
                <div v-if="buildingSearchLoading" class="text-center py-4 text-sm text-gray-500">
                  {{ $t('banking.searching') }}
                </div>
                <div v-else-if="buildingSearchResults.length === 0 && buildingSearchPerformed" class="text-center py-4 text-sm text-gray-500">
                  {{ $t('banking.noBuildingsFound') }}
                </div>
                <div v-else-if="buildingSearchResults.length > 0" class="max-h-60 overflow-y-auto border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400">
                  <div
                    v-for="building in buildingSearchResults"
                    :key="building.id"
                    @click="toggleBuildingSelection(building)"
                    :class="[
                      'p-3 border-b border-white/10 hover:bg-yellow-500/20 cursor-pointer transition-colors',
                      selectedBuildings.includes(building.id) ? 'bg-yellow-500/20 border-yellow-400' : ''
                    ]"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <input
                            type="checkbox"
                            :checked="selectedBuildings.includes(building.id)"
                            @click.stop="toggleBuildingSelection(building)"
                            class="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-white/30 rounded"
                          />
                          <h4 class="font-semibold text-white">{{ building.name }}</h4>
                        </div>
                        <p class="text-xs text-gray-600 mt-1 ml-6">
                          {{ building.city }}, {{ building.country || 'Ethiopia' }}
                          <span v-if="building.realEstateCompanyName"> • {{ building.realEstateCompanyName }}</span>
                        </p>
                        <p class="text-xs text-gray-500 mt-1 ml-6">
                          {{ building.totalUnits }} units • {{ building.totalFloors }} floors
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-4 text-sm text-gray-500">
                  {{ $t('banking.enterSearchCriteriaBuildings') }}
                </div>
              </div>
              
              <!-- Selected Buildings Summary -->
              <div v-if="selectedBuildings.length > 0" class="mt-3 p-3 bg-yellow-500/10 rounded-md border border-yellow-400/50">
                <p class="text-sm font-medium text-gray-400 mb-2">
                  {{ $t('banking.selected') }}: {{ selectedBuildings.length }} {{ selectedBuildings.length === 1 ? $t('banking.building') : $t('banking.buildings') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="buildingId in selectedBuildings"
                    :key="buildingId"
                    class="inline-flex items-center px-2 py-1 bg-blue-500/30 text-blue-200 rounded text-xs font-medium"
                  >
                    {{ getBuildingDisplayName(buildingId) }}
                    <button
                      @click.stop="toggleBuildingSelection({ id: buildingId })"
                      class="ml-1 text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div v-if="linkType === 'none'">
              <label class="block text-sm font-medium text-gray-400">{{ $t('banking.projectIdOptional') }}</label>
              <input
                v-model="offerForm.projectId"
                type="text"
                :placeholder="$t('banking.leaveEmptyNotApplicable')"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400">{{ $t('banking.specialInterestRate') }}</label>
                <input
                  v-model.number="offerForm.specialInterestRate"
                  type="number"
                  step="0.01"
                  min="0"
                  :placeholder="$t('banking.overrideProductRate')"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400">{{ $t('banking.specialLtvRatio') }}</label>
                <input
                  v-model.number="offerForm.specialLTVRatio"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  :placeholder="$t('banking.overrideProductLtv')"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400">{{ $t('loan.specialTerms') }}</label>
              <textarea
                v-model="offerForm.specialTerms"
                rows="3"
                :placeholder="$t('banking.additionalTermsSpecificOffer')"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 px-3 py-2"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {{ editingOffer ? $t('common.update') : $t('common.create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
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

const loading = ref(false)
const error = ref('')
const offers = ref([])
const creditProducts = ref([])
const showCreateModal = ref(false)
const editingOffer = ref(null)

const linkType = ref('none')
const offerForm = ref({
  creditProductId: '',
  propertyId: '',
  buildingId: '',
  projectId: '',
  specialInterestRate: null,
  specialLTVRatio: null,
  specialTerms: ''
})

// Selected items (for multi-select)
const selectedProperties = ref([])
const selectedBuildings = ref([])

// Property search
const propertySearch = ref({
  companyName: '',
  city: '',
  state: '',
  country: '',
  title: ''
})
const propertySearchResults = ref([])
const propertySearchLoading = ref(false)
const propertySearchPerformed = ref(false)
let propertySearchTimeout = null

// Building search
const buildingSearch = ref({
  companyName: '',
  city: '',
  state: '',
  country: '',
  name: ''
})
const buildingSearchResults = ref([])
const buildingSearchLoading = ref(false)
const buildingSearchPerformed = ref(false)
let buildingSearchTimeout = null

const bankId = ref(route.params.bankId)

const loadOffers = async () => {
  if (!bankId.value) {
    error.value = 'Bank ID is required'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const response = await api.get(`/banks/${bankId.value}/financing-offers`)
    offers.value = response.data
  } catch (err) {
    console.error('Failed to load financing offers:', err)
    error.value = err.response?.data?.message || 'Failed to load financing offers'
  } finally {
    loading.value = false
  }
}

const loadCreditProducts = async () => {
  try {
    const response = await api.get(`/banks/${bankId.value}/credit-products`)
    creditProducts.value = response.data
  } catch (err) {
    console.error('Failed to load credit products:', err)
  }
}

const saveOffer = async () => {
  // Validate selection if linking to property/building
  if (linkType.value === 'property' && selectedProperties.value.length === 0) {
    alert(t('banking.pleaseSelectAtLeastOneProperty'))
    return
  }
  if (linkType.value === 'building' && selectedBuildings.value.length === 0) {
    alert(t('banking.pleaseSelectAtLeastOneBuilding'))
    return
  }
  
  try {
    const basePayload = {
      creditProductId: offerForm.value.creditProductId,
      projectId: linkType.value === 'none' ? offerForm.value.projectId : null,
      specialInterestRate: offerForm.value.specialInterestRate || null,
      specialLTVRatio: offerForm.value.specialLTVRatio || null,
      specialTerms: offerForm.value.specialTerms || null
    }

    if (editingOffer.value) {
      // For editing, update the existing offer (single property/building)
      const payload = {
        ...basePayload,
        propertyId: linkType.value === 'property' ? offerForm.value.propertyId : null,
        buildingId: linkType.value === 'building' ? offerForm.value.buildingId : null
      }
      await api.put(`/banks/${bankId.value}/financing-offers/${editingOffer.value.id}`, payload)
      alert(t('banking.financingOfferUpdatedSuccessfully'))
    } else {
      // For creating, create multiple offers if multiple properties/buildings selected
      let createdCount = 0
      if (linkType.value === 'property' && selectedProperties.value.length > 0) {
        // Create one offer per selected property
        const promises = selectedProperties.value.map(propertyId => {
          const payload = {
            ...basePayload,
            propertyId: propertyId,
            buildingId: null
          }
          return api.post(`/banks/${bankId.value}/financing-offers`, payload)
        })
        await Promise.all(promises)
        createdCount = selectedProperties.value.length
      } else if (linkType.value === 'building' && selectedBuildings.value.length > 0) {
        // Create one offer per selected building
        const promises = selectedBuildings.value.map(buildingId => {
          const payload = {
            ...basePayload,
            propertyId: null,
            buildingId: buildingId
          }
          return api.post(`/banks/${bankId.value}/financing-offers`, payload)
        })
        await Promise.all(promises)
        createdCount = selectedBuildings.value.length
      } else {
        // General offer (no property/building)
        await api.post(`/banks/${bankId.value}/financing-offers`, basePayload)
        createdCount = 1
      }
      
      if (createdCount > 1) {
        alert(t('banking.successfullyCreatedFinancingOffers', { count: createdCount }))
      } else {
        alert(t('banking.financingOfferCreatedSuccessfully'))
      }
    }
    closeModal()
    loadOffers()
  } catch (err) {
    alert(err.response?.data?.message || t('banking.failedToSaveFinancingOffer'))
  }
}

const editOffer = async (offer) => {
  editingOffer.value = offer
  linkType.value = offer.buildingId ? 'building' : (offer.propertyId ? 'property' : 'none')
  offerForm.value = {
    creditProductId: offer.creditProductId,
    propertyId: offer.propertyId || '',
    buildingId: offer.buildingId || '',
    projectId: offer.projectId || '',
    specialInterestRate: offer.specialInterestRate || null,
    specialLTVRatio: offer.specialLTVRatio || null,
    specialTerms: offer.specialTerms || ''
  }
  
  // For editing, set single selection
  selectedProperties.value = offer.propertyId ? [offer.propertyId] : []
  selectedBuildings.value = offer.buildingId ? [offer.buildingId] : []
  
  // Load the selected property/building info for display
  if (offer.propertyId) {
    try {
      const response = await api.get(`/properties/${offer.propertyId}`)
      propertySearchResults.value = [response.data]
      propertySearchPerformed.value = true
    } catch (err) {
      console.error('Failed to load property:', err)
    }
  } else if (offer.buildingId) {
    try {
      const response = await api.get(`/buildings/${offer.buildingId}`)
      buildingSearchResults.value = [response.data]
      buildingSearchPerformed.value = true
    } catch (err) {
      console.error('Failed to load building:', err)
    }
  }
  
  showCreateModal.value = true
}

const deleteOffer = async (offerId) => {
  if (!confirm(t('banking.areYouSureDeleteFinancingOffer'))) {
    return
  }

  try {
    await api.delete(`/banks/${bankId.value}/financing-offers/${offerId}`)
    loadOffers()
  } catch (err) {
    alert(err.response?.data?.message || t('banking.failedToDeleteFinancingOffer'))
  }
}

const getProductName = (productId) => {
  const product = creditProducts.value.find(p => p.id === productId)
  return product ? product.name : 'Unknown Product'
}

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

const getPropertyDisplayName = (propertyId) => {
  const property = propertySearchResults.value.find(p => p.id === propertyId)
  return property ? property.title : propertyId.substring(0, 8) + '...'
}

const getBuildingDisplayName = (buildingId) => {
  const building = buildingSearchResults.value.find(b => b.id === buildingId)
  return building ? building.name : buildingId.substring(0, 8) + '...'
}

const clearSelection = () => {
  offerForm.value.propertyId = ''
  offerForm.value.buildingId = ''
  selectedProperties.value = []
  selectedBuildings.value = []
  propertySearchResults.value = []
  buildingSearchResults.value = []
  propertySearchPerformed.value = false
  buildingSearchPerformed.value = false
}

const togglePropertySelection = (property) => {
  const index = selectedProperties.value.indexOf(property.id)
  if (index > -1) {
    selectedProperties.value.splice(index, 1)
  } else {
    selectedProperties.value.push(property.id)
  }
}

const toggleBuildingSelection = (building) => {
  const index = selectedBuildings.value.indexOf(building.id)
  if (index > -1) {
    selectedBuildings.value.splice(index, 1)
  } else {
    selectedBuildings.value.push(building.id)
  }
}

const searchProperties = async () => {
  if (linkType.value !== 'property') return
  
  const hasSearchCriteria = propertySearch.value.companyName || 
                            propertySearch.value.city || 
                            propertySearch.value.title || 
                            propertySearch.value.country
  
  if (!hasSearchCriteria) {
    propertySearchResults.value = []
    propertySearchPerformed.value = false
    return
  }
  
  propertySearchLoading.value = true
  propertySearchPerformed.value = true
  
  try {
    const params = new URLSearchParams()
    if (propertySearch.value.companyName) params.append('companyName', propertySearch.value.companyName)
    if (propertySearch.value.city) params.append('city', propertySearch.value.city)
    if (propertySearch.value.state) params.append('state', propertySearch.value.state)
    if (propertySearch.value.country) params.append('country', propertySearch.value.country)
    if (propertySearch.value.title) params.append('title', propertySearch.value.title)
    params.append('limit', '20')
    
    const response = await api.get(`/properties/search?${params.toString()}`)
    propertySearchResults.value = response.data
  } catch (err) {
    console.error('Failed to search properties:', err)
    propertySearchResults.value = []
  } finally {
    propertySearchLoading.value = false
  }
}

const debouncedSearchProperties = () => {
  if (propertySearchTimeout) {
    clearTimeout(propertySearchTimeout)
  }
  propertySearchTimeout = setTimeout(() => {
    searchProperties()
  }, 500)
}

const searchBuildings = async () => {
  if (linkType.value !== 'building') return
  
  const hasSearchCriteria = buildingSearch.value.companyName || 
                            buildingSearch.value.city || 
                            buildingSearch.value.name || 
                            buildingSearch.value.country
  
  if (!hasSearchCriteria) {
    buildingSearchResults.value = []
    buildingSearchPerformed.value = false
    return
  }
  
  buildingSearchLoading.value = true
  buildingSearchPerformed.value = true
  
  try {
    const params = new URLSearchParams()
    if (buildingSearch.value.companyName) params.append('companyName', buildingSearch.value.companyName)
    if (buildingSearch.value.city) params.append('city', buildingSearch.value.city)
    if (buildingSearch.value.state) params.append('state', buildingSearch.value.state)
    if (buildingSearch.value.country) params.append('country', buildingSearch.value.country)
    if (buildingSearch.value.name) params.append('name', buildingSearch.value.name)
    params.append('limit', '20')
    
    const response = await api.get(`/buildings/search?${params.toString()}`)
    buildingSearchResults.value = response.data
  } catch (err) {
    console.error('Failed to search buildings:', err)
    buildingSearchResults.value = []
  } finally {
    buildingSearchLoading.value = false
  }
}

const debouncedSearchBuildings = () => {
  if (buildingSearchTimeout) {
    clearTimeout(buildingSearchTimeout)
  }
  buildingSearchTimeout = setTimeout(() => {
    searchBuildings()
  }, 500)
}

const closeModal = () => {
  showCreateModal.value = false
  editingOffer.value = null
  linkType.value = 'none'
  offerForm.value = {
    creditProductId: '',
    propertyId: '',
    buildingId: '',
    projectId: '',
    specialInterestRate: null,
    specialLTVRatio: null,
    specialTerms: ''
  }
  selectedProperties.value = []
  selectedBuildings.value = []
  propertySearch.value = {
    companyName: '',
    city: '',
    state: '',
    country: '',
    title: ''
  }
  buildingSearch.value = {
    companyName: '',
    city: '',
    state: '',
    country: '',
    name: ''
  }
  propertySearchResults.value = []
  buildingSearchResults.value = []
  propertySearchPerformed.value = false
  buildingSearchPerformed.value = false
}

onMounted(() => {
  loadOffers()
  loadCreditProducts()
})
</script>