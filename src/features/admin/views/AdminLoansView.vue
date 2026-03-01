<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-white">Loan Management</h1>
        <p class="mt-2 text-sm text-gray-400">{{ $t('admin.manageLoanApplications') }}</p>
      </div>

      <div class="bg-zinc-900 border border-white/10 rounded-lg p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="block text-sm font-medium text-gray-300">Status</label>
            <select
              v-model="filters.status"
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
              @click="loadLoans"
              class="w-full px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400 transition-colors"
            >
              Apply Filters
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
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Applicant</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Property</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Applied</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <tr v-for="loan in loans" :key="loan.id" class="hover:bg-yellow-500/10 transition-colors">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-white">{{ loan.applicantName || 'N/A' }}</div>
                  <div class="text-sm text-gray-400">{{ loan.applicantEmail || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-white">
                  {{ loan.propertyTitle || 'N/A' }}
                </td>
                <td class="px-6 py-4 text-sm text-white">
                  {{ formatPrice(loan.loanAmountEtb, loan.loanAmountUsd) }}
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      getStatusClass(loan.status)
                    ]"
                  >
                    {{ loan.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-400">
                  {{ formatDate(loan.createdAt) }}
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <button
                    @click="viewLoan(loan)"
                    class="text-white hover:text-yellow-400 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- View Loan Modal -->
      <div
        v-if="showViewDialog"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="showViewDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-2xl shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">Loan Application Details</h3>
              <button
                @click="showViewDialog = false"
                class="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingLoan" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-400">Applicant Name</label>
                  <p class="mt-1 text-sm text-white">{{ viewingLoan.applicantName || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Applicant Email</label>
                  <p class="mt-1 text-sm text-white">{{ viewingLoan.applicantEmail || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Property</label>
                  <p class="mt-1 text-sm text-white">{{ viewingLoan.propertyTitle || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Status</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      getStatusClass(viewingLoan.status)
                    ]"
                  >
                    {{ viewingLoan.status || 'N/A' }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Loan Amount (ETB)</label>
                  <p class="mt-1 text-sm text-white">{{ viewingLoan.loanAmountEtb ? formatPrice(viewingLoan.loanAmountEtb, 'ETB') : 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Loan Amount (USD)</label>
                  <p class="mt-1 text-sm text-white">{{ viewingLoan.loanAmountUsd ? formatPrice(viewingLoan.loanAmountUsd, 'USD') : 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Applied Date</label>
                  <p class="mt-1 text-sm text-white">{{ formatDate(viewingLoan.createdAt) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Loan ID</label>
                  <p class="mt-1 text-sm text-white">{{ viewingLoan.id || 'N/A' }}</p>
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
const loans = ref([])
const filters = ref({ status: '' })

const showViewDialog = ref(false)
const viewingLoan = ref(null)

const loadLoans = async () => {
  loading.value = true
  try {
    const data = await adminApi.getLoanApplications(filters.value, { size: 50 })
    loans.value = 'content' in data ? data.content : data
  } catch (err) {
    console.error('Failed to load loans:', err)
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status) => {
  const classes = {
    PENDING: 'bg-yellow-500/30 text-yellow-200',
    APPROVED: 'bg-green-500/30 text-green-200',
    REJECTED: 'bg-red-500/30 text-red-200'
  }
  return classes[status] || 'bg-gray-500/30 text-gray-300'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const viewLoan = (loan) => {
  viewingLoan.value = loan
  showViewDialog.value = true
}

onMounted(() => {
  loadLoans()
})
</script>
