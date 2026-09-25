<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-xl font-bold text-gray-900">{{ $t('purchase.payment.title') }}</h2>
      <p class="mt-1 text-sm text-gray-500">{{ $t('purchase.payment.subtitle') }}</p>
    </header>

    <!-- Birr or US dollars: USD pays the same deposit by international card at the platform's rate. -->
    <div v-if="usdOffered" class="grid grid-cols-2 gap-2" role="radiogroup" :aria-label="$t('purchase.payment.currencyLabel')">
      <button
        v-for="c in (['ETB', 'USD'] as const)"
        :key="c"
        type="button"
        role="radio"
        :aria-checked="currency === c"
        :data-testid="`deposit-currency-${c}`"
        class="rounded-xl border px-3 py-2.5 text-left text-sm transition-colors disabled:opacity-60"
        :class="currency === c ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-300' : 'border-gray-200 bg-white hover:border-primary-300'"
        :disabled="form.loadingPreview"
        @click="form.setDepositCurrency(c)"
      >
        <span class="block font-semibold text-gray-900">{{ $t(`purchase.payment.currency.${c}`) }}</span>
        <span class="block text-xs text-gray-500">{{ c === 'ETB' ? $t('purchase.payment.currencyEtbHelp') : $t('purchase.payment.currencyUsdHelp') }}</span>
      </button>
    </div>

    <div v-if="form.depositQuote" class="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p class="text-xs font-medium uppercase tracking-wide text-gray-500">{{ $t('purchase.deposit.title') }}</p>
      <p class="mt-1 text-2xl font-bold text-gray-900" data-testid="deposit-quote">{{ money(form.depositQuote.amount) }}</p>
      <p v-if="form.depositQuote.baseAmount && form.depositQuote.exchangeRate" class="text-xs text-gray-600" data-testid="deposit-conversion">
        {{ $t('purchase.payment.conversion', { base: formatPrice(form.depositQuote.baseAmount, form.depositQuote.baseCurrency ?? 'ETB'), rate: form.depositQuote.exchangeRate }) }}
      </p>
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
import { computed } from 'vue'
import { formatPrice } from '@/shared/utils'
import DepositMethodPicker from './DepositMethodPicker.vue'
import { usePurchaseOrderFormStore } from '../stores/purchaseOrderForm'

defineProps<{ attempted?: boolean }>()
const form = usePurchaseOrderFormStore()
/** The USD switch shows when the server offers it, or while USD is chosen. */
const usdOffered = computed(
  () => !!form.depositOnline && (form.payment.currency === 'USD' || form.depositQuote?.usdAmount != null)
)
const currency = computed(() => (form.payment.currency === 'USD' ? 'USD' : 'ETB'))
function money(value: number | null | undefined) {
  return formatPrice(value ?? 0, form.depositQuote?.currency ?? form.preview?.currency ?? 'ETB')
}
</script>
