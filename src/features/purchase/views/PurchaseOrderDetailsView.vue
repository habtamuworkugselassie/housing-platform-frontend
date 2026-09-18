<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <router-link to="/purchase-orders" class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary-700">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        {{ $t('purchase.myOrders') }}
      </router-link>

      <div v-if="loading" class="py-20 text-center">
        <div class="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{{ translate(error) }}</div>

      <template v-else-if="order">
        <!-- Success banner after creation -->
        <div v-if="justCreated" class="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5" role="status">
          <svg class="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <p class="font-semibold text-green-800">{{ $t('purchase.success.title', { number: order.orderNumber }) }}</p>
            <p class="text-sm text-green-700">{{ $t('purchase.success.body') }}</p>
            <ul v-if="order.warnings?.length" class="mt-2 list-disc pl-5 text-xs text-amber-700">
              <li v-for="w in order.warnings" :key="w">{{ w }}</li>
            </ul>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
          <div class="space-y-6 lg:col-span-2">
            <!-- Header -->
            <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ order.orderNumber }}</p>
                  <h1 class="mt-1 text-2xl font-bold text-gray-900">{{ order.property.title }}</h1>
                  <p class="text-sm text-gray-500">{{ [order.property.unitNumber, order.property.city].filter(Boolean).join(' · ') }}</p>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <PurchaseOrderStatusBadge :status="order.status" />
                  <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="order.purchaseType === 'BANK_FINANCED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'">
                    {{ $t(`purchase.types.${order.purchaseType}`) }}
                  </span>
                </div>
              </div>
              <p class="mt-4 text-sm text-gray-700">{{ $t(`purchase.statusHelp.${order.status}`) }}</p>
              <p v-if="order.expiresAt && order.status === 'PENDING_SELLER_REVIEW'" class="mt-1 text-xs text-gray-500">{{ $t('purchase.expiresOn', { date: formatDate(order.expiresAt) }) }}</p>
            </section>

            <!-- Financing -->
            <section v-if="order.financing" class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 class="mb-4 text-lg font-bold text-gray-900">{{ $t('purchase.financing.title') }}</h2>
              <dl class="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div><dt class="text-xs text-gray-500">{{ $t('purchase.financing.bank') }}</dt><dd class="font-semibold text-gray-900">{{ order.financing.bankName }}</dd></div>
                <div><dt class="text-xs text-gray-500">{{ $t('purchase.financing.product') }}</dt><dd class="font-semibold text-gray-900">{{ order.financing.creditProductName }}</dd></div>
                <div><dt class="text-xs text-gray-500">{{ $t('purchase.financing.status') }}</dt><dd class="font-semibold text-gray-900">{{ $t(`purchase.financingStatus.${order.financing.financingStatus}`) }}</dd></div>
                <div><dt class="text-xs text-gray-500">{{ $t('purchase.financing.financedAmount') }}</dt><dd class="font-semibold text-gray-900">{{ money(order.financing.financedAmount) }}</dd></div>
                <div><dt class="text-xs text-gray-500">{{ $t('purchase.financing.cashPortion') }}</dt><dd class="font-semibold text-gray-900">{{ money(order.financing.cashPortionAmount) }}</dd></div>
                <div><dt class="text-xs text-gray-500">{{ $t('purchase.financing.coverage') }}</dt><dd class="font-semibold text-gray-900">{{ (order.financing.financingCoverageRatio * 100).toFixed(1) }}% · {{ $t(`purchase.financing.mode${order.financing.financingMode === 'MAXIMUM' ? 'Maximum' : 'Partial'}`) }}</dd></div>
                <div><dt class="text-xs text-gray-500">{{ $t('purchase.financing.interestRate') }}</dt><dd class="font-semibold text-gray-900">{{ order.financing.appliedInterestRate }}%</dd></div>
                <div><dt class="text-xs text-gray-500">{{ $t('purchase.financing.tenure') }}</dt><dd class="font-semibold text-gray-900">{{ order.financing.tenureMonths }} {{ $t('purchase.months') }}</dd></div>
                <div><dt class="text-xs text-gray-500">{{ $t('purchase.financing.estimatedInstallment') }}</dt><dd class="font-semibold text-gray-900">{{ money(order.financing.estimatedMonthlyInstallment) }}</dd></div>
              </dl>

              <!-- Partial approval decision -->
              <div v-if="order.status === 'FINANCING_PARTIALLY_APPROVED'" class="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p class="font-semibold">{{ $t('purchase.partial.title') }}</p>
                <p class="mt-1">{{ $t('purchase.partial.body', { approved: money(order.financing.approvedAmount), cash: money(order.financing.proposedCashPortionAmount) }) }}</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button type="button" class="rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50" :disabled="acting" @click="act(() => purchaseApi.acceptPartialApproval(order!.id))">{{ $t('purchase.partial.accept') }}</button>
                  <button type="button" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50" :disabled="acting" @click="act(() => purchaseApi.convertToCash(order!.id))">{{ $t('purchase.actions.convertToCash') }}</button>
                </div>
              </div>
              <div v-else-if="order.status === 'FINANCING_REJECTED'" class="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p class="font-semibold">{{ $t('purchase.rejectedFinancing.title') }}</p>
                <p class="mt-1">{{ $t('purchase.rejectedFinancing.body') }}</p>
                <div class="mt-3 flex flex-wrap items-end gap-2">
                  <div>
                    <label class="block text-xs font-medium" for="reapply-amount">{{ $t('purchase.rejectedFinancing.newAmount') }}</label>
                    <input id="reapply-amount" v-model.number="reapplyAmount" type="number" class="mt-1 w-44 rounded-lg border border-gray-300 px-3 py-2 text-gray-900" :max="order.financing.financedAmount - 1" :min="order.financing.minFinanceableAmount" />
                  </div>
                  <button type="button" class="rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50" :disabled="acting || !reapplyAmount" @click="act(() => purchaseApi.updateFinancing(order!.id, { financedAmount: reapplyAmount! }))">{{ $t('purchase.rejectedFinancing.reapply') }}</button>
                  <button type="button" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50" :disabled="acting" @click="act(() => purchaseApi.convertToCash(order!.id))">{{ $t('purchase.actions.convertToCash') }}</button>
                </div>
              </div>
            </section>

            <!-- Reservation deposit -->
            <section v-if="order.deposit" class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" data-testid="deposit-card">
              <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="text-lg font-bold text-gray-900">{{ $t('purchase.deposit.title') }}</h2>
                  <p class="text-sm text-gray-500">{{ $t('purchase.deposit.subtitle', { provider: providerName }) }}</p>
                </div>
                <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="depositClass(order.deposit.status)">{{ $t(`purchase.deposit.status.${order.deposit.status}`) }}</span>
              </div>
              <p class="text-2xl font-bold text-gray-900">{{ money(order.deposit.amount) }}</p>
              <p v-if="order.deposit.dueAt && (order.deposit.status === 'DUE' || order.deposit.status === 'FAILED')" class="text-xs text-gray-500">{{ $t('purchase.deposit.dueBy', { date: formatDate(order.deposit.dueAt) }) }}</p>
              <p v-if="order.deposit.paidAt" class="text-xs text-gray-500">{{ $t('purchase.deposit.paidOn', { date: formatDate(order.deposit.paidAt), method: order.deposit.paymentMethod || order.deposit.provider }) }}</p>

              <div v-if="depositOutcome" class="mt-3 rounded-xl p-3 text-sm" :class="depositOutcome === 'paid' ? 'bg-green-50 text-green-800' : depositOutcome === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'" role="status">
                {{ $t(`purchase.deposit.outcome.${depositOutcome}`) }}
              </div>
              <p v-if="order.deposit.failureReason && order.deposit.status === 'FAILED'" class="mt-2 text-xs text-red-600">{{ order.deposit.failureReason }}</p>
              <p v-if="depositError" class="mt-2 text-xs text-red-600" role="alert">{{ translate(depositError) }}</p>

              <div v-if="canPayDeposit" class="mt-4 space-y-2">
                <p v-if="order.deposit.termsPending" class="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{{ $t('purchase.deposit.signTermsFirst') }}</p>
                <p v-else-if="!order.deposit.checkoutAvailable" class="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">{{ $t('purchase.deposit.unavailable') }}</p>
                <button
                  v-else
                  type="button"
                  data-testid="pay-deposit"
                  class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                  :disabled="depositBusy"
                  @click="payDeposit"
                >
                  <span v-if="depositBusy" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                  {{ order.deposit.status === 'PENDING' ? $t('purchase.deposit.resume') : order.deposit.status === 'FAILED' ? $t('purchase.deposit.retry') : $t('purchase.deposit.pay') }}
                </button>
                <button v-if="order.deposit.status === 'PENDING'" type="button" class="ml-2 text-xs font-semibold text-primary-700 hover:underline" :disabled="depositBusy" @click="checkDeposit">{{ $t('purchase.deposit.checkStatus') }}</button>
                <p class="text-[11px] text-gray-500">{{ $t('purchase.deposit.securityNote') }}</p>
              </div>
            </section>

            <!-- Agreements -->
            <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div class="mb-4 flex items-center justify-between">
                <h2 class="text-lg font-bold text-gray-900">{{ $t('purchase.agreements.title') }}</h2>
                <span v-if="order.pendingSignatures" class="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">{{ $t('purchase.agreements.pending', { count: order.pendingSignatures }) }}</span>
              </div>
              <ul class="divide-y divide-gray-200">
                <li v-for="a in order.agreements" :key="a.id" class="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ a.title }}</p>
                    <p class="text-xs text-gray-500">
                      {{ $t('purchase.agreement.version', { version: a.templateVersion }) }} · {{ a.providerName }}
                      <template v-if="a.buyerSignedAt"> · {{ $t('purchase.agreements.signedOn', { date: formatDate(a.buyerSignedAt), name: a.buyerSignatoryName }) }}</template>
                    </p>
                    <p class="mt-0.5 font-mono text-[10px] text-gray-400" :title="$t('purchase.agreements.fingerprint')">SHA-256 {{ a.contentHash.slice(0, 16) }}…</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="agreementClass(a.status)">{{ $t(`purchase.agreementStatus.${a.status}`) }}</span>
                    <button type="button" class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50" @click="openAgreement(a)">
                      {{ a.status === 'PENDING_BUYER_SIGNATURE' ? $t('purchase.agreements.reviewAndSign') : $t('purchase.agreements.view') }}
                    </button>
                  </div>
                </li>
              </ul>
            </section>

            <!-- History -->
            <section class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 class="mb-4 text-lg font-bold text-gray-900">{{ $t('purchase.history') }}</h2>
              <ol class="space-y-3">
                <li v-for="(h, i) in [...order.statusHistory].reverse()" :key="i" class="flex gap-3 text-sm">
                  <span class="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" :class="i === 0 ? 'bg-primary-600' : 'bg-gray-300'"></span>
                  <div>
                    <p class="font-medium text-gray-900">{{ $t(`purchase.status.${h.toStatus}`) }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(h.changedAt) }}<span v-if="h.notes"> · {{ h.notes }}</span></p>
                  </div>
                </li>
              </ol>
            </section>
          </div>

          <!-- Sidebar -->
          <aside class="space-y-4 lg:col-span-1">
            <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $t('purchase.review.property') }}</p>
              <p class="mt-2 text-2xl font-bold text-gray-900">{{ money(order.pricing.listedPrice) }}</p>
              <p class="text-xs text-gray-500">{{ order.property.realEstateCompanyName }}</p>
              <router-link :to="`/properties/${order.property.id}`" class="mt-3 inline-block text-sm font-semibold text-primary-700 hover:underline">{{ $t('purchase.viewProperty') }}</router-link>
            </div>
            <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">{{ $t('purchase.review.contact') }}</p>
              <p class="mt-2 text-sm font-semibold text-gray-900">{{ order.buyer.contactPhone }}</p>
              <p class="text-sm text-gray-600">{{ order.buyer.contactEmail || $t('purchase.review.noEmail') }}</p>
            </div>
            <div v-if="order.financing?.nextSteps?.length" class="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">
              <p class="font-semibold">{{ $t('purchase.nextSteps') }}</p>
              <ul class="mt-2 list-disc space-y-1 pl-5 text-xs">
                <li v-for="s in order.financing.nextSteps" :key="s">{{ s }}</li>
              </ul>
            </div>
            <SellerOrderActions v-if="isSeller" :order="order" @updated="order = $event" />
            <button
              v-if="canCancel"
              type="button"
              class="w-full rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
              :disabled="acting"
              @click="cancelOrder"
            >
              {{ $t('purchase.actions.cancel') }}
            </button>
            <p v-if="actionError" class="text-xs text-red-600">{{ actionError }}</p>
          </aside>
        </div>
      </template>
    </div>

    <!-- Agreement modal -->
    <div v-if="activeAgreement" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="closeAgreement">
      <div class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true">
        <div class="mb-4 flex items-start justify-between">
          <h3 class="text-xl font-bold text-gray-900">{{ activeAgreement.title }}</h3>
          <button type="button" class="text-gray-400 hover:text-gray-600" :aria-label="$t('common.close')" @click="closeAgreement">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div v-if="loadingAgreement" class="py-10 text-center"><div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div></div>

        <template v-else-if="activeAgreement.content">
          <AgreementReviewPanel
            v-if="activeAgreement.status === 'PENDING_BUYER_SIGNATURE'"
            :title="activeAgreement.title"
            :content="activeAgreement.content"
            :version="activeAgreement.templateVersion"
            :provider-name="activeAgreement.providerName"
            v-model:accepted="signing.accepted"
            v-model:signatory-name="signing.name"
            v-model:scrolled-to-end="signing.scrolled"
            :attempted="signing.attempted"
            :disabled="signing.busy"
          />
          <div v-else class="agreement-readonly max-h-[60vh] overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-800" v-html="renderMarkdown(activeAgreement.content)" />

          <div class="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
            <p>{{ $t('purchase.agreements.fingerprint') }}: <span class="font-mono">{{ activeAgreement.contentHash }}</span></p>
            <p v-if="activeAgreement.buyerSignedAt">{{ $t('purchase.agreements.signedOn', { date: formatDate(activeAgreement.buyerSignedAt), name: activeAgreement.buyerSignatoryName }) }}</p>
            <p v-if="activeAgreement.providerSignedAt">{{ $t('purchase.agreements.providerSigned', { provider: activeAgreement.providerName, name: activeAgreement.providerSignatoryName, date: formatDate(activeAgreement.providerSignedAt) }) }}</p>
          </div>

          <p v-if="signing.error" class="mt-3 text-sm text-red-600" role="alert">{{ signing.error }}</p>

          <div v-if="activeAgreement.status === 'PENDING_BUYER_SIGNATURE'" class="mt-5 flex justify-end gap-3">
            <button type="button" class="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50" @click="closeAgreement">{{ $t('common.cancel') }}</button>
            <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60" :disabled="signing.busy" @click="signActive">
              <span v-if="signing.busy" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
              {{ $t('purchase.agreements.sign') }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/features/auth'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { formatPrice } from '@/shared/utils'
import { purchaseApi } from '../api/purchase.api'
import type { AgreementStatus, PurchaseAgreementResponse, PurchaseOrderResponse } from '../api/purchase.types'
import { renderMarkdown } from '../utils/markdown'
import PurchaseOrderStatusBadge from '../components/PurchaseOrderStatusBadge.vue'
import SellerOrderActions from '../components/SellerOrderActions.vue'
import { isDepositReturn, useDepositCheckout } from '../composables/useDepositCheckout'
import type { DepositStatus } from '../api/purchase.types'
import AgreementReviewPanel from '../components/AgreementReviewPanel.vue'

const route = useRoute()
const { t, te, locale } = useI18n()

const order = ref<PurchaseOrderResponse | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const acting = ref(false)
const actionError = ref<string | null>(null)
const reapplyAmount = ref<number | null>(null)
const justCreated = computed(() => route.query.created === '1')

// ---- reservation deposit
const orderIdRef = computed(() => String(route.params.id))
const depositCheckout = useDepositCheckout(orderIdRef)
const depositBusy = depositCheckout.busy
const depositError = depositCheckout.error
const depositOutcome = depositCheckout.outcome
const providerName = computed(() => order.value?.agreements?.[0]?.providerName || 'the provider')
// Buyer-only controls stay hidden for the seller, the bank and admins who open the same page.
const auth = useAuthStore()
const isBuyer = computed(() => !!order.value && !!auth.user?.id && auth.user.id === order.value.buyer?.id)
const canPayDeposit = computed(() => {
  const d = order.value?.deposit
  return isBuyer.value && !!d && (d.status === 'DUE' || d.status === 'PENDING' || d.status === 'FAILED') && order.value!.status !== 'CANCELLED'
})
function depositClass(status: DepositStatus) {
  if (status === 'PAID' || status === 'WAIVED') return 'bg-green-100 text-green-700'
  if (status === 'FAILED' || status === 'REFUND_PENDING') return 'bg-red-100 text-red-700'
  if (status === 'PENDING') return 'bg-amber-100 text-amber-800'
  if (status === 'REFUNDED' || status === 'CANCELLED') return 'bg-gray-200 text-gray-700'
  return 'bg-blue-100 text-blue-700'
}
async function payDeposit() {
  await depositCheckout.pay()
}
async function checkDeposit() {
  const deposit = await depositCheckout.confirmOnReturn()
  if (deposit && order.value) order.value = { ...order.value, deposit }
}

const OPEN = new Set(['PENDING_SELLER_REVIEW', 'AWAITING_FINANCING', 'FINANCING_APPROVED', 'FINANCING_PARTIALLY_APPROVED', 'FINANCING_REJECTED', 'AWAITING_PAYMENT'])
const canCancel = computed(() => isBuyer.value && order.value !== null && OPEN.has(order.value.status))
/** Realtors and agents see accept / reject / complete here; the backend still checks the listing is theirs. */
const isSeller = computed(() => !!order.value && !isBuyer.value && auth.hasRole('REALTOR'))

function translate(message: string | null) {
  if (!message) return ''
  return te(message) ? t(message) : message
}
function money(value: number | null | undefined) {
  return formatPrice(value ?? 0, order.value?.pricing.currency ?? 'ETB')
}
function formatDate(value: string | null | undefined) {
  if (!value) return ''
  return new Date(value).toLocaleString(locale.value === 'am' ? 'am-ET' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}
function agreementClass(status: AgreementStatus) {
  return status === 'FULLY_SIGNED'
    ? 'bg-green-100 text-green-700'
    : status === 'VOID'
      ? 'bg-gray-200 text-gray-600'
      : 'bg-amber-100 text-amber-800'
}

async function load() {
  loading.value = true
  error.value = null
  try {
    order.value = await purchaseApi.getById(String(route.params.id))
    if (order.value.financing) reapplyAmount.value = Math.max(order.value.financing.minFinanceableAmount, Math.round(order.value.financing.financedAmount * 0.8))
  } catch (err: any) {
    error.value = err?.response?.status === 404 ? 'purchase.errors.orderNotFound' : (err?.response?.data?.message || 'purchase.errors.loadFailed')
  } finally {
    loading.value = false
  }
  // Back from the payment provider: confirm the result and refresh the deposit block.
  if (order.value?.deposit && isDepositReturn(route.query)) {
    await checkDeposit()
    if (depositOutcome.value === 'paid') await load()
  }
}

async function act(fn: () => Promise<PurchaseOrderResponse>) {
  acting.value = true
  actionError.value = null
  try {
    order.value = await fn()
  } catch (err: any) {
    actionError.value = err?.response?.data?.message || t('purchase.errors.actionFailed')
  } finally {
    acting.value = false
  }
}

function cancelOrder() {
  if (!order.value) return
  if (!window.confirm(t('purchase.actions.cancelConfirm'))) return
  act(() => purchaseApi.cancel(order.value!.id))
}

// ---- agreement modal
const activeAgreement = ref<PurchaseAgreementResponse | null>(null)
const loadingAgreement = ref(false)
const signing = reactive({ accepted: false, name: '', scrolled: false, attempted: false, busy: false, error: null as string | null })

async function openAgreement(summary: PurchaseAgreementResponse) {
  Object.assign(signing, { accepted: false, name: '', scrolled: false, attempted: false, busy: false, error: null })
  activeAgreement.value = { ...summary, content: null }
  loadingAgreement.value = true
  try {
    activeAgreement.value = await purchaseApi.getAgreement(order.value!.id, summary.id)
  } catch (err: any) {
    signing.error = err?.response?.data?.message || t('purchase.errors.loadFailed')
  } finally {
    loadingAgreement.value = false
  }
}
function closeAgreement() {
  activeAgreement.value = null
}
async function signActive() {
  if (!activeAgreement.value || !order.value) return
  signing.attempted = true
  if (!signing.scrolled || !signing.accepted || signing.name.trim().length < 3) return
  signing.busy = true
  signing.error = null
  try {
    await purchaseApi.signAgreement(order.value.id, activeAgreement.value.id, {
      templateId: activeAgreement.value.templateId,
      accepted: true,
      signatoryFullName: signing.name.trim()
    })
    closeAgreement()
    await load()
  } catch (err: any) {
    signing.error = err?.response?.data?.message || t('purchase.errors.actionFailed')
  } finally {
    signing.busy = false
  }
}

watch(() => route.params.id, load)
onMounted(load)
</script>

<style scoped>
.agreement-readonly :deep(h1) { font-size: 1.125rem; font-weight: 800; margin-bottom: 0.75rem; }
.agreement-readonly :deep(h2) { font-size: 1rem; font-weight: 700; margin: 1.25rem 0 0.5rem; }
.agreement-readonly :deep(p) { margin-bottom: 0.75rem; }
.agreement-readonly :deep(ol) { list-style: decimal; margin: 0 0 0.75rem 1.25rem; }
.agreement-readonly :deep(ul) { list-style: disc; margin: 0 0 0.75rem 1.25rem; }
.agreement-readonly :deep(hr) { margin: 1rem 0; }
</style>
