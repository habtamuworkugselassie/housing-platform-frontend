<template>
  <section v-if="balance" class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" data-testid="balance-card">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-gray-900">{{ $t('purchase.balance.title') }}</h2>
        <p class="text-sm text-gray-500">{{ $t('purchase.balance.subtitle') }}</p>
      </div>
      <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="balance.fullyPaid ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'">
        {{ balance.fullyPaid ? $t('purchase.balance.paidInFull') : $t('purchase.balance.open') }}
      </span>
    </div>

    <!-- Summary -->
    <dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
      <dt class="text-gray-500">{{ $t('purchase.balance.price') }}</dt><dd class="text-right text-gray-900">{{ money(balance.listedPrice) }}</dd>
      <template v-if="balance.depositCredit > 0"><dt class="text-gray-500">{{ $t('purchase.balance.depositCredit') }}</dt><dd class="text-right text-gray-900">− {{ money(balance.depositCredit) }}</dd></template>
      <template v-if="balance.loanAmount > 0"><dt class="text-gray-500">{{ $t('purchase.balance.loan') }}</dt><dd class="text-right text-gray-900">− {{ money(balance.loanAmount) }}</dd></template>
      <dt class="font-semibold text-gray-900">{{ $t('purchase.balance.due') }}</dt><dd class="text-right font-semibold text-gray-900" data-testid="balance-due">{{ money(balance.balanceDue) }}</dd>
      <dt class="text-gray-500">{{ $t('purchase.balance.paid') }}</dt><dd class="text-right text-green-700">{{ money(balance.paid) }}</dd>
      <template v-if="balance.inProgress > 0"><dt class="text-gray-500">{{ $t('purchase.balance.inProgress') }}</dt><dd class="text-right text-amber-700">{{ money(balance.inProgress) }}</dd></template>
      <dt class="font-semibold text-gray-900">{{ $t('purchase.balance.remaining') }}</dt><dd class="text-right text-lg font-bold text-gray-900" data-testid="balance-remaining">{{ money(balance.remaining) }}</dd>
    </dl>
    <div class="mt-2 h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100">
      <div class="h-full rounded-full bg-green-500 transition-all" :style="{ width: `${percent}%` }" />
    </div>

    <!-- The provider's service fee: markup + VAT on price and markup, paid separately -->
    <div v-if="balance.fees" class="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm" data-testid="fees-summary">
      <div class="flex items-center justify-between">
        <p class="font-semibold text-gray-900">{{ $t('purchase.fees.title') }}</p>
        <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="balance.fees.fullyPaid ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'">{{ balance.fees.fullyPaid ? $t('purchase.balance.paidInFull') : $t('purchase.balance.open') }}</span>
      </div>
      <dl class="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
        <dt class="text-gray-500">{{ $t('purchase.fees.markup', { percent: balance.fees.markupPercent }) }}</dt><dd class="text-right">{{ money(balance.fees.markupAmount) }}</dd>
        <dt class="text-gray-500">{{ $t('purchase.fees.vat', { rate: balance.fees.vatRate }) }}</dt><dd class="text-right">{{ money(balance.fees.vatAmount) }}</dd>
        <dt class="font-semibold text-gray-900">{{ $t('purchase.fees.total') }}</dt><dd class="text-right font-semibold" data-testid="fees-total">{{ money(balance.fees.total) }}</dd>
        <template v-if="balance.fees.paid > 0"><dt class="text-gray-500">{{ $t('purchase.balance.paid') }}</dt><dd class="text-right text-green-700">{{ money(balance.fees.paid) }}</dd></template>
        <template v-if="!balance.fees.fullyPaid"><dt class="text-gray-500">{{ $t('purchase.balance.remaining') }}</dt><dd class="text-right font-semibold">{{ money(balance.fees.remaining) }}</dd></template>
      </dl>
    </div>

    <!-- Schedule -->
    <h3 class="mt-5 text-sm font-semibold text-gray-900">{{ $t('purchase.balance.schedule') }}</h3>
    <ul class="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200 text-sm">
      <li v-for="i in balance.instalments" :key="i.sequence" class="flex items-center gap-3 px-3 py-2">
        <span class="min-w-0 flex-1">
          <span class="block font-medium text-gray-900">{{ i.label }}</span>
          <span class="block text-xs" :class="i.overdue ? 'text-red-600' : 'text-gray-500'">{{ i.dueDate ? $t('purchase.balance.dueOn', { date: formatDay(i.dueDate) }) : $t('purchase.balance.noDueDate') }}</span>
        </span>
        <span class="text-right">
          <span class="block font-semibold text-gray-900">{{ money(i.amount) }}</span>
          <span class="block text-xs" :class="i.paid ? 'text-green-700' : i.overdue ? 'text-red-600' : 'text-gray-500'">{{ i.paid ? $t('purchase.balance.linePaid') : i.covered > 0 ? $t('purchase.balance.linePartly', { amount: money(i.covered) }) : i.overdue ? $t('purchase.balance.lineOverdue') : $t('purchase.balance.lineDue') }}</span>
        </span>
      </li>
    </ul>

    <div v-if="outcome" class="mt-3 rounded-xl p-3 text-sm" :class="outcome === 'paid' ? 'bg-green-50 text-green-800' : outcome === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'" role="status">{{ $t(`purchase.balance.outcome.${outcome}`) }}</div>
    <p v-if="error" class="mt-3 text-xs text-red-600" role="alert">{{ error }}</p>

    <!-- Buyer: pay -->
    <div v-if="isBuyer && balance.payable && anyRoom" class="mt-5 space-y-3" data-testid="balance-pay">
      <!-- What to pay: the service fee first, then the balance -->
      <div v-if="balance.fees && feesRoom > 0 && balanceRoom > 0" class="grid grid-cols-2 gap-2" role="radiogroup" :aria-label="$t('purchase.fees.whatToPay')">
        <button v-for="p in (['FEES', 'BALANCE'] as const)" :key="p" type="button" role="radio" :aria-checked="purpose === p" class="rounded-xl border px-3 py-2 text-left text-sm" :class="purpose === p ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-300' : 'border-gray-200'" :data-testid="`purpose-${p}`" @click="setPurpose(p)">
          <span class="block font-semibold text-gray-900">{{ $t(`purchase.fees.purpose.${p}`) }}</span>
          <span class="block text-xs text-gray-500">{{ money(p === 'FEES' ? feesRoom : balanceRoom) }}</span>
        </button>
      </div>
      <div class="grid grid-cols-2 gap-2" role="tablist">
        <button v-for="tab in (['online', 'transfer'] as const)" :key="tab" type="button" role="tab" :aria-selected="payTab === tab" class="rounded-xl border px-3 py-2 text-sm font-semibold" :class="payTab === tab ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-gray-200 text-gray-700'" :data-testid="`balance-tab-${tab}`" @click="payTab = tab">
          {{ $t(`purchase.balance.tabs.${tab}`) }}
        </button>
      </div>

      <div class="space-y-1">
        <label :for="`${uid}-amount`" class="block text-xs font-medium text-gray-700">{{ $t('purchase.balance.amount') }}</label>
        <div class="flex items-center gap-2">
          <input :id="`${uid}-amount`" v-model.number="amount" type="number" inputmode="decimal" min="1" :max="room" step="0.01" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" data-testid="balance-amount" />
          <span class="text-sm text-gray-500">{{ balance.currency }}</span>
        </div>
        <p class="text-[11px] text-gray-500">{{ $t('purchase.balance.amountHelp', { max: money(room) }) }}</p>
      </div>

      <template v-if="payTab === 'online'">
        <p v-if="!balance.checkoutAvailable" class="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">{{ $t('purchase.payment.unavailable') }}</p>
        <template v-else>
          <DepositMethodPicker v-model="method" :methods="balance.paymentMethods" name="balance-method" :disabled="busy" />
          <p class="text-[11px] text-gray-500">{{ $t('purchase.balance.limitsNote') }}</p>
          <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60" :disabled="busy || !validAmount || !method" data-testid="balance-pay-online" @click="payOnline">
            {{ $t('purchase.balance.payOnline', { amount: validAmount ? money(amount) : '' }) }}
          </button>
        </template>
      </template>

      <template v-else>
        <div v-if="balance.bankAccount" class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm" data-testid="bank-account">
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">{{ $t('purchase.balance.transferTo') }}</p>
          <p class="mt-1 font-semibold text-gray-900">{{ balance.bankAccount.bankName }}<span v-if="balance.bankAccount.branch" class="font-normal text-gray-600"> · {{ balance.bankAccount.branch }}</span></p>
          <p class="text-gray-800">{{ balance.bankAccount.accountName }}</p>
          <p class="font-mono text-gray-900">{{ balance.bankAccount.accountNumber }}</p>
          <p class="mt-2 text-xs text-gray-600">{{ $t('purchase.balance.quoteReference') }} <strong class="font-mono">{{ transferReference }}</strong></p>
        </div>
        <p v-else class="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{{ $t('purchase.balance.noBankAccount') }}</p>
        <div class="grid gap-2 sm:grid-cols-2">
          <label class="text-xs font-medium text-gray-700">{{ $t('purchase.balance.bankReference') }}
            <input v-model="transfer.reference" type="text" maxlength="255" class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" data-testid="transfer-reference" />
          </label>
          <label class="text-xs font-medium text-gray-700">{{ $t('purchase.balance.paidOn') }}
            <input v-model="transfer.paidOn" type="date" class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
          </label>
        </div>
        <label class="block text-xs font-medium text-gray-700">{{ $t('purchase.balance.receipt') }}
          <input type="file" accept="application/pdf,image/jpeg,image/png" class="mt-1 block w-full text-xs" data-testid="transfer-slip" @change="onSlip" />
        </label>
        <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60" :disabled="busy || !validAmount || !transfer.reference.trim() || !transfer.slip" data-testid="transfer-submit" @click="reportTransfer">
          {{ $t('purchase.balance.sendTransfer') }}
        </button>
      </template>
    </div>
    <p v-else-if="isBuyer && !balance.payable && !balance.fullyPaid" class="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">{{ $t('purchase.balance.notYetPayable') }}</p>

    <!-- Seller (or admin) tools -->
    <BalanceSellerTools v-if="isSeller" class="mt-5" :order-id="orderId" :balance="balance" @updated="balance = $event" />

    <!-- History -->
    <template v-if="balance.payments.length">
      <h3 class="mt-5 text-sm font-semibold text-gray-900">{{ $t('purchase.balance.history') }}</h3>
      <ul class="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200 text-sm">
        <li v-for="p in [...balance.payments].reverse()" :key="p.id" class="flex flex-wrap items-center gap-2 px-3 py-2" :data-testid="`balance-payment-${p.id}`">
          <span class="min-w-0 flex-1">
            <span class="block font-medium text-gray-900">{{ money(p.amount) }}<span v-if="p.purpose === 'FEES'"> · {{ $t('purchase.fees.purpose.FEES') }}</span> · {{ $t(`purchase.balance.channel.${p.channel}`) }}<span v-if="p.paymentMethod || p.preferredMethod"> · {{ p.paymentMethod || $t(`purchase.payment.methods.${p.preferredMethod}.label`) }}</span></span>
            <span class="block text-xs text-gray-500">{{ [p.reference, p.paidOn ? formatDay(p.paidOn) : null, formatDay(p.createdAt)].filter(Boolean).join(' · ') }}</span>
            <span v-if="p.note && (p.status === 'REJECTED' || p.status === 'FAILED')" class="block text-xs text-red-600">{{ p.note }}</span>
          </span>
          <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="STATUS_CLASS[p.status]">{{ $t(`purchase.balance.status.${p.status}`) }}</span>
          <a v-if="isBuyer && p.status === 'PENDING' && p.checkoutUrl" :href="p.checkoutUrl" class="text-xs font-semibold text-primary-700 hover:underline">{{ $t('purchase.deposit.resume') }}</a>
          <button v-if="p.hasSlip" type="button" class="text-xs font-semibold text-primary-700 hover:underline" @click="openSlip(p.id)">{{ $t('purchase.balance.viewReceipt') }}</button>
        </li>
      </ul>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { formatPrice } from '@/shared/utils'
