<template>
  <div class="flex flex-wrap items-end gap-3 rounded-xl border border-admin-line/20 bg-admin-surface p-4" data-testid="fees-card">
    <div class="min-w-[12rem] flex-1">
      <p class="text-sm font-semibold text-admin-fg">{{ $t('admin.purchaseOrders.fees.title') }}</p>
      <p class="text-xs text-admin-subtle">{{ $t('admin.purchaseOrders.fees.help') }}</p>
    </div>
    <label class="text-xs text-admin-subtle">{{ $t('admin.purchaseOrders.fees.markup') }}
      <input v-model.number="markupPercent" type="number" min="0" max="100" step="0.01" class="mt-1 block w-28 rounded-lg border border-admin-line/30 bg-transparent px-3 py-2 text-sm text-admin-fg" data-testid="fees-markup" />
    </label>
    <label class="text-xs text-admin-subtle">{{ $t('admin.purchaseOrders.fees.vat') }}
      <input v-model.number="vatRate" type="number" min="0" max="100" step="0.01" class="mt-1 block w-28 rounded-lg border border-admin-line/30 bg-transparent px-3 py-2 text-sm text-admin-fg" data-testid="fees-vat" />
    </label>
    <button type="button" class="rounded-lg bg-admin-accent px-3 py-2 text-sm font-semibold text-admin-accent-fg disabled:opacity-60" :disabled="saving" data-testid="fees-save" @click="save">{{ $t('common.save') }}</button>
    <p class="w-full text-xs" :class="error ? 'text-red-500' : 'text-admin-subtle'" role="status">
      {{ error || (Number(markupPercent) > 0 ? $t('admin.purchaseOrders.fees.example', { markup: markupPercent, vat: vatRate }) : $t('admin.purchaseOrders.fees.off')) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { purchaseApi } from '@/features/purchase/api/purchase.api'

/** Markup % and VAT rate added on top of the price; orders keep the rates they were placed with. */
const markupPercent = ref<number | string>(0)
const vatRate = ref<number | string>(15)
const saving = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const r = await purchaseApi.getFeeRates()
    markupPercent.value = r.markupPercent
    vatRate.value = r.vatRate
  } catch {
    /* the rest of the page still works */
  }
})

async function save() {
  saving.value = true
  error.value = null
  try {
    const r = await purchaseApi.setFeeRates({ markupPercent: Number(markupPercent.value) || 0, vatRate: Number(vatRate.value) || 0 })
    markupPercent.value = r.markupPercent
    vatRate.value = r.vatRate
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Could not save the rates'
  } finally {
    saving.value = false
  }
}
</script>
