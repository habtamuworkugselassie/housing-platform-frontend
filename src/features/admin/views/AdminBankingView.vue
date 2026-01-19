<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Banking Management</h1>
        <p class="mt-2 text-sm text-gray-600">Manage banks and credit products</p>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <div v-else>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit Product</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest Rate</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in creditProducts" :key="product.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ product.bankName || 'N/A' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ product.productType }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ product.interestRate }}%
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ product.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <button
                    @click="viewProduct(product)"
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

const loading = ref(false)
const creditProducts = ref([])

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
  // TODO: Navigate to product details
  console.log('View product:', product)
}

onMounted(() => {
  loadProducts()
})
</script>
