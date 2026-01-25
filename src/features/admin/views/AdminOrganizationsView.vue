<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Organization Management</h1>
        <p class="mt-2 text-sm text-gray-600">Manage organizations, approve/reject applications</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Pending</p>
              <p class="text-2xl font-semibold text-gray-900">{{ pendingCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Approved</p>
              <p class="text-2xl font-semibold text-gray-900">{{ approvedCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Real Estate</p>
              <p class="text-2xl font-semibold text-gray-900">{{ realEstateCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Banks</p>
              <p class="text-2xl font-semibold text-gray-900">{{ bankCount }}</p>
            </div>
          </div>
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
              placeholder="Search organizations..."
              @input="loadOrgs"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Type</label>
            <select
              v-model="filters.type"
              @change="loadOrgs"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="">All Types</option>
              <option value="REAL_ESTATE_COMPANY">Real Estate</option>
              <option value="BANK">Bank</option>
              <option value="SUPPLIER">Supplier</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <select
              v-model="filters.status"
              @change="loadOrgs"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Organizations Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                  <span class="text-sm text-gray-500">Loading organizations...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="error">
              <td colspan="6" class="px-6 py-12 text-center text-sm text-red-500">
                <div>Error: {{ error }}</div>
                <button @click="loadOrgs" class="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                  Retry
                </button>
              </td>
            </tr>
            <tr v-else-if="!organizations || !Array.isArray(organizations) || organizations.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500">
                No organizations found
              </td>
            </tr>
            <template v-else>
              <tr
                v-for="org in organizations"
                :key="org?.id || org?.name || Math.random()"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ org.name }}</div>
                  <div class="text-sm text-gray-500">{{ org.city }}, {{ org.country }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                    {{ org.type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ org.email || 'N/A' }}</div>
                  <div class="text-sm text-gray-500">{{ org.phoneNumber || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      org.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      (org.status === 'PENDING_APPROVAL' || org.status === 'PENDING') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ org.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(org.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      v-if="org.status === 'PENDING_APPROVAL' || org.status === 'PENDING'"
                      @click="approveOrg(org.id)"
                      class="text-green-600 hover:text-green-900"
                    >
                      Approve
                    </button>
                    <button
                      v-if="org.status === 'PENDING_APPROVAL' || org.status === 'PENDING'"
                      @click="showRejectModal(org)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Reject
                    </button>
                    <button
                      @click="viewOrg(org)"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- View Organization Modal -->
      <div
        v-if="showViewDialog"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click.self="showViewDialog = false"
      >
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Organization Details</h3>
              <button
                @click="showViewDialog = false"
                class="text-gray-400 hover:text-gray-500"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingOrg" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Name</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingOrg.name }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Type</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingOrg.type }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Status</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      viewingOrg.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      (viewingOrg.status === 'PENDING_APPROVAL' || viewingOrg.status === 'PENDING') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ viewingOrg.status }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Registration Number</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingOrg.registrationNumber || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingOrg.email || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Phone</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingOrg.phoneNumber || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">City</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingOrg.city || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Country</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingOrg.country || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Address</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingOrg.address || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <p class="mt-1 text-sm text-gray-900">{{ viewingOrg.description || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Website</label>
                  <p class="mt-1 text-sm text-gray-900">
                    <a v-if="viewingOrg.website" :href="viewingOrg.website" target="_blank" class="text-primary-600 hover:underline">
                      {{ viewingOrg.website }}
                    </a>
                    <span v-else>N/A</span>
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Created</label>
                  <p class="mt-1 text-sm text-gray-900">{{ formatDate(viewingOrg.createdAt) }}</p>
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

      <!-- Reject Modal -->
      <div
        v-if="showRejectDialog"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click.self="showRejectDialog = false"
      >
        <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Reject Organization</h3>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <textarea
                v-model="rejectReason"
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter rejection reason..."
              />
            </div>
            <div class="flex justify-end space-x-3">
              <button
                @click="showRejectDialog = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                @click="rejectOrg"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AdminLayout from '../components/AdminLayout.vue'
import { useAdminOrganizations } from '../composables/useAdmin'

const adminOrgs = useAdminOrganizations()
// Access refs directly to preserve reactivity
const organizations = adminOrgs.organizations
const loading = adminOrgs.loading
const error = adminOrgs.error
const { loadOrganizations, approveOrganization, rejectOrganization } = adminOrgs


const filters = ref({
  search: '',
  type: '',
  status: ''
})

const showRejectDialog = ref(false)
const selectedOrg = ref(null)
const rejectReason = ref('')

const pendingCount = computed(() => {
  if (!Array.isArray(organizations.value)) return 0
  return organizations.value.filter(org => org.status === 'PENDING_APPROVAL' || org.status === 'PENDING').length
})

const approvedCount = computed(() => {
  if (!Array.isArray(organizations.value)) return 0
  return organizations.value.filter(org => org.status === 'APPROVED').length
})

const realEstateCount = computed(() => {
  if (!Array.isArray(organizations.value)) return 0
  return organizations.value.filter(org => org.type === 'REAL_ESTATE_COMPANY').length
})

const bankCount = computed(() => {
  if (!Array.isArray(organizations.value)) return 0
  return organizations.value.filter(org => org.type === 'BANK').length
})

const loadOrgs = async () => {
  await loadOrganizations(filters.value)
}

const clearFilters = () => {
  filters.value = { search: '', type: '', status: '' }
  loadOrgs()
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const approveOrg = async (id) => {
  try {
    await approveOrganization(id)
    await loadOrgs()
  } catch (err) {
    console.error('Failed to approve organization:', err)
  }
}

const showRejectModal = (org) => {
  selectedOrg.value = org
  rejectReason.value = ''
  showRejectDialog.value = true
}

const rejectOrg = async () => {
  if (!selectedOrg.value || !rejectReason.value.trim()) {
    return
  }
  try {
    await rejectOrganization(selectedOrg.value.id, rejectReason.value)
    showRejectDialog.value = false
    selectedOrg.value = null
    rejectReason.value = ''
    await loadOrgs()
  } catch (err) {
    console.error('Failed to reject organization:', err)
  }
}

const showViewDialog = ref(false)
const viewingOrg = ref(null)

const viewOrg = (org) => {
  viewingOrg.value = org
  showViewDialog.value = true
}

onMounted(async () => {
  await loadOrgs()
})
</script>
