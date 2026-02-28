<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">{{ $t('loan.myLoanApplications') }}</h1>
        <p class="mt-2 text-sm text-gray-400">{{ $t('loan.viewManageApplications') }}</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-white text-black rounded-lg hover:bg-yellow-400 font-medium transition-colors"
      >
        + {{ $t('loan.applyForLoan') }}
      </button>
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
        v-for="application in applications"
        :key="application.id"
        @click="viewDetails(application.id)"
        class="group bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors cursor-pointer"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-white">
                Loan Application #{{ application.id.substring(0, 8) }}
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
                <label class="text-xs font-medium text-gray-400">{{ $t('loan.requestedAmount') }}</label>
                <p class="text-sm font-semibold text-white mt-1">{{ formatPrice(application.requestedAmount, application.currency || 'ETB') }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-400">{{ $t('loan.requestedTenure') }}</label>
                <p class="text-sm text-white mt-1">{{ application.requestedTenureMonths }} {{ $t('loan.tenureMonths') }}</p>
              </div>
              <div v-if="application.approvedAmount">
                <label class="text-xs font-medium text-gray-400">{{ $t('loan.approvedAmount') }}</label>
                <p class="text-sm font-semibold text-green-400 mt-1">{{ formatPrice(application.approvedAmount, application.approvedCurrency || application.currency || 'ETB') }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-400">Applied Date</label>
                <p class="text-sm text-white mt-1">{{ formatDate(application.createdAt) }}</p>
              </div>
            </div>

            <div v-if="application.purpose" class="mt-4">
                <label class="text-xs font-medium text-gray-400">{{ $t('loan.purpose') }}</label>
              <p class="text-sm text-white mt-1">{{ application.purpose }}</p>
            </div>

            <div v-if="application.rejectionReason" class="mt-4 p-3 bg-red-900/40 border border-red-500/30 rounded">
              <label class="text-xs font-medium text-red-200">{{ $t('loan.rejectionReason') }}</label>
              <p class="text-sm text-red-200 mt-1">{{ application.rejectionReason }}</p>
            </div>
          </div>
          
          <div class="ml-4">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>

      <div v-if="applications.length === 0" class="text-center py-12 bg-zinc-900 border border-white/10 rounded-lg">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-white">{{ $t('loan.noLoanApplications') }}</h3>
        <p class="mt-1 text-sm text-gray-400">{{ $t('loan.getStarted') }}</p>
        <div class="mt-6">
          <button
            @click="showCreateModal = true"
            class="px-4 py-2 bg-white text-black rounded-lg hover:bg-yellow-400 font-medium transition-colors"
          >
            {{ $t('loan.applyForLoan') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create Loan Application Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
      @click.self="closeModal"
    >
      <div class="relative mx-auto p-5 border border-white/10 w-full max-w-2xl shadow-lg rounded-md bg-zinc-900 text-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-white mb-4">{{ $t('loan.applyForLoan') }}</h3>
          
          <form @submit.prevent="submitApplication" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300">Bank *</label>
              <select
                v-model="applicationForm.bankId"
                required
                @change="loadCreditProducts"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
              >
                <option value="">{{ $t('loan.selectBank') }}</option>
                <option
                  v-for="bank in banks"
                  :key="bank.id"
                  :value="bank.id"
                >
                  {{ bank.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300">Credit Product *</label>
              <select
                v-model="applicationForm.creditProductId"
                required
                :disabled="!applicationForm.bankId || creditProductsLoading"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50"
              >
                <option value="">{{ $t('loan.selectCreditProduct') }}</option>
                <option
                  v-for="product in creditProducts"
                  :key="product.id"
                  :value="product.id"
                >
                  {{ product.name }} - {{ product.interestRate }}% interest
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300">Property ID (Optional)</label>
              <input
                v-model="applicationForm.propertyId"
                type="text"
                placeholder="Leave empty if not property-specific"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300">{{ $t('loan.requestedAmount') }} *</label>
              <div class="mt-1 flex gap-2">
                <input
                  v-model.number="applicationForm.requestedAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="flex-1 border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
                <select
                  v-model="applicationForm.currency"
                  required
                  class="w-32 border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="">{{ $t('currency.selectCurrency') }}</option>
                  <option value="ETB">{{ $t('currency.etb') }}</option>
                  <option value="USD">{{ $t('currency.usd') }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300">{{ $t('loan.requestedTenure') }} ({{ $t('loan.tenureMonths') }}) *</label>
              <input
                v-model.number="applicationForm.requestedTenureMonths"
                type="number"
                min="1"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300">Purpose</label>
              <textarea
                v-model="applicationForm.purpose"
                rows="3"
                placeholder="Describe the purpose of this loan"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md px-3 py-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
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
                {{ submitting ? $t('common.loading') : $t('common.submit') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/shared/api/client'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const applications = ref([])
const banks = ref([])
const creditProducts = ref([])
const creditProductsLoading = ref(false)
const showCreateModal = ref(false)

const applicationForm = ref({
  bankId: '',
  creditProductId: '',
  propertyId: '',
  requestedAmount: 0,
  currency: 'ETB',
  requestedTenureMonths: 12,
  purpose: ''
})

const loadApplications = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await api.get('/loan-applications/my-applications')
    applications.value = response.data
  } catch (err) {
    console.error('Failed to load loan applications:', err)
    error.value = err.response?.data?.message || 'Failed to load loan applications'
  } finally {
    loading.value = false
  }
}

const loadBanks = async () => {
  try {
    const response = await api.get('/organizations?type=BANK&status=APPROVED')
    banks.value = response.data
  } catch (err) {
    console.error('Failed to load banks:', err)
  }
}

const loadCreditProducts = async () => {
  if (!applicationForm.value.bankId) {
    creditProducts.value = []
    return
  }

  creditProductsLoading.value = true
  try {
    const response = await api.get(`/banks/${applicationForm.value.bankId}/credit-products?status=ACTIVE`)
    creditProducts.value = response.data
  } catch (err) {
    console.error('Failed to load credit products:', err)
    alert('Failed to load credit products')
  } finally {
    creditProductsLoading.value = false
  }
}

const submitApplication = async () => {
  submitting.value = true
  try {
    const payload = {
      bankId: applicationForm.value.bankId,
      creditProductId: applicationForm.value.creditProductId,
      propertyId: applicationForm.value.propertyId || null,
      requestedAmount: applicationForm.value.requestedAmount,
      currency: applicationForm.value.currency,
      requestedTenureMonths: applicationForm.value.requestedTenureMonths,
      purpose: applicationForm.value.purpose || null
    }

    await api.post('/loan-applications', payload)
    closeModal()
    loadApplications()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to submit loan application')
  } finally {
    submitting.value = false
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

const closeModal = () => {
  showCreateModal.value = false
  applicationForm.value = {
    bankId: '',
    creditProductId: '',
    propertyId: '',
    requestedAmount: 0,
    currency: 'ETB',
    requestedTenureMonths: 12,
    purpose: ''
  }
  creditProducts.value = []
}

onMounted(() => {
  loadApplications()
  loadBanks()
})
</script>