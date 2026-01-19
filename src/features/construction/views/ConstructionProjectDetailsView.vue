<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="mt-4 text-gray-600">{{ $t('common.loading') }}</p>
    </div>

    <div v-else-if="project" class="space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <button
            @click="$router.back()"
            class="mb-4 text-sm text-gray-600 hover:text-gray-900"
          >
            ← {{ $t('common.back') }}
          </button>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-3xl font-bold text-gray-900">{{ project.name }}</h1>
            <span :class="getStatusColor(project.status)" class="px-3 py-1 text-sm font-medium rounded">
              {{ getStatusLabel(project.status) }}
            </span>
          </div>
          <p v-if="project.description" class="text-gray-600">{{ project.description }}</p>
        </div>
        <div class="flex gap-2">
          <button
            v-if="authStore.hasRole('REALTOR')"
            @click="showPhaseModal = true"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            + {{ $t('construction.addPhase') }}
          </button>
          <button
            v-if="authStore.hasRole('REALTOR')"
            @click="updateProjectStatus"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {{ $t('construction.updateStatus') }}
          </button>
        </div>
      </div>

      <!-- Project Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow">
          <label class="text-xs font-medium text-gray-500">{{ $t('construction.budget') }}</label>
          <p class="text-xl font-bold text-gray-900 mt-1">
            {{ formatPrice(project.budget, project.currency || 'ETB') }}
          </p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <label class="text-xs font-medium text-gray-500">{{ $t('construction.totalCost') }}</label>
          <p class="text-xl font-bold text-gray-900 mt-1">
            {{ formatPrice(project.totalCost, project.currency || 'ETB') }}
          </p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <label class="text-xs font-medium text-gray-500">{{ $t('construction.completion') }}</label>
          <p class="text-xl font-bold text-gray-900 mt-1">
            {{ project.overallCompletionPercentage || 0 }}%
          </p>
          <div class="mt-2 bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all"
              :style="{ width: (project.overallCompletionPercentage || 0) + '%' }"
            ></div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <label class="text-xs font-medium text-gray-500">{{ $t('construction.phases') }}</label>
          <p class="text-xl font-bold text-gray-900 mt-1">
            {{ project.completedPhases || 0 }}/{{ project.totalPhases || 0 }}
          </p>
        </div>
      </div>

      <!-- Project Info -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('construction.projectDetails') }}</h3>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt class="text-sm font-medium text-gray-500">{{ $t('construction.type') }}</dt>
            <dd class="text-sm text-gray-900 mt-1">{{ getTypeLabel(project.type) }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">{{ $t('construction.currency') }}</dt>
            <dd class="text-sm text-gray-900 mt-1">{{ project.currency || 'ETB' }}</dd>
          </div>
          <div v-if="project.startDate">
            <dt class="text-sm font-medium text-gray-500">{{ $t('construction.startDate') }}</dt>
            <dd class="text-sm text-gray-900 mt-1">{{ formatDate(project.startDate) }}</dd>
          </div>
          <div v-if="project.plannedEndDate">
            <dt class="text-sm font-medium text-gray-500">{{ $t('construction.plannedEndDate') }}</dt>
            <dd class="text-sm text-gray-900 mt-1">{{ formatDate(project.plannedEndDate) }}</dd>
          </div>
          <div v-if="project.locationAddress">
            <dt class="text-sm font-medium text-gray-500">{{ $t('construction.location') }}</dt>
            <dd class="text-sm text-gray-900 mt-1">
              {{ project.locationAddress }}{{ project.locationCity ? ', ' + project.locationCity : '' }}{{ project.locationCountry ? ', ' + project.locationCountry : '' }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- Phases -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ $t('construction.phases') }}</h3>
          <button
            v-if="authStore.hasRole('REALTOR')"
            @click="showPhaseModal = true"
            class="text-sm text-primary-600 hover:text-primary-700"
          >
            + {{ $t('construction.addPhase') }}
          </button>
        </div>

        <div v-if="phases.length === 0" class="text-center py-8 text-gray-500">
          {{ $t('construction.noPhases') }}
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="phase in phases"
            :key="phase.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-sm font-medium text-gray-500">#{{ phase.sequence }}</span>
                  <h4 class="text-lg font-semibold text-gray-900">{{ phase.name }}</h4>
                  <span :class="getPhaseStatusColor(phase.status)" class="px-2 py-1 text-xs font-medium rounded">
                    {{ getPhaseStatusLabel(phase.status) }}
                  </span>
                </div>
                <p v-if="phase.description" class="text-sm text-gray-600 mb-3">{{ phase.description }}</p>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label class="text-xs font-medium text-gray-500">{{ $t('construction.completion') }}</label>
                    <div class="mt-1">
                      <div class="bg-gray-200 rounded-full h-2">
                        <div
                          class="bg-primary-600 h-2 rounded-full transition-all"
                          :style="{ width: (phase.completionPercentage || 0) + '%' }"
                        ></div>
                      </div>
                      <p class="text-xs text-gray-600 mt-1">{{ phase.completionPercentage || 0 }}%</p>
                    </div>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-gray-500">{{ $t('construction.budget') }}</label>
                    <p class="text-sm font-semibold text-gray-900 mt-1">
                      {{ formatPrice(phase.budget, project.currency || 'ETB') }}
                    </p>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-gray-500">{{ $t('construction.actualCost') }}</label>
                    <p class="text-sm font-semibold text-gray-900 mt-1">
                      {{ formatPrice(phase.actualCost, project.currency || 'ETB') }}
                    </p>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-gray-500">{{ $t('construction.type') }}</label>
                    <p class="text-sm text-gray-900 mt-1">{{ getPhaseTypeLabel(phase.type) }}</p>
                  </div>
                </div>

                <div v-if="phase.startDate || phase.plannedEndDate" class="mt-3 text-xs text-gray-500">
                  <span v-if="phase.startDate">{{ $t('construction.startDate') }}: {{ formatDate(phase.startDate) }}</span>
                  <span v-if="phase.plannedEndDate" class="ml-4">
                    {{ $t('construction.plannedEnd') }}: {{ formatDate(phase.plannedEndDate) }}
                  </span>
                </div>
              </div>
              <div class="ml-4 flex gap-2">
                <button
                  v-if="authStore.hasRole('REALTOR')"
                  @click="editPhase(phase)"
                  class="px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  {{ $t('common.edit') }}
                </button>
                <button
                  v-if="authStore.hasRole('REALTOR')"
                  @click="updatePhaseCompletion(phase)"
                  class="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  {{ $t('construction.updateCompletion') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Material Orders -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ $t('construction.materialOrders') }}</h3>
          <router-link
            :to="`/construction/projects/${project.id}/orders`"
            class="text-sm text-primary-600 hover:text-primary-700"
          >
            {{ $t('common.viewAll') }} →
          </router-link>
        </div>
        <p class="text-sm text-gray-500">{{ $t('construction.viewOrdersInOrdersPage') }}</p>
      </div>

      <!-- Material Usage -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ $t('construction.materialUsage') }}</h3>
          <router-link
            :to="`/construction/projects/${project.id}/usage`"
            class="text-sm text-primary-600 hover:text-primary-700"
          >
            {{ $t('common.viewAll') }} →
          </router-link>
        </div>
        <p class="text-sm text-gray-500">{{ $t('construction.viewUsageInUsagePage') }}</p>
      </div>
    </div>

    <!-- Phase Modal -->
    <div
      v-if="showPhaseModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="showPhaseModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingPhase ? $t('construction.editPhase') : $t('construction.addPhase') }}
          </h3>
          
          <form @submit.prevent="savePhase" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.phaseName') }} *</label>
              <input
                v-model="phaseForm.name"
                type="text"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.description') }}</label>
              <textarea
                v-model="phaseForm.description"
                rows="3"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.phaseType') }} *</label>
                <select
                  v-model="phaseForm.type"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">{{ $t('construction.selectPhaseType') }}</option>
                  <option value="SITE_PREPARATION">{{ $t('construction.sitePreparation') }}</option>
                  <option value="EXCAVATION">{{ $t('construction.excavation') }}</option>
                  <option value="FOUNDATION">{{ $t('construction.foundation') }}</option>
                  <option value="FRAMING">{{ $t('construction.framing') }}</option>
                  <option value="ROOFING">{{ $t('construction.roofing') }}</option>
                  <option value="ELECTRICAL">{{ $t('construction.electrical') }}</option>
                  <option value="PLUMBING">{{ $t('construction.plumbing') }}</option>
                  <option value="HVAC">{{ $t('construction.hvac') }}</option>
                  <option value="INSULATION">{{ $t('construction.insulation') }}</option>
                  <option value="DRYWALL">{{ $t('construction.drywall') }}</option>
                  <option value="PAINTING">{{ $t('construction.painting') }}</option>
                  <option value="FLOORING">{{ $t('construction.flooring') }}</option>
                  <option value="FINISHING">{{ $t('construction.finishing') }}</option>
                  <option value="LANDSCAPING">{{ $t('construction.landscaping') }}</option>
                  <option value="INSPECTION">{{ $t('construction.inspection') }}</option>
                  <option value="OTHER">{{ $t('construction.other') }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.sequence') }} *</label>
                <input
                  v-model.number="phaseForm.sequence"
                  type="number"
                  min="1"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.budget') }}</label>
                <input
                  v-model.number="phaseForm.budget"
                  type="number"
                  min="0"
                  step="0.01"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.plannedEndDate') }}</label>
                <input
                  v-model="phaseForm.plannedEndDate"
                  type="date"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.notes') }}</label>
              <textarea
                v-model="phaseForm.notes"
                rows="2"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closePhaseModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {{ submitting ? $t('common.loading') : (editingPhase ? $t('common.update') : $t('common.create')) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Update Completion Modal -->
    <div
      v-if="showCompletionModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="showCompletionModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('construction.updateCompletion') }}</h3>
          <form @submit.prevent="saveCompletion" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.completionPercentage') }} (%)</label>
              <input
                v-model.number="completionPercentage"
                type="number"
                min="0"
                max="100"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <div class="mt-2 bg-gray-200 rounded-full h-4">
                <div
                  class="bg-primary-600 h-4 rounded-full transition-all"
                  :style="{ width: (completionPercentage || 0) + '%' }"
                ></div>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="showCompletionModal = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {{ submitting ? $t('common.loading') : $t('common.update') }}
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
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const project = ref(null)
const phases = ref([])
const showPhaseModal = ref(false)
const showCompletionModal = ref(false)
const editingPhase = ref(null)
const selectedPhaseForCompletion = ref(null)
const completionPercentage = ref(0)

const phaseForm = ref({
  name: '',
  description: '',
  type: '',
  sequence: 1,
  budget: null,
  plannedEndDate: '',
  notes: ''
})

const loadProject = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get(`/construction-projects/${route.params.id}`)
    project.value = response.data
    phases.value = response.data.phases || []
  } catch (err) {
    console.error('Failed to load project:', err)
    error.value = err.response?.data?.message || t('construction.failedToLoadProject')
  } finally {
    loading.value = false
  }
}

