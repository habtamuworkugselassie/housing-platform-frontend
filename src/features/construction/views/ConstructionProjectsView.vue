<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{{ $t('construction.projects') }}</h1>
        <p class="mt-2 text-sm text-gray-600">{{ $t('construction.manageProjects') }}</p>
      </div>
      <button
        v-if="authStore.hasRole('REALTOR')"
        @click="showCreateModal = true"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
      >
        + {{ $t('construction.createProject') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('construction.status') }}</label>
          <select
            v-model="filters.status"
            @change="loadProjects"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          >
            <option value="">{{ $t('filters.all') }}</option>
            <option value="PLANNING">{{ $t('construction.planning') }}</option>
            <option value="IN_PROGRESS">{{ $t('construction.inProgress') }}</option>
            <option value="ON_HOLD">{{ $t('construction.onHold') }}</option>
            <option value="COMPLETED">{{ $t('construction.completed') }}</option>
            <option value="CANCELLED">{{ $t('construction.cancelled') }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('construction.type') }}</label>
          <select
            v-model="filters.type"
            @change="loadProjects"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          >
            <option value="">{{ $t('filters.all') }}</option>
            <option value="NEW_CONSTRUCTION">{{ $t('construction.newConstruction') }}</option>
            <option value="RENOVATION">{{ $t('construction.renovation') }}</option>
            <option value="EXPANSION">{{ $t('construction.expansion') }}</option>
            <option value="REPAIR">{{ $t('construction.repair') }}</option>
            <option value="MAINTENANCE">{{ $t('construction.maintenance') }}</option>
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
      <p class="mt-4 text-gray-600">{{ $t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-800">{{ error }}</p>
    </div>

    <!-- Projects List -->
    <div v-if="!loading" class="grid grid-cols-1 gap-6">
      <div
        v-for="project in projects"
        :key="project.id"
        @click="$router.push(`/construction/projects/${project.id}`)"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-xl font-semibold text-gray-900">{{ project.name }}</h3>
              <span :class="getStatusColor(project.status)" class="px-2 py-1 text-xs font-medium rounded">
                {{ getStatusLabel(project.status) }}
              </span>
              <span class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                {{ getTypeLabel(project.type) }}
              </span>
            </div>
            <p v-if="project.description" class="text-sm text-gray-600 mb-3">{{ project.description }}</p>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label class="text-xs font-medium text-gray-500">{{ $t('construction.budget') }}</label>
                <p class="text-sm font-semibold text-gray-900 mt-1">
                  {{ formatPrice(project.budget, project.currency || 'ETB') }}
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500">{{ $t('construction.totalCost') }}</label>
                <p class="text-sm font-semibold text-gray-900 mt-1">
                  {{ formatPrice(project.totalCost, project.currency || 'ETB') }}
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500">{{ $t('construction.phases') }}</label>
                <p class="text-sm font-semibold text-gray-900 mt-1">
                  {{ project.completedPhases || 0 }}/{{ project.totalPhases || 0 }}
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500">{{ $t('construction.completion') }}</label>
                <p class="text-sm font-semibold text-gray-900 mt-1">
                  {{ project.overallCompletionPercentage || 0 }}%
                </p>
              </div>
            </div>

            <div v-if="project.locationCity || project.locationCountry" class="mt-3 text-sm text-gray-600">
              📍 {{ project.locationCity }}{{ project.locationCountry ? ', ' + project.locationCountry : '' }}
            </div>

            <div v-if="project.startDate" class="mt-2 text-xs text-gray-500">
              {{ $t('construction.startDate') }}: {{ formatDate(project.startDate) }}
              <span v-if="project.plannedEndDate">
                • {{ $t('construction.plannedEnd') }}: {{ formatDate(project.plannedEndDate) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="projects.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <p class="text-sm text-gray-500">{{ $t('construction.noProjects') }}</p>
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

    <!-- Create Project Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="showCreateModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('construction.createProject') }}</h3>
          
          <form @submit.prevent="createProject" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.projectName') }} *</label>
              <input
                v-model="projectForm.name"
                type="text"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.description') }}</label>
              <textarea
                v-model="projectForm.description"
                rows="3"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.projectType') }} *</label>
                <select
                  v-model="projectForm.type"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">{{ $t('construction.selectType') }}</option>
                  <option value="NEW_CONSTRUCTION">{{ $t('construction.newConstruction') }}</option>
                  <option value="RENOVATION">{{ $t('construction.renovation') }}</option>
                  <option value="EXPANSION">{{ $t('construction.expansion') }}</option>
                  <option value="REPAIR">{{ $t('construction.repair') }}</option>
                  <option value="MAINTENANCE">{{ $t('construction.maintenance') }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('common.currency') }} *</label>
                <select
                  v-model="projectForm.currency"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="ETB">{{ $t('currency.etb') }}</option>
                  <option value="USD">{{ $t('currency.usd') }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.budget') }}</label>
              <input
                v-model.number="projectForm.budget"
                type="number"
                min="0"
                step="0.01"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.startDate') }}</label>
                <input
                  v-model="projectForm.startDate"
                  type="date"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.plannedEndDate') }}</label>
                <input
                  v-model="projectForm.plannedEndDate"
                  type="date"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.location') }}</label>
              <div class="grid grid-cols-2 gap-4 mt-2">
                <input
                  v-model="projectForm.locationCity"
                  type="text"
                  :placeholder="$t('property.city')"
                  class="block w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  v-model="projectForm.locationCountry"
                  type="text"
                  :placeholder="$t('property.country')"
                  class="block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <input
                v-model="projectForm.locationAddress"
                type="text"
                :placeholder="$t('property.address')"
                class="mt-2 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="showCreateModal = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {{ submitting ? $t('common.loading') : $t('common.create') }}
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
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const projects = ref([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(1)
const showCreateModal = ref(false)

const filters = ref({
  status: '',
  type: ''
})

const projectForm = ref({
  name: '',
  description: '',
  type: '',
  currency: 'ETB',
  budget: null,
  startDate: '',
  plannedEndDate: '',
  locationAddress: '',
  locationCity: '',
  locationCountry: ''
})

const loadProjects = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    
    if (filters.value.status) {
      params.status = filters.value.status
    }

    const response = await api.get('/construction-projects', { params })
    projects.value = response.data.content || response.data || []
    totalPages.value = response.data.totalPages || 1
  } catch (err) {
    console.error('Failed to load projects:', err)
    error.value = err.response?.data?.message || t('construction.failedToLoadProjects')
  } finally {
    loading.value = false
  }
}

const createProject = async () => {
  submitting.value = true
  error.value = ''
  try {
    await api.post('/construction-projects', projectForm.value)
    showCreateModal.value = false
    resetForm()
    loadProjects()
  } catch (err) {
    error.value = err.response?.data?.message || t('construction.failedToCreateProject')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  projectForm.value = {
    name: '',
    description: '',
    type: '',
    currency: 'ETB',
    budget: null,
    startDate: '',
    plannedEndDate: '',
    locationAddress: '',
    locationCity: '',
    locationCountry: ''
  }
}

const clearFilters = () => {
  filters.value = { status: '', type: '' }
  currentPage.value = 0
  loadProjects()
}

const changePage = (page) => {
  currentPage.value = page
  loadProjects()
}

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const getStatusColor = (status) => {
  const colors = {
    PLANNING: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    ON_HOLD: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    PLANNING: t('construction.planning'),
    IN_PROGRESS: t('construction.inProgress'),
    ON_HOLD: t('construction.onHold'),
    COMPLETED: t('construction.completed'),
    CANCELLED: t('construction.cancelled')
  }
  return labels[status] || status
}

const getTypeLabel = (type) => {
  const labels = {
    NEW_CONSTRUCTION: t('construction.newConstruction'),
    RENOVATION: t('construction.renovation'),
    EXPANSION: t('construction.expansion'),
    REPAIR: t('construction.repair'),
    MAINTENANCE: t('construction.maintenance')
  }
  return labels[type] || type
}

onMounted(() => {
  loadProjects()
})
</script>