import { openProtectedFile } from '@/shared/api/protectedFile'
import { purchaseApi } from '../api/purchase.api'
import type { BalancePurpose, DepositPaymentMethod, PurchaseBalanceResponse } from '../api/purchase.types'
import DepositMethodPicker from './DepositMethodPicker.vue'
import BalanceSellerTools from './BalanceSellerTools.vue'

/**
 * The balance of an order (price − deposit − loan), paid to the provider after the seller accepts:
 * online through Chapa in as many parts as wallet or card limits need, or by bank transfer with a
 * receipt the seller or an admin confirms. Sellers also manage the schedule here.
 */
const props = withDefaults(
  defineProps<{ orderId: string; isBuyer?: boolean; isSeller?: boolean; navigate?: (url: string) => void }>(),
  { isBuyer: false, isSeller: false, navigate: (url: string) => window.location.assign(url) }
)
const emit = defineEmits<{ changed: [balance: PurchaseBalanceResponse] }>()
const { t } = useI18n()
const route = useRoute()

const STATUS_CLASS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  SUBMITTED: 'bg-amber-100 text-amber-800',
  PAID: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-200 text-gray-700',
  REFUND_PENDING: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-200 text-gray-700'
}

const uid = `bal-${Math.random().toString(36).slice(2, 8)}`
const balance = ref<PurchaseBalanceResponse | null>(null)
const busy = ref(false)
const error = ref<string | null>(null)
const outcome = ref<'paid' | 'failed' | 'pending' | null>(null)
const payTab = ref<'online' | 'transfer'>('online')
const amount = ref<number | null>(null)
const method = ref<DepositPaymentMethod | null>(null)
const transfer = reactive({ reference: '', paidOn: '', slip: null as File | null })

