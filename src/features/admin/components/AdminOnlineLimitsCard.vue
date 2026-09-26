<template>
  <div class="flex flex-wrap items-end gap-3 rounded-xl border border-admin-line/20 bg-admin-surface p-4" data-testid="online-limits-card">
    <div class="min-w-[12rem] flex-1">
      <p class="text-sm font-semibold text-admin-fg">{{ $t('admin.purchaseOrders.onlineLimits.title') }}</p>
      <p class="text-xs text-admin-subtle">{{ $t('admin.purchaseOrders.onlineLimits.help') }}</p>
    </div>
    <label class="text-xs text-admin-subtle">ETB
      <input v-model.number="maxEtb" type="number" min="0" step="1" class="mt-1 block w-32 rounded-lg border border-admin-line/30 bg-transparent px-3 py-2 text-sm text-admin-fg" data-testid="limit-etb" />
    </label>
    <label class="text-xs text-admin-subtle">USD
      <input v-model.number="maxUsd" type="number" min="0" step="1" class="mt-1 block w-28 rounded-lg border border-admin-line/30 bg-transparent px-3 py-2 text-sm text-admin-fg" data-testid="limit-usd" />
    </label>
    <button type="button" class="rounded-lg bg-admin-accent px-3 py-2 text-sm font-semibold text-admin-accent-fg disabled:opacity-60" :disabled="saving" data-testid="limits-save" @click="save">{{ $t('common.save') }}</button>
    <p v-if="error" class="w-full text-xs text-red-500" role="alert">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { purchaseApi } from '@/features/purchase/api/purchase.api'

/** Chapa's maximum per online payment; deposits are capped at it, larger amounts are split. */
const maxEtb = ref<number | string>('')
const maxUsd = ref<number | string>('')
const saving = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const l = await purchaseApi.getOnlineLimits()
    maxEtb.value = l.maxEtb ?? ''
    maxUsd.value = l.maxUsd ?? ''
  } catch {
    /* the rest of the page still works */
  }
})

async function save() {
  saving.value = true
  error.value = null
  try {
    const l = await purchaseApi.setOnlineLimits({ maxEtb: Number(maxEtb.value) || null, maxUsd: Number(maxUsd.value) || null })
    maxEtb.value = l.maxEtb ?? ''
    maxUsd.value = l.maxUsd ?? ''
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Could not save the limits'
  } finally {
    saving.value = false
  }
}
</script>
