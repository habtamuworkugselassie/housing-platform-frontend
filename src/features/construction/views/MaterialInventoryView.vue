<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{{ $t('construction.materialInventory') }}</h1>
        <p class="mt-2 text-sm text-gray-600">{{ $t('construction.manageInventory') }}</p>
      </div>
      <button
        v-if="authStore.hasRole('REALTOR') || authStore.hasRole('SUPPLIER')"
        @click="showCreateModal = true"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
      >
        + {{ $t('construction.addInventory') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('construction.search') }}</label>
          <input
            v-model="filters.search"
            type="text"
            :placeholder="$t('construction.searchByNameOrCategory')"
            @input="loadInventory"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('construction.category') }}</label>
          <input
            v-model="filters.category"
            type="text"
            :placeholder="$t('construction.filterByCategory')"
            @input="loadInventory"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
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

    <!-- Low Stock Alert -->
    <div v-if="lowStockItems.length > 0" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-yellow-600">⚠️</span>
        <h3 class="text-sm font-semibold text-yellow-800">{{ $t('construction.lowStockAlert') }}</h3>
      </div>
      <p class="text-sm text-yellow-700">{{ $t('construction.lowStockItems', { count: lowStockItems.length }) }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Inventory List -->
    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in inventory"
        :key="item.id"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">{{ item.materialName }}</h3>
            <p v-if="item.category" class="text-sm text-gray-500 mt-1">{{ item.category }}</p>
          </div>
          <span
            v-if="item.quantityOnHand <= item.reorderLevel"
            class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded"
          >
            {{ $t('construction.lowStock') }}
          </span>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">{{ $t('construction.quantityOnHand') }}</span>
            <span class="text-sm font-semibold text-gray-900">{{ item.quantityOnHand }} {{ item.unit }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">{{ $t('construction.reorderLevel') }}</span>
            <span class="text-sm font-semibold text-gray-900">{{ item.reorderLevel }} {{ item.unit }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">{{ $t('construction.unitPrice') }}</span>
            <span class="text-sm font-semibold text-gray-900">
              {{ formatPrice(item.unitPrice, item.currency || 'ETB') }}
            </span>
          </div>
          <div v-if="item.location" class="flex justify-between">
            <span class="text-sm text-gray-600">{{ $t('construction.location') }}</span>
            <span class="text-sm text-gray-900">{{ item.location }}</span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200 flex gap-2">
          <button
            @click="adjustInventory(item)"
            class="flex-1 px-3 py-2 text-sm text-primary-600 hover:text-primary-700 border border-primary-300 rounded-md hover:bg-primary-50"
          >
            {{ $t('construction.adjust') }}
          </button>
          <button
            v-if="authStore.hasRole('REALTOR') || authStore.hasRole('SUPPLIER')"
            @click="editInventory(item)"
            class="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {{ $t('common.edit') }}
          </button>
        </div>
      </div>

      <div v-if="inventory.length === 0" class="col-span-full text-center py-12 bg-white rounded-lg shadow">
        <p class="text-sm text-gray-500">{{ $t('construction.noInventory') }}</p>
      </div>
    </div>

    <!-- Adjust Inventory Modal -->
    <div
      v-if="showAdjustModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="showAdjustModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('construction.adjustInventory') }}</h3>
          
          <form @submit.prevent="saveAdjustment" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.materialName') }}</label>
              <p class="text-sm text-gray-900 mt-1">{{ adjustmentForm.materialName }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.currentQuantity') }}</label>
              <p class="text-sm text-gray-900 mt-1">{{ adjustmentForm.currentQuantity }} {{ adjustmentForm.unit }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.adjustmentType') }} *</label>
              <select
                v-model="adjustmentForm.adjustmentType"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">{{ $t('construction.selectAdjustmentType') }}</option>
                <option value="ADD">{{ $t('construction.add') }}</option>
                <option value="SUBTRACT">{{ $t('construction.subtract') }}</option>
                <option value="SET">{{ $t('construction.set') }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.quantity') }} *</label>
              <input
                v-model.number="adjustmentForm.quantity"
                type="number"
                min="0"
                step="0.01"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.reason') }}</label>
              <textarea
                v-model="adjustmentForm.reason"
                rows="2"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="showAdjustModal = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {{ submitting ? $t('common.loading') : $t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Create/Edit Inventory Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="showCreateModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingItem ? $t('construction.editInventory') : $t('construction.addInventory') }}
          </h3>
          
          <form @submit.prevent="saveInventory" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.materialName') }} *</label>
                <input
                  v-model="inventoryForm.materialName"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.category') }} *</label>
                <input
                  v-model="inventoryForm.category"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.quantityOnHand') }} *</label>
                <input
                  v-model.number="inventoryForm.quantityOnHand"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.unit') }} *</label>
                <input
                  v-model="inventoryForm.unit"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('common.currency') }} *</label>
                <select
                  v-model="inventoryForm.currency"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="ETB">{{ $t('currency.etb') }}</option>
                  <option value="USD">{{ $t('currency.usd') }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.unitPrice') }} *</label>
                <input
                  v-model.number="inventoryForm.unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('construction.reorderLevel') }}</label>
                <input
                  v-model.number="inventoryForm.reorderLevel"
                  type="number"
                  min="0"
                  step="0.01"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.location') }}</label>
              <input
                v-model="inventoryForm.location"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">{{ $t('construction.notes') }}</label>
              <textarea
                v-model="inventoryForm.notes"
                rows="2"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeInventoryModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {{ submitting ? $t('common.loading') : (editingItem ? $t('common.update') : $t('common.create')) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/shared/api/client'
import { useAuthStore } from '@/features/auth'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const inventory = ref([])
const showCreateModal = ref(false)
const showAdjustModal = ref(false)
const editingItem = ref(null)

const filters = ref({
  search: '',
  category: ''
})

const inventoryForm = ref({
  materialName: '',
  category: '',
  quantityOnHand: 0,
  unit: '',
  unitPrice: 0,
  currency: 'ETB',
  reorderLevel: 0,
  location: '',
  notes: ''
})

const adjustmentForm = ref({
  inventoryId: null,
  materialName: '',
  currentQuantity: 0,
  unit: '',
  adjustmentType: '',
  quantity: 0,
  reason: ''
})

const lowStockItems = computed(() => {
  return inventory.value.filter(item => item.quantityOnHand <= item.reorderLevel)
})

const loadInventory = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = {}
    
    if (filters.value.search) {
      params.search = filters.value.search
    }
    
    if (filters.value.category) {
      params.category = filters.value.category
    }

    const response = await api.get('/material-inventory', { params })
    inventory.value = response.data || []
  } catch (err) {
    console.error('Failed to load inventory:', err)
    error.value = err.response?.data?.message || t('construction.failedToLoadInventory')
  } finally {
    loading.value = false
  }
}

const saveInventory = async () => {
  submitting.value = true
  error.value = ''
  try {
    if (editingItem.value) {
      await api.put(`/material-inventory/${editingItem.value.id}`, inventoryForm.value)
    } else {
      await api.post('/material-inventory', inventoryForm.value)
    }
    closeInventoryModal()
    loadInventory()
  } catch (err) {
    error.value = err.response?.data?.message || t('construction.failedToSaveInventory')
  } finally {
    submitting.value = false
  }
}

const adjustInventory = (item) => {
  adjustmentForm.value = {
    inventoryId: item.id,
    materialName: item.materialName,
    currentQuantity: item.quantityOnHand,
    unit: item.unit,
    adjustmentType: '',
    quantity: 0,
    reason: ''
  }
  showAdjustModal.value = true
}

const saveAdjustment = async () => {
  submitting.value = true
  error.value = ''
  try {
    await api.post(`/material-inventory/${adjustmentForm.value.inventoryId}/adjust`, {
      adjustmentType: adjustmentForm.value.adjustmentType,
      quantity: adjustmentForm.value.quantity,
      reason: adjustmentForm.value.reason
    })
    showAdjustModal.value = false
    loadInventory()
  } catch (err) {
    error.value = err.response?.data?.message || t('construction.failedToAdjustInventory')
  } finally {
    submitting.value = false
  }
}

const editInventory = (item) => {
  editingItem.value = item
  inventoryForm.value = {
    materialName: item.materialName,
    category: item.category,
    quantityOnHand: item.quantityOnHand,
    unit: item.unit,
    unitPrice: item.unitPrice,
    currency: item.currency || 'ETB',
    reorderLevel: item.reorderLevel || 0,
    location: item.location || '',
    notes: item.notes || ''
  }
  showCreateModal.value = true
}

const closeInventoryModal = () => {
  showCreateModal.value = false
  editingItem.value = null
  inventoryForm.value = {
    materialName: '',
    category: '',
    quantityOnHand: 0,
    unit: '',
    unitPrice: 0,
    currency: 'ETB',
    reorderLevel: 0,
    location: '',
    notes: ''
  }
}

const clearFilters = () => {
  filters.value = { search: '', category: '' }
  loadInventory()
}

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

onMounted(() => {
  loadInventory()
})
</script>
