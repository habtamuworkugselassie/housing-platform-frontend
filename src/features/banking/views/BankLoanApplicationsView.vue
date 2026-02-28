<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white">Loan Applications Review</h1>
      <p class="mt-2 text-sm text-gray-400">Review and manage loan applications for your bank</p>
    </div>

    <!-- Filter Tabs -->
    <div class="mb-6 border-b border-white/10">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          @click="selectedStatus = filter.value"
          :class="[
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
            selectedStatus === filter.value
              ? 'border-yellow-400 text-yellow-400'
              : 'border-transparent text-gray-400 hover:text-yellow-400 hover:border-white/30'
          ]"
        >
          {{ filter.label }}
          <span v-if="filter.count !== undefined" class="ml-2 bg-white/10 text-gray-300 py-0.5 px-2 rounded-full text-xs">
            {{ filter.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-900/40 border border-red-500/30 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-200">{{ error }}</p>
    </div>

    <!-- Loan Applications List -->
    <div v-if="!loading" class="grid grid-cols-1 gap-6">
      <div
        v-for="application in filteredApplications"
        :key="application.id"
        @click="viewDetails(application.id)"
        class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors cursor-pointer"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-white">
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
                <label class="text-xs font-medium text-gray-400">Requested Amount</label>
                <p class="text-sm font-semibold text-white mt-1">{{ formatPrice(application.requestedAmount, application.currency || 'ETB') }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-400">Tenure</label>
                <p class="text-sm text-white mt-1">{{ application.requestedTenureMonths }} months</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-400">Buyer ID</label>
                <p class="text-sm text-white mt-1">{{ application.buyerId.substring(0, 8) }}...</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-400">Applied Date</label>
                <p class="text-sm text-white mt-1">{{ formatDate(application.createdAt) }}</p>
              </div>
            </div>

            <div v-if="application.purpose" class="mt-4">
              <label class="text-xs font-medium text-gray-500">Purpose</label>
              <p class="text-sm text-white mt-1">{{ application.purpose }}</p>
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

      <div v-if="filteredApplications.length === 0" class="text-center py-12 bg-zinc-900 border border-white/10 rounded-lg">
        <p class="text-sm text-gray-400">No loan applications found</p>
      </div>
    </div>

    <!-- Approve Modal -->
    <div
      v-if="showApproveModalFlag && selectedApplication"
      class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50"
      @click.self="closeApproveModal"
    >
      <div class="relative top-20 mx-auto p-5 w-full max-w-2xl">
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6">
          <h3 class="text-lg font-medium text-white mb-4">Approve Loan Application</h3>
          
          <form @submit.prevent="approveApplication" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400">Approved Amount *</label>
              <input
                v-model.number="approvalForm.approvedAmount"
                type="number"
                min="0"
                step="0.01"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400">Approved Interest Rate (%) *</label>
              <input
                v-model.number="approvalForm.approvedInterestRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400">Approved Tenure (months) *</label>
              <input
                v-model.number="approvalForm.approvedTenureMonths"
                type="number"
                min="1"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400">Approval Notes</label>
              <textarea
                v-model="approvalForm.approvalNotes"
                rows="3"
                placeholder="Additional notes about the approval"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeApproveModal"
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50"
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
      class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50"
      @click.self="closeRejectModal"
    >
      <div class="relative top-20 mx-auto p-5 w-full max-w-2xl">
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6">
          <h3 class="text-lg font-medium text-white mb-4">Reject Loan Application</h3>
          
          <form @submit.prevent="rejectApplication" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400">Rejection Reason *</label>
              <textarea
                v-model="rejectionForm.rejectionReason"
                rows="4"
                required
                placeholder="Please provide a reason for rejection"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeRejectModal"
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50"
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
    DRAFT: 'bg-gray-500/30 text-gray-300',
    SUBMITTED: 'bg-blue-500/30 text-blue-200',
    UNDER_REVIEW: 'bg-yellow-500/30 text-yellow-200',
    APPROVED: 'bg-green-500/30 text-green-200',
    REJECTED: 'bg-red-500/30 text-red-200',
    DISBURSED: 'bg-purple-500/30 text-purple-200',
    CLOSED: 'bg-gray-500/30 text-gray-300'
  }
  return colors[status] || 'bg-gray-500/30 text-gray-300'
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