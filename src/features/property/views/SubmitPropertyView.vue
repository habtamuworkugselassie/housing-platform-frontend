<template>
  <div class="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12 text-white">
    <div class="bg-zinc-900 border border-white/10 shadow rounded-lg p-4 sm:p-6 lg:p-8 text-white">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{{ $t('submitProperty.title') }}</h2>
      
      <div v-if="!agent" class="mb-6 rounded-md bg-yellow-50 p-4">
        <div class="text-sm text-yellow-800">
          {{ $t('submitProperty.needAgent') }}
        </div>
        <router-link to="/register-agent" class="mt-2 inline-block text-sm font-medium text-yellow-900 hover:text-yellow-700">
          {{ $t('submitProperty.registerAsAgent') }} →
        </router-link>
      </div>

      <form @submit.prevent="handleSubmit" v-else>
        <div class="space-y-6">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label for="title" class="block text-sm font-medium text-gray-700">{{ $t('property.propertyTitle') }} *</label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label for="type" class="block text-sm font-medium text-gray-700">{{ $t('property.propertyType') }} *</label>
              <select
                id="type"
                v-model="form.type"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{{ $t('propertyTypes.selectType') }}</option>
                <option value="APARTMENT">{{ $t('propertyTypes.apartment') }}</option>
                <option value="HOUSE">{{ $t('propertyTypes.house') }}</option>
                <option value="VILLA">{{ $t('propertyTypes.villa') }}</option>
                <option value="CONDOMINIUM">{{ $t('propertyTypes.condominium') }}</option>
                <option value="TOWNHOUSE">{{ $t('propertyTypes.townhouse') }}</option>
                <option value="LAND">{{ $t('propertyTypes.land') }}</option>
              </select>
            </div>

            <div>
              <label for="category" class="block text-sm font-medium text-gray-700">{{ $t('property.category') }} *</label>
              <select
                id="category"
                v-model="form.category"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{{ $t('submitProperty.selectCategory') }}</option>
                <option value="FOR_SALE">{{ $t('property.forSale') }}</option>
                <option value="FOR_RENTAL">{{ $t('property.forRental') }}</option>
              </select>
            </div>

            <div>
              <label for="constructionStatus" class="block text-sm font-medium text-gray-700">{{ $t('property.constructionStatus') }} *</label>
              <select
                id="constructionStatus"
                v-model="form.constructionStatus"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{{ $t('submitProperty.selectStatus') }}</option>
                <option value="READY_TO_MOVE">{{ $t('property.readyToMove') }}</option>
                <option value="UNDER_CONSTRUCTION">{{ $t('property.underConstruction') }}</option>
                <option value="PLANNED">{{ $t('property.planned') }}</option>
                <option value="COMPLETED">{{ $t('property.completed') || 'Completed' }}</option>
              </select>
            </div>

            <div>
              <label for="constructionPercentage" class="block text-sm font-medium text-gray-700">{{ $t('property.constructionPercentage') }} (%)</label>
              <input
                id="constructionPercentage"
                v-model.number="form.constructionPercentage"
                type="number"
                min="0"
                max="100"
                placeholder="0-100"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div class="flex items-center">
              <input
                id="isFullyFurnished"
                v-model="form.isFullyFurnished"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="isFullyFurnished" class="ml-2 block text-sm text-gray-700">
                {{ $t('property.isFullyFurnished') }}
              </label>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('property.price') }} *</label>
              <p class="text-xs text-gray-500 mb-3">{{ $t('property.dualPricingNote') }}</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="priceETB" class="block text-xs font-medium text-gray-600 mb-1">{{ $t('currency.etb') }} ({{ $t('currency.birr') }})</label>
                  <input
                    id="priceETB"
                    v-model.number="form.priceETB"
                    type="number"
                    step="0.01"
                    min="0"
                    :placeholder="$t('property.priceOptional')"
                    class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label for="priceUSD" class="block text-xs font-medium text-gray-600 mb-1">{{ $t('currency.usd') }} ({{ $t('currency.dollar') }})</label>
                  <input
                    id="priceUSD"
                    v-model.number="form.priceUSD"
                    type="number"
                    step="0.01"
                    min="0"
                    :placeholder="$t('property.priceOptional')"
                    class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <p class="mt-2 text-xs text-gray-500">{{ $t('property.atLeastOnePriceRequired') }}</p>
            </div>

            <div>
              <label for="area" class="block text-sm font-medium text-gray-700">{{ $t('property.area') }} ({{ $t('property.areaUnit') }}) *</label>
              <input
                id="area"
                v-model.number="form.area"
                type="number"
                step="0.01"
                min="0"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label for="bedrooms" class="block text-sm font-medium text-gray-700">{{ $t('property.bedrooms') }}</label>
              <input
                id="bedrooms"
                v-model.number="form.bedrooms"
                type="number"
                min="0"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label for="bathrooms" class="block text-sm font-medium text-gray-700">{{ $t('property.bathrooms') }}</label>
              <input
                id="bathrooms"
                v-model.number="form.bathrooms"
                type="number"
                min="0"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label for="floorNumber" class="block text-sm font-medium text-gray-700">{{ $t('property.floorNumber') }}</label>
              <input
                id="floorNumber"
                v-model.number="form.floorNumber"
                type="number"
                min="0"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label for="totalFloors" class="block text-sm font-medium text-gray-700">{{ $t('property.totalFloors') }}</label>
              <input
                id="totalFloors"
                v-model.number="form.totalFloors"
                type="number"
                min="0"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label for="buildingId" class="block text-sm font-medium text-gray-700">{{ $t('submitProperty.buildingOptional') }}</label>
              <select
                id="buildingId"
                v-model="form.buildingId"
                @change="onBuildingChange"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{{ $t('submitProperty.noneStandalone') }}</option>
                <option
                  v-for="building in buildings"
                  :key="building.id"
                  :value="building.id"
                >
                  {{ building.name }} - {{ building.city }}
                </option>
              </select>
            </div>

            <div v-if="form.buildingId">
              <label for="unitNumber" class="block text-sm font-medium text-gray-700">{{ $t('building.unitNumber') }}</label>
              <input
                id="unitNumber"
                v-model="form.unitNumber"
                type="text"
                :placeholder="$t('submitProperty.unitNumberPlaceholder')"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label for="address" class="block text-sm font-medium text-gray-700">{{ $t('property.address') }} *</label>
            <input
              id="address"
              v-model="form.address"
              type="text"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label for="city" class="block text-sm font-medium text-gray-700">{{ $t('property.city') }} *</label>
              <input
                id="city"
                v-model="form.city"
                type="text"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label for="state" class="block text-sm font-medium text-gray-700">{{ $t('property.state') }}</label>
              <input
                id="state"
                v-model="form.state"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label for="country" class="block text-sm font-medium text-gray-700">{{ $t('property.country') }} *</label>
              <input
                id="country"
                v-model="form.country"
                type="text"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label for="zipCode" class="block text-sm font-medium text-gray-700">{{ $t('property.zipCode') }}</label>
            <input
              id="zipCode"
              v-model="form.zipCode"
              type="text"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">{{ $t('property.description') }}</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('submitProperty.propertyImages') }}</label>
            
            <!-- File Upload -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
              <input
                type="file"
                ref="fileInput"
                @change="handleFileSelect"
                multiple
                accept="image/*,video/*"
                class="hidden"
                id="property-file-upload"
              />
              <label for="property-file-upload" class="cursor-pointer flex flex-col items-center justify-center">
                <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <span class="text-sm text-gray-600 mb-1">Click to upload photos or videos</span>
                <span class="text-xs text-gray-500">Supports: JPG, PNG, GIF, MP4, MOV (Max 10MB each)</span>
              </label>
            </div>
            
            <!-- Selected Files Preview -->
            <div v-if="selectedFiles.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div v-for="(fileObj, index) in selectedFiles" :key="index" class="relative">
                <div v-if="fileObj.type.startsWith('image/')" class="relative">
                  <img :src="fileObj.preview" :alt="fileObj.name" class="w-full h-24 object-cover rounded border border-gray-300" />
                  <button
                    type="button"
                    @click="removeSelectedFile(index)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <div v-else class="relative bg-gray-100 rounded border border-gray-300 h-24 flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  <button
                    type="button"
                    @click="removeSelectedFile(index)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <p class="text-xs text-gray-600 mt-1 truncate">{{ fileObj.name }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="mt-4 rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-800">{{ error }}</div>
        </div>

        <div v-if="success" class="mt-4 rounded-md bg-green-50 p-4">
          <div class="text-sm text-green-800">{{ success }}</div>
        </div>

        <div class="mt-6">
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium bg-white text-black hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-yellow-400 disabled:opacity-50"
          >
            <span v-if="loading">{{ $t('submitProperty.submitting') }}</span>
            <span v-else>{{ $t('submitProperty.submitProperty') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/shared/api/client'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const agent = ref(null)
const buildings = ref([])
const form = ref({
  title: '',
  type: '',
  category: '',
  constructionStatus: '',
  constructionPercentage: null,
  isFullyFurnished: false,
  priceETB: null,
  priceUSD: null,
  area: null,
  bedrooms: null,
  bathrooms: null,
  floorNumber: null,
  totalFloors: null,
  address: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  description: '',
  realEstateCompanyId: '',
  buildingId: '',
  unitNumber: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')
const selectedFiles = ref([])
const fileInput = ref(null)

const loadAgent = async () => {
  try {
    const response = await api.get('/real-estate-agents/me')
    agent.value = response.data
    form.value.realEstateCompanyId = agent.value.organizationId
    
    // Load buildings for this organization
    if (agent.value.organizationId) {
      try {
        const buildingsResponse = await api.get(`/buildings/companies/${agent.value.organizationId}`)
        buildings.value = buildingsResponse.data
      } catch (err) {
        console.error('Failed to load buildings:', err)
      }
    }
  } catch (err) {
    console.error('Failed to load agent:', err)
  }
}

const onBuildingChange = () => {
  if (form.value.buildingId) {
    const selectedBuilding = buildings.value.find(b => b.id === form.value.buildingId)
    if (selectedBuilding) {
      // Pre-fill address fields from building
      form.value.address = selectedBuilding.address
      form.value.city = selectedBuilding.city
      form.value.state = selectedBuilding.state
      form.value.country = selectedBuilding.country
      form.value.zipCode = selectedBuilding.zipCode
    }
  }
}

// Check if buildingId is in route params
onMounted(() => {
  loadAgent()
  if (route.query.buildingId) {
    form.value.buildingId = route.query.buildingId
  }
})

// Cleanup preview URLs on unmount
onUnmounted(() => {
  selectedFiles.value.forEach(fileObj => {
    if (fileObj.preview) {
      URL.revokeObjectURL(fileObj.preview)
    }
  })
})

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || [])
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`File ${file.name} exceeds 10MB limit`)
      return
    }
    
    const fileObj = {
      file: file,
      name: file.name,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }
    selectedFiles.value.push(fileObj)
  })
  
  // Reset input to allow selecting the same file again
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeSelectedFile = (index) => {
  if (selectedFiles.value[index].preview) {
    URL.revokeObjectURL(selectedFiles.value[index].preview)
  }
  selectedFiles.value.splice(index, 1)
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    // Create property first (without images)
    const propertyData = {
      ...form.value
    }

    // Remove images from propertyData as we'll upload them separately
    delete propertyData.images

    const response = await api.post('/properties', propertyData)
    const createdProperty = response.data
    
    // Upload images if any were selected
    if (selectedFiles.value.length > 0) {
      const formData = new FormData()
      selectedFiles.value.forEach(fileObj => {
        formData.append('files', fileObj.file)
      })
      
      await api.post(`/properties/${createdProperty.id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
    
    success.value = t('submitProperty.propertySubmitted')
    setTimeout(() => {
      router.push('/properties')
    }, 2000)
  } catch (err) {
    error.value = err.response?.data?.message || t('submitProperty.submitFailed')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAgent()
})
</script>
