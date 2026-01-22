<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Property Management</h1>
          <p class="mt-2 text-sm text-gray-600">Manage all properties on the platform</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search properties..."
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <select
              v-model="filters.status"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Category</label>
            <select
              v-model="filters.category"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="">All Categories</option>
              <option value="FOR_SALE">For Sale</option>
              <option value="FOR_RENTAL">For Rental</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="loadProperties"
              class="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Properties Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="property in properties" :key="property.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ property.title }}</div>
                  <div class="text-sm text-gray-500">{{ property.category }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ property.city }}, {{ property.country }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  <div class="flex flex-col gap-1">
                    <span v-if="property.priceETB" class="font-semibold">{{ formatPrice(property.priceETB, 'ETB') }}</span>
                    <span v-if="property.priceUSD" class="text-xs text-gray-600">{{ formatPrice(property.priceUSD, 'USD') }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      getStatusClass(property.status)
                    ]"
                  >
                    {{ property.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      property.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ property.featured ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <button
                    @click="viewProperty(property)"
                    class="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    View
                  </button>
                  <button
                    @click="editProperty(property)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Edit
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
const properties = ref([])
const filters = ref({
  search: '',
  status: '',
  category: ''
})

const loadProperties = async () => {
  loading.value = true
  try {
    const data = await adminApi.getProperties(filters.value, { size: 50 })
    properties.value = 'content' in data ? data.content : data
  } catch (err) {
    console.error('Failed to load properties:', err)
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status) => {
  const classes = {
    AVAILABLE: 'bg-green-100 text-green-800',
    RESERVED: 'bg-yellow-100 text-yellow-800',
    SOLD: 'bg-blue-100 text-blue-800',
    WITHDRAWN: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const viewProperty = (property) => {
  // TODO: Navigate to property details
  console.log('View property:', property)
}

const editProperty = (property) => {
  // TODO: Open edit modal
  console.log('Edit property:', property)
}

onMounted(() => {
  loadProperties()
})
</script>