/** What can still be paid now: remaining minus payments waiting for Chapa or a confirmation. */
const balanceRoom = computed(() => (balance.value ? Math.max(0, round2(balance.value.remaining - balance.value.inProgress)) : 0))
const feesRoom = computed(() => {
  const f = balance.value?.fees
  return f ? Math.max(0, round2(f.remaining - f.inProgress)) : 0
})
const anyRoom = computed(() => balanceRoom.value > 0 || feesRoom.value > 0)
/** The service fee comes first while it is open. */
const purpose = ref<BalancePurpose>('BALANCE')
const room = computed(() => (purpose.value === 'FEES' ? feesRoom.value : balanceRoom.value))
const transferReference = computed(() => {
  const ref = balance.value?.transferReference ?? ''
  return purpose.value === 'FEES' ? ref.replace(/-BAL$/, '-FEE') : ref
})
const validAmount = computed(() => amount.value != null && amount.value > 0 && amount.value <= room.value + 1e-9)
const percent = computed(() => {
  const b = balance.value
  if (!b || b.balanceDue <= 0) return 100
  return Math.min(100, Math.round((b.paid / b.balanceDue) * 100))
})

function round2(n: number) {
  return Math.round(n * 100) / 100
}
function money(value: number | null | undefined) {
  return formatPrice(value ?? 0, balance.value?.currency ?? 'ETB')
}
function formatDay(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return value
  }
}

