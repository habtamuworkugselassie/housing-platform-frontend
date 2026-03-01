<template>
  <div class="min-h-screen bg-black text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white">{{ $t('construction.supplierDashboard') }}</h1>
        <p class="mt-2 text-sm text-gray-400">{{ $t('construction.manageYourSupplies') }}</p>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>

      <div v-else class="space-y-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-zinc-900 border border-white/10 p-6 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
            <label class="text-xs font-medium text-gray-400">{{ $t('construction.totalOrders') }}</label>
            <p class="text-2xl font-bold text-white mt-2">{{ stats.totalOrders }}</p>
          </div>
          <div class="bg-zinc-900 border border-white/10 p-6 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
            <label class="text-xs font-medium text-gray-400">{{ $t('construction.pendingOrders') }}</label>
            <p class="text-2xl font-bold text-yellow-400 mt-2">{{ stats.pendingOrders }}</p>
          </div>
          <div class="bg-zinc-900 border border-white/10 p-6 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
            <label class="text-xs font-medium text-gray-400">{{ $t('construction.processingOrders') }}</label>
            <p class="text-2xl font-bold text-blue-300 mt-2">{{ stats.processingOrders }}</p>
          </div>
          <div class="bg-zinc-900 border border-white/10 p-6 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors">
            <label class="text-xs font-medium text-gray-400">{{ $t('construction.totalRevenue') }}</label>
            <p class="text-2xl font-bold text-green-400 mt-2">{{ formatPrice(stats.totalRevenue, 'ETB') }}</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-4">{{ $t('construction.quickActions') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <router-link
              to="/construction/orders"
              class="p-4 border border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 text-center text-white transition-colors"
            >
              <div class="text-2xl mb-2">📦</div>
              <div class="font-medium text-white">{{ $t('construction.viewOrders') }}</div>
            </router-link>
            <router-link
              to="/construction/inventory"
              class="p-4 border border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 text-center text-white transition-colors"
            >
              <div class="text-2xl mb-2">📋</div>
              <div class="font-medium text-white">{{ $t('construction.manageInventory') }}</div>
            </router-link>
            <router-link
              to="/construction/orders"
              class="p-4 border border-white/10 rounded-lg hover:border-yellow-400 hover:bg-yellow-500/20 text-center text-white transition-colors"
            >
              <div class="text-2xl mb-2">➕</div>
              <div class="font-medium text-white">{{ $t('construction.createOrder') }}</div>
            </router-link>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">{{ $t('construction.recentOrders') }}</h3>
            <router-link
              to="/construction/orders"
              class="text-sm text-yellow-400 hover:text-yellow-300"
            >
              {{ $t('common.viewAll') }} →
            </router-link>
          </div>

          <div v-if="recentOrders.length === 0" class="text-center py-8 text-gray-400">
            {{ $t('construction.noOrders') }}
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="order in recentOrders"
              :key="order.id"
              @click="$router.push(`/construction/orders/${order.id}`)"
              class="border border-white/10 rounded-lg p-4 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors cursor-pointer"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-white">{{ order.orderNumber }}</span>
                    <span :class="getOrderStatusColor(order.status)" class="px-2 py-1 text-xs font-medium rounded">
                      {{ getOrderStatusLabel(order.status) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-400 mt-1">
                    {{ $t('construction.project') }}: {{ order.projectName || $t('construction.generalOrder') }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">{{ formatDate(order.orderDate) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-semibold text-white">
                    {{ formatPrice(order.totalAmount, order.currency || 'ETB') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inventory Summary -->
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white">{{ $t('construction.inventorySummary') }}</h3>
            <router-link
              to="/construction/inventory"
              class="text-sm text-yellow-400 hover:text-yellow-300"
            >
              {{ $t('common.viewAll') }} →
            </router-link>
          </div>

          <div v-if="inventorySummary.length === 0" class="text-center py-8 text-gray-400">
            {{ $t('construction.noInventory') }}
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="item in inventorySummary"
              :key="item.id"
              class="border border-white/10 rounded-lg p-4 hover:border-yellow-400 hover:bg-yellow-500/10 transition-colors"
            >
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-white">{{ item.materialName }}</h4>
                <span
                  v-if="item.quantityOnHand <= item.reorderLevel"
                  class="px-2 py-1 text-xs font-medium bg-red-500/30 text-red-200 rounded"
                >
                  {{ $t('construction.lowStock') }}
                </span>
              </div>
              <div class="text-sm text-gray-400">
                <div class="flex justify-between">
                  <span>{{ $t('construction.quantityOnHand') }}:</span>
                  <span class="font-medium text-white">{{ item.quantityOnHand }} {{ item.unit }}</span>
                </div>
                <div class="flex justify-between mt-1">
                  <span>{{ $t('construction.unitPrice') }}:</span>
                  <span class="font-medium text-white">{{ formatPrice(item.unitPrice, item.currency || 'ETB') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const stats = ref({
  totalOrders: 0,
  pendingOrders: 0,
  processingOrders: 0,
  totalRevenue: 0
})
const recentOrders = ref([])
const inventorySummary = ref([])

const loadDashboardData = async () => {
  loading.value = true
  try {
    // Get supplier ID
    let supplierId = null
    try {
      const supplierResponse = await api.get('/suppliers/my-supplier')
      supplierId = supplierResponse.data.id
    } catch (err) {
      console.error('Failed to get supplier:', err)
      return
    }

    // Load orders
    const ordersResponse = await api.get('/material-orders', {
      params: { supplierId, size: 10, sort: 'orderDate,desc' }
    })
    recentOrders.value = ordersResponse.data.content || ordersResponse.data || []

    // Calculate stats
    const allOrdersResponse = await api.get('/material-orders', {
      params: { supplierId, size: 1000 }
    })
    const allOrders = allOrdersResponse.data.content || allOrdersResponse.data || []
    
    stats.value = {
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === 'PENDING').length,
      processingOrders: allOrders.filter(o => o.status === 'PROCESSING').length,
      totalRevenue: allOrders
        .filter(o => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    }

    // Load inventory summary
    const inventoryResponse = await api.get('/material-inventory', { params: { size: 6 } })
    inventorySummary.value = inventoryResponse.data || []
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
  } finally {
    loading.value = false
  }
}

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const getOrderStatusColor = (status) => {
  const colors = {
    DRAFT: 'bg-gray-500/30 text-gray-200',
    PENDING: 'bg-yellow-500/30 text-yellow-200',
    CONFIRMED: 'bg-blue-500/30 text-blue-200',
    PROCESSING: 'bg-purple-500/30 text-purple-200',
    SHIPPED: 'bg-indigo-500/30 text-indigo-200',
    DELIVERED: 'bg-green-500/30 text-green-200',
    CANCELLED: 'bg-red-500/30 text-red-200'
  }
  return colors[status] || 'bg-gray-500/30 text-gray-200'
}

const getOrderStatusLabel = (status) => {
  const labels = {
    DRAFT: t('construction.draft'),
    PENDING: t('construction.pending'),
    CONFIRMED: t('construction.confirmed'),
    PROCESSING: t('construction.processing'),
    SHIPPED: t('construction.shipped'),
    DELIVERED: t('construction.delivered'),
    CANCELLED: t('construction.cancelled')
  }
  return labels[status] || status
}

onMounted(() => {
  loadDashboardData()
})
</script>
