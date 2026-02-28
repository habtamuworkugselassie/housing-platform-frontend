<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Credit Products</h1>
        <p class="mt-2 text-sm text-gray-400">Manage your bank's credit products</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-white text-black rounded-lg hover:bg-yellow-400 font-medium transition-colors"
      >
        + Create Credit Product
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

    <!-- Credit Products List -->
    <div v-if="!loading" class="grid grid-cols-1 gap-6">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-zinc-900 border border-white/10 rounded-lg p-6 hover:border-yellow-400 hover:bg-yellow-500/20 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-white">{{ product.name }}</h3>
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                product.status === 'ACTIVE' ? 'bg-green-500/30 text-green-200' :
                product.status === 'PENDING_APPROVAL' ? 'bg-yellow-500/30 text-yellow-200' :
                'bg-gray-500/30 text-gray-300'
              ]">
                {{ product.status }}
              </span>
            </div>
            <p class="text-sm text-gray-400 mb-4">{{ product.description || 'No description' }}</p>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="text-xs font-medium text-gray-400">Product Type</label>
                <p class="text-sm text-white mt-1">{{ product.productType }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-400">Interest Rate</label>
                <p class="text-sm text-white mt-1">{{ product.interestRate }}%</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-400">Loan Amount</label>
                <p class="text-sm text-white mt-1">{{ formatPrice(product.minLoanAmount, product.currency || 'ETB') }} - {{ formatPrice(product.maxLoanAmount, product.currency || 'ETB') }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-400">Tenure</label>
                <p class="text-sm text-white mt-1">{{ product.minTenureMonths }} - {{ product.maxTenureMonths }} months</p>
              </div>
            </div>
          </div>
          
          <div class="ml-4 flex gap-2">
            <button
              @click="editProduct(product)"
              class="px-3 py-1 text-sm text-white hover:text-yellow-400 font-medium transition-colors"
            >
              Edit
            </button>
            <button
              @click="deleteProduct(product.id)"
              class="px-3 py-1 text-sm text-red-300 hover:text-yellow-400 font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div v-if="products.length === 0" class="text-center py-12 bg-zinc-900 border border-white/10 rounded-lg">
        <p class="text-sm text-gray-400">No credit products yet. Create your first one!</p>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingProduct"
      class="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 w-full max-w-2xl">
        <div class="bg-zinc-900 border border-white/10 rounded-lg p-6">
          <h3 class="text-lg font-medium text-white mb-4">
            {{ editingProduct ? 'Edit Credit Product' : 'Create Credit Product' }}
          </h3>
          
          <form @submit.prevent="saveProduct" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400">Product Name *</label>
              <input
                v-model="productForm.name"
                type="text"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400">Description</label>
              <textarea
                v-model="productForm.description"
                rows="3"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400">Product Type *</label>
                <select
                  v-model="productForm.productType"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                >
                  <option value="HOME_PURCHASE">Home Purchase</option>
                  <option value="CONSTRUCTION_LOAN">Construction Loan</option>
                  <option value="MATERIAL_FINANCING">Material Financing</option>
                  <option value="REFINANCING">Refinancing</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400">Interest Rate (%) *</label>
                <input
                  v-model.number="productForm.interestRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400">Min Tenure (months) *</label>
                <input
                  v-model.number="productForm.minTenureMonths"
                  type="number"
                  min="1"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400">Max Tenure (months) *</label>
                <input
                  v-model.number="productForm.maxTenureMonths"
                  type="number"
                  min="1"
                  required
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400">Max Loan-to-Value Ratio *</label>
              <input
                v-model.number="productForm.maxLoanToValueRatio"
                type="number"
                step="0.01"
                min="0"
                max="1"
                required
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400">Min Loan Amount *</label>
                <div class="mt-1 flex gap-2">
                  <input
                    v-model.number="productForm.minLoanAmount"
                    type="number"
                    min="0"
                    required
                    class="flex-1 border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                  <select
                    v-model="productForm.currency"
                    required
                    class="w-32 border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  >
                    <option value="ETB">ETB</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400">Max Loan Amount *</label>
                <div class="mt-1 flex gap-2">
                  <input
                    v-model.number="productForm.maxLoanAmount"
                    type="number"
                    min="0"
                    required
                    class="flex-1 border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                  <select
                    v-model="productForm.currency"
                    required
                    class="w-32 border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  >
                    <option value="ETB">ETB</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400">Processing Fee</label>
                <input
                  v-model.number="productForm.processingFee"
                  type="number"
                  min="0"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400">Prepayment Penalty</label>
                <input
                  v-model.number="productForm.prepaymentPenalty"
                  type="number"
                  min="0"
                  class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400">Eligibility Criteria</label>
              <textarea
                v-model="productForm.eligibilityCriteria"
                rows="3"
                class="mt-1 block w-full border border-white/20 bg-white/5 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-white text-black rounded-md hover:bg-yellow-400"
              >
                {{ editingProduct ? 'Update' : 'Create' }}
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
import { useRoute, useRouter } from 'vue-router'
import api from '@/shared/api/client'
import { formatPrice as formatCurrencyPrice } from '@/shared/utils'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const products = ref([])
const showCreateModal = ref(false)
const editingProduct = ref(null)

const productForm = ref({
  name: '',
  description: '',
  productType: 'HOME_PURCHASE',
  interestRate: 0,
  minTenureMonths: 12,
  maxTenureMonths: 360,
  maxLoanToValueRatio: 0.8,
  minLoanAmount: 0,
  maxLoanAmount: 0,
  currency: 'ETB',
  processingFee: 0,
  prepaymentPenalty: 0,
  eligibilityCriteria: ''
})

const bankId = ref(route.params.bankId)

const loadProducts = async () => {
  if (!bankId.value) {
    error.value = 'Bank ID is required'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const response = await api.get(`/banks/${bankId.value}/credit-products`)
    products.value = response.data
  } catch (err) {
    console.error('Failed to load credit products:', err)
    error.value = err.response?.data?.message || 'Failed to load credit products'
  } finally {
    loading.value = false
  }
}

const saveProduct = async () => {
  try {
    if (editingProduct.value) {
      await api.put(`/banks/${bankId.value}/credit-products/${editingProduct.value.id}`, productForm.value)
    } else {
      await api.post(`/banks/${bankId.value}/credit-products`, productForm.value)
    }
    closeModal()
    loadProducts()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to save credit product')
  }
}

const editProduct = (product) => {
  editingProduct.value = product
  productForm.value = {
    name: product.name,
    description: product.description || '',
    productType: product.productType,
    interestRate: product.interestRate,
    minTenureMonths: product.minTenureMonths,
    maxTenureMonths: product.maxTenureMonths,
    maxLoanToValueRatio: product.maxLoanToValueRatio,
    minLoanAmount: product.minLoanAmount,
    maxLoanAmount: product.maxLoanAmount,
    currency: product.currency || 'ETB',
    processingFee: product.processingFee || 0,
    prepaymentPenalty: product.prepaymentPenalty || 0,
    eligibilityCriteria: product.eligibilityCriteria || ''
  }
  showCreateModal.value = true
}

const deleteProduct = async (productId) => {
  if (!confirm('Are you sure you want to delete this credit product?')) {
    return
  }

  try {
    await api.delete(`/banks/${bankId.value}/credit-products/${productId}`)
    loadProducts()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete credit product')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingProduct.value = null
  productForm.value = {
    name: '',
    description: '',
    productType: 'HOME_PURCHASE',
    interestRate: 0,
    minTenureMonths: 12,
    maxTenureMonths: 360,
    maxLoanToValueRatio: 0.8,
    minLoanAmount: 0,
    maxLoanAmount: 0,
    currency: 'ETB',
    processingFee: 0,
    prepaymentPenalty: 0,
    eligibilityCriteria: ''
  }
}

const formatPrice = (price, currency = 'ETB') => {
  return formatCurrencyPrice(price, currency || 'ETB')
}

onMounted(() => {
  loadProducts()
})
</script>