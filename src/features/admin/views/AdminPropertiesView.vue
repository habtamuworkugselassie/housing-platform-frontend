<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">Property Management</h1>
          <p class="mt-2 text-sm text-gray-400">{{ $t('admin.manageProperties') }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-zinc-900 border border-white/10 rounded-lg p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label class="block text-sm font-medium text-gray-300">Search</label>
            <input
              v-model="filters.search"
              type="text"
              :placeholder="$t('admin.searchProperties')"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Status</label>
            <select
              v-model="filters.status"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Category</label>
            <select
              v-model="filters.category"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All Categories</option>
              <option value="FOR_SALE">For Sale</option>
              <option value="FOR_RENTAL">For Rental</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="loadProperties"
              class="w-full px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Properties Table -->
      <div class="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-white/10">
            <thead class="bg-zinc-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Property</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Featured</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <tr v-for="property in properties" :key="property.id" class="hover:bg-yellow-500/10 transition-colors">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-white">{{ property.title }}</div>
                  <div class="text-sm text-gray-400">{{ property.category }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-white">
                  {{ property.city }}, {{ property.country }}
                </td>
                <td class="px-6 py-4 text-sm text-white">
                  <div class="flex flex-col gap-1">
                    <span v-if="property.priceETB" class="font-semibold">{{ formatPrice(property.priceETB, 'ETB') }}</span>
                    <span v-if="property.priceUSD" class="text-xs text-gray-400">{{ formatPrice(property.priceUSD, 'USD') }}</span>
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
                      property.featured ? 'bg-yellow-500/30 text-yellow-200' : 'bg-gray-500/30 text-gray-300'
                    ]"
                  >
                    {{ property.featured ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <button
                    @click="viewProperty(property)"
                    class="text-white hover:text-yellow-400 mr-4 transition-colors"
                  >
                    View
                  </button>
                  <button
                    @click="editProperty(property)"
                    class="text-blue-300 hover:text-yellow-400 transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- View Property Modal -->
      <div
        v-if="showViewDialog"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="showViewDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-3xl shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">Property Details</h3>
              <button
                @click="showViewDialog = false"
                class="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingProperty" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-400">Title</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.title || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Category</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.category || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Status</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      getStatusClass(viewingProperty.status)
                    ]"
                  >
                    {{ viewingProperty.status || 'N/A' }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Featured</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.featured ? 'Yes' : 'No' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Price (ETB)</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.priceETB ? formatPrice(viewingProperty.priceETB, 'ETB') : 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Price (USD)</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.priceUSD ? formatPrice(viewingProperty.priceUSD, 'USD') : 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">City</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.city || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Country</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.country || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-400">Address</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.address || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-400">Description</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.description || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Bedrooms</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.bedrooms || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Bathrooms</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.bathrooms || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Area (sqft)</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.area || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Property ID</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProperty.id || 'N/A' }}</p>
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
const properties = ref([])
const filters = ref({
  search: '',
  status: '',
  category: ''
})

const showViewDialog = ref(false)
const viewingProperty = ref(null)

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
    AVAILABLE: 'bg-green-500/30 text-green-200',
    RESERVED: 'bg-yellow-500/30 text-yellow-200',
    SOLD: 'bg-blue-500/30 text-blue-200',
    WITHDRAWN: 'bg-red-500/30 text-red-200'
  }
  return classes[status] || 'bg-gray-500/30 text-gray-300'
}

const viewProperty = (property) => {
  viewingProperty.value = property
  showViewDialog.value = true
}

const editProperty = (property) => {
  // TODO: Open edit modal
  console.log('Edit property:', property)
}

onMounted(() => {
  loadProperties()
})
</script>
