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

      <!-- View Project Modal -->
      <div
        v-if="showViewDialog"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click.self="showViewDialog = false"
      >
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Construction Project Details</h3>
              <button
                @click="showViewDialog = false"
                class="text-gray-400 hover:text-gray-500"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingProject" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Name</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingProject.name || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Status</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      getStatusClass(viewingProject.status)
                    ]"
                  >
                    {{ viewingProject.status || 'N/A' }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Progress</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingProject.progressPercentage || 0 }}%</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Budget (ETB)</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingProject.budgetEtb ? formatPrice(viewingProject.budgetEtb, 'ETB') : 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Budget (USD)</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingProject.budgetUsd ? formatPrice(viewingProject.budgetUsd, 'USD') : 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Project ID</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingProject.id || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingProject.description || 'N/A' }}</p>
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button
                @click="showViewDialog = false"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
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

const showViewDialog = ref(false)
const viewingProject = ref(null)

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
  viewingProject.value = project
  showViewDialog.value = true
}

onMounted(() => {
  loadProjects()
})
</script>
