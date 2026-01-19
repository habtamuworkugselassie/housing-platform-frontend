<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Banking Dashboard</h1>
      <p class="mt-2 text-sm text-gray-600">Manage your credit products and financing offers</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <p class="mt-2 text-sm text-gray-600">Loading...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-800">{{ error }}</p>
    </div>

    <!-- Bank Info -->
    <div v-if="bank" class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Bank Information</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-500">Bank Name</label>
          <p class="mt-1 text-sm text-gray-900">{{ bank.name }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500">Status</label>
          <p class="mt-1">
            <span :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              bank.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            ]">
              {{ bank.status }}
            </span>
          </p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500">Email</label>
          <p class="mt-1 text-sm text-gray-900">{{ bank.email || 'N/A' }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-500">Phone</label>
          <p class="mt-1 text-sm text-gray-900">{{ bank.phoneNumber || 'N/A' }}</p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Credit Products</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.creditProducts }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Active Offers</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.activeOffers }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
            <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Pending Offers</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.pendingOffers }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <router-link
          :to="bank ? `/banking/${bank.id}/credit-products` : '#'"
          :class="[
            'flex items-center p-4 border-2 rounded-lg transition-colors',
            bank ? 'border-gray-200 hover:border-primary-500 hover:bg-primary-50 cursor-pointer' : 'border-gray-200 opacity-50 cursor-not-allowed'
          ]"
        >
          <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
            <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Manage Credit Products</h3>
            <p class="text-sm text-gray-500">Create and manage your credit products</p>
          </div>
        </router-link>

        <router-link
          :to="bank ? `/banking/${bank.id}/financing-offers` : '#'"
          :class="[
            'flex items-center p-4 border-2 rounded-lg transition-colors',
            bank ? 'border-gray-200 hover:border-primary-500 hover:bg-primary-50 cursor-pointer' : 'border-gray-200 opacity-50 cursor-not-allowed'
          ]"
        >
          <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Manage Financing Offers</h3>
            <p class="text-sm text-gray-500">Create and manage property financing offers</p>
          </div>
        </router-link>

        <router-link
          to="/banking/loan-applications"
          class="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors cursor-pointer"
        >
          <div class="flex-shrink-0 bg-purple-100 rounded-md p-3">
            <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">Review Loan Applications</h3>
            <p class="text-sm text-gray-500">Review and approve/reject loan applications</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Recent Credit Products</h2>
      </div>
      <div class="p-6">
        <div v-if="recentProducts.length === 0" class="text-center py-8">
          <p class="text-sm text-gray-500">No credit products yet. Create your first one!</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="product in recentProducts"
            :key="product.id"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div>
              <h3 class="text-sm font-medium text-gray-900">{{ product.name }}</h3>
              <p class="text-xs text-gray-500 mt-1">{{ product.productType }} • {{ product.interestRate }}% interest</p>
            </div>
            <span :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            ]">
              {{ product.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'

const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const bank = ref(null)
const stats = ref({
  creditProducts: 0,
  activeOffers: 0,
  pendingOffers: 0
})
const recentProducts = ref([])

const loadDashboardData = async () => {
  if (!authStore.hasRole('BANKER')) {
    error.value = 'You must be a banker to access this page'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Load bank information
    const bankResponse = await api.get('/organizations/my-bank')
    bank.value = bankResponse.data

    // Load credit products
    const productsResponse = await api.get(`/banks/${bank.value.id}/credit-products`)
    const products = productsResponse.data
    stats.value.creditProducts = products.length
    recentProducts.value = products.slice(0, 5)

    // Load financing offers
    const offersResponse = await api.get(`/banks/${bank.value.id}/financing-offers`)
    const offers = offersResponse.data
    stats.value.activeOffers = offers.filter(o => o.status === 'ACTIVE').length
    stats.value.pendingOffers = offers.filter(o => o.status === 'PENDING_APPROVAL').length
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
    error.value = err.response?.data?.message || 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>