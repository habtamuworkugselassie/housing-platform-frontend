<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">Building Management</h1>
          <p class="mt-2 text-sm text-gray-400">{{ $t('admin.manageBuildings') }}</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 font-medium transition-colors"
        >
          + Add Building
        </button>
      </div>

      <div class="bg-zinc-900 border border-white/10 rounded-lg p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="block text-sm font-medium text-gray-300">Search</label>
            <input
              v-model="filters.search"
              type="text"
              :placeholder="$t('admin.searchBuildings')"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="loadBuildings"
              class="w-full px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div class="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-white/10">
            <thead class="bg-zinc-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Building</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Units</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <tr v-for="building in buildings" :key="building.id" class="hover:bg-yellow-500/10 transition-colors">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-white">{{ building.name }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-white">
                  {{ building.address }}
                </td>
                <td class="px-6 py-4 text-sm text-white">
                  {{ building.totalUnits || 0 }}
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs font-medium bg-green-500/30 text-green-200 rounded">
                    Active
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-3">
                    <button
                      @click="editBuilding(building)"
                      class="text-white hover:text-yellow-400 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      @click="confirmDelete(building)"
                      class="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- View Building Modal -->
      <div
        v-if="showViewDialog"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="showViewDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-2xl shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">Building Details</h3>
              <button
                @click="showViewDialog = false"
                class="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingBuilding" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-400">Name</label>
                  <p class="mt-1 text-sm text-white">{{ viewingBuilding.name || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Total Units</label>
                  <p class="mt-1 text-sm text-white">{{ viewingBuilding.totalUnits || 0 }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-400">Address</label>
                  <p class="mt-1 text-sm text-white">{{ viewingBuilding.address || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">City</label>
                  <p class="mt-1 text-sm text-white">{{ viewingBuilding.city || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Country</label>
                  <p class="mt-1 text-sm text-white">{{ viewingBuilding.country || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-400">Description</label>
                  <p class="mt-1 text-sm text-white">{{ viewingBuilding.description || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Building ID</label>
                  <p class="mt-1 text-sm text-white">{{ viewingBuilding.id || 'N/A' }}</p>
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
      <!-- Create/Edit Building Modal -->
      <div
        v-if="showCreateModal || showEditModal"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="closeModal"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-2xl shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-white mb-4">
              {{ showEditModal ? 'Edit Building' : 'Create Building' }}
            </h3>
            
            <form @submit.prevent="submitBuilding" class="space-y-4">
              <!-- Organization Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-300">Real Estate Company *</label>
                <select
                  v-model="buildingForm.organizationId"
                  required
                  :disabled="showEditModal"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50"
                >
                  <option value="" disabled>Select a company</option>
                  <option v-for="org in organizations" :key="org.id" :value="org.id">
                    {{ org.name }}
                  </option>
                </select>
                <p v-if="showEditModal" class="mt-1 text-xs text-gray-400">Company cannot be changed after creation.</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300">Building Name *</label>
                <input
                  v-model="buildingForm.name"
                  type="text"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  v-model="buildingForm.description"
                  rows="3"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300">Address *</label>
                  <input
                    v-model="buildingForm.address"
                    type="text"
                    required
                    class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">City *</label>
                  <input
                    v-model="buildingForm.city"
                    type="text"
                    required
                    class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300">State</label>
                  <input
                    v-model="buildingForm.state"
                    type="text"
                    class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Country *</label>
                  <input
                    v-model="buildingForm.country"
                    type="text"
                    required
                    class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300">Total Floors *</label>
                  <input
                    v-model.number="buildingForm.totalFloors"
                    type="number"
                    min="1"
                    required
                    class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Total Units *</label>
                  <input
                    v-model.number="buildingForm.totalUnits"
                    type="number"
                    min="1"
                    required
                    class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300">Building Type *</label>
                  <select
                    v-model="buildingForm.buildingType"
                    required
                    class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                  >
                    <option value="">Select Type</option>
                    <option value="APARTMENT_COMPLEX">Apartment Complex</option>
                    <option value="CONDOMINIUM">Condominium</option>
                    <option value="RESIDENTIAL_COMPLEX">Residential Complex</option>
                    <option value="MIXED_USE">Mixed Use</option>
                    <option value="COMMERCIAL_RESIDENTIAL">Commercial Residential</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300">Status</label>
                  <select
                    v-model="buildingForm.status"
                    class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="UNDER_CONSTRUCTION">Under Construction</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="RENOVATION">Renovation</option>
                  </select>
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 border border-white/20 rounded-md text-white hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="submitting"
                  class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 disabled:opacity-50 transition-colors"
                >
                  {{ submitting ? 'Saving...' : (showEditModal ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
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

const loading = ref(false)
const submitting = ref(false)
const buildings = ref([])
const organizations = ref([])
const filters = ref({ search: '' })

const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingBuilding = ref(null)

const buildingForm = ref({
  organizationId: '',
  name: '',
  description: '',
  address: '',
  city: '',
  state: '',
  country: '',
  totalFloors: 1,
  totalUnits: 1,
  buildingType: '',
  status: 'PLANNED'
})

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

const loadOrganizations = async () => {
  try {
    const response = await adminApi.getOrganizations({ type: 'REAL_ESTATE_COMPANY' })
    organizations.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('Failed to load organizations:', err)
  }
}

const submitBuilding = async () => {
  submitting.value = true
  try {
    if (showEditModal.value && editingBuilding.value) {
      await adminApi.updateBuilding(buildingForm.value.organizationId, editingBuilding.value.id, buildingForm.value)
    } else {
      await adminApi.createBuilding(buildingForm.value.organizationId, buildingForm.value)
    }
    closeModal()
    loadBuildings()
  } catch (err) {
    alert(err?.response?.data?.message || 'Failed to save building')
  } finally {
    submitting.value = false
  }
}

const editBuilding = (building) => {
  editingBuilding.value = building
  buildingForm.value = {
    organizationId: building.realEstateCompanyId || '',
    name: building.name,
    description: building.description || '',
    address: building.address,
    city: building.city,
    state: building.state || '',
    country: building.country,
    totalFloors: building.totalFloors || 1,
    totalUnits: building.totalUnits || 1,
    buildingType: building.buildingType || '',
    status: building.status || 'PLANNED'
  }
  showEditModal.value = true
}

const confirmDelete = async (building) => {
  if (confirm(`Are you sure you want to delete the building "${building.name}"?`)) {
    try {
      await adminApi.deleteBuilding(building.realEstateCompanyId, building.id)
      loadBuildings()
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete building')
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingBuilding.value = null
  buildingForm.value = {
    organizationId: '',
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    totalFloors: 1,
    totalUnits: 1,
    buildingType: '',
    status: 'PLANNED'
  }
}

onMounted(() => {
  loadBuildings()
  loadOrganizations()
})
</script>
