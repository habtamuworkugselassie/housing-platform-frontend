<template>
  <div class="grid gap-3 sm:grid-cols-2" role="radiogroup" :aria-label="$t('purchase.payment.chooseMethod')">
    <label
      v-for="m in methods"
      :key="m"
      class="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors"
      :class="m === modelValue ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-300' : 'border-gray-200 bg-white hover:border-primary-300'"
      :data-testid="`deposit-method-${m}`"
    >
      <input type="radio" class="sr-only" :name="name" :value="m" :checked="m === modelValue" :disabled="disabled" @change="$emit('update:modelValue', m)" />
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white" :class="BADGE[m]" aria-hidden="true">{{ SHORT[m] }}</span>
      <span class="min-w-0">
        <span class="block text-sm font-semibold text-gray-900">{{ $t(`purchase.payment.methods.${m}.label`) }}</span>
        <span class="block text-xs text-gray-500">{{ $t(`purchase.payment.methods.${m}.help`) }}</span>
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { DepositPaymentMethod } from '../api/purchase.types'

/** One choice per deposit payment method; each opens Chapa's checkout on that method. */
withDefaults(
  defineProps<{
    modelValue: DepositPaymentMethod | null
    methods: DepositPaymentMethod[]
    disabled?: boolean
    name?: string
  }>(),
  { disabled: false, name: 'deposit-method' }
)
defineEmits<{ (e: 'update:modelValue', value: DepositPaymentMethod): void }>()

const SHORT: Record<DepositPaymentMethod, string> = {
  TELEBIRR: 'tb',
  CBE_BIRR: 'CBE',
  MPESA: 'M-P',
  AWASH_BIRR: 'AW',
  CARD: 'VISA'
}
const BADGE: Record<DepositPaymentMethod, string> = {
  TELEBIRR: 'bg-sky-600',
  CBE_BIRR: 'bg-purple-700',
  MPESA: 'bg-green-600',
  AWASH_BIRR: 'bg-orange-500',
  CARD: 'bg-slate-700'
}
</script>