/** Default to the uncovered part of the next instalment, within what can be paid now. */
function defaultAmount(b: PurchaseBalanceResponse) {
  if (purpose.value === 'FEES') return feesRoom.value
  const next = b.instalments.find((i) => !i.paid)
  const suggested = next ? next.amount - next.covered : b.remaining
  return round2(Math.min(Math.max(0, b.remaining - b.inProgress), suggested))
}

function setPurpose(p: BalancePurpose) {
  purpose.value = p
  if (balance.value) amount.value = defaultAmount(balance.value) || null
}

function set(b: PurchaseBalanceResponse) {
  const first = balance.value == null
  balance.value = b
  // Open with the service fee while it is due; afterwards keep the buyer's choice when possible.
  if (first && b.fees && feesRoom.value > 0) purpose.value = 'FEES'
  if (purpose.value === 'FEES' && feesRoom.value <= 0) purpose.value = 'BALANCE'
  if (purpose.value === 'BALANCE' && balanceRoom.value <= 0 && feesRoom.value > 0) purpose.value = 'FEES'
  if (first || amount.value == null || amount.value > room.value) amount.value = defaultAmount(b) || null
  if (!method.value && b.paymentMethods.length === 1) method.value = b.paymentMethods[0]
  emit('changed', b)
}

async function load() {
  error.value = null
  try {
    set(await purchaseApi.getBalance(props.orderId))
  } catch (err: any) {
    // 404/400 before acceptance or for orders without a balance: just hide the card.
    if (err?.response?.status && err.response.status >= 500) error.value = t('purchase.balance.errors.load')
  }
}

async function run(action: () => Promise<PurchaseBalanceResponse | void>) {
  busy.value = true
  error.value = null
  try {
    const b = await action()
    if (b) set(b)
  } catch (err: any) {
    error.value = err?.response?.data?.message || t('purchase.balance.errors.action')
  } finally {
    busy.value = false
  }
}

function payOnline() {
  return run(async () => {
    const checkout = await purchaseApi.payBalanceOnline(props.orderId, round2(amount.value!), method.value, purpose.value)
    props.navigate(checkout.checkoutUrl)
  })
}

function onSlip(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] ?? null
  if (f && f.size > 10 * 1024 * 1024) {
    error.value = t('purchase.balance.errors.slipTooLarge')
    transfer.slip = null
    return
  }
  transfer.slip = f
}

function reportTransfer() {
  return run(async () => {
    const b = await purchaseApi.reportBalanceTransfer(props.orderId, {
      amount: round2(amount.value!),
      reference: transfer.reference.trim(),
      paidOn: transfer.paidOn || undefined,
      slip: transfer.slip!,
      purpose: purpose.value
    })
    Object.assign(transfer, { reference: '', paidOn: '', slip: null })
    return b
  })
}

async function openSlip(paymentId: string) {
  try {
    await openProtectedFile(purchaseApi.balanceSlipPath(props.orderId, paymentId))
  } catch {
    error.value = t('documents.errors.openFailed')
  }
}

onMounted(async () => {
  // Back from Chapa: settle the pending online payments first.
  if (route?.query?.balance === 'return' && props.isBuyer) {
    await run(async () => {
      const b = await purchaseApi.confirmBalance(props.orderId)
      const last = [...b.payments].reverse().find((p) => p.channel === 'ONLINE')
      outcome.value = last?.status === 'PAID' ? 'paid' : last?.status === 'FAILED' ? 'failed' : 'pending'
      return b
    })
    return
  }
  await load()
})
watch(() => props.orderId, load)
defineExpose({ reload: load })
</script>
