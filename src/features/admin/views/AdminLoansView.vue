<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Loan Management</h1>
        <p class="mt-2 text-sm text-gray-600">Manage loan applications</p>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <select
              v-model="filters.status"
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
              @click="loadLoans"
              class="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="loan in loans" :key="loan.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ loan.applicantName || 'N/A' }}</div>
                  <div class="text-sm text-gray-500">{{ loan.applicantEmail || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ loan.propertyTitle || 'N/A' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
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
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ formatDate(loan.createdAt) }}
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <button
                    @click="viewLoan(loan)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const viewLoan = (loan) => {
  // TODO: Navigate to loan details
  console.log('View loan:', loan)
}

onMounted(() => {
  loadLoans()
})
</script>
