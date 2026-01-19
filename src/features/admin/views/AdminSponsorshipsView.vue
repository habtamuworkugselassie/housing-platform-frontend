<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Sponsorship Management</h1>
          <p class="mt-2 text-sm text-gray-600">Create sponsorship packages and assign them to real estate companies</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="activeTab = 'applications'"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              activeTab === 'applications'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            Applications ({{ pendingApplicationsCount }})
          </button>
          <button
            @click="showCreateModal = true"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            + Create Package
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'packages'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'packages'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Sponsorship Packages
          </button>
          <button
            @click="activeTab = 'applications'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm relative',
              activeTab === 'applications'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Applications
            <span
              v-if="pendingApplicationsCount > 0"
              class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
            >
              {{ pendingApplicationsCount }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Sponsorship Packages Tab -->
      <div v-if="activeTab === 'packages'" class="space-y-6">
        <!-- Filters -->
        <div class="bg-white rounded-lg shadow p-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select
                v-model="filters.status"
                @change="loadPackages"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              >
                <option value="">All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Type</label>
              <select
                v-model="filters.type"
                @change="loadPackages"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              >
                <option value="">All Types</option>
                <option value="BASIC">Basic</option>
                <option value="PREMIER">Premier</option>
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

        <!-- Packages Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>

          <div v-else>
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Price</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Features</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="pkg in packages" :key="pkg.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <svg class="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ pkg.name }}</div>
                        <div class="text-xs text-gray-500">{{ pkg.description || 'No description' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded',
                        pkg.type === 'PREMIER' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      ]"
                    >
                      {{ pkg.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ formatPrice(pkg.basePrice) }}
                  </td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded',
                        pkg.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ pkg.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ pkg.features ? pkg.features.substring(0, 50) + '...' : 'N/A' }}
                  </td>
                  <td class="px-6 py-4 text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2">
                      <button
                        @click="editPackage(pkg)"
                        class="text-primary-600 hover:text-primary-900"
                      >
                        Edit
                      </button>
                      <button
                        @click="togglePackageStatus(pkg)"
                        :class="pkg.status === 'ACTIVE' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'"
                      >
                        {{ pkg.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}
                      </button>
                      <button
                        @click="deletePackage(pkg.id)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="packages.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500">
                    No sponsorship packages found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Applications Tab -->
      <div v-if="activeTab === 'applications'" class="space-y-6">
        <!-- Filters -->
        <div class="bg-white rounded-lg shadow p-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select
                v-model="applicationFilters.status"
                @change="loadApplications"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              >
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="loadApplications"
                class="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Applications Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div v-if="loadingApplications" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>

          <div v-else>
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sponsorship Package</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="app in applications" :key="app.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{ app.organizationName }}</div>
                    <div class="text-xs text-gray-500">{{ app.organizationEmail || 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{ app.sponsorshipName }}</div>
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-medium rounded mt-1',
                        app.sponsorship?.type === 'PREMIER' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      ]"
                    >
                      {{ app.sponsorship?.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    <div>{{ formatDate(app.startDate) }}</div>
                    <div class="text-xs text-gray-500">to {{ formatDate(app.endDate) }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded',
                        getApplicationStatusClass(app.status)
                      ]"
                    >
                      {{ app.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ formatDate(app.createdAt) }}
                  </td>
                  <td class="px-6 py-4 text-right text-sm font-medium">
                    <div v-if="app.status === 'PENDING'" class="flex items-center justify-end space-x-2">
                      <button
                        @click="approveApplication(app)"
                        class="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                      <button
                        @click="showRejectModal(app)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </div>
                    <div v-else class="text-gray-400">
                      {{ app.status }}
                    </div>
                  </td>
                </tr>
                <tr v-if="applications.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500">
                    No applications found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Create/Edit Package Modal -->
      <div
        v-if="showCreateModal || editingPackage"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click.self="closeModal"
      >
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex items-center mb-4">
              <svg class="w-6 h-6 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900">
                {{ editingPackage ? 'Edit Sponsorship Package' : 'Create New Sponsorship Package' }}
              </h3>
            </div>

            <form @submit.prevent="savePackage" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  placeholder="e.g., Basic Sponsorship"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  placeholder="Describe the sponsorship package benefits..."
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    v-model="form.type"
                    required
                    class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  >
                    <option value="">Select type</option>
                    <option value="BASIC">Basic</option>
                    <option value="PREMIER">Premier</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Base Price *</label>
                  <input
                    v-model="form.basePrice"
                    type="number"
                    step="0.01"
                    required
                    class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Features</label>
                <textarea
                  v-model="form.features"
                  rows="4"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  placeholder="List key features (one per line)..."
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  v-model="form.notes"
                  rows="2"
                  class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  placeholder="Internal notes..."
                />
              </div>

              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {{ editingPackage ? 'Update' : 'Create' }} Package
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Reject Application Modal -->
      <div
        v-if="showRejectDialog"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
        @click.self="showRejectDialog = false"
      >
        <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Reject Sponsorship Application</h3>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
              <textarea
                v-model="rejectReason"
                rows="3"
                required
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
                @click="rejectApplication"
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
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../components/AdminLayout.vue'
import api from '@/shared/api/client'

const activeTab = ref('packages')
const loading = ref(false)
const loadingApplications = ref(false)
const showCreateModal = ref(false)
const editingPackage = ref(null)
const packages = ref([])
const applications = ref([])

const filters = ref({
  status: '',
  type: ''
})

const applicationFilters = ref({
  status: ''
})

const form = ref({
  name: '',
  description: '',
  type: '',
  basePrice: '',
  features: '',
  notes: ''
})

const showRejectDialog = ref(false)
const selectedApplication = ref(null)
const rejectReason = ref('')

const pendingApplicationsCount = computed(() => {
  return applications.value.filter(app => app.status === 'PENDING').length
})

const loadPackages = async () => {
  loading.value = true
  try {
    const response = await api.get('/sponsorships')
    let data = response.data

    if (filters.value.status) {
      data = data.filter(p => p.status === filters.value.status)
    }
    if (filters.value.type) {
      data = data.filter(p => p.type === filters.value.type)
    }

    packages.value = data
  } catch (err) {
    console.error('Failed to load packages:', err)
  } finally {
    loading.value = false
  }
}

const loadApplications = async () => {
  loadingApplications.value = true
  try {
    const response = await api.get('/sponsorships/applications')
    let data = response.data

    if (applicationFilters.value.status) {
      data = data.filter(app => app.status === applicationFilters.value.status)
    }

    applications.value = data
  } catch (err) {
    console.error('Failed to load applications:', err)
  } finally {
    loadingApplications.value = false
  }
}

const clearFilters = () => {
  filters.value = { status: '', type: '' }
  loadPackages()
}

const savePackage = async () => {
  try {
    const payload = {
      name: form.value.name,
      description: form.value.description || null,
      type: form.value.type,
      basePrice: parseFloat(form.value.basePrice),
      features: form.value.features || null,
      notes: form.value.notes || null
    }

    if (editingPackage.value) {
      await api.put(`/sponsorships/${editingPackage.value.id}`, payload)
    } else {
      await api.post('/sponsorships', payload)
    }

    closeModal()
    loadPackages()
  } catch (err) {
    console.error('Failed to save package:', err)
    alert(err.response?.data?.message || 'Failed to save sponsorship package')
  }
}

const editPackage = (pkg) => {
  editingPackage.value = pkg
  form.value = {
    name: pkg.name || '',
    description: pkg.description || '',
    type: pkg.type || '',
    basePrice: pkg.basePrice?.toString() || '',
    features: pkg.features || '',
    notes: pkg.notes || ''
  }
  showCreateModal.value = true
}

const togglePackageStatus = async (pkg) => {
  try {
    const newStatus = pkg.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await api.put(`/sponsorships/${pkg.id}`, { status: newStatus })
    loadPackages()
  } catch (err) {
    console.error('Failed to update package status:', err)
    alert(err.response?.data?.message || 'Failed to update package status')
  }
}

const deletePackage = async (id) => {
  if (!confirm('Are you sure you want to delete this sponsorship package? This action cannot be undone.')) {
    return
  }

  try {
    await api.delete(`/sponsorships/${id}`)
    loadPackages()
  } catch (err) {
    console.error('Failed to delete package:', err)
    alert(err.response?.data?.message || 'Failed to delete package')
  }
}

const approveApplication = async (app) => {
  if (!confirm(`Approve sponsorship application for ${app.organizationName}?`)) {
    return
  }

  try {
    await api.put(`/sponsorships/applications/${app.id}/approve`, { notes: 'Approved by admin' })
    await loadApplications()
    if (activeTab.value === 'packages') {
      activeTab.value = 'applications'
    }
  } catch (err) {
    console.error('Failed to approve application:', err)
    alert(err.response?.data?.message || 'Failed to approve application')
  }
}

const showRejectModal = (app) => {
  selectedApplication.value = app
  rejectReason.value = ''
  showRejectDialog.value = true
}

const rejectApplication = async () => {
  if (!selectedApplication.value || !rejectReason.value.trim()) {
    return
  }

  try {
    await api.put(`/sponsorships/applications/${selectedApplication.value.id}/reject`, {
      reason: rejectReason.value
    })
    showRejectDialog.value = false
    selectedApplication.value = null
    rejectReason.value = ''
    await loadApplications()
  } catch (err) {
    console.error('Failed to reject application:', err)
    alert(err.response?.data?.message || 'Failed to reject application')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingPackage.value = null
  form.value = {
    name: '',
    description: '',
    type: '',
    basePrice: '',
    features: '',
    notes: ''
  }
}

const formatPrice = (price) => {
  if (!price) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const getApplicationStatusClass = (status) => {
  const classes = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  loadPackages()
  loadApplications()
})
</script>
