<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Construction Management</h1>
        <p class="mt-2 text-sm text-gray-600">Manage construction projects and materials</p>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="project in projects" :key="project.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ project.name }}</div>
                  <div class="text-sm text-gray-500">{{ project.description }}</div>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      getStatusClass(project.status)
                    ]"
                  >
                    {{ project.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      :class="['h-2 rounded-full', getProgressColor(project.progressPercentage)]"
                      :style="{ width: `${project.progressPercentage || 0}%` }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-500 mt-1">{{ project.progressPercentage || 0 }}%</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ formatPrice(project.budgetEtb, project.budgetUsd) }}
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <button
                    @click="viewProject(project)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from '../components/AdminLayout.vue'
import { adminApi } from '../api/admin.api'
import { formatPrice } from '@/shared/utils'

const loading = ref(false)
const projects = ref([])

const loadProjects = async () => {
  loading.value = true
  try {
    const data = await adminApi.getConstructionProjects({}, { size: 50 })
    projects.value = 'content' in data ? data.content : data
  } catch (err) {
    console.error('Failed to load projects:', err)
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status) => {
  const classes = {
    PLANNING: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    ON_HOLD: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getProgressColor = (progress) => {
  if (progress < 30) return 'bg-red-500'
  if (progress < 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

const viewProject = (project) => {
  // TODO: Navigate to project details
  console.log('View project:', project)
}

onMounted(() => {
  loadProjects()
})
</script>
