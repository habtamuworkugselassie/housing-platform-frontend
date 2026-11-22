<template>
  <div class="min-h-screen bg-violet-950 py-10 px-4 text-white sm:px-6">
    <div class="absolute top-4 right-4 z-50"><LocaleSwitcher /></div>
    <div class="mx-auto max-w-2xl space-y-6">
      <div class="flex flex-col items-center text-center">
        <router-link :to="localized('/')" class="mb-5 hover:opacity-90"><img src="/images/branding/ethio-build-connect-banner.png" alt="Ethio Build Connect" class="h-9 w-auto object-contain" /></router-link>
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em]">{{ $t('reservation.eyebrow') }}</p>
        <h1 class="mb-2 text-2xl font-bold uppercase tracking-tight sm:text-3xl">{{ $t('reservation.statusTitle') }}</h1>
      </div>

      <div class="rounded-2xl border border-white/10 bg-white p-5 text-gray-900 shadow-2xl sm:p-8">
        <p v-if="loading" class="py-8 text-center text-sm text-gray-500">{{ $t('reservation.loadingPackages') }}</p>
        <div v-else-if="error" class="py-8 text-center space-y-3">
          <p class="text-red-600">{{ error }}</p>
          <p class="text-sm text-gray-600">{{ $t('reservation.statusHelp') }}</p>
        </div>
        <div v-else-if="s" class="space-y-5" data-testid="reservation-status">
          <div v-if="returned" class="rounded-xl p-4 text-center" :class="justPaid ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'" data-testid="return-banner">
            <p class="font-bold">{{ justPaid ? $t('reservation.paymentOk') : $t('reservation.paymentPending') }}</p>
          </div>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-2xl font-extrabold tracking-[0.1em] text-primary-900">{{ s.reference }}</p>
              <p class="font-semibold">{{ s.packageName }}</p>
              <p class="text-sm text-gray-600">{{ s.company }} · {{ s.contactName }}</p>
              <p v-if="s.boothCodes.length" class="text-sm font-semibold text-primary-800">{{ $t('booth.picked', { codes: s.boothCodes.join(', ') }) }}</p>
            </div>
            <span class="rounded-full px-3 py-1 text-xs font-bold" :class="statusCls">{{ $t(`admin.reservations.status.${s.status}`) }}</span>
          </div>

          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="rounded-xl bg-violet-50 p-3"><p class="text-[11px] uppercase tracking-wide text-primary-700">{{ $t('reservation.total') }}</p><p class="font-bold">{{ money(s.amount) }}</p></div>
            <div class="rounded-xl bg-green-50 p-3"><p class="text-[11px] uppercase tracking-wide text-green-700">{{ $t('reservation.paid') }}</p><p class="font-bold text-green-800">{{ money(s.amountPaid) }}</p></div>
            <div class="rounded-xl bg-gray-50 p-3"><p class="text-[11px] uppercase tracking-wide text-gray-600">{{ $t('reservation.outstanding') }}</p><p class="font-bold">{{ money(s.outstanding) }}</p></div>
          </div>

          <p v-if="s.paymentDueAt && s.outstanding > 0" class="rounded-xl px-4 py-2 text-sm font-semibold" :class="s.overdue ? 'bg-red-50 text-red-700' : 'bg-violet-50 text-primary-800'" data-testid="due-line">{{ s.overdue ? $t('reservation.overdueSince', { d: dateOnly(s.paymentDueAt) }) : $t('reservation.dueOn', { d: dateOnly(s.paymentDueAt) }) }}</p>
          <div v-if="s.checkoutAvailable" class="space-y-3 rounded-xl border border-gold-300 bg-gold-50 p-4" data-testid="pay-box">
            <p class="text-sm font-semibold text-gray-900">{{ s.depositPaid ? $t('reservation.payBalanceTitle', { amount: money(s.outstanding) }) : $t('reservation.payDepositTitle', { amount: money(s.depositAmount) }) }}</p>
            <p class="text-xs text-gray-600">{{ s.depositPaid ? $t('reservation.payBalanceBody') : $t('reservation.payDepositBody') }}</p>
            <p v-if="s.outstanding > s.onlineMax" class="text-xs font-medium text-amber-800" data-testid="online-cap-note">{{ $t('reservation.onlineCapNote', { max: money(s.onlineMax) }) }}</p>
            <div class="grid gap-2 sm:grid-cols-5" role="radiogroup">
              <button v-for="m in METHODS" :key="m" type="button" role="radio" :aria-checked="method === m" :class="['rounded-lg border px-2 py-2 text-xs font-semibold', method === m ? 'border-primary-600 bg-white ring-2 ring-primary-300' : 'border-gray-300 bg-white']" @click="method = m">{{ $t(`reservation.methods.${m}`) }}</button>
            </div>
            <p v-if="payError" class="text-sm text-red-600" role="alert">{{ payError }}</p>
            <div class="flex flex-wrap gap-2">
              <button v-if="!s.depositPaid" type="button" :disabled="paying" class="rounded-full bg-gold-400 px-5 py-3 text-sm font-bold text-primary-950 hover:bg-gold-500 disabled:opacity-50" data-testid="pay-deposit" @click="pay('DEPOSIT')">{{ paying ? $t('reservation.redirecting') : $t('reservation.payDepositCtaAmount', { amount: money(s.depositAmount) }) }}</button>
              <button type="button" :disabled="paying" class="rounded-full border border-primary-600 bg-white px-5 py-3 text-sm font-bold text-primary-800 hover:bg-violet-50 disabled:opacity-50" data-testid="pay-balance" @click="pay('BALANCE')">{{ paying ? $t('reservation.redirecting') : $t('reservation.payFullCta', { amount: money(s.nextOnlineAmount) }) }}</button>
            </div>
            <p class="text-[11px] text-gray-500">{{ $t('reservation.chapaNote') }}</p>
          </div>
          <p v-else-if="s.status === 'PAID'" class="rounded-xl bg-green-50 p-4 text-center text-sm font-semibold text-green-800">{{ $t('reservation.allPaid') }}</p>

          <div v-if="s.payments.length" class="rounded-xl border border-gray-200 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-primary-700">{{ $t('reservation.paymentsTitle') }}</p>
            <ul class="mt-2 divide-y divide-gray-100 text-sm">
              <li v-for="p in s.payments" :key="p.txRef" class="flex items-center justify-between gap-3 py-2">
                <span>{{ $t(`reservation.purpose.${p.purpose}`) }} · {{ money(p.amount) }} {{ p.currency }}<span class="block text-xs text-gray-500">{{ p.txRef }}<span v-if="p.paidAt"> · {{ formatDate(p.paidAt) }}</span></span></span>
                <span class="flex items-center gap-2">
                  <a v-if="p.status === 'PENDING' && p.checkoutUrl" :href="p.checkoutUrl" class="text-xs font-semibold text-primary-700 underline">{{ $t('reservation.resume') }}</a>
                  <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="p.status === 'PAID' ? 'bg-green-100 text-green-800' : p.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'">{{ $t(`reservation.payStatus.${p.status}`) }}</span>
                </span>
              </li>
            </ul>
          </div>

          <div class="rounded-xl border border-gray-200 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-primary-700">{{ $t('reservation.payTo', { payee: s.payee }) }}</p>
            <ul class="mt-2 divide-y divide-gray-100 text-sm">
              <li v-for="a in s.bankAccounts" :key="a.number" class="flex justify-between gap-3 py-1.5"><span class="text-gray-700">{{ a.bank }}</span><span class="font-mono font-semibold">{{ a.number }}</span></li>
            </ul>
            <p class="mt-2 text-xs text-gray-500">{{ $t('reservation.payNote') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import LocaleSwitcher from '@/shared/components/LocaleSwitcher.vue'
import { reservationApi, RESERVATION_PAYMENT_METHODS } from '@/features/reservation/api/reservation.api'
import { localePrefix } from '@/i18n/localeRoutes'

const { t, locale } = useI18n()
const route = useRoute()
const METHODS = RESERVATION_PAYMENT_METHODS
const s = ref(null)
const loading = ref(true)
const error = ref('')
const paying = ref(false)
const payError = ref('')
const method = ref('TELEBIRR')
const returned = computed(() => route.query.return === '1')
const justPaid = computed(() => !!s.value && (s.value.status === 'DEPOSIT_PAID' || s.value.status === 'PAID'))
const statusCls = computed(() => {
  const st = s.value?.status
  if (st === 'PAID') return 'bg-green-100 text-green-800'
  if (st === 'DEPOSIT_PAID' || st === 'SIGNED') return 'bg-blue-100 text-blue-800'
  if (st === 'CANCELLED') return 'bg-gray-100 text-gray-600'
  return 'bg-gold-100 text-primary-900'
})

function dateOnly(v) {
  try {
    return new Date(v).toLocaleDateString(String(locale.value || 'en').toLowerCase().startsWith('am') ? 'am-ET' : 'en-GB', { dateStyle: 'medium' })
  } catch {
    return String(v).slice(0, 10)
  }
}
function localized(path) {
  return `${localePrefix(String(locale.value || 'en').toLowerCase().startsWith('am') ? 'am' : 'en')}${path}`
}
function money(v) {
  const n = Number(v)
  return Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}
function formatDate(v) {
  try { return new Date(v).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return String(v) }
}
async function load(refresh) {
  loading.value = true
  error.value = ''
  try {
    s.value = await reservationApi.status(String(route.params.reference || ''), String(route.query.email || ''), refresh)
  } catch (e) {
    error.value = e?.response?.status === 404 ? t('reservation.notFound') : t('reservation.errors.generic')
  } finally {
    loading.value = false
  }
}
async function pay(purpose) {
  payError.value = ''
  paying.value = true
  try {
    const c = await reservationApi.checkout(s.value.reference, String(route.query.email || ''), purpose, method.value)
    if (c.checkoutUrl) window.location.assign(c.checkoutUrl)
    else payError.value = t('reservation.errors.generic')
  } catch (e) {
    payError.value = e?.response?.data?.message || t('reservation.errors.generic')
  } finally {
    paying.value = false
  }
}
onMounted(() => load(returned.value))
</script>
