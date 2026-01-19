<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Building Management</h1>
        <p class="mt-2 text-sm text-gray-600">Manage all buildings on the platform</p>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="block text-sm font-medium text-gray-700">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search buildings..."
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="loadBuildings"
              class="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Building</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="building in buildings" :key="building.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ building.name }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ building.address }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ building.totalUnits || 0 }}
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Active
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <button
                    @click="viewBuilding(building)"
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

const loading = ref(false)
const buildings = ref([])
const filters = ref({ search: '' })

const loadBuildings = async () => {
  loading.value = true
  try {
    buildings.value = await adminApi.getBuildings(filters.value)
  } catch (err) {
    console.error('Failed to load buildings:', err)
  } finally {
    loading.value = false
  }
}

const viewBuilding = (building) => {
  // TODO: Navigate to building details
  console.log('View building:', building)
}

onMounted(() => {
  loadBuildings()
})
</script>
