<template>
  <div
    class="rounded-lg border p-4 text-sm"
    :class="dark ? 'border-white/15 bg-white/5 text-gray-200' : 'border-admin-line/15 bg-admin-field/5 text-admin-fg'"
    data-testid="etrade-card"
  >
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div>
        <p class="text-xs uppercase tracking-wide opacity-60">{{ $t('etrade.title') }}</p>
        <p class="text-base font-semibold" data-testid="etrade-business-name">
          {{ details.businessName || '—' }}
        </p>
        <p v-if="details.businessNameAmharic" class="opacity-80">{{ details.businessNameAmharic }}</p>
      </div>
      <span
        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
        :class="details.hasActiveLicense ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'"
        data-testid="etrade-license-summary"
      >
        {{ details.hasActiveLicense ? $t('etrade.activeLicense') : $t('etrade.noActiveLicense') }}
      </span>
    </div>

    <dl class="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
      <div class="flex gap-2"><dt class="opacity-60">{{ $t('etrade.tin') }}</dt><dd class="font-mono">{{ details.tin }}</dd></div>
      <div class="flex gap-2">
        <dt class="opacity-60">{{ $t('etrade.legalCondition') }}</dt>
        <dd>{{ legalConditionLabel }}</dd>
      </div>
      <div class="flex gap-2">
        <dt class="opacity-60">{{ $t('etrade.registrationNumber') }}</dt>
        <dd class="font-mono break-all" data-testid="etrade-reg-no">{{ details.registrationNumber || '—' }}</dd>
      </div>
      <div class="flex gap-2">
        <dt class="opacity-60">{{ $t('etrade.registrationDate') }}</dt>
        <dd>{{ formatDate(details.registrationDate, details.registrationDateRaw) }}</dd>
      </div>
      <div v-if="details.paidUpCapital != null" class="flex gap-2">
        <dt class="opacity-60">{{ $t('etrade.paidUpCapital') }}</dt>
        <dd>{{ formatCapital(details.paidUpCapital) }}</dd>
      </div>
      <div v-if="details.associates?.length" class="flex gap-2 sm:col-span-2">
        <dt class="opacity-60">{{ $t('etrade.managers') }}</dt>
        <dd>
          <span v-for="(a, i) in details.associates" :key="i">
            <span v-if="i > 0">, </span>{{ a.name || a.nameAmharic || '—' }}<span v-if="a.position" class="opacity-70"> ({{ a.position }})</span>
          </span>
        </dd>
      </div>
    </dl>

    <div v-if="checks" class="mt-3 flex flex-wrap gap-2" data-testid="etrade-checks">
      <span v-for="c in checkRows" :key="c.key" class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs" :class="checkClass(c.value)">
        <span aria-hidden="true">{{ c.value === true ? '✓' : c.value === false ? '✗' : '•' }}</span>
        {{ c.label }}<span v-if="c.value == null" class="opacity-70">: {{ $t('etrade.checkNotCompared') }}</span>
      </span>
    </div>

    <div v-if="details.businesses?.length" class="mt-4">
      <p class="mb-1 text-xs uppercase tracking-wide opacity-60">{{ $t('etrade.licenses') }}</p>
      <ul class="space-y-2">
        <li
          v-for="b in details.businesses"
          :key="b.id || b.licenseNumber"
          class="rounded-md border p-3"
          :class="dark ? 'border-white/10' : 'border-admin-line/10'"
          data-testid="etrade-license"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="font-medium">{{ b.tradeName || b.tradeNameAmharic || '—' }}</p>
            <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="statusClass(b.licenseStatus)">
              {{ $t(`etrade.status.${b.licenseStatus || 'UNKNOWN'}`) }}
            </span>
          </div>
          <p class="font-mono text-xs break-all">{{ b.licenseNumber || '—' }}</p>
          <p class="text-xs opacity-80">
            {{ $t('etrade.validity') }}:
            {{ formatDate(b.renewedFrom, b.renewedFromRaw) }} – {{ formatDate(b.renewedTo, b.renewedToRaw) }}
            <span v-if="b.dateRegistered || b.dateRegisteredRaw"> · {{ $t('etrade.registeredOn') }} {{ formatDate(b.dateRegistered, b.dateRegisteredRaw) }}</span>
          </p>
          <p v-if="b.sectors?.length" class="mt-1 text-xs opacity-80">
            {{ b.sectors.map((s) => [s.code, s.description].filter(Boolean).join(' ')).join('; ') }}
          </p>
        </li>
      </ul>
    </div>
    <p v-else class="mt-3 text-xs opacity-70">{{ $t('etrade.noLicenses') }}</p>

    <p class="mt-3 text-xs opacity-60">
      <a v-if="details.sourceUrl" :href="details.sourceUrl" target="_blank" rel="noopener" class="underline">{{ $t('etrade.openOnEtrade') }}</a>
      <span v-if="details.fetchedAt"> · {{ $t('etrade.fetchedAt') }} {{ formatDateTime(details.fetchedAt) }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { EtradeBusinessDetails, EtradeVerificationChecks } from '@/shared/api/etrade'

const props = withDefaults(
  defineProps<{
    details: EtradeBusinessDetails
    /** Match flags from the organization verification endpoint; omitted for a plain lookup. */
    checks?: EtradeVerificationChecks | null
    /** Dark glass styling (realtor dashboard) vs admin palette. */
    dark?: boolean
  }>(),
  { checks: null, dark: false }
)

const { t, locale } = useI18n()

const legalConditionLabel = computed(() => {
  const lc = props.details.legalCondition
  if (!lc) return '—'
  const name = locale.value === 'am' ? lc.nameAmharic || lc.name : lc.name || lc.nameAmharic
  return name ? `${name} (${lc.code})` : lc.code
})

const checkRows = computed(() => {
  const c = props.checks
  if (!c) return []
  return [
    { key: 'name', label: t('etrade.checkName'), value: c.nameMatches },
    { key: 'license', label: t('etrade.checkLicense'), value: c.licenseNumberMatches },
    { key: 'registration', label: t('etrade.checkRegistration'), value: c.registrationNumberMatches },
    { key: 'active', label: t('etrade.checkActive'), value: c.licenseActive }
  ]
})

function checkClass(v: boolean | null | undefined) {
  if (v === true) return 'border-green-500/40 bg-green-500/10 text-green-300'
  if (v === false) return 'border-red-500/40 bg-red-500/10 text-red-300'
  return 'border-white/15 bg-white/5 opacity-80'
}

function statusClass(s: string | null | undefined) {
  if (s === 'ACTIVE') return 'bg-green-500/20 text-green-300'
  if (s === 'EXPIRED') return 'bg-red-500/20 text-red-300'
  if (s === 'NOT_YET_VALID') return 'bg-blue-500/20 text-blue-300'
  return 'bg-gray-500/20 text-gray-300'
}

function formatDate(iso?: string | null, raw?: string | null) {
  if (iso) {
    const d = new Date(iso)
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }
  return raw || '—'
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString()
}

function formatCapital(v: number) {
  return `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB`
}
</script>
