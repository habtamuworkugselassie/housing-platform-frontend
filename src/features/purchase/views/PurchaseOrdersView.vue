<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('purchase.myOrders') }}</h1>
        <router-link to="/properties" class="text-sm font-semibold text-primary-700 hover:underline">{{ $t('purchase.browseProperties') }}</router-link>
      </div>

      <div v-if="loading" class="py-20 text-center"><div class="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600"></div></div>
      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{{ error }}</div>
      <div v-else-if="!orders.length" class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
        {{ $t('purchase.noOrders') }}
      </div>
      <ul v-else class="space-y-3">
        <li v-for="o in orders" :key="o.id">
          <router-link :to="{ name: 'PurchaseOrderDetails', params: { id: o.id } }" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-primary-300">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ o.orderNumber }}</p>
              <p class="text-base font-bold text-gray-900">{{ o.property.title }}</p>
              <p class="text-sm text-gray-500">{{ formatPrice(o.pricing.listedPrice, o.pricing.currency) }} · {{ $t(`purchase.types.${o.purchaseType}`) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="o.pendingSignatures" class="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">{{ $t('purchase.agreements.pending', { count: o.pendingSignatures }) }}</span>
              <PurchaseOrderStatusBadge :status="o.status" />
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { formatPrice } from '@/shared/utils'
import { purchaseApi } from '../api/purchase.api'
import type { PurchaseOrderResponse } from '../api/purchase.types'
import PurchaseOrderStatusBadge from '../components/PurchaseOrderStatusBadge.vue'

const orders = ref<PurchaseOrderResponse[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const page = await purchaseApi.mine({ page: 0, size: 50 })
    orders.value = page.content
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Could not load purchase orders'
  } finally {
    loading.value = false
  }
})
</script>