const savePhase = async () => {
  submitting.value = true
  error.value = ''
  try {
    if (editingPhase.value) {
      await api.put(`/construction-projects/${route.params.id}/phases/${editingPhase.value.id}`, phaseForm.value)
    } else {
      await api.post(`/construction-projects/${route.params.id}/phases`, phaseForm.value)
    }
    closePhaseModal()
    loadProject()
  } catch (err) {
    error.value = err.response?.data?.message || t('construction.failedToSavePhase')
  } finally {
    submitting.value = false
  }
}

const editPhase = (phase) => {
  editingPhase.value = phase
  phaseForm.value = {
    name: phase.name,
    description: phase.description || '',
    type: phase.type,
    sequence: phase.sequence,
    budget: phase.budget,
    plannedEndDate: phase.plannedEndDate || '',
    notes: phase.notes || ''
  }
  showPhaseModal.value = true
}

const updatePhaseCompletion = (phase) => {
  selectedPhaseForCompletion.value = phase
  completionPercentage.value = phase.completionPercentage || 0
  showCompletionModal.value = true
}

const saveCompletion = async () => {
  submitting.value = true
  try {
    await api.put(
      `/construction-projects/${route.params.id}/phases/${selectedPhaseForCompletion.value.id}/completion`,
      null,
      { params: { completionPercentage: completionPercentage.value } }
    )
    showCompletionModal.value = false
    loadProject()
  } catch (err) {
    error.value = err.response?.data?.message || t('construction.failedToUpdateCompletion')
  } finally {
    submitting.value = false
  }
}

