<template>
  <div class="space-y-4" data-testid="balance-seller-tools">
    <!-- Transfers waiting for confirmation -->
    <div v-if="submitted.length" class="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <p class="text-sm font-semibold text-amber-900">{{ $t('purchase.balance.seller.toConfirm') }}</p>
      <div v-for="p in submitted" :key="p.id" class="space-y-2 rounded-lg bg-white p-3 text-sm" :data-testid="`review-${p.id}`">
        <p class="font-medium text-gray-900">{{ money(p.amount) }}<span v-if="p.purpose === 'FEES'"> · {{ $t('purchase.fees.purpose.FEES') }}</span> · {{ p.reference }}<span v-if="p.paidOn" class="text-gray-500"> · {{ p.paidOn }}</span></p>
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" class="text-xs font-semibold text-primary-700 hover:underline" @click="openSlip(p.id)">{{ $t('purchase.balance.viewReceipt') }}</button>
          <input v-model="notes[p.id]" type="text" maxlength="2000" :placeholder="$t('purchase.balance.seller.notePlaceholder')" class="min-w-[10rem] flex-1 rounded-lg border border-gray-300 px-2 py-1 text-xs" />
          <button type="button" class="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60" :disabled="busy" :data-testid="`approve-${p.id}`" @click="review(p.id, true)">{{ $t('purchase.balance.seller.approve') }}</button>
          <button type="button" class="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60" :disabled="busy" :data-testid="`decline-${p.id}`" @click="review(p.id, false)">{{ $t('purchase.balance.seller.decline') }}</button>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <button v-if="!balance.fullyPaid" type="button" class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-800" data-testid="open-record" @click="panel = panel === 'record' ? null : 'record'">{{ $t('purchase.balance.seller.record') }}</button>
      <button v-if="canEditSchedule" type="button" class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-800" data-testid="open-schedule" @click="openSchedule">{{ $t('purchase.balance.seller.editSchedule') }}</button>
    </div>

    <!-- Record money received outside the platform -->
    <div v-if="panel === 'record'" class="space-y-2 rounded-xl border border-gray-200 p-3" data-testid="record-form">
      <p class="text-xs text-gray-600">{{ $t('purchase.balance.seller.recordHelp') }}</p>
      <select v-if="balance.fees" v-model="record.purpose" class="rounded-lg border border-gray-300 px-2 py-1.5 text-sm" data-testid="record-purpose">
        <option value="BALANCE">{{ $t('purchase.fees.purpose.BALANCE') }}</option>
        <option value="FEES">{{ $t('purchase.fees.purpose.FEES') }}</option>
      </select>
      <div class="grid gap-2 sm:grid-cols-3">
        <input v-model.number="record.amount" type="number" min="1" step="0.01" :placeholder="$t('purchase.balance.amount')" class="rounded-lg border border-gray-300 px-2 py-1.5 text-sm" data-testid="record-amount" />
        <input v-model="record.reference" type="text" maxlength="255" :placeholder="$t('purchase.balance.bankReference')" class="rounded-lg border border-gray-300 px-2 py-1.5 text-sm" data-testid="record-reference" />
        <input v-model="record.paidOn" type="date" class="rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
      </div>
      <button type="button" class="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60" :disabled="busy || !(record.amount > 0) || !record.reference.trim()" data-testid="record-submit" @click="saveRecord">{{ $t('purchase.balance.seller.recordSave') }}</button>
    </div>

    <!-- Schedule editor -->
    <div v-if="panel === 'schedule'" class="space-y-2 rounded-xl border border-gray-200 p-3" data-testid="schedule-form">
      <p class="text-xs text-gray-600">{{ $t('purchase.balance.seller.scheduleHelp', { total: money(balance.balanceDue) }) }}</p>
      <div v-for="(line, i) in lines" :key="i" class="grid grid-cols-[1fr_7rem_8.5rem_auto] items-center gap-2">
        <input v-model="line.label" type="text" maxlength="100" :placeholder="$t('purchase.balance.seller.label', { n: i + 1 })" class="rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
        <input v-model.number="line.amount" type="number" min="1" step="0.01" class="rounded-lg border border-gray-300 px-2 py-1.5 text-sm" :data-testid="`line-amount-${i}`" />
        <input v-model="line.dueDate" type="date" class="rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
        <button type="button" class="text-xs text-red-600" :disabled="lines.length === 1" :aria-label="$t('common.delete')" @click="lines.splice(i, 1)">✕</button>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button type="button" class="text-xs font-semibold text-primary-700" @click="lines.push({ label: '', amount: 0, dueDate: '' })">+ {{ $t('purchase.balance.seller.addLine') }}</button>
        <span class="text-xs" :class="scheduleMatches ? 'text-green-700' : 'text-red-600'" data-testid="schedule-total">{{ $t('purchase.balance.seller.scheduleTotal', { total: money(scheduleTotal), due: money(balance.balanceDue) }) }}</span>
      </div>
      <button type="button" class="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60" :disabled="busy || !scheduleMatches" data-testid="schedule-save" @click="saveSchedule">{{ $t('common.save') }}</button>
    </div>

    <p v-if="error" class="text-xs text-red-600" role="alert">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatPrice } from '@/shared/utils'
