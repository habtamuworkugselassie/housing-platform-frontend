<template>
  <div class="space-y-3" data-testid="seller-actions">
    <!-- PENDING_SELLER_REVIEW: accept or reject -->
    <template v-if="order.status === 'PENDING_SELLER_REVIEW'">
      <div v-if="mode === 'idle'" class="flex flex-wrap gap-2">
        <button type="button" class="inline-flex flex-1 items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50" :disabled="busy" data-testid="accept" @click="mode = 'accept'">
          {{ $t('purchase.seller.accept') }}
        </button>
        <button type="button" class="inline-flex flex-1 items-center justify-center rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50" :disabled="busy" data-testid="reject" @click="mode = 'reject'">
          {{ $t('purchase.seller.reject') }}
        </button>
      </div>

      <form v-else-if="mode === 'accept'" class="space-y-2 rounded-xl border border-primary-200 bg-primary-50 p-3" @submit.prevent="accept">
        <p class="text-xs text-primary-900">{{ $t('purchase.seller.acceptHelp') }}</p>
        <label :for="`${uid}-notes`" class="block text-xs font-medium text-gray-700">{{ $t('purchase.seller.acceptNotes') }}</label>
        <textarea :id="`${uid}-notes`" v-model="notes" rows="2" maxlength="2000" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" :placeholder="$t('purchase.seller.acceptNotesPlaceholder')" />
        <div class="flex gap-2">
          <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50" :disabled="busy" data-testid="accept-confirm">{{ $t('purchase.seller.confirm') }}</button>
          <button type="button" class="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-white" :disabled="busy" @click="reset">{{ $t('purchase.seller.back') }}</button>
        </div>
      </form>

      <form v-else-if="mode === 'reject'" class="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3" novalidate @submit.prevent="reject">
        <label :for="`${uid}-reason`" class="block text-xs font-medium text-gray-700">{{ $t('purchase.seller.rejectReason') }} <span class="text-red-600">*</span></label>
        <textarea :id="`${uid}-reason`" v-model="reason" rows="2" maxlength="2000" required class="w-full rounded-lg border px-3 py-2 text-sm" :class="reasonError ? 'border-red-400' : 'border-gray-300'" :placeholder="$t('purchase.seller.rejectReasonPlaceholder')" />
        <p v-if="reasonError" class="text-xs text-red-600">{{ $t('purchase.seller.rejectReasonRequired') }}</p>
        <div class="flex gap-2">
          <button type="submit" class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50" :disabled="busy" data-testid="reject-confirm">{{ $t('purchase.seller.reject') }}</button>
          <button type="button" class="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-white" :disabled="busy" @click="reset">{{ $t('purchase.seller.back') }}</button>
        </div>
      </form>
    </template>

    <!-- AWAITING_PAYMENT: confirm payment and close the sale -->
    <template v-else-if="order.status === 'AWAITING_PAYMENT'">
      <p v-if="blockedBySignatures" class="rounded-lg bg-amber-50 p-3 text-xs text-amber-800" data-testid="blocked">{{ $t('purchase.seller.blockedSignatures', { count: order.pendingSignatures }) }}</p>
      <p v-else-if="blockedByDeposit" class="rounded-lg bg-amber-50 p-3 text-xs text-amber-800" data-testid="blocked">{{ $t('purchase.seller.blockedDeposit') }}</p>
      <p v-else-if="blockedByBalance" class="rounded-lg bg-amber-50 p-3 text-xs text-amber-800" data-testid="blocked">{{ $t('purchase.seller.blockedBalance') }}</p>

      <button v-if="mode === 'idle'" type="button" class="inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50" :disabled="busy || blocked" data-testid="complete" @click="mode = 'complete'">
        {{ $t('purchase.seller.complete') }}
      </button>
      <form v-else class="space-y-2 rounded-xl border border-green-200 bg-green-50 p-3" @submit.prevent="complete">
        <p class="text-xs text-green-900">{{ $t('purchase.seller.completeHelp') }}</p>
        <label :for="`${uid}-ref`" class="block text-xs font-medium text-gray-700">{{ $t('purchase.seller.paymentReference') }}</label>
        <input :id="`${uid}-ref`" v-model="paymentReference" type="text" maxlength="255" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" :placeholder="$t('purchase.seller.paymentReferencePlaceholder')" />
        <div class="flex gap-2">
          <button type="submit" class="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50" :disabled="busy" data-testid="complete-confirm">{{ $t('purchase.seller.confirm') }}</button>
          <button type="button" class="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-white" :disabled="busy" @click="reset">{{ $t('purchase.seller.back') }}</button>
        </div>
      </form>
    </template>

    <p v-if="error" class="text-xs text-red-600" role="alert">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { purchaseApi } from '../api/purchase.api'
import type { PurchaseOrderResponse } from '../api/purchase.types'

/**
 * The seller's controls for one order: accept / reject while the order awaits review, and
 * "confirm payment" once it awaits payment. Renders nothing for other statuses. Emits the
 * updated order so the parent (list row or details page) can replace its copy.
 */
const props = defineProps<{
  order: PurchaseOrderResponse
  /** Left to pay on the balance, when the caller knows it (order details page). */
  balanceRemaining?: number | null
}>()
const emit = defineEmits<{ updated: [order: PurchaseOrderResponse] }>()
const { t } = useI18n()

const uid = `so-${Math.random().toString(36).slice(2, 8)}`
const mode = ref<'idle' | 'accept' | 'reject' | 'complete'>('idle')
const notes = ref('')
const reason = ref('')
const reasonError = ref(false)
const paymentReference = ref('')
const busy = ref(false)
const error = ref<string | null>(null)

const blockedBySignatures = computed(() => (props.order.pendingSignatures ?? 0) > 0)
const blockedByDeposit = computed(() => {
  const d = props.order.deposit
  return !!d && d.status !== 'PAID' && d.status !== 'WAIVED'
})
const blockedByBalance = computed(() => props.balanceRemaining != null && props.balanceRemaining > 0)
const blocked = computed(() => blockedBySignatures.value || blockedByDeposit.value || blockedByBalance.value)

function reset() {
  mode.value = 'idle'
  reasonError.value = false
  error.value = null
}

async function run(action: () => Promise<PurchaseOrderResponse>) {
  busy.value = true
  error.value = null
  try {
    const updated = await action()
    emit('updated', updated)
    reset()
  } catch (err: any) {
    error.value = err?.response?.data?.message || t('purchase.seller.actionFailed')
  } finally {
    busy.value = false
  }
}

function accept() {
  return run(() => purchaseApi.accept(props.order.id, notes.value.trim() || undefined))
}

function reject() {
  if (!reason.value.trim()) {
    reasonError.value = true
    return
  }
  reasonError.value = false
  return run(() => purchaseApi.reject(props.order.id, reason.value.trim()))
}

function complete() {
  return run(() => purchaseApi.complete(props.order.id, paymentReference.value.trim() || undefined))
}
</script>
