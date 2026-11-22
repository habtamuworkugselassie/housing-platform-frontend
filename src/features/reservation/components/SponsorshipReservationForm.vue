<template>
  <div>
    <div v-if="confirmation" class="space-y-4" data-testid="reservation-confirmed">
      <div class="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
        <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <p class="text-lg font-bold text-gray-900">{{ $t('reservation.doneTitle') }}</p>
        <p class="mt-1 text-sm text-gray-600">{{ $t('reservation.doneBody', { email: confirmation.email }) }}</p>
        <p class="mt-3 text-2xl font-extrabold tracking-[0.1em] text-primary-900" data-testid="reservation-reference">{{ confirmation.reference }}</p>
        <p class="text-sm text-gray-700">{{ confirmation.packageName }} · {{ money(confirmation.amount) }} {{ confirmation.currency }}</p>
        <p v-if="confirmation.boothCodes && confirmation.boothCodes.length" class="mt-1 text-sm font-semibold text-primary-800" data-testid="held-booths">{{ $t('booth.heldFor', { codes: confirmation.boothCodes.join(', '), days: holdDays }) }}</p>
      </div>
      <div v-if="confirmation.checkoutAvailable && confirmation.depositAmount" class="rounded-xl border border-gold-300 bg-gold-50 p-4 text-center" data-testid="pay-deposit-box">
        <p class="text-sm font-semibold text-gray-900">{{ $t('reservation.payDepositTitle', { amount: money(confirmation.depositAmount) }) }}</p>
        <p class="mt-1 text-xs text-gray-600">{{ $t('reservation.payDepositBodyShort') }}</p>
        <a :href="statusPath" class="mt-3 inline-block rounded-full bg-gold-400 px-6 py-3 text-sm font-bold text-primary-950 hover:bg-gold-500" data-testid="pay-deposit-link">{{ $t('reservation.payDepositCta') }}</a>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-primary-700">{{ $t('reservation.payTo', { payee: confirmation.payee }) }}</p>
        <ul class="mt-2 divide-y divide-gray-100 text-sm">
          <li v-for="a in confirmation.bankAccounts" :key="a.number" class="flex justify-between gap-3 py-1.5"><span class="text-gray-700">{{ a.bank }}</span><span class="font-mono font-semibold text-gray-900">{{ a.number }}</span></li>
        </ul>
        <p class="mt-2 text-xs text-gray-500">{{ $t('reservation.payNote') }}</p>
      </div>
      <button type="button" class="w-full rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700" @click="$emit('done')">{{ $t('reservation.close') }}</button>
    </div>

    <form v-else class="min-w-0 space-y-4 overflow-x-hidden" novalidate data-testid="reservation-form" @submit.prevent="submit">
      <div v-if="pkg" class="rounded-xl border border-primary-100 bg-violet-50 px-4 py-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-primary-700">{{ $t('reservation.selected') }}</p>
        <p class="text-base font-bold text-gray-900">{{ pkg.name }}</p>
        <p class="text-sm text-gray-700">{{ money(pkg.basePrice) }} ETB <span class="text-gray-500">· {{ $t('reservation.exclVat') }}</span></p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label :for="`${uid}-company`" class="mb-1 block text-sm font-medium text-gray-700">{{ $t('reservation.company') }}</label>
          <input :id="`${uid}-company`" v-model.trim="form.company" type="text" autocomplete="organization" required maxlength="200" :class="inputCls(errors.company)" />
          <p v-if="errors.company" class="mt-1 text-xs text-red-600">{{ errors.company }}</p>
        </div>
        <div>
          <label :for="`${uid}-contact`" class="mb-1 block text-sm font-medium text-gray-700">{{ $t('reservation.contactName') }}</label>
          <input :id="`${uid}-contact`" v-model.trim="form.contactName" type="text" autocomplete="name" required maxlength="200" :class="inputCls(errors.contactName)" />
          <p v-if="errors.contactName" class="mt-1 text-xs text-red-600">{{ errors.contactName }}</p>
        </div>
        <div>
          <label :for="`${uid}-email`" class="mb-1 block text-sm font-medium text-gray-700">{{ $t('reservation.email') }}</label>
          <input :id="`${uid}-email`" v-model.trim="form.email" type="email" autocomplete="email" required maxlength="255" :class="inputCls(errors.email)" />
          <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
        </div>
        <div>
          <label :for="`${uid}-phone`" class="mb-1 block text-sm font-medium text-gray-700">{{ $t('reservation.phone') }}</label>
          <input :id="`${uid}-phone`" v-model.trim="form.phone" type="tel" autocomplete="tel" maxlength="50" placeholder="+251 9…" :class="inputCls(false)" />
        </div>
        <div>
          <label :for="`${uid}-tin`" class="mb-1 block text-sm font-medium text-gray-700">{{ $t('reservation.tin') }}</label>
          <input :id="`${uid}-tin`" v-model.trim="form.tin" type="text" maxlength="40" :class="inputCls(false)" />
        </div>
        <div v-if="pkg && boothsIncluded > 0" class="min-w-0 overflow-hidden sm:col-span-2">
          <p class="mb-1 text-sm font-medium text-gray-700">{{ $t('booth.pick', { n: boothsIncluded }) }} <span class="font-normal text-gray-500">{{ $t('booth.pickOptional') }}</span></p>
          <p v-if="map" class="mb-2 text-xs text-gray-500">{{ $t('booth.availableCount', { n: map.counts.AVAILABLE || 0, total: map.counts.TOTAL || 0 }) }}</p>
          <p class="mb-2 text-xs text-gray-500">{{ $t('booth.eligibleTypes', { types: allowedTypes.map((t) => $t(`booth.type.${t}`)).join(', ') }) }}</p>
          <BoothMap v-if="map" v-model:selected="selectedBooths" :booths="map.booths" selectable :max-select="boothsIncluded" :allowed-types="allowedTypes" />
          <p v-else class="text-xs text-gray-500">{{ $t('booth.loading') }}</p>
          <p v-if="selectedBooths.length" class="mt-2 text-sm font-semibold text-primary-800" data-testid="picked-booths">{{ $t('booth.picked', { codes: selectedBooths.join(', ') }) }}</p>
        </div>
        <div class="sm:col-span-2">
          <label :for="`${uid}-booth`" class="mb-1 block text-sm font-medium text-gray-700">{{ $t('reservation.booth') }}</label>
          <input :id="`${uid}-booth`" v-model.trim="form.boothPreference" type="text" maxlength="200" :placeholder="$t('reservation.boothPlaceholder')" :class="inputCls(false)" />
        </div>
        <div class="sm:col-span-2">
          <label :for="`${uid}-message`" class="mb-1 block text-sm font-medium text-gray-700">{{ $t('reservation.message') }}</label>
          <textarea :id="`${uid}-message`" v-model.trim="form.message" rows="2" maxlength="4000" :class="inputCls(false)"></textarea>
        </div>
      </div>
      <div class="hidden" aria-hidden="true"><label>Website <input v-model="form.website" type="text" tabindex="-1" autocomplete="off" /></label></div>
      <p v-if="submitError" class="text-sm text-red-600" role="alert">{{ submitError }}</p>
      <button type="submit" :disabled="submitting || !pkg" class="w-full rounded-full bg-gold-400 px-6 py-3.5 text-sm font-bold text-primary-950 shadow-sm transition-colors hover:bg-gold-500 disabled:opacity-50" data-testid="reservation-submit">
        {{ submitting ? $t('reservation.submitting') : $t('reservation.submit') }}
      </button>
      <p class="text-center text-xs text-gray-500">{{ $t('reservation.fineprint') }}</p>
    </form>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BoothMap from './BoothMap.vue'
