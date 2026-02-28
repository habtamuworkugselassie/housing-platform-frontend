<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-3xl font-bold text-white">Organization Management</h1>
        <p class="mt-2 text-sm text-gray-400">Manage organizations, approve/reject applications</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-500/30 rounded-lg p-3">
              <svg class="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-400">Pending</p>
              <p class="text-2xl font-semibold text-white">{{ pendingCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-500/30 rounded-lg p-3">
              <svg class="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-400">Approved</p>
              <p class="text-2xl font-semibold text-white">{{ approvedCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-500/30 rounded-lg p-3">
              <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-400">Real Estate</p>
              <p class="text-2xl font-semibold text-white">{{ realEstateCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-500/30 rounded-lg p-3">
              <svg class="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-400">Banks</p>
              <p class="text-2xl font-semibold text-white">{{ bankCount }}</p>
            </div>
          </div>
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
              placeholder="Search organizations..."
              @input="loadOrgs"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Type</label>
            <select
              v-model="filters.type"
              @change="loadOrgs"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">All Types</option>
              <option value="REAL_ESTATE_COMPANY">Real Estate</option>
              <option value="BANK">Bank</option>
              <option value="SUPPLIER">Supplier</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300">Status</label>
            <select
              v-model="filters.status"
              @change="loadOrgs"
              class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 focus:ring-yellow-400 focus:border-yellow-400"
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
              class="w-full px-4 py-2 border border-white/20 rounded-md text-sm font-medium text-white bg-white/5 hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Organizations Table -->
      <div class="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-white/10">
          <thead class="bg-zinc-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Organization</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12 text-center bg-zinc-900">
                <div class="flex flex-col items-center">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mb-2"></div>
                  <span class="text-sm text-gray-400">Loading organizations...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="error">
              <td colspan="6" class="px-6 py-12 text-center text-sm text-red-200 bg-zinc-900">
                <div>Error: {{ error }}</div>
                <button @click="loadOrgs" class="mt-2 px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 transition-colors">
                  Retry
                </button>
              </td>
            </tr>
            <tr v-else-if="!organizations || !Array.isArray(organizations) || organizations.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-400 bg-zinc-900">
                No organizations found
              </td>
            </tr>
            <template v-else>
              <tr
                v-for="org in organizations"
                :key="org?.id || org?.name || Math.random()"
                class="hover:bg-yellow-500/10 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-white">{{ org.name }}</div>
                  <div class="text-sm text-gray-400">{{ org.city }}, {{ org.country }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-medium bg-gray-500/30 text-gray-300 rounded">
                    {{ org.type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">{{ org.email || 'N/A' }}</div>
                  <div class="text-sm text-gray-400">{{ org.phoneNumber || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      org.status === 'APPROVED' ? 'bg-green-500/30 text-green-200' :
                      (org.status === 'PENDING_APPROVAL' || org.status === 'PENDING') ? 'bg-yellow-500/30 text-yellow-200' :
                      'bg-red-500/30 text-red-200'
                    ]"
                  >
                    {{ org.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {{ formatDate(org.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      v-if="org.status === 'PENDING_APPROVAL' || org.status === 'PENDING'"
                      @click="approveOrg(org.id)"
                      class="text-green-300 hover:text-yellow-400 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      v-if="org.status === 'PENDING_APPROVAL' || org.status === 'PENDING'"
                      @click="showRejectModal(org)"
                      class="text-red-300 hover:text-yellow-400 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      @click="viewOrg(org)"
                      class="text-white hover:text-yellow-400 transition-colors"
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
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="showViewDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-2xl shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">Organization Details</h3>
              <button
                @click="showViewDialog = false"
                class="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingOrg" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-400">Name</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.name }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Type</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.type }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Status</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      viewingOrg.status === 'APPROVED' ? 'bg-green-500/30 text-green-200' :
                      (viewingOrg.status === 'PENDING_APPROVAL' || viewingOrg.status === 'PENDING') ? 'bg-yellow-500/30 text-yellow-200' :
                      'bg-red-500/30 text-red-200'
                    ]"
                  >
                    {{ viewingOrg.status }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Registration Number</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.registrationNumber || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Email</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.email || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Phone</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.phoneNumber || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">City</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.city || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Country</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.country || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-400">Address</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.address || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-400">Description</label>
                  <p class="mt-1 text-sm text-white">{{ viewingOrg.description || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Website</label>
                  <p class="mt-1 text-sm text-white">
                    <a v-if="viewingOrg.website" :href="viewingOrg.website" target="_blank" class="text-yellow-400 hover:underline">
                      {{ viewingOrg.website }}
                    </a>
                    <span v-else>N/A</span>
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Created</label>
                  <p class="mt-1 text-sm text-white">{{ formatDate(viewingOrg.createdAt) }}</p>
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

      <!-- Reject Modal -->
      <div
        v-if="showRejectDialog"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="showRejectDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-md shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-white mb-4">Reject Organization</h3>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-400 mb-2">Reason</label>
              <textarea
                v-model="rejectReason"
                rows="3"
                class="w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                placeholder="Enter rejection reason..."
              />
            </div>
            <div class="flex justify-end space-x-3">
              <button
                @click="showRejectDialog = false"
                class="px-4 py-2 border border-white/20 rounded-md text-white hover:bg-yellow-500/20 hover:border-yellow-400 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="rejectOrg"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors"
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
