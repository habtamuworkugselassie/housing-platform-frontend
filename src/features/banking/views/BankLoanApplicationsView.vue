<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Loan Applications Review</h1>
      <p class="mt-2 text-sm text-gray-600">Review and manage loan applications for your bank</p>
    </div>

    <!-- Filter Tabs -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          @click="selectedStatus = filter.value"
          :class="[
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            selectedStatus === filter.value
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ filter.label }}
          <span v-if="filter.count !== undefined" class="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
            {{ filter.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-800">{{ error }}</p>
    </div>

    <!-- Loan Applications List -->
    <div v-if="!loading" class="grid grid-cols-1 gap-6">
      <div
        v-for="application in filteredApplications"
        :key="application.id"
        @click="viewDetails(application.id)"
        class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">
                Application #{{ application.id.substring(0, 8) }}
              </h3>
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                getStatusColor(application.status)
              ]">
                {{ application.status }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label class="text-xs font-medium text-gray-500">Requested Amount</label>
                <p class="text-sm font-semibold text-gray-900 mt-1">{{ formatPrice(application.requestedAmount, application.currency || 'ETB') }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500">Tenure</label>
                <p class="text-sm text-gray-900 mt-1">{{ application.requestedTenureMonths }} months</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500">Buyer ID</label>
                <p class="text-sm text-gray-900 mt-1">{{ application.buyerId.substring(0, 8) }}...</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500">Applied Date</label>
                <p class="text-sm text-gray-900 mt-1">{{ formatDate(application.createdAt) }}</p>
              </div>
            </div>

            <div v-if="application.purpose" class="mt-4">
              <label class="text-xs font-medium text-gray-500">Purpose</label>
              <p class="text-sm text-gray-900 mt-1">{{ application.purpose }}</p>
            </div>
          </div>
          
          <div class="ml-4 flex gap-2">
            <button
              v-if="application.status === 'SUBMITTED'"
              @click.stop="moveToReview(application.id)"
              class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Start Review
            </button>
            <button
              v-if="application.status === 'UNDER_REVIEW'"
              @click.stop="showApproveModal(application)"
              class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Approve
            </button>
            <button
              v-if="application.status === 'UNDER_REVIEW'"
              @click.stop="showRejectModal(application)"
              class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reject
            </button>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>

      <div v-if="filteredApplications.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <p class="text-sm text-gray-500">No loan applications found</p>
      </div>
    </div>

    <!-- Approve Modal -->
    <div
      v-if="showApproveModalFlag && selectedApplication"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeApproveModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Approve Loan Application</h3>
          
          <form @submit.prevent="approveApplication" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Approved Amount *</label>
              <input
                v-model.number="approvalForm.approvedAmount"
                type="number"
                min="0"
                step="0.01"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Approved Interest Rate (%) *</label>
              <input
                v-model.number="approvalForm.approvedInterestRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Approved Tenure (months) *</label>
              <input
                v-model.number="approvalForm.approvedTenureMonths"
                type="number"
                min="1"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Approval Notes</label>
              <textarea
                v-model="approvalForm.approvalNotes"
                rows="3"
                placeholder="Additional notes about the approval"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeApproveModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {{ submitting ? 'Approving...' : 'Approve' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div
      v-if="showRejectModalFlag && selectedApplication"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeRejectModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Reject Loan Application</h3>
          
          <form @submit.prevent="rejectApplication" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Rejection Reason *</label>
              <textarea
                v-model="rejectionForm.rejectionReason"
                rows="4"
                required
                placeholder="Please provide a reason for rejection"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeRejectModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {{ submitting ? 'Rejecting...' : 'Reject' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/shared/api/client'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const applications = ref([])
const selectedStatus = ref('ALL')
const showApproveModalFlag = ref(false)
const showRejectModalFlag = ref(false)
const selectedApplication = ref(null)

const approvalForm = ref({
  approvedAmount: 0,
  approvedInterestRate: 0,
  approvedTenureMonths: 0,
  approvalNotes: ''
})

const rejectionForm = ref({
  rejectionReason: ''
})

const statusFilters = computed(() => {
  const all = applications.value.length
  const submitted = applications.value.filter(a => a.status === 'SUBMITTED').length
  const underReview = applications.value.filter(a => a.status === 'UNDER_REVIEW').length
  const approved = applications.value.filter(a => a.status === 'APPROVED').length
  const rejected = applications.value.filter(a => a.status === 'REJECTED').length

  return [
    { label: 'All', value: 'ALL', count: all },
    { label: 'Submitted', value: 'SUBMITTED', count: submitted },
    { label: 'Under Review', value: 'UNDER_REVIEW', count: underReview },
    { label: 'Approved', value: 'APPROVED', count: approved },
    { label: 'Rejected', value: 'REJECTED', count: rejected }
  ]
})

const filteredApplications = computed(() => {
  if (selectedStatus.value === 'ALL') {
    return applications.value
  }
  return applications.value.filter(a => a.status === selectedStatus.value)
})

const loadApplications = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/loan-applications/my-bank-applications')
    applications.value = response.data
  } catch (err) {
    console.error('Failed to load loan applications:', err)
    error.value = err.response?.data?.message || 'Failed to load loan applications'
  } finally {
    loading.value = false
  }
}

const showApproveModal = (application) => {
  selectedApplication.value = application
  approvalForm.value = {
    approvedAmount: application.requestedAmount,
    approvedInterestRate: 0,
    approvedTenureMonths: application.requestedTenureMonths,
    approvalNotes: ''
  }
  showApproveModalFlag.value = true
}

const showRejectModal = (application) => {
  selectedApplication.value = application
  rejectionForm.value = {
    rejectionReason: ''
  }
  showRejectModalFlag.value = true
}

const moveToReview = async (applicationId) => {
  if (!confirm('Move this application to review?')) {
    return
  }

  try {
    await api.put(`/loan-applications/${applicationId}/review`)
    loadApplications()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to move application to review')
  }
}

const approveApplication = async () => {
  if (!selectedApplication.value) return

  submitting.value = true
  try {
    await api.put(`/loan-applications/${selectedApplication.value.id}/approve`, approvalForm.value)
    closeApproveModal()
    loadApplications()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to approve loan application')
  } finally {
    submitting.value = false
  }
}

const rejectApplication = async () => {
  if (!selectedApplication.value) return

  submitting.value = true
  try {
    await api.put(`/loan-applications/${selectedApplication.value.id}/reject`, rejectionForm.value)
    closeRejectModal()
    loadApplications()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to reject loan application')
  } finally {
    submitting.value = false
  }
}

const closeApproveModal = () => {
  showApproveModalFlag.value = false
  selectedApplication.value = null
  approvalForm.value = {
    approvedAmount: 0,
    approvedInterestRate: 0,
    approvedTenureMonths: 0,
    approvalNotes: ''
  }
}

const closeRejectModal = () => {
  showRejectModalFlag.value = false
  selectedApplication.value = null
  rejectionForm.value = {
    rejectionReason: ''
  }
}

const viewDetails = (applicationId) => {
  router.push(`/loan-applications/${applicationId}`)
}

const getStatusColor = (status) => {
  const colors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    DISBURSED: 'bg-purple-100 text-purple-800',
    CLOSED: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  loadApplications()
})
</script>