import { openProtectedFile } from '@/shared/api/protectedFile'
import { useAuthStore } from '@/features/auth'
import { purchaseApi } from '../api/purchase.api'
import type { PurchaseBalanceResponse } from '../api/purchase.types'

/** Seller (or admin) side of the balance: confirm transfers, record payments, set the schedule. */
const props = defineProps<{ orderId: string; balance: PurchaseBalanceResponse }>()
const emit = defineEmits<{ updated: [balance: PurchaseBalanceResponse] }>()
const { t } = useI18n()
type BalancePurpose = 'BALANCE' | 'FEES'
const auth = useAuthStore()

const busy = ref(false)
const error = ref<string | null>(null)
const panel = ref<'record' | 'schedule' | null>(null)
const notes = reactive<Record<string, string>>({})
const record = reactive({ amount: 0, reference: '', paidOn: '', purpose: 'BALANCE' as BalancePurpose })
const lines = ref<{ label: string; amount: number; dueDate: string }[]>([])

const submitted = computed(() => props.balance.payments.filter((p) => p.status === 'SUBMITTED'))
/** Sellers set the schedule until money is paid; the platform can always change it. */
const canEditSchedule = computed(() => !props.balance.fullyPaid && (props.balance.paid === 0 || auth.isAdmin))
const scheduleTotal = computed(() => Math.round(lines.value.reduce((s, l) => s + (Number(l.amount) || 0), 0) * 100) / 100)
const scheduleMatches = computed(() => lines.value.length > 0 && Math.abs(scheduleTotal.value - props.balance.balanceDue) < 0.005 && lines.value.every((l) => Number(l.amount) > 0))

function money(v: number) {
  return formatPrice(v ?? 0, props.balance.currency)
}

async function run(action: () => Promise<PurchaseBalanceResponse>) {
  busy.value = true
  error.value = null
  try {
    emit('updated', await action())
    return true
  } catch (err: any) {
    error.value = err?.response?.data?.message || t('purchase.balance.errors.action')
    return false
  } finally {
    busy.value = false
  }
}

function review(paymentId: string, approve: boolean) {
  return run(() => purchaseApi.reviewBalanceTransfer(props.orderId, paymentId, approve, notes[paymentId]))
}

async function saveRecord() {
  const ok = await run(() =>
    purchaseApi.recordBalancePayment(props.orderId, { amount: record.amount, reference: record.reference.trim(), paidOn: record.paidOn || null, purpose: record.purpose })
  )
  if (ok) {
    Object.assign(record, { amount: 0, reference: '', paidOn: '', purpose: 'BALANCE' })
    panel.value = null
  }
}

function openSchedule() {
  lines.value = props.balance.instalments.map((i) => ({ label: i.label, amount: i.amount, dueDate: i.dueDate ?? '' }))
  panel.value = panel.value === 'schedule' ? null : 'schedule'
}

async function saveSchedule() {
  const ok = await run(() =>
    purchaseApi.setBalanceSchedule(
      props.orderId,
      lines.value.map((l) => ({ label: l.label.trim(), amount: Number(l.amount), dueDate: l.dueDate || null }))
    )
  )
  if (ok) panel.value = null
}

async function openSlip(paymentId: string) {
  try {
    await openProtectedFile(purchaseApi.balanceSlipPath(props.orderId, paymentId))
  } catch {
    error.value = t('documents.errors.openFailed')
  }
}
</script>
