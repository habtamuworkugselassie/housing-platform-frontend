<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white">Banking Dashboard</h1>
      <p class="mt-2 text-sm text-gray-400">{{ $t('banking.dashboardSubtitle') }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      <p class="mt-2 text-sm text-gray-400">Loading...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-900/40 border border-red-500/30 rounded-lg p-4 mb-6">
      <p class="text-sm text-red-200">{{ error }}</p>
    </div>

    <!-- Bank Info -->
    <div v-if="bank" class="bg-zinc-900 border border-white/10 rounded-lg p-6 mb-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
      <h2 class="text-xl font-semibold text-white mb-4">Bank Information</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-400">Bank Name</label>
          <p class="mt-1 text-sm text-white">{{ bank.name }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-400">Status</label>
          <p class="mt-1">
            <span :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              bank.status === 'APPROVED' ? 'bg-green-500/30 text-green-200' : 'bg-yellow-500/30 text-yellow-200'
            ]">
              {{ bank.status }}
            </span>
          </p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-400">Email</label>
          <p class="mt-1 text-sm text-white">{{ bank.email || 'N/A' }}</p>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-400">Phone</label>
          <p class="mt-1 text-sm text-white">{{ bank.phoneNumber || 'N/A' }}</p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-blue-500/30 rounded-md p-3">
            <svg class="h-6 w-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-400">Credit Products</p>
            <p class="text-2xl font-semibold text-white">{{ stats.creditProducts }}</p>
          </div>
        </div>
      </div>

      <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-green-500/30 rounded-md p-3">
            <svg class="h-6 w-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-400">Active Offers</p>
            <p class="text-2xl font-semibold text-white">{{ stats.activeOffers }}</p>
          </div>
        </div>
      </div>

      <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-yellow-500/30 rounded-md p-3">
            <svg class="h-6 w-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-400">Pending Offers</p>
            <p class="text-2xl font-semibold text-white">{{ stats.pendingOffers }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-zinc-900 border border-white/10 rounded-lg p-6 mb-8 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
      <h2 class="text-xl font-semibold text-white mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <router-link
          :to="bank ? `/banking/${bank.id}/credit-products` : '#'"
          :class="[
            'flex items-center p-4 border-2 rounded-lg transition-colors text-white',
            bank ? 'border-white/10 hover:border-yellow-400 hover:bg-yellow-500/20' : 'border-white/10 opacity-50 cursor-not-allowed'
          ]"
        >
          <div class="flex-shrink-0 bg-yellow-500/30 rounded-md p-3">
            <svg class="h-6 w-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-white">Manage Credit Products</h3>
            <p class="text-sm text-gray-400">{{ $t('banking.createManageCreditProducts') }}</p>
          </div>
        </router-link>

        <router-link
          :to="bank ? `/banking/${bank.id}/financing-offers` : '#'"
          :class="[
            'flex items-center p-4 border-2 rounded-lg transition-colors text-white',
            bank ? 'border-white/10 hover:border-yellow-400 hover:bg-yellow-500/20' : 'border-white/10 opacity-50 cursor-not-allowed'
          ]"
        >
          <div class="flex-shrink-0 bg-green-500/30 rounded-md p-3">
            <svg class="h-6 w-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-white">Manage Financing Offers</h3>
            <p class="text-sm text-gray-400">{{ $t('banking.createManageFinancingOffers') }}</p>
          </div>
        </router-link>

        <router-link
          to="/banking/loan-applications"
          class="flex items-center p-4 border-2 border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors cursor-pointer text-white"
        >
          <div class="flex-shrink-0 bg-purple-500/30 rounded-md p-3">
            <svg class="h-6 w-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-white">Review Loan Applications</h3>
            <p class="text-sm text-gray-400">{{ $t('banking.reviewApproveLoans') }}</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-white/10">
        <h2 class="text-xl font-semibold text-white">Recent Credit Products</h2>
      </div>
      <div class="p-6">
        <div v-if="recentProducts.length === 0" class="text-center py-8">
          <p class="text-sm text-gray-400">{{ $t('banking.noCreditProductsCreateFirst') }}</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="product in recentProducts"
            :key="product.id"
            class="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors"
          >
            <div>
              <h3 class="text-sm font-medium text-white">{{ product.name }}</h3>
              <p class="text-xs text-gray-400 mt-1">{{ product.productType }} • {{ product.interestRate }}% interest</p>
            </div>
            <span :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              product.status === 'ACTIVE' ? 'bg-green-500/30 text-green-200' : 'bg-yellow-500/30 text-yellow-200'
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