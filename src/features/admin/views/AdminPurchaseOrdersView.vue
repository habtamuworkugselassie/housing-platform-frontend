<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-admin-fg">{{ $t('admin.purchaseOrders.title') }}</h1>
        <p class="mt-2 text-sm text-admin-subtle">{{ $t('admin.purchaseOrders.subtitle') }}</p>
      </div>

      <AdminFeeRatesCard />
      <AdminOnlineLimitsCard />
      <AdminUsdRateCard />
      <AdminBankAccountCard />

      <!-- Overview chips: click a status to filter by it, click again to clear. -->
      <div v-if="stats" class="flex flex-wrap gap-2" data-testid="stats">
        <span class="rounded-full border border-admin-line/20 bg-admin-surface px-3 py-1 text-xs font-semibold text-admin-fg">
          {{ $t('admin.purchaseOrders.total') }} · {{ stats.total }}
        </span>
        <span class="rounded-full border border-admin-line/20 bg-admin-surface px-3 py-1 text-xs font-semibold text-admin-fg">
          {{ $t('admin.purchaseOrders.open') }} · {{ stats.open }}
        </span>
        <button
          v-for="s in statusesWithOrders"
          :key="s"
          type="button"
          class="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
          :class="filters.status === s ? 'bg-admin-accent text-admin-accent-fg' : 'border border-admin-line/20 bg-admin-surface text-admin-muted hover:text-admin-fg'"
          :data-testid="`stat-${s}`"
          @click="toggleStatus(s)"
        >
          {{ $t(`purchase.status.${s}`) }} · {{ stats.byStatus[s] }}
        </button>
      </div>

      <!-- Filters -->
      <form class="bg-admin-surface border border-admin-line/10 rounded-lg p-4" @submit.prevent="applyFilters">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div class="lg:col-span-2">
            <label for="po-search" class="block text-sm font-medium text-admin-muted">{{ $t('admin.purchaseOrders.filters.search') }}</label>
            <input
              id="po-search"
              v-model="filters.q"
              type="search"
              :placeholder="$t('admin.purchaseOrders.filters.searchPlaceholder')"
              class="mt-1 block w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg rounded-md py-2 px-3 focus:ring-primary-400 focus:border-primary-400"
            />
          </div>
          <div>
            <label for="po-status" class="block text-sm font-medium text-admin-muted">{{ $t('admin.purchaseOrders.filters.status') }}</label>
            <select id="po-status" v-model="filters.status" class="mt-1 block w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg rounded-md py-2 px-3 focus:ring-primary-400 focus:border-primary-400">
              <option value="">{{ $t('admin.purchaseOrders.filters.allStatuses') }}</option>
              <option v-for="s in STATUSES" :key="s" :value="s">{{ $t(`purchase.status.${s}`) }}</option>
            </select>
          </div>
          <div>
            <label for="po-type" class="block text-sm font-medium text-admin-muted">{{ $t('admin.purchaseOrders.filters.type') }}</label>
            <select id="po-type" v-model="filters.purchaseType" class="mt-1 block w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg rounded-md py-2 px-3 focus:ring-primary-400 focus:border-primary-400">
              <option value="">{{ $t('admin.purchaseOrders.filters.allTypes') }}</option>
              <option value="CASH">{{ $t('purchase.types.CASH') }}</option>
              <option value="BANK_FINANCED">{{ $t('purchase.types.BANK_FINANCED') }}</option>
            </select>
          </div>
          <div>
            <label for="po-from" class="block text-sm font-medium text-admin-muted">{{ $t('admin.purchaseOrders.filters.from') }}</label>
            <input id="po-from" v-model="filters.createdFrom" type="date" class="mt-1 block w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg rounded-md py-2 px-3 focus:ring-primary-400 focus:border-primary-400" />
          </div>
          <div>
            <label for="po-to" class="block text-sm font-medium text-admin-muted">{{ $t('admin.purchaseOrders.filters.to') }}</label>
            <input id="po-to" v-model="filters.createdTo" type="date" class="mt-1 block w-full border border-admin-line/20 bg-admin-field/5 text-admin-fg rounded-md py-2 px-3 focus:ring-primary-400 focus:border-primary-400" />
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="submit" class="px-4 py-2 bg-admin-accent text-admin-accent-fg rounded-md hover:bg-admin-accent-hover transition-colors">
            {{ $t('admin.purchaseOrders.filters.apply') }}
          </button>
          <button type="button" class="px-4 py-2 border border-admin-line/20 text-admin-muted rounded-md hover:text-admin-fg transition-colors" @click="resetFilters">
            {{ $t('admin.purchaseOrders.filters.reset') }}
          </button>
        </div>
      </form>

      <!-- Table -->
      <div class="bg-admin-surface border border-admin-line/10 rounded-lg overflow-hidden">
        <div v-if="loading" class="text-center py-12" data-testid="loading">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-admin-line/15"></div>
        </div>
        <div v-else-if="error" class="p-6 text-sm text-admin-danger" role="alert">{{ error }}</div>
        <div v-else-if="!orders.length" class="p-10 text-center text-sm text-admin-subtle">{{ $t('admin.purchaseOrders.empty') }}</div>
        <div v-else>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[64rem] divide-y divide-admin-line/10 rtable">
              <thead class="bg-admin-raised">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-admin-subtle uppercase">{{ $t('admin.purchaseOrders.columns.order') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-admin-subtle uppercase">{{ $t('admin.purchaseOrders.columns.property') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-admin-subtle uppercase">{{ $t('admin.purchaseOrders.columns.buyer') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-admin-subtle uppercase">{{ $t('admin.purchaseOrders.columns.type') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-admin-subtle uppercase">{{ $t('admin.purchaseOrders.columns.price') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-admin-subtle uppercase">{{ $t('admin.purchaseOrders.columns.deposit') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-admin-subtle uppercase">{{ $t('admin.purchaseOrders.columns.status') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-admin-subtle uppercase">{{ $t('admin.purchaseOrders.columns.created') }}</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-admin-subtle uppercase">{{ $t('admin.purchaseOrders.columns.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-admin-line/10">
                <template v-for="o in orders" :key="o.id">
                <tr class="hover:bg-admin-nav/10 transition-colors" data-testid="order-row">
                  <td class="px-4 py-3 text-sm font-mono text-admin-fg">{{ o.orderNumber }}</td>
                  <td class="px-4 py-3">
                    <div class="text-sm font-medium text-admin-fg">{{ o.property?.title || '—' }}</div>
                    <div class="text-xs text-admin-subtle">
                      {{ [o.property?.city, o.property?.realEstateCompanyName].filter(Boolean).join(' · ') }}
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-sm text-admin-fg">{{ o.buyer?.fullName || '—' }}</div>
                    <div class="text-xs text-admin-subtle">{{ o.buyer?.contactPhone }}<template v-if="o.buyer?.contactEmail"> · {{ o.buyer.contactEmail }}</template></div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-sm text-admin-fg">{{ $t(`purchase.types.${o.purchaseType}`) }}</div>
                    <div v-if="o.financing?.financedAmount" class="text-xs text-admin-subtle">
                      {{ $t('admin.purchaseOrders.financedVia', { amount: formatPrice(o.financing.financedAmount, o.pricing.currency), bank: o.financing.bankName || '—' }) }}
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-admin-fg whitespace-nowrap">{{ formatPrice(o.pricing.listedPrice, o.pricing.currency) }}</td>
                  <td class="px-4 py-3">
                    <span v-if="o.deposit" class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="depositClass(o.deposit.status)">
                      {{ $t(`purchase.deposit.status.${o.deposit.status}`) }}
                    </span>
                    <span v-else class="text-xs text-admin-subtle">{{ $t('admin.purchaseOrders.noDeposit') }}</span>
                  </td>
                  <td class="px-4 py-3"><PurchaseOrderStatusBadge :status="o.status" /></td>
                  <td class="px-4 py-3 text-sm text-admin-subtle whitespace-nowrap">{{ formatDate(o.createdAt) }}</td>
                  <td class="px-4 py-3 text-right text-sm font-medium whitespace-nowrap">
                    <button
                      v-if="canManage(o)"
                      type="button"
                      class="mr-3 rounded-md px-2 py-1 text-xs font-semibold transition-colors"
                      :class="expanded === o.id ? 'bg-admin-accent text-admin-accent-fg' : 'border border-admin-line/20 text-admin-fg hover:text-primary-400'"
                      :data-testid="`manage-${o.id}`"
                      @click="expanded = expanded === o.id ? null : o.id"
                    >
                      {{ expanded === o.id ? $t('admin.purchaseOrders.hide') : $t('admin.purchaseOrders.manage') }}
                    </button>
                    <router-link :to="{ name: 'PurchaseOrderDetails', params: { id: o.id } }" class="text-admin-fg hover:text-primary-400 transition-colors">
                      {{ $t('admin.purchaseOrders.view') }}
                    </router-link>
                  </td>
                </tr>
                <!-- Admin acts on behalf of the listing's company: same controls the realtor has. -->
                <tr v-if="expanded === o.id" :data-testid="`manage-panel-${o.id}`">
                  <td colspan="9" class="bg-admin-raised px-4 py-4">
                    <div class="mx-auto max-w-2xl rounded-xl bg-white p-4 text-gray-900 shadow-sm">
                      <p class="mb-3 text-xs text-gray-500">
                        {{ $t('admin.purchaseOrders.onBehalf', { company: o.property?.realEstateCompanyName || '—' }) }}
                      </p>
                      <SellerOrderActions :order="o" @updated="onManaged" />
                    </div>
                  </td>
                </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div v-if="page" class="flex items-center justify-between border-t border-admin-line/10 px-4 py-3 text-sm text-admin-subtle">
            <span>{{ $t('admin.purchaseOrders.range', { from: rangeFrom, to: rangeTo, total: page.totalElements }) }}</span>
            <div class="flex gap-2">
              <button type="button" class="px-3 py-1 border border-admin-line/20 rounded-md disabled:opacity-40" :disabled="page.first" @click="goTo(pageIndex - 1)">{{ $t('admin.purchaseOrders.prev') }}</button>
              <button type="button" class="px-3 py-1 border border-admin-line/20 rounded-md disabled:opacity-40" :disabled="page.last" @click="goTo(pageIndex + 1)">{{ $t('admin.purchaseOrders.next') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import AdminUsdRateCard from '../components/AdminUsdRateCard.vue'
import AdminFeeRatesCard from '../components/AdminFeeRatesCard.vue'
import AdminOnlineLimitsCard from '../components/AdminOnlineLimitsCard.vue'
import AdminBankAccountCard from '../components/AdminBankAccountCard.vue'
import { formatPrice } from '@/shared/utils'
import type { PaginatedResponse } from '@/shared/types'
import { purchaseApi } from '@/features/purchase/api/purchase.api'
import type {
  AdminPurchaseOrderFilter,
  DepositStatus,
  PurchaseOrderResponse,
  PurchaseOrderStatsResponse,
  PurchaseOrderStatus
} from '@/features/purchase/api/purchase.types'
import PurchaseOrderStatusBadge from '@/features/purchase/components/PurchaseOrderStatusBadge.vue'
import SellerOrderActions from '@/features/purchase/components/SellerOrderActions.vue'

const PAGE_SIZE = 25
const STATUSES: PurchaseOrderStatus[] = [
  'PENDING_SELLER_REVIEW',
  'AWAITING_FINANCING',
  'FINANCING_APPROVED',
  'FINANCING_PARTIALLY_APPROVED',
  'FINANCING_REJECTED',
  'AWAITING_PAYMENT',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
  'EXPIRED'
]

const { t } = useI18n()

const emptyFilters = (): AdminPurchaseOrderFilter => ({ q: '', status: '', purchaseType: '', createdFrom: '', createdTo: '' })
const filters = reactive<AdminPurchaseOrderFilter>(emptyFilters())
const pageIndex = ref(0)
const page = ref<PaginatedResponse<PurchaseOrderResponse> | null>(null)
const stats = ref<PurchaseOrderStatsResponse | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
/** Row whose management panel is open. */
const expanded = ref<string | null>(null)
const MANAGEABLE = new Set<PurchaseOrderStatus>(['PENDING_SELLER_REVIEW', 'AWAITING_PAYMENT'])
function canManage(o: PurchaseOrderResponse) {
  return MANAGEABLE.has(o.status)
}

const orders = computed(() => page.value?.content ?? [])
const statusesWithOrders = computed(() => STATUSES.filter((s) => (stats.value?.byStatus[s] ?? 0) > 0))
const rangeFrom = computed(() => (page.value && page.value.totalElements ? page.value.number * page.value.size + 1 : 0))
const rangeTo = computed(() => (page.value ? page.value.number * page.value.size + page.value.content.length : 0))

async function load() {
  loading.value = true
  error.value = null
  try {
    page.value = await purchaseApi.adminSearch({ ...filters }, { page: pageIndex.value, size: PAGE_SIZE })
  } catch (err: any) {
    error.value = err?.response?.data?.message || t('admin.purchaseOrders.loadError')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    stats.value = await purchaseApi.adminStats()
  } catch {
    stats.value = null // the table is still useful without the chips
  }
}

function applyFilters() {
  pageIndex.value = 0
  load()
}

function resetFilters() {
  Object.assign(filters, emptyFilters())
  applyFilters()
}

function toggleStatus(status: PurchaseOrderStatus) {
  filters.status = filters.status === status ? '' : status
  applyFilters()
}

function goTo(index: number) {
  pageIndex.value = Math.max(0, index)
  load()
}

/** After accept / reject / complete on behalf of the seller: swap the row, refresh the chips. */
function onManaged(updated: PurchaseOrderResponse) {
  if (page.value) {
    page.value = { ...page.value, content: page.value.content.map((o) => (o.id === updated.id ? updated : o)) }
  }
  if (!canManage(updated)) expanded.value = null
  loadStats()
}

function depositClass(status: DepositStatus) {
  if (status === 'PAID' || status === 'WAIVED') return 'bg-green-500/20 text-admin-ok'
  if (status === 'FAILED' || status === 'REFUND_PENDING') return 'bg-red-500/20 text-admin-danger'
  if (status === 'PENDING') return 'bg-amber-500/20 text-amber-500'
  if (status === 'REFUNDED' || status === 'CANCELLED') return 'bg-gray-500/20 text-admin-muted'
  return 'bg-blue-500/20 text-blue-400'
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

onMounted(() => {
  load()
  loadStats()
})
</script>
