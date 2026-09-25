<template>
  <section class="space-y-5">
    <header>
      <h2 class="text-xl font-bold text-gray-900">{{ $t('purchase.review.title') }}</h2>
      <p class="mt-1 text-sm text-gray-500">{{ $t('purchase.review.subtitle') }}</p>
    </header>

    <dl class="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
      <div class="grid gap-1 p-4 sm:grid-cols-3">
        <dt class="text-sm font-medium text-gray-500">{{ $t('purchase.review.property') }}</dt>
        <dd class="text-sm text-gray-900 sm:col-span-2">
          <span class="font-semibold">{{ propertyTitle }}</span>
          <span class="block text-gray-600">{{ money(form.preview?.listedPrice) }}</span>
        </dd>
      </div>
      <div class="grid gap-1 p-4 sm:grid-cols-3">
        <dt class="text-sm font-medium text-gray-500">{{ $t('purchase.review.contact') }}</dt>
        <dd class="text-sm text-gray-900 sm:col-span-2">
          <span class="block">{{ payload?.contactPhone }}</span>
          <span class="block text-gray-600">{{ payload?.contactEmail || $t('purchase.review.noEmail') }}</span>
          <span v-if="payload?.buyerMessage" class="mt-1 block italic text-gray-600">“{{ payload.buyerMessage }}”</span>
        </dd>
        <button type="button" class="text-left text-xs font-semibold text-primary-600 hover:underline sm:col-start-3" @click="form.goTo('contact')">{{ $t('common.edit') }}</button>
      </div>
      <div class="grid gap-1 p-4 sm:grid-cols-3">
        <dt class="text-sm font-medium text-gray-500">{{ $t('purchase.review.payment') }}</dt>
        <dd class="text-sm text-gray-900 sm:col-span-2">
          <template v-if="form.financingApplied && form.split && form.selectedOffer">
            <span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{{ $t('purchase.types.BANK_FINANCED') }}</span>
            <ul class="mt-2 space-y-0.5 text-gray-700">
              <li>{{ form.selectedOffer.bankName }} · {{ form.selectedOffer.creditProductName }} · {{ form.selectedOffer.interestRate }}%</li>
              <li>{{ $t('purchase.financing.financedAmount') }}: <strong>{{ money(form.split.financedAmount) }}</strong> ({{ (form.split.coverageRatio * 100).toFixed(1) }}%)</li>
              <li>{{ $t('purchase.financing.cashPortion') }}: <strong>{{ money(form.split.cashPortion) }}</strong></li>
              <li>{{ $t('purchase.financing.tenure') }}: {{ form.split.tenureMonths }} {{ $t('purchase.months') }} · ≈ {{ money(form.split.installment) }}/{{ $t('purchase.month') }}</li>
            </ul>
          </template>
          <template v-else-if="!form.depositQuote">
            <span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">{{ $t('purchase.types.CASH') }}</span>
            <span class="mt-1 block text-gray-600">{{ $t('purchase.review.cashExplainer') }}</span>
          </template>
          <div v-if="form.depositQuote" :class="{ 'mt-3': form.financingApplied }" data-testid="review-deposit">
            <span class="block font-semibold">{{ $t('purchase.review.depositNow', { amount: money(form.depositQuote.amount) }) }}</span>
            <span v-if="form.payment.method" class="block text-gray-600">{{ $t('purchase.review.via', { method: $t(`purchase.payment.methods.${form.payment.method}.label`) }) }}</span>
            <span v-else class="block text-gray-600">{{ $t('purchase.payment.unavailable') }}</span>
          </div>
        </dd>
        <button v-if="form.depositQuote" type="button" class="text-left text-xs font-semibold text-primary-600 hover:underline sm:col-start-3" @click="form.goTo('payment')">{{ $t('common.edit') }}</button>
        <button v-else-if="form.financingAvailable" type="button" class="text-left text-xs font-semibold text-primary-600 hover:underline sm:col-start-3" @click="form.goTo('financing')">{{ $t('common.edit') }}</button>
      </div>
      <div class="grid gap-1 p-4 sm:grid-cols-3">
        <dt class="text-sm font-medium text-gray-500">{{ $t('purchase.review.agreement') }}</dt>
        <dd class="text-sm text-gray-900 sm:col-span-2">
          <span class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
            {{ $t('purchase.review.agreementAccepted') }}
          </span>
          <span class="mt-1 block text-gray-600">{{ form.promiseAgreement?.title }} · {{ $t('purchase.agreement.version', { version: form.promiseAgreement?.version }) }}</span>
          <span v-if="form.depositTermsAgreement" class="block text-gray-600">{{ form.depositTermsAgreement.title }} · {{ $t('purchase.agreement.version', { version: form.depositTermsAgreement.version }) }}</span>
          <span class="block text-gray-600">{{ $t('purchase.review.signedAs', { name: payload?.promiseToPurchase.signatoryFullName }) }}</span>
        </dd>
        <button type="button" class="text-left text-xs font-semibold text-primary-600 hover:underline sm:col-start-3" @click="form.goTo('agreement')">{{ $t('purchase.review.reread') }}</button>
      </div>
    </dl>

    <p class="text-xs text-gray-500">{{ $t('purchase.review.submitNote') }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatPrice } from '@/shared/utils'
import { usePurchaseOrderFormStore } from '../stores/purchaseOrderForm'

defineProps<{ propertyTitle: string }>()
const form = usePurchaseOrderFormStore()
const payload = computed(() => form.payload)
function money(value: number | null | undefined) {
  return formatPrice(value ?? 0, form.preview?.currency ?? 'ETB')
}
</script>
