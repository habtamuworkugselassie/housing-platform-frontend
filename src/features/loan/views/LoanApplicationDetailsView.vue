<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
    <div class="mb-6">
      <button
        @click="$router.back()"
        class="text-white hover:text-yellow-400 font-medium mb-4 transition-colors"
      >
        ← Back
      </button>
      <h1 class="text-3xl font-bold text-white">Loan Application Details</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-900/40 border border-red-500/30 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-200">{{ error }}</p>
    </div>

    <!-- Loan Application Details -->
    <div v-if="!loading && application" class="bg-zinc-900 border border-white/10 rounded-lg p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between border-b border-white/10 pb-4">
        <div>
          <h2 class="text-xl font-semibold text-white">
            Loan Application #{{ application.id.substring(0, 8) }}
          </h2>
          <p class="text-sm text-gray-400 mt-1">Applied on {{ formatDate(application.createdAt) }}</p>
        </div>
        <span :class="[
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
          getStatusColor(application.status)
        ]">
          {{ application.status }}
        </span>
      </div>

      <!-- Application Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="text-sm font-medium text-gray-400">Requested Amount</label>
          <p class="text-lg font-semibold text-white mt-1">{{ formatPrice(application.requestedAmount, application.currency || 'ETB') }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-400">Requested Tenure</label>
          <p class="text-lg font-semibold text-white mt-1">{{ application.requestedTenureMonths }} months</p>
        </div>
        <div v-if="application.approvedAmount">
          <label class="text-sm font-medium text-gray-400">Approved Amount</label>
          <p class="text-lg font-semibold text-green-400 mt-1">{{ formatPrice(application.approvedAmount, application.approvedCurrency || application.currency || 'ETB') }}</p>
        </div>
        <div v-if="application.approvedInterestRate">
          <label class="text-sm font-medium text-gray-400">Approved Interest Rate</label>
          <p class="text-lg font-semibold text-white mt-1">{{ application.approvedInterestRate }}%</p>
        </div>
        <div v-if="application.approvedTenureMonths">
          <label class="text-sm font-medium text-gray-400">Approved Tenure</label>
          <p class="text-lg font-semibold text-white mt-1">{{ application.approvedTenureMonths }} months</p>
        </div>
      </div>

      <!-- Purpose -->
      <div v-if="application.purpose">
        <label class="text-sm font-medium text-gray-400">Purpose</label>
        <p class="text-sm text-white mt-1">{{ application.purpose }}</p>
      </div>

      <!-- Approval Notes -->
      <div v-if="application.approvalNotes">
        <label class="text-sm font-medium text-gray-400">Approval Notes</label>
        <p class="text-sm text-white mt-1">{{ application.approvalNotes }}</p>
      </div>

      <!-- Rejection Reason -->
      <div v-if="application.rejectionReason" class="p-4 bg-red-900/40 border border-red-500/30 rounded-lg">
        <label class="text-sm font-medium text-red-200">Rejection Reason</label>
        <p class="text-sm text-red-200 mt-1">{{ application.rejectionReason }}</p>
      </div>

      <!-- Status History -->
      <div class="border-t border-white/10 pt-6">
        <h3 class="text-lg font-semibold text-white mb-4">Status History</h3>
        <div class="space-y-4">
          <div
            v-for="(history, index) in statusHistory"
            :key="index"
            class="flex items-start gap-4"
          >
            <div class="flex-shrink-0">
              <div class="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
              <div v-if="index < statusHistory.length - 1" class="w-0.5 h-12 bg-white/20 ml-1"></div>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-white">
                {{ history.fromStatus }} → {{ history.toStatus }}
              </p>
              <p class="text-xs text-gray-500 mt-1">{{ formatDate(history.changedAt) }}</p>
              <p v-if="history.notes" class="text-xs text-gray-400 mt-1">{{ history.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/shared/api/client'

const route = useRoute()

const loading = ref(false)
const error = ref('')
const application = ref(null)
const statusHistory = ref([])

const loadApplication = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get(`/loan-applications/${route.params.id}`)
    application.value = response.data
    
    // Load status history if available
    // Note: This might need to be included in the response or fetched separately
    // For now, we'll create a simple history from the application data
    if (application.value) {
      statusHistory.value = [
        {
          fromStatus: 'DRAFT',
          toStatus: application.value.status,
          changedAt: application.value.createdAt,
          notes: application.value.purpose
        }
      ]
    }
  } catch (err) {
    console.error('Failed to load loan application:', err)
    error.value = err.response?.data?.message || 'Failed to load loan application'
  } finally {
    loading.value = false
  }
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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadApplication()
})
</script>