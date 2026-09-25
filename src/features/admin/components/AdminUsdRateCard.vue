<template>
  <div class="flex flex-wrap items-end gap-3 rounded-xl border border-admin-line/20 bg-admin-surface p-4" data-testid="usd-rate-card">
    <div class="min-w-[12rem] flex-1">
      <label for="usd-rate" class="block text-sm font-semibold text-admin-fg">{{ $t('admin.purchaseOrders.usdRate.title') }}</label>
      <p class="text-xs text-admin-subtle">{{ $t('admin.purchaseOrders.usdRate.help') }}</p>
    </div>
    <div class="flex items-center gap-2">
      <input
        id="usd-rate"
        v-model="input"
        type="number"
        inputmode="decimal"
        min="1"
        step="0.0001"
        :placeholder="$t('admin.purchaseOrders.usdRate.placeholder')"
        class="w-36 rounded-lg border border-admin-line/30 bg-transparent px-3 py-2 text-sm text-admin-fg"
        @keydown.enter.prevent="save"
      />
      <span class="text-xs text-admin-subtle">{{ $t('admin.purchaseOrders.usdRate.unit') }}</span>
      <button type="button" class="rounded-lg bg-admin-accent px-3 py-2 text-sm font-semibold text-admin-accent-fg disabled:opacity-60" :disabled="saving" @click="save">
        {{ $t('common.save') }}
      </button>
    </div>
    <p class="w-full text-xs" :class="error ? 'text-red-500' : 'text-admin-subtle'" role="status">
      {{ error || (current ? $t('admin.purchaseOrders.usdRate.on', { rate: current }) : $t('admin.purchaseOrders.usdRate.off')) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { purchaseApi } from '@/features/purchase/api/purchase.api'

/** Birr per USD for deposits paid in USD by international card. Empty turns USD off. */
const current = ref<number | null>(null)
const input = ref<string | number>('')
const saving = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    current.value = (await purchaseApi.getUsdRate()).etbPerUsd
    input.value = current.value ?? ''
  } catch {
    /* the rest of the page still works */
  }
})

async function save() {
  saving.value = true
  error.value = null
  try {
    const raw = String(input.value).trim()
    const rate = raw === '' ? null : Number(raw)
    current.value = (await purchaseApi.setUsdRate(rate)).etbPerUsd
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.response?.data?.fieldErrors?.[0]?.message || 'Could not save the rate'
  } finally {
    saving.value = false
  }
}
</script>
