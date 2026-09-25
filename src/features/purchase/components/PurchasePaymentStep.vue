<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-xl font-bold text-gray-900">{{ $t('purchase.payment.title') }}</h2>
      <p class="mt-1 text-sm text-gray-500">{{ $t('purchase.payment.subtitle') }}</p>
    </header>

    <div v-if="form.depositQuote" class="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p class="text-xs font-medium uppercase tracking-wide text-gray-500">{{ $t('purchase.deposit.title') }}</p>
      <p class="mt-1 text-2xl font-bold text-gray-900" data-testid="deposit-quote">{{ money(form.depositQuote.amount) }}</p>
      <p class="mt-1 text-xs text-gray-600">{{ $t('purchase.payment.depositExplainer') }}</p>
    </div>

    <fieldset v-if="form.depositOnline">
      <legend class="mb-2 text-sm font-medium text-gray-700">{{ $t('purchase.payment.chooseMethod') }}</legend>
      <DepositMethodPicker v-model="form.payment.method" :methods="form.depositQuote?.paymentMethods ?? []" />
      <p v-if="attempted && form.paymentErrors.method" class="mt-2 text-xs text-red-600" role="alert">{{ $t(form.paymentErrors.method) }}</p>
      <p class="mt-3 text-[11px] text-gray-500">{{ $t('purchase.deposit.securityNote') }}</p>
    </fieldset>
    <p v-else class="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">{{ $t('purchase.payment.unavailable') }}</p>

    <p v-if="form.financingApplied" class="text-xs text-gray-500">{{ $t('purchase.payment.financedNote') }}</p>
  </section>
</template>

<script setup lang="ts">
import { formatPrice } from '@/shared/utils'
import DepositMethodPicker from './DepositMethodPicker.vue'
import { usePurchaseOrderFormStore } from '../stores/purchaseOrderForm'

defineProps<{ attempted?: boolean }>()
const form = usePurchaseOrderFormStore()
function money(value: number | null | undefined) {
  return formatPrice(value ?? 0, form.depositQuote?.currency ?? form.preview?.currency ?? 'ETB')
}
</script>
