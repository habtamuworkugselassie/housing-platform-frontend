<template>
  <div class="space-y-3 rounded-xl border border-admin-line/20 bg-admin-surface p-4" data-testid="bank-account-card">
    <div>
      <p class="text-sm font-semibold text-admin-fg">{{ $t('admin.purchaseOrders.bankAccount.title') }}</p>
      <p class="text-xs text-admin-subtle">{{ $t('admin.purchaseOrders.bankAccount.help') }}</p>
    </div>
    <div class="grid gap-2 sm:grid-cols-4">
      <input v-for="f in FIELDS" :key="f" v-model="form[f]" type="text" maxlength="255" :placeholder="$t(`admin.purchaseOrders.bankAccount.${f}`)" :aria-label="$t(`admin.purchaseOrders.bankAccount.${f}`)" class="rounded-lg border border-admin-line/30 bg-transparent px-3 py-2 text-sm text-admin-fg" :data-testid="`bank-${f}`" />
    </div>
    <div class="flex items-center gap-3">
      <button type="button" class="rounded-lg bg-admin-accent px-3 py-2 text-sm font-semibold text-admin-accent-fg disabled:opacity-60" :disabled="saving" data-testid="bank-save" @click="save">{{ $t('common.save') }}</button>
      <span class="text-xs" :class="error ? 'text-red-500' : 'text-admin-subtle'" role="status">{{ error || (saved ? $t('admin.purchaseOrders.bankAccount.saved') : '') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { purchaseApi } from '@/features/purchase/api/purchase.api'
import type { ProviderBankAccount } from '@/features/purchase/api/purchase.types'

/** The provider's bank account shown to buyers who pay the balance by transfer. */
const FIELDS = ['bankName', 'accountName', 'accountNumber', 'branch'] as const
const form = reactive<Record<(typeof FIELDS)[number], string>>({ bankName: '', accountName: '', accountNumber: '', branch: '' })
const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)

function fill(a: ProviderBankAccount | null) {
  for (const f of FIELDS) form[f] = a?.[f] ?? ''
}

onMounted(async () => {
  try {
    fill(await purchaseApi.getBankAccount())
  } catch {
    /* the rest of the page still works */
  }
})

async function save() {
  saving.value = true
  saved.value = false
  error.value = null
  try {
    fill(await purchaseApi.setBankAccount({ ...form }))
    saved.value = true
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Could not save the bank account'
  } finally {
    saving.value = false
  }
}
</script>
