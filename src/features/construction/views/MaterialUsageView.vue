<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{{ $t('construction.materialUsage') }}</h1>
        <p class="mt-2 text-sm text-gray-600">{{ $t('construction.trackMaterialUsage') }}</p>
      </div>
      <button
        v-if="authStore.hasRole('REALTOR')"
        @click="showCreateModal = true"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
      >
        + {{ $t('construction.recordUsage') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('construction.project') }}</label>
          <select
            v-model="filters.projectId"
            @change="loadUsage"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          >
            <option value="">{{ $t('filters.all') }}</option>
            <option v-for="proj in projects" :key="proj.id" :value="proj.id">
              {{ proj.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('construction.materialName') }}</label>
          <input
            v-model="filters.materialName"
            type="text"
            :placeholder="$t('construction.searchByMaterial')"
            @input="loadUsage"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('construction.dateFrom') }}</label>
          <input
            v-model="filters.dateFrom"
            type="date"
            @change="loadUsage"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
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
    </div>

    <!-- Usage List -->
    <div v-if="!loading" class="space-y-4">
      <div
        v-for="usage in usageRecords"
        :key="usage.id"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">{{ usage.materialName }}</h3>
              <span v-if="usage.projectName" class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                {{ usage.projectName }}
              </span>
              <span v-if="usage.phaseName" class="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                {{ usage.phaseName }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label class="text-xs font-medium text-gray-500">{{ $t('construction.quantity') }}</label>
                <p class="text-sm font-semibold text-gray-900 mt-1">
                  {{ usage.quantity }} {{ usage.unit }}
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500">{{ $t('construction.unitCost') }}</label>
                <p class="text-sm font-semibold text-gray-900 mt-1">
                  {{ formatPrice(usage.unitCost, usage.currency || 'ETB') }}
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500">{{ $t('construction.totalCost') }}</label>
                <p class="text-sm font-semibold text-gray-900 mt-1">
                  {{ formatPrice(usage.totalCost, usage.currency || 'ETB') }}
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500">{{ $t('construction.usageDate') }}</label>
                <p class="text-sm text-gray-900 mt-1">{{ formatDate(usage.usageDate) }}</p>
              </div>
            </div>

            <div v-if="usage.notes" class="mt-3 text-sm text-gray-600">
              <strong>{{ $t('construction.notes') }}:</strong> {{ usage.notes }}
            </div>

            <div v-if="usage.location" class="mt-2 text-xs text-gray-500">
              📍 {{ usage.location }}
            </div>
          </div>
          <div v-if="authStore.hasRole('REALTOR')" class="ml-4">
            <button
              @click="editUsage(usage)"
              class="px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
            >
              {{ $t('common.edit') }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="usageRecords.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <p class="text-sm text-gray-500">{{ $t('construction.noUsageRecords') }}</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <nav class="flex space-x-2">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 0"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          {{ $t('common.previous') }}
        </button>
        <span class="px-4 py-2 text-sm text-gray-700">
          {{ $t('common.page') }} {{ currentPage + 1 }} {{ $t('common.of') }} {{ totalPages }}
        </span>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= totalPages - 1"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          {{ $t('common.next') }}
        </button>
      </nav>
    </div>

    <!-- Create/Edit Usage Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="showCreateModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingUsage ? $t('construction.editUsage') : $t('construction.recordUsage') }}
          </h3>
          
          <form @submit.prevent="saveUsage" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.project') }}</label>
                <select
                  v-model="usageForm.projectId"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">{{ $t('construction.selectProject') }}</option>
                  <option v-for="proj in projects" :key="proj.id" :value="proj.id">
                    {{ proj.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.phase') }}</label>
                <select
                  v-model="usageForm.phaseId"
                  :disabled="!usageForm.projectId"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">{{ $t('construction.selectPhase') }}</option>
                  <option v-for="phase in projectPhases" :key="phase.id" :value="phase.id">
                    {{ phase.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.materialName') }} *</label>
                <input
                  v-model="usageForm.materialName"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.category') }} *</label>
                <input
                  v-model="usageForm.category"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.quantity') }} *</label>
                <input
                  v-model.number="usageForm.quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.unit') }} *</label>
                <input
                  v-model="usageForm.unit"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('common.currency') }} *</label>
                <select
                  v-model="usageForm.currency"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="ETB">{{ $t('currency.etb') }}</option>
                  <option value="USD">{{ $t('currency.usd') }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.unitCost') }} *</label>
                <input
                  v-model.number="usageForm.unitCost"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.usageDate') }} *</label>
                <input
                  v-model="usageForm.usageDate"
                  type="date"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.location') }}</label>
              <input
                v-model="usageForm.location"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.notes') }}</label>
              <textarea
                v-model="usageForm.notes"
                rows="2"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeUsageModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {{ submitting ? $t('common.loading') : (editingUsage ? $t('common.update') : $t('common.create')) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const usageRecords = ref([])
const projects = ref([])
const projectPhases = ref([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(1)
const showCreateModal = ref(false)
const editingUsage = ref(null)

const filters = ref({
  projectId: '',
  materialName: '',
  dateFrom: ''
})

const usageForm = ref({
  projectId: '',
  phaseId: '',
  materialName: '',
  category: '',
  quantity: 0,
  unit: '',
  unitCost: 0,
  currency: 'ETB',
  usageDate: new Date().toISOString().split('T')[0],
  location: '',
  notes: ''
})

const loadUsage = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    
    if (filters.value.projectId) {
      params.projectId = filters.value.projectId
    }
    
    if (filters.value.materialName) {
      params.materialName = filters.value.materialName
    }
    
    if (filters.value.dateFrom) {
      params.dateFrom = filters.value.dateFrom
    }

    const response = await api.get('/material-usage', { params })
    usageRecords.value = response.data.content || response.data || []
    totalPages.value = response.data.totalPages || 1
  } catch (err) {
    console.error('Failed to load usage:', err)
    error.value = err.response?.data?.message || t('construction.failedToLoadUsage')
  } finally {
    loading.value = false
  }
}

const loadProjects = async () => {
  try {
    const response = await api.get('/construction-projects', { params: { size: 100 } })
    projects.value = response.data.content || response.data || []
  } catch (err) {
    console.error('Failed to load projects:', err)
  }
}

const loadProjectPhases = async (projectId) => {
  if (!projectId) {
    projectPhases.value = []
    return
  }
  
  try {
    const response = await api.get(`/construction-projects/${projectId}`)
    projectPhases.value = response.data.phases || []
  } catch (err) {
    console.error('Failed to load phases:', err)
    projectPhases.value = []
  }
}

watch(() => usageForm.value.projectId, (newProjectId) => {
  if (newProjectId) {
    loadProjectPhases(newProjectId)
  } else {
    projectPhases.value = []
    usageForm.value.phaseId = ''
  }
})

const saveUsage = async () => {
  submitting.value = true
  error.value = ''
  try {
    if (editingUsage.value) {
      await api.put(`/material-usage/${editingUsage.value.id}`, usageForm.value)
    } else {
      await api.post('/material-usage', usageForm.value)
    }
    closeUsageModal()
    loadUsage()
  } catch (err) {
    error.value = err.response?.data?.message || t('construction.failedToSaveUsage')
  } finally {
    submitting.value = false
  }
}

const editUsage = (usage) => {
  editingUsage.value = usage
  usageForm.value = {
    projectId: usage.projectId || '',
    phaseId: usage.phaseId || '',
    materialName: usage.materialName,
    category: usage.category,
    quantity: usage.quantity,
    unit: usage.unit,
    unitCost: usage.unitCost,
    currency: usage.currency || 'ETB',
    usageDate: usage.usageDate ? usage.usageDate.split('T')[0] : new Date().toISOString().split('T')[0],
    location: usage.location || '',
    notes: usage.notes || ''
  }
  
  if (usage.projectId) {
    loadProjectPhases(usage.projectId)
  }
  
  showCreateModal.value = true
}

const closeUsageModal = () => {
  showCreateModal.value = false
  editingUsage.value = null
  usageForm.value = {
    projectId: '',
    phaseId: '',
    materialName: '',
    category: '',
    quantity: 0,
    unit: '',
    unitCost: 0,
    currency: 'ETB',
    usageDate: new Date().toISOString().split('T')[0],
    location: '',
    notes: ''
  }
  projectPhases.value = []
}

const clearFilters = () => {
  filters.value = { projectId: '', materialName: '', dateFrom: '' }
  currentPage.value = 0
  loadUsage()
}

const changePage = (page) => {
  currentPage.value = page
  loadUsage()
}

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  loadUsage()
  loadProjects()
})
</script>
