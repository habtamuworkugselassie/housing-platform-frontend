<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ $t('purchase.seller.title') }}</h1>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">{{ $t('purchase.seller.subtitle') }}</p>
        </div>
        <span v-if="pendingCount > 0" class="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800" data-testid="pending-count">
          {{ $t('purchase.seller.needsReview', { count: pendingCount }) }}
        </span>
      </div>

      <!-- Status filter tabs -->
      <div class="mb-4 flex flex-wrap gap-2" role="tablist">
        <button
          v-for="f in FILTERS"
          :key="f.key"
          type="button"
          role="tab"
          :aria-selected="filter === f.key ? 'true' : 'false'"
          class="rounded-full px-3 py-1.5 text-sm font-semibold transition-colors"
          :class="filter === f.key ? 'bg-primary-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:border-primary-300'"
          :data-testid="`filter-${f.key}`"
          @click="setFilter(f.key)"
        >
          {{ $t(`purchase.seller.filters.${f.key}`) }}
        </button>
      </div>

      <div v-if="loading" class="py-20 text-center" data-testid="loading"><div class="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600"></div></div>
      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700" role="alert">{{ error }}</div>
      <div v-else-if="!orders.length" class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
        {{ $t('purchase.seller.empty') }}
      </div>
      <ul v-else class="space-y-4">
        <li v-for="o in orders" :key="o.id" class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" data-testid="order-card">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ o.orderNumber }}</p>
                <PurchaseOrderStatusBadge :status="o.status" />
                <span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">{{ $t(`purchase.types.${o.purchaseType}`) }}</span>
              </div>
              <router-link :to="`/properties/${o.property.id}`" class="mt-1 block text-base font-bold text-gray-900 hover:text-primary-700">{{ o.property.title }}</router-link>
              <p class="text-sm text-gray-500">
                {{ formatPrice(o.pricing.listedPrice, o.pricing.currency) }}
                <template v-if="o.property.city"> · {{ o.property.city }}</template>
                <template v-if="o.property.unitNumber"> · {{ o.property.unitNumber }}</template>
              </p>

              <dl class="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <div>
                  <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $t('purchase.seller.buyer') }}</dt>
                  <dd class="text-gray-900">
                    <span class="font-medium">{{ o.buyer.fullName || '—' }}</span>
                    <a :href="`tel:${o.buyer.contactPhone}`" class="ml-2 text-primary-700 hover:underline">{{ o.buyer.contactPhone }}</a>
                    <a v-if="o.buyer.contactEmail" :href="`mailto:${o.buyer.contactEmail}`" class="ml-2 text-primary-700 hover:underline">{{ o.buyer.contactEmail }}</a>
                  </dd>
                </div>
                <div v-if="o.financing">
                  <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $t('purchase.seller.financing') }}</dt>
                  <dd class="text-gray-900">
                    {{ formatPrice(o.financing.financedAmount, o.pricing.currency) }}
                    <template v-if="o.financing.bankName"> · {{ o.financing.bankName }}</template>
                    <template v-if="o.financing.financingStatus"> · {{ $t(`purchase.financingStatus.${o.financing.financingStatus}`) }}</template>
                  </dd>
                </div>
                <div v-if="o.deposit">
                  <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $t('purchase.seller.deposit') }}</dt>
                  <dd class="text-gray-900">{{ formatPrice(o.deposit.amount, o.deposit.currency) }} · {{ $t(`purchase.deposit.status.${o.deposit.status}`) }}</dd>
                </div>
                <div v-if="o.buyerMessage" class="sm:col-span-2">
                  <dt class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $t('purchase.seller.message') }}</dt>
                  <dd class="whitespace-pre-line text-gray-700">{{ o.buyerMessage }}</dd>
                </div>
              </dl>

              <p class="mt-3 text-xs text-gray-500">
                {{ $t('purchase.seller.placed', { date: formatDate(o.createdAt) }) }}
                <template v-if="o.status === 'PENDING_SELLER_REVIEW' && o.expiresAt"> · {{ $t('purchase.seller.respondBy', { date: formatDate(o.expiresAt) }) }}</template>
                · <router-link :to="{ name: 'PurchaseOrderDetails', params: { id: o.id } }" class="font-semibold text-primary-700 hover:underline">{{ $t('purchase.seller.view') }}</router-link>
              </p>
            </div>

            <div class="w-full sm:w-72">
              <SellerOrderActions :order="o" @updated="replace" />
            </div>
          </div>
        </li>
      </ul>

      <div v-if="page && page.totalPages > 1" class="mt-6 flex items-center justify-between text-sm text-gray-600">
        <span>{{ page.number + 1 }} / {{ page.totalPages }}</span>
        <div class="flex gap-2">
          <button type="button" class="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40" :disabled="page.first" @click="goTo(page.number - 1)">{{ $t('admin.purchaseOrders.prev') }}</button>
          <button type="button" class="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40" :disabled="page.last" @click="goTo(page.number + 1)">{{ $t('admin.purchaseOrders.next') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatPrice } from '@/shared/utils'
import type { PaginatedResponse } from '@/shared/types'
import { purchaseApi } from '../api/purchase.api'
import type { PurchaseOrderResponse, PurchaseOrderStatus } from '../api/purchase.types'
import PurchaseOrderStatusBadge from '../components/PurchaseOrderStatusBadge.vue'
import SellerOrderActions from '../components/SellerOrderActions.vue'

type FilterKey = 'all' | 'review' | 'inProgress' | 'awaitingPayment' | 'completed' | 'closed'
/** Each tab maps to the statuses it shows; the API takes one status, so tabs with several filter client-side. */
const FILTERS: { key: FilterKey; statuses: PurchaseOrderStatus[] | null; api: PurchaseOrderStatus | '' }[] = [
  { key: 'review', statuses: ['PENDING_SELLER_REVIEW'], api: 'PENDING_SELLER_REVIEW' },
  { key: 'inProgress', statuses: ['AWAITING_FINANCING', 'FINANCING_APPROVED', 'FINANCING_PARTIALLY_APPROVED', 'FINANCING_REJECTED'], api: '' },
  { key: 'awaitingPayment', statuses: ['AWAITING_PAYMENT'], api: 'AWAITING_PAYMENT' },
  { key: 'completed', statuses: ['COMPLETED'], api: 'COMPLETED' },
  { key: 'closed', statuses: ['CANCELLED', 'REJECTED', 'EXPIRED'], api: '' },
  { key: 'all', statuses: null, api: '' }
]
const PAGE_SIZE = 50

const { t } = useI18n()
const filter = ref<FilterKey>('all')
const page = ref<PaginatedResponse<PurchaseOrderResponse> | null>(null)
const pendingCount = ref(0)
const loading = ref(true)
const error = ref<string | null>(null)

const orders = computed(() => {
  const def = FILTERS.find((f) => f.key === filter.value)!
  const rows = page.value?.content ?? []
  return def.statuses ? rows.filter((o) => def.statuses!.includes(o.status)) : rows
})

async function load(pageIndex = 0) {
  loading.value = true
  error.value = null
  try {
    const def = FILTERS.find((f) => f.key === filter.value)!
    page.value = await purchaseApi.received({ status: def.api, page: pageIndex, size: PAGE_SIZE })
  } catch (err: any) {
    error.value = err?.response?.data?.message || t('purchase.seller.loadError')
  } finally {
    loading.value = false
  }
}

async function loadPendingCount() {
  try {
    const p = await purchaseApi.received({ status: 'PENDING_SELLER_REVIEW', page: 0, size: 1 })
    pendingCount.value = p.totalElements
  } catch {
    pendingCount.value = 0
  }
}

function setFilter(key: FilterKey) {
  filter.value = key
  load(0)
}

function goTo(index: number) {
  load(Math.max(0, index))
}

/** After accept / reject / complete, swap the row in place and refresh the review counter. */
function replace(updated: PurchaseOrderResponse) {
  if (!page.value) return
  page.value = { ...page.value, content: page.value.content.map((o) => (o.id === updated.id ? updated : o)) }
  loadPendingCount()
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''
  return new Date(value).toLocaleDateString()
}

onMounted(() => {
  load(0)
  loadPendingCount()
})
</script>