import { reservationApi, boothsForPackage, boothTypesForPackage } from '@/features/reservation/api/reservation.api'
import { trackEvent } from '@/utils/analytics'

const props = defineProps({
  /** The chosen package: { id, name, basePrice, type }. */
  pkg: { type: Object, default: null },
  source: { type: String, default: 'web' }
})
const emit = defineEmits(['done', 'reserved'])

const { t, locale } = useI18n()
const uid = `rsv-${Math.random().toString(36).slice(2, 8)}`
const form = reactive({ company: '', contactName: '', email: '', phone: '', tin: '', boothPreference: '', message: '', website: '' })
const errors = reactive({ company: '', contactName: '', email: '' })
const submitting = ref(false)
const submitError = ref('')
const confirmation = ref(null)
const statusPath = computed(() => {
  if (!confirmation.value) return '#'
  const am = String(locale.value || 'en').toLowerCase().startsWith('am')
  return `${am ? '/am' : ''}/reserve/${encodeURIComponent(confirmation.value.reference)}?email=${encodeURIComponent(confirmation.value.email)}`
})
const map = ref(null)
const selectedBooths = ref([])
const boothsIncluded = computed(() => boothsForPackage(props.pkg?.type))
const allowedTypes = computed(() => boothTypesForPackage(props.pkg?.type))
const holdDays = computed(() => map.value?.holdBusinessDays || 10)

watch(() => props.pkg?.id, () => { selectedBooths.value = [] })
onMounted(async () => {
  try {
    map.value = await reservationApi.boothMap()
  } catch {
    map.value = null
  }
})

function inputCls(invalid) {
  return [
    'w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400',
    invalid ? 'border-red-400' : 'border-gray-300'
  ]
}
function money(v) {
  const n = Number(v)
  return Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}
function validate() {
  errors.company = form.company ? '' : t('reservation.errors.company')
  errors.contactName = form.contactName ? '' : t('reservation.errors.contactName')
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : t('reservation.errors.email')
  return !errors.company && !errors.contactName && !errors.email
}
async function submit() {
  submitError.value = ''
  if (!props.pkg?.id) {
    submitError.value = t('reservation.errors.package')
    return
  }
  if (!validate()) return
  submitting.value = true
  try {
    confirmation.value = await reservationApi.reserve({
      sponsorshipId: props.pkg.id,
      company: form.company,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone || undefined,
      tin: form.tin || undefined,
      boothPreference: form.boothPreference || undefined,
      boothCodes: selectedBooths.value.length ? [...selectedBooths.value] : undefined,
      message: form.message || undefined,
      locale: String(locale.value || 'en').toLowerCase().startsWith('am') ? 'am' : 'en',
      source: props.source,
      website: form.website || undefined
    })
    trackEvent('package_reservation', { package_type: props.pkg.type || '' })
    emit('reserved', confirmation.value)
  } catch (e) {
    const status = e?.response?.status
    submitError.value = status === 429 ? t('reservation.errors.tooMany') : e?.response?.data?.message || t('reservation.errors.generic')
  } finally {
    submitting.value = false
  }
}
</script>
