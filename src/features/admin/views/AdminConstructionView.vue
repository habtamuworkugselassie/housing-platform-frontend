<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-white">Construction Management</h1>
        <p class="mt-2 text-sm text-gray-400">Manage construction projects and materials</p>
      </div>

      <div class="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-white/10">
            <thead class="bg-zinc-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Project</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Progress</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Budget</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <tr v-for="project in projects" :key="project.id" class="hover:bg-yellow-500/10 transition-colors">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-white">{{ project.name }}</div>
                  <div class="text-sm text-gray-400">{{ project.description }}</div>
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
                  <div class="w-full bg-white/20 rounded-full h-2">
                    <div
                      :class="['h-2 rounded-full', getProgressColor(project.progressPercentage)]"
                      :style="{ width: `${project.progressPercentage || 0}%` }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-400 mt-1">{{ project.progressPercentage || 0 }}%</span>
                </td>
                <td class="px-6 py-4 text-sm text-white">
                  {{ formatPrice(project.budgetEtb, project.budgetUsd) }}
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <button
                    @click="viewProject(project)"
                    class="text-white hover:text-yellow-400 transition-colors"
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
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="showViewDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-2xl shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">Construction Project Details</h3>
              <button
                @click="showViewDialog = false"
                class="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingProject" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-400">Name</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProject.name || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Status</label>
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
                  <label class="block text-sm font-medium text-gray-400">Progress</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProject.progressPercentage || 0 }}%</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Budget (ETB)</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProject.budgetEtb ? formatPrice(viewingProject.budgetEtb, 'ETB') : 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Budget (USD)</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProject.budgetUsd ? formatPrice(viewingProject.budgetUsd, 'USD') : 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Project ID</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProject.id || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-400">Description</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProject.description || 'N/A' }}</p>
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end">
              <button
                @click="showViewDialog = false"
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 transition-colors"
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
    PLANNING: 'bg-gray-500/30 text-gray-300',
    IN_PROGRESS: 'bg-blue-500/30 text-blue-200',
    ON_HOLD: 'bg-yellow-500/30 text-yellow-200',
    COMPLETED: 'bg-green-500/30 text-green-200',
    CANCELLED: 'bg-red-500/30 text-red-200'
  }
  return classes[status] || 'bg-gray-500/30 text-gray-300'
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
