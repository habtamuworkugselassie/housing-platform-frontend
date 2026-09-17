<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-xl font-bold text-gray-900">{{ $t('purchase.financing.title') }}</h2>
      <p class="mt-1 text-sm text-gray-500">{{ $t('purchase.financing.subtitle') }}</p>
    </header>

    <!-- Opt-in toggle -->
    <label class="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <input v-model="form.financing.useFinancing" type="checkbox" class="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-400" />
      <span>
        <span class="block text-sm font-semibold text-gray-900">{{ $t('purchase.financing.useFinancing') }}</span>
        <span class="block text-xs text-gray-500">{{ $t('purchase.financing.useFinancingHelp') }}</span>
      </span>
    </label>

    <template v-if="form.financing.useFinancing && form.preview">
      <!-- Offer picker -->
      <fieldset>
        <legend class="mb-2 text-sm font-medium text-gray-700">{{ $t('purchase.financing.chooseOffer') }}</legend>
        <div class="grid gap-3 sm:grid-cols-2">
          <label
            v-for="offer in form.preview.financingOffers"
            :key="offer.financingOfferId"
            class="relative flex cursor-pointer flex-col rounded-xl border p-4 transition-colors"
            :class="offer.financingOfferId === form.financing.selectedOfferId ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-300' : 'border-gray-200 bg-white hover:border-primary-300'"
          >
            <input
              type="radio"
              class="sr-only"
              name="financing-offer"
              :value="offer.financingOfferId"
              :checked="offer.financingOfferId === form.financing.selectedOfferId"
              @change="form.selectOffer(offer.financingOfferId)"
            />
            <span class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-gray-900">{{ offer.bankName || $t('purchase.financing.bank') }}</span>
              <span v-if="offer.recommended" class="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">{{ $t('purchase.financing.recommended') }}</span>
            </span>
            <span class="text-xs text-gray-500">{{ offer.creditProductName }}</span>
            <dl class="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><dt class="text-gray-500">{{ $t('purchase.financing.interestRate') }}</dt><dd class="font-semibold text-gray-900">{{ offer.interestRate }}%</dd></div>
              <div><dt class="text-gray-500">{{ $t('purchase.financing.maxCoverage') }}</dt><dd class="font-semibold text-gray-900">{{ Math.round(offer.ltvRatio * 100) }}%</dd></div>
              <div><dt class="text-gray-500">{{ $t('purchase.financing.maxLoan') }}</dt><dd class="font-semibold text-gray-900">{{ money(offer.maxFinanceableAmount) }}</dd></div>
              <div><dt class="text-gray-500">{{ $t('purchase.financing.tenureRange') }}</dt><dd class="font-semibold text-gray-900">{{ offer.minTenureMonths }}–{{ offer.maxTenureMonths }} {{ $t('purchase.months') }}</dd></div>
            </dl>
          </label>
        </div>
        <p v-if="attempted && form.financingErrors.offer" class="mt-1 text-xs text-red-600">{{ $t(form.financingErrors.offer) }}</p>
      </fieldset>

      <!-- Split -->
      <div v-if="offer && form.split" class="space-y-4 rounded-xl border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900">{{ $t('purchase.financing.howMuch') }}</h3>
          <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="form.split.mode === 'MAXIMUM' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'">
            {{ form.split.mode === 'MAXIMUM' ? $t('purchase.financing.modeMaximum') : $t('purchase.financing.modePartial') }}
          </span>
        </div>

        <template v-if="offer.partialFinancingAllowed">
          <input
            v-model.number="financedInput"
            type="range"
            class="w-full accent-primary-600"
            :min="offer.minFinanceableAmount"
            :max="offer.maxFinanceableAmount"
            :step="sliderStep"
            :aria-label="$t('purchase.financing.financedAmount')"
          />
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="po-financed" class="block text-xs font-medium text-gray-700">{{ $t('purchase.financing.financedAmount') }}</label>
              <input
                id="po-financed"
                v-model.number="financedInput"
                type="number"
                inputmode="decimal"
                :min="offer.minFinanceableAmount"
                :max="offer.maxFinanceableAmount"
                class="mt-1 w-full rounded-lg border px-3 py-2 text-gray-900"
                :class="attempted && form.financingErrors.financedAmount ? 'border-red-400' : 'border-gray-300'"
              />
              <p class="mt-1 text-[11px] text-gray-500">
                {{ $t('purchase.financing.range', { min: money(offer.minFinanceableAmount), max: money(offer.maxFinanceableAmount) }) }}
              </p>
            </div>
            <div>
              <label for="po-cash" class="block text-xs font-medium text-gray-700">{{ $t('purchase.financing.cashPortion') }}</label>
              <input
                id="po-cash"
                :value="form.split.cashPortion"
                type="number"
                inputmode="decimal"
                class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                @change="onCashChange"
              />
              <p class="mt-1 text-[11px] text-gray-500">{{ $t('purchase.financing.cashHelp', { min: money(offer.minimumDownPayment) }) }}</p>
            </div>
          </div>
          <p v-if="attempted && form.financingErrors.financedAmount" class="text-xs text-red-600">
            {{ $t(form.financingErrors.financedAmount, { min: money(offer.minFinanceableAmount), max: money(offer.maxFinanceableAmount) }) }}
          </p>
        </template>
        <p v-else class="text-xs text-gray-500">{{ $t('purchase.financing.partialNotAllowed') }}</p>

        <div>
          <label for="po-tenure" class="block text-xs font-medium text-gray-700">{{ $t('purchase.financing.tenure') }}</label>
          <div class="mt-1 flex items-center gap-3">
            <input
              id="po-tenure"
              v-model.number="form.financing.tenureMonths"
              type="range"
              class="flex-1 accent-primary-600"
              :min="offer.minTenureMonths"
              :max="offer.maxTenureMonths"
              step="1"
            />
            <input
              v-model.number="form.financing.tenureMonths"
              type="number"
              :min="offer.minTenureMonths"
              :max="offer.maxTenureMonths"
              class="w-24 rounded-lg border px-3 py-2 text-gray-900"
              :class="attempted && form.financingErrors.tenureMonths ? 'border-red-400' : 'border-gray-300'"
              :aria-label="$t('purchase.financing.tenure')"
            />
            <span class="text-sm text-gray-500">{{ $t('purchase.months') }}</span>
          </div>
          <p v-if="attempted && form.financingErrors.tenureMonths" class="mt-1 text-xs text-red-600">
            {{ $t(form.financingErrors.tenureMonths, { min: offer.minTenureMonths, max: offer.maxTenureMonths }) }}
          </p>
        </div>

        <!-- Live summary -->
        <dl class="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4 text-sm sm:grid-cols-4">
          <div><dt class="text-xs text-gray-500">{{ $t('purchase.financing.financedAmount') }}</dt><dd class="font-bold text-gray-900">{{ money(form.split.financedAmount) }}</dd></div>
          <div><dt class="text-xs text-gray-500">{{ $t('purchase.financing.cashPortion') }}</dt><dd class="font-bold text-gray-900">{{ money(form.split.cashPortion) }}</dd></div>
          <div><dt class="text-xs text-gray-500">{{ $t('purchase.financing.coverage') }}</dt><dd class="font-bold text-gray-900">{{ (form.split.coverageRatio * 100).toFixed(1) }}%</dd></div>
          <div><dt class="text-xs text-gray-500">{{ $t('purchase.financing.estimatedInstallment') }}</dt><dd class="font-bold text-primary-700">{{ money(form.split.installment) }}<span class="text-xs font-normal text-gray-500">/{{ $t('purchase.month') }}</span></dd></div>
        </dl>
        <p class="text-[11px] text-gray-500">{{ $t('purchase.financing.estimateDisclaimer') }}</p>
      </div>
    </template>

    <p v-else class="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600">
      {{ $t('purchase.financing.cashChosen') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatPrice } from '@/shared/utils'
import { usePurchaseOrderFormStore } from '../stores/purchaseOrderForm'

defineProps<{ attempted?: boolean }>()
const form = usePurchaseOrderFormStore()
const offer = computed(() => form.selectedOffer)

const financedInput = computed<number>({
  get: () => form.financing.financedAmount ?? offer.value?.maxFinanceableAmount ?? 0,
  set: (v) => {
    form.financing.financedAmount = Number.isFinite(v) ? v : null
  }
})

const sliderStep = computed(() => {
  const span = (offer.value?.maxFinanceableAmount ?? 0) - (offer.value?.minFinanceableAmount ?? 0)
  return span > 1_000_000 ? 10_000 : span > 100_000 ? 1_000 : 100
})

function onCashChange(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  if (Number.isFinite(value)) form.setDownPayment(value)
}

function money(value: number | null | undefined) {
  return formatPrice(value ?? 0, form.preview?.currency ?? 'ETB')
}
</script>
