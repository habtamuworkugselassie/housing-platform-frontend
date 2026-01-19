<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6">
      <button
        @click="$router.back()"
        class="text-primary-600 hover:text-primary-700 font-medium mb-4"
      >
        ← Back
      </button>
      <h1 class="text-3xl font-bold text-gray-900">Loan Application Details</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-800">{{ error }}</p>
    </div>

    <!-- Loan Application Details -->
    <div v-if="!loading && application" class="bg-white rounded-lg shadow p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between border-b pb-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">
            Loan Application #{{ application.id.substring(0, 8) }}
          </h2>
          <p class="text-sm text-gray-500 mt-1">Applied on {{ formatDate(application.createdAt) }}</p>
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
          <label class="text-sm font-medium text-gray-500">Requested Amount</label>
          <p class="text-lg font-semibold text-gray-900 mt-1">{{ formatPrice(application.requestedAmount, application.currency || 'ETB') }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500">Requested Tenure</label>
          <p class="text-lg font-semibold text-gray-900 mt-1">{{ application.requestedTenureMonths }} months</p>
        </div>
        <div v-if="application.approvedAmount">
          <label class="text-sm font-medium text-gray-500">Approved Amount</label>
          <p class="text-lg font-semibold text-green-600 mt-1">{{ formatPrice(application.approvedAmount, application.approvedCurrency || application.currency || 'ETB') }}</p>
        </div>
        <div v-if="application.approvedInterestRate">
          <label class="text-sm font-medium text-gray-500">Approved Interest Rate</label>
          <p class="text-lg font-semibold text-gray-900 mt-1">{{ application.approvedInterestRate }}%</p>
        </div>
        <div v-if="application.approvedTenureMonths">
          <label class="text-sm font-medium text-gray-500">Approved Tenure</label>
          <p class="text-lg font-semibold text-gray-900 mt-1">{{ application.approvedTenureMonths }} months</p>
        </div>
      </div>

      <!-- Purpose -->
      <div v-if="application.purpose">
        <label class="text-sm font-medium text-gray-500">Purpose</label>
        <p class="text-sm text-gray-900 mt-1">{{ application.purpose }}</p>
      </div>

      <!-- Approval Notes -->
      <div v-if="application.approvalNotes">
        <label class="text-sm font-medium text-gray-500">Approval Notes</label>
        <p class="text-sm text-gray-900 mt-1">{{ application.approvalNotes }}</p>
      </div>

      <!-- Rejection Reason -->
      <div v-if="application.rejectionReason" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <label class="text-sm font-medium text-red-800">Rejection Reason</label>
        <p class="text-sm text-red-700 mt-1">{{ application.rejectionReason }}</p>
      </div>

      <!-- Status History -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
        <div class="space-y-4">
          <div
            v-for="(history, index) in statusHistory"
            :key="index"
            class="flex items-start gap-4"
          >
            <div class="flex-shrink-0">
              <div class="w-2 h-2 rounded-full bg-primary-600 mt-2"></div>
              <div v-if="index < statusHistory.length - 1" class="w-0.5 h-12 bg-gray-200 ml-1"></div>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">
                {{ history.fromStatus }} → {{ history.toStatus }}
              </p>
              <p class="text-xs text-gray-500 mt-1">{{ formatDate(history.changedAt) }}</p>
              <p v-if="history.notes" class="text-xs text-gray-600 mt-1">{{ history.notes }}</p>
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