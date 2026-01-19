<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{{ $t('construction.materialOrders') }}</h1>
        <p class="mt-2 text-sm text-gray-600">{{ $t('construction.manageMaterialOrders') }}</p>
      </div>
      <button
        v-if="authStore.hasRole('REALTOR') || authStore.hasRole('SUPPLIER')"
        @click="showCreateModal = true"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
      >
        + {{ $t('construction.createOrder') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('construction.status') }}</label>
          <select
            v-model="filters.status"
            @change="loadOrders"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          >
            <option value="">{{ $t('filters.all') }}</option>
            <option value="DRAFT">{{ $t('construction.draft') }}</option>
            <option value="PENDING">{{ $t('construction.pending') }}</option>
            <option value="CONFIRMED">{{ $t('construction.confirmed') }}</option>
            <option value="PROCESSING">{{ $t('construction.processing') }}</option>
            <option value="SHIPPED">{{ $t('construction.shipped') }}</option>
            <option value="DELIVERED">{{ $t('construction.delivered') }}</option>
            <option value="CANCELLED">{{ $t('construction.cancelled') }}</option>
          </select>
        </div>
        <div v-if="authStore.hasRole('REALTOR')">
          <label class="block text-sm font-medium text-gray-700">{{ $t('construction.project') }}</label>
          <select
            v-model="filters.projectId"
            @change="loadOrders"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          >
            <option value="">{{ $t('filters.all') }}</option>
            <option v-for="proj in projects" :key="proj.id" :value="proj.id">
              {{ proj.name }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {{ $t('filters.clearFilters') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Orders List -->
    <div v-if="!loading" class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        @click="$router.push(`/construction/orders/${order.id}`)"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">{{ order.orderNumber }}</h3>
              <span :class="getOrderStatusColor(order.status)" class="px-2 py-1 text-xs font-medium rounded">
                {{ getOrderStatusLabel(order.status) }}
              </span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label class="text-xs font-medium text-gray-500">{{ $t('construction.supplier') }}</label>
                <p class="text-sm font-semibold text-gray-900 mt-1">{{ order.supplierName || 'N/A' }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500">{{ $t('construction.project') }}</label>
                <p class="text-sm font-semibold text-gray-900 mt-1">{{ order.projectName || $t('construction.generalOrder') }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500">{{ $t('construction.totalAmount') }}</label>
                <p class="text-sm font-semibold text-gray-900 mt-1">
                  {{ formatPrice(order.totalAmount, order.currency || 'ETB') }}
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500">{{ $t('construction.orderDate') }}</label>
                <p class="text-sm text-gray-900 mt-1">{{ formatDate(order.orderDate) }}</p>
              </div>
            </div>

            <div v-if="order.items && order.items.length > 0" class="mt-3">
              <p class="text-xs text-gray-500 mb-1">{{ $t('construction.items') }}:</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="item in order.items.slice(0, 3)"
                  :key="item.id"
                  class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {{ item.materialName }} ({{ item.quantity }} {{ item.unit }})
                </span>
                <span v-if="order.items.length > 3" class="text-xs text-gray-500">
                  +{{ order.items.length - 3 }} {{ $t('construction.more') }}
                </span>
              </div>
            </div>

            <div v-if="order.expectedDeliveryDate" class="mt-2 text-xs text-gray-500">
              {{ $t('construction.expectedDelivery') }}: {{ formatDate(order.expectedDeliveryDate) }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="orders.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <p class="text-sm text-gray-500">{{ $t('construction.noOrders') }}</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex justify-center">
      <nav class="flex space-x-2">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 0"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          {{ $t('common.previous') }}
        </button>
        <span class="px-4 py-2 text-sm text-gray-700">
          {{ $t('common.page') }} {{ currentPage + 1 }} {{ $t('common.of') }} {{ totalPages }}
        </span>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= totalPages - 1"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          {{ $t('common.next') }}
        </button>
      </nav>
    </div>

    <!-- Create Order Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="showCreateModal = false"
    >
      <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('construction.createOrder') }}</h3>
          
          <form @submit.prevent="createOrder" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.supplier') }} *</label>
                <select
                  v-model="orderForm.supplierId"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">{{ $t('construction.selectSupplier') }}</option>
                  <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                    {{ supplier.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.project') }}</label>
                <select
                  v-model="orderForm.projectId"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">{{ $t('construction.generalOrder') }}</option>
                  <option v-for="proj in projects" :key="proj.id" :value="proj.id">
                    {{ proj.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('common.currency') }} *</label>
                <select
                  v-model="orderForm.currency"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="ETB">{{ $t('currency.etb') }}</option>
                  <option value="USD">{{ $t('currency.usd') }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.expectedDeliveryDate') }}</label>
                <input
                  v-model="orderForm.expectedDeliveryDate"
                  type="date"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <!-- Order Items -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.orderItems') }} *</label>
                <button
                  type="button"
                  @click="addOrderItem"
                  class="text-sm text-primary-600 hover:text-primary-700"
                >
                  + {{ $t('construction.addItem') }}
                </button>
              </div>
              
              <div v-for="(item, index) in orderForm.items" :key="index" class="border border-gray-200 rounded-lg p-4 mb-3">
                <div class="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-700">{{ $t('construction.materialName') }} *</label>
                    <input
                      v-model="item.materialName"
                      type="text"
                      required
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700">{{ $t('construction.category') }} *</label>
                    <input
                      v-model="item.category"
                      type="text"
                      required
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-4 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-gray-700">{{ $t('construction.quantity') }} *</label>
                    <input
                      v-model.number="item.quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700">{{ $t('construction.unit') }} *</label>
                    <input
                      v-model="item.unit"
                      type="text"
                      required
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700">{{ $t('construction.unitPrice') }} *</label>
                    <input
                      v-model.number="item.unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div class="flex items-end">
                    <button
                      type="button"
                      @click="removeOrderItem(index)"
                      class="w-full px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-md"
                    >
                      {{ $t('common.delete') }}
                    </button>
                  </div>
                </div>
                <div v-if="item.quantity && item.unitPrice" class="mt-2 text-xs text-gray-600">
                  {{ $t('construction.total') }}: {{ formatPrice(item.quantity * item.unitPrice, orderForm.currency) }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.taxAmount') }}</label>
                <input
                  v-model.number="orderForm.taxAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.shippingCost') }}</label>
                <input
                  v-model.number="orderForm.shippingCost"
                  type="number"
                  min="0"
                  step="0.01"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.deliveryAddress') }}</label>
              <input
                v-model="orderForm.deliveryAddress"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.notes') }}</label>
              <textarea
                v-model="orderForm.notes"
                rows="2"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                @click="showCreateModal = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="submitting || orderForm.items.length === 0"
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {{ submitting ? $t('common.loading') : $t('common.create') }}
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
import { useI18n } from 'vue-i18n'
import api from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const orders = ref([])
const suppliers = ref([])
const projects = ref([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(1)
const showCreateModal = ref(false)

const filters = ref({
  status: '',
  projectId: ''
})

const orderForm = ref({
  supplierId: '',
  projectId: '',
  currency: 'ETB',
  expectedDeliveryDate: '',
  taxAmount: null,
  shippingCost: null,
  deliveryAddress: '',
  notes: '',
  items: []
})

const loadOrders = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    
    if (filters.value.status) {
      params.status = filters.value.status
    }
    
    if (filters.value.projectId) {
      params.projectId = filters.value.projectId
    }

    // If supplier, filter by supplier
    if (authStore.hasRole('SUPPLIER')) {
      // Get supplier ID from user's organization
      try {
        const supplierResponse = await api.get('/suppliers/my-supplier')
        params.supplierId = supplierResponse.data.id
      } catch (err) {
        console.error('Failed to get supplier:', err)
      }
    }

    const response = await api.get('/material-orders', { params })
    orders.value = response.data.content || response.data || []
    totalPages.value = response.data.totalPages || 1
  } catch (err) {
    console.error('Failed to load orders:', err)
    error.value = err.response?.data?.message || t('construction.failedToLoadOrders')
  } finally {
    loading.value = false
  }
}

const loadSuppliers = async () => {
  try {
    const response = await api.get('/suppliers')
    suppliers.value = response.data || []
  } catch (err) {
    console.error('Failed to load suppliers:', err)
  }
}

const loadProjects = async () => {
  if (!authStore.hasRole('REALTOR')) return
  
  try {
    const response = await api.get('/construction-projects', { params: { size: 100 } })
    projects.value = response.data.content || response.data || []
  } catch (err) {
    console.error('Failed to load projects:', err)
  }
}

const createOrder = async () => {
  if (orderForm.value.items.length === 0) {
    error.value = t('construction.atLeastOneItemRequired')
    return
  }

  submitting.value = true
  error.value = ''
  try {
    await api.post('/material-orders', orderForm.value)
    showCreateModal.value = false
    resetOrderForm()
    loadOrders()
  } catch (err) {
    error.value = err.response?.data?.message || t('construction.failedToCreateOrder')
  } finally {
    submitting.value = false
  }
}

const addOrderItem = () => {
  orderForm.value.items.push({
    materialName: '',
    category: '',
    unit: '',
    quantity: 0,
    unitPrice: 0
  })
}

const removeOrderItem = (index) => {
  orderForm.value.items.splice(index, 1)
}

const resetOrderForm = () => {
  orderForm.value = {
    supplierId: '',
    projectId: '',
    currency: 'ETB',
    expectedDeliveryDate: '',
    taxAmount: null,
    shippingCost: null,
    deliveryAddress: '',
    notes: '',
    items: []
  }
}

const clearFilters = () => {
  filters.value = { status: '', projectId: '' }
  currentPage.value = 0
  loadOrders()
}

const changePage = (page) => {
  currentPage.value = page
  loadOrders()
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
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    RETURNED: 'bg-orange-100 text-orange-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getOrderStatusLabel = (status) => {
  const labels = {
    DRAFT: t('construction.draft'),
    PENDING: t('construction.pending'),
    CONFIRMED: t('construction.confirmed'),
    PROCESSING: t('construction.processing'),
    SHIPPED: t('construction.shipped'),
    DELIVERED: t('construction.delivered'),
    CANCELLED: t('construction.cancelled'),
    RETURNED: t('construction.returned')
  }
  return labels[status] || status
}

onMounted(() => {
  loadOrders()
  loadSuppliers()
  loadProjects()
})
</script>