const updateProjectStatus = async () => {
  const statuses = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']
  const currentIndex = statuses.indexOf(project.value.status)
  const nextStatus = statuses[(currentIndex + 1) % statuses.length]
  
  if (confirm(t('construction.confirmStatusChange', { status: getStatusLabel(nextStatus) }))) {
    try {
      await api.put(`/construction-projects/${route.params.id}/status`, null, {
        params: { status: nextStatus }
      })
      loadProject()
    } catch (err) {
      error.value = err.response?.data?.message || t('construction.failedToUpdateStatus')
    }
  }
}

const closePhaseModal = () => {
  showPhaseModal.value = false
  editingPhase.value = null
  phaseForm.value = {
    name: '',
    description: '',
    type: '',
    sequence: phases.value.length + 1,
    budget: null,
    plannedEndDate: '',
    notes: ''
  }
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

const getPhaseStatusColor = (status) => {
  const colors = {
    NOT_STARTED: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    ON_HOLD: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getPhaseStatusLabel = (status) => {
  const labels = {
    NOT_STARTED: t('construction.notStarted'),
    IN_PROGRESS: t('construction.inProgress'),
    COMPLETED: t('construction.completed'),
    ON_HOLD: t('construction.onHold'),
    CANCELLED: t('construction.cancelled')
  }
  return labels[status] || status
}

const getPhaseTypeLabel = (type) => {
  const labels = {
    SITE_PREPARATION: t('construction.sitePreparation'),
    EXCAVATION: t('construction.excavation'),
    FOUNDATION: t('construction.foundation'),
    FRAMING: t('construction.framing'),
    ROOFING: t('construction.roofing'),
    ELECTRICAL: t('construction.electrical'),
    PLUMBING: t('construction.plumbing'),
    HVAC: t('construction.hvac'),
    INSULATION: t('construction.insulation'),
    DRYWALL: t('construction.drywall'),
    PAINTING: t('construction.painting'),
    FLOORING: t('construction.flooring'),
    FINISHING: t('construction.finishing'),
    LANDSCAPING: t('construction.landscaping'),
    INSPECTION: t('construction.inspection'),
    OTHER: t('construction.other')
  }
  return labels[type] || type
}

onMounted(() => {
  loadProject()
})
</script>
