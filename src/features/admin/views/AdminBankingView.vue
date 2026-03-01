<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-white">Banking Management</h1>
        <p class="mt-2 text-sm text-gray-400">{{ $t('admin.manageBanking') }}</p>
      </div>

      <div class="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-white/10">
            <thead class="bg-zinc-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Credit Product</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Bank</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Interest Rate</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <tr v-for="product in creditProducts" :key="product.id" class="hover:bg-yellow-500/10 transition-colors">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-white">{{ product.name }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-white">
                  {{ product.bankName || 'N/A' }}
                </td>
                <td class="px-6 py-4 text-sm text-white">
                  {{ product.productType }}
                </td>
                <td class="px-6 py-4 text-sm text-white">
                  {{ product.interestRate }}%
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      product.status === 'ACTIVE' ? 'bg-green-500/30 text-green-200' : 'bg-gray-500/30 text-gray-300'
                    ]"
                  >
                    {{ product.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <button
                    @click="viewProduct(product)"
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

      <!-- View Credit Product Modal -->
      <div
        v-if="showViewDialog"
        class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20 pb-8"
        @click.self="showViewDialog = false"
      >
        <div class="relative mx-auto p-5 border border-white/10 w-full max-w-2xl shadow-lg rounded-md bg-zinc-900 text-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-white">Credit Product Details</h3>
              <button
                @click="showViewDialog = false"
                class="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div v-if="viewingProduct" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-400">Name</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProduct.name || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Bank</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProduct.bankName || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Type</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProduct.productType || 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Interest Rate</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProduct.interestRate || 'N/A' }}%</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Status</label>
                  <span
                    :class="[
                      'mt-1 inline-block px-2 py-1 text-xs font-medium rounded',
                      viewingProduct.status === 'ACTIVE' ? 'bg-green-500/30 text-green-200' : 'bg-gray-500/30 text-gray-300'
                    ]"
                  >
                    {{ viewingProduct.status || 'N/A' }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Min Amount</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProduct.minAmount ? formatPrice(viewingProduct.minAmount, 'ETB') : 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Max Amount</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProduct.maxAmount ? formatPrice(viewingProduct.maxAmount, 'ETB') : 'N/A' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Term (Months)</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProduct.termMonths || 'N/A' }}</p>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-400">Description</label>
                  <p class="mt-1 text-sm text-white">{{ viewingProduct.description || 'N/A' }}</p>
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
const creditProducts = ref([])

const showViewDialog = ref(false)
const viewingProduct = ref(null)

const loadProducts = async () => {
  loading.value = true
  try {
    creditProducts.value = await adminApi.getCreditProducts({})
  } catch (err) {
    console.error('Failed to load credit products:', err)
  } finally {
    loading.value = false
  }
}

const viewProduct = (product) => {
  viewingProduct.value = product
  showViewDialog.value = true
}

onMounted(() => {
  loadProducts()
})
</script>
