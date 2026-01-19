<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">{{ $t('construction.constructionDashboard') }}</h1>
      <p class="mt-2 text-sm text-gray-600">{{ $t('construction.manageConstructionProgress') }}</p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-6 rounded-lg shadow">
          <label class="text-xs font-medium text-gray-500">{{ $t('construction.activeProjects') }}</label>
          <p class="text-2xl font-bold text-gray-900 mt-2">{{ stats.activeProjects }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <label class="text-xs font-medium text-gray-500">{{ $t('construction.totalBudget') }}</label>
          <p class="text-2xl font-bold text-blue-600 mt-2">{{ formatPrice(stats.totalBudget, 'ETB') }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <label class="text-xs font-medium text-gray-500">{{ $t('construction.totalCost') }}</label>
          <p class="text-2xl font-bold text-green-600 mt-2">{{ formatPrice(stats.totalCost, 'ETB') }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <label class="text-xs font-medium text-gray-500">{{ $t('construction.averageCompletion') }}</label>
          <p class="text-2xl font-bold text-primary-600 mt-2">{{ stats.averageCompletion }}%</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('construction.quickActions') }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <router-link
            to="/construction/projects"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <div class="text-2xl mb-2">🏗️</div>
            <div class="font-medium text-gray-900">{{ $t('construction.viewProjects') }}</div>
          </router-link>
          <router-link
            to="/construction/projects"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <div class="text-2xl mb-2">➕</div>
            <div class="font-medium text-gray-900">{{ $t('construction.createProject') }}</div>
          </router-link>
          <router-link
            to="/construction/orders"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <div class="text-2xl mb-2">📦</div>
            <div class="font-medium text-gray-900">{{ $t('construction.viewOrders') }}</div>
          </router-link>
          <router-link
            to="/construction/usage"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <div class="text-2xl mb-2">📊</div>
            <div class="font-medium text-gray-900">{{ $t('construction.viewUsage') }}</div>
          </router-link>
        </div>
      </div>

      <!-- Active Projects -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ $t('construction.activeProjects') }}</h3>
          <router-link
            to="/construction/projects"
            class="text-sm text-primary-600 hover:text-primary-700"
          >
            {{ $t('common.viewAll') }} →
          </router-link>
        </div>

        <div v-if="activeProjects.length === 0" class="text-center py-8 text-gray-500">
          {{ $t('construction.noProjects') }}
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="project in activeProjects"
            :key="project.id"
            @click="$router.push(`/construction/projects/${project.id}`)"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h4 class="text-lg font-semibold text-gray-900">{{ project.name }}</h4>
                  <span :class="getStatusColor(project.status)" class="px-2 py-1 text-xs font-medium rounded">
                    {{ getStatusLabel(project.status) }}
                  </span>
                </div>
                <p v-if="project.description" class="text-sm text-gray-600 mb-3">{{ project.description }}</p>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label class="text-xs font-medium text-gray-500">{{ $t('construction.completion') }}</label>
                    <div class="mt-1">
                      <div class="bg-gray-200 rounded-full h-2">
                        <div
                          class="bg-primary-600 h-2 rounded-full transition-all"
                          :style="{ width: (project.overallCompletionPercentage || 0) + '%' }"
                        ></div>
                      </div>
                      <p class="text-xs text-gray-600 mt-1">{{ project.overallCompletionPercentage || 0 }}%</p>
                    </div>
                  </div>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Material Usage -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ $t('construction.recentMaterialUsage') }}</h3>
          <router-link
            to="/construction/usage"
            class="text-sm text-primary-600 hover:text-primary-700"
          >
            {{ $t('common.viewAll') }} →
          </router-link>
        </div>

        <div v-if="recentUsage.length === 0" class="text-center py-8 text-gray-500">
          {{ $t('construction.noUsageRecords') }}
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="usage in recentUsage"
            :key="usage.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900">{{ usage.materialName }}</span>
                  <span v-if="usage.projectName" class="text-sm text-gray-500">
                    - {{ usage.projectName }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mt-1">
                  {{ $t('construction.quantity') }}: {{ usage.quantity }} {{ usage.unit }}
                </p>
                <p class="text-xs text-gray-500 mt-1">{{ formatDate(usage.usageDate) }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-gray-900">
                  {{ formatPrice(usage.totalCost, usage.currency || 'ETB') }}
                </p>
                <p v-if="usage.phaseName" class="text-xs text-gray-500 mt-1">{{ usage.phaseName }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const stats = ref({
  activeProjects: 0,
  totalBudget: 0,
  totalCost: 0,
  averageCompletion: 0
})
const activeProjects = ref([])
const recentUsage = ref([])

const loadDashboardData = async () => {
  loading.value = true
  try {
    // Load active projects
    const projectsResponse = await api.get('/construction-projects', {
      params: { status: 'IN_PROGRESS', size: 5, sort: 'updatedAt,desc' }
    })
    activeProjects.value = projectsResponse.data.content || projectsResponse.data || []

    // Calculate stats
    const allProjectsResponse = await api.get('/construction-projects', {
      params: { size: 1000 }
    })
    const allProjects = allProjectsResponse.data.content || allProjectsResponse.data || []
    const inProgressProjects = allProjects.filter(p => p.status === 'IN_PROGRESS')
    
    stats.value = {
      activeProjects: inProgressProjects.length,
      totalBudget: allProjects.reduce((sum, p) => sum + (p.budget || 0), 0),
      totalCost: allProjects.reduce((sum, p) => sum + (p.totalCost || 0), 0),
      averageCompletion: inProgressProjects.length > 0
        ? Math.round(inProgressProjects.reduce((sum, p) => sum + (p.overallCompletionPercentage || 0), 0) / inProgressProjects.length)
        : 0
    }

    // Load recent usage
    const usageResponse = await api.get('/material-usage', {
      params: { size: 5, sort: 'usageDate,desc' }
    })
    recentUsage.value = usageResponse.data.content || usageResponse.data || []
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
  } finally {
    loading.value = false
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

onMounted(() => {
  loadDashboardData()
})
</script>
