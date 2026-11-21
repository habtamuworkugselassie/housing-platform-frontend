<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-admin-fg">{{ $t('admin.reservations.title') }}</h1>
          <p class="mt-2 max-w-3xl text-sm text-admin-subtle">{{ $t('admin.reservations.subtitle') }}</p>
        </div>
        <a :href="reserveLink" target="_blank" rel="noopener" class="rounded-lg border border-admin-line/20 px-3 py-2 text-xs font-semibold text-admin-muted hover:bg-admin-sunken/60">{{ $t('admin.reservations.openForm') }}</a>
      </div>

      <div v-if="pipeline" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="pipeline">
        <div class="rounded-lg border border-admin-line/10 bg-admin-surface p-4">
          <p class="text-xs uppercase tracking-wide text-admin-subtle">{{ $t('admin.reservations.openPipeline') }}</p>
          <p class="mt-1 text-2xl font-bold text-admin-fg">{{ money(pipeline.openValue) }} <span class="text-sm font-normal text-admin-subtle">ETB</span></p>
          <p class="mt-1 text-xs text-admin-subtle">{{ $t('admin.reservations.openCount', { n: pipeline.openCount }) }}</p>
        </div>
        <div class="rounded-lg border border-admin-line/10 bg-admin-surface p-4">
          <p class="text-xs uppercase tracking-wide text-admin-subtle">{{ $t('admin.reservations.collected') }}</p>
          <p class="mt-1 text-2xl font-bold text-emerald-700">{{ money(pipeline.paidValue) }} <span class="text-sm font-normal text-admin-subtle">ETB</span></p>
          <p class="mt-1 text-xs text-admin-subtle">{{ $t('admin.reservations.paidCount', { n: pipeline.byStatus.PAID?.count || 0 }) }}</p>
        </div>
        <div class="rounded-lg border border-admin-line/10 bg-admin-surface p-4 lg:col-span-2">
          <p class="text-xs uppercase tracking-wide text-admin-subtle">{{ $t('admin.reservations.byStage') }}</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button v-for="s in STATUSES" :key="s" type="button" :class="['rounded-full px-3 py-1 text-xs font-semibold', statusFilter === s ? 'bg-admin-nav text-white' : statusCls(s)]" @click="setStatus(s)">
              {{ $t(`admin.reservations.status.${s}`) }} · {{ pipeline.byStatus[s]?.count || 0 }}
            </button>
          </div>
        </div>
      </div>

      <p v-if="error" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ error }}</p>
      <p v-if="notice" class="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ notice }}</p>

      <div class="flex flex-wrap items-center gap-2">
        <input v-model.trim="q" type="search" :placeholder="$t('admin.reservations.search')" class="w-64 rounded-lg border border-admin-line/20 px-3 py-2 text-sm text-admin-fg" data-testid="search" @keyup.enter="reload" />
        <button type="button" class="rounded-lg border border-admin-line/20 px-3 py-2 text-xs font-semibold text-admin-muted hover:bg-admin-sunken/60" @click="reload">{{ $t('admin.reservations.apply') }}</button>
        <button v-if="statusFilter" type="button" class="text-xs text-admin-nav underline" @click="setStatus('')">{{ $t('admin.reservations.clearFilter') }}</button>
        <span class="text-xs text-admin-subtle">{{ $t('admin.reservations.count', { n: total }) }}</span>
      </div>

      <div class="bg-admin-surface border border-admin-line/10 rounded-lg overflow-hidden">
        <div v-if="loading" class="text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-admin-line/15" /></div>
        <div v-else-if="!rows.length" class="px-6 py-12 text-center text-admin-subtle text-sm">{{ $t('admin.reservations.empty') }}</div>
        <div v-else class="divide-y divide-admin-line/10">
          <div v-for="row in rows" :key="row.id" class="grid gap-3 px-4 py-4 lg:grid-cols-12" :data-testid="`reservation-${row.reference}`">
            <div class="lg:col-span-3">
              <p class="font-mono text-xs font-semibold text-admin-subtle">{{ row.reference }} · {{ formatDate(row.createdAt) }}</p>
              <p class="font-semibold text-admin-fg">{{ row.company }}</p>
              <p class="text-xs text-admin-muted">{{ row.contactName }} · <a :href="`mailto:${row.email}`" class="hover:underline">{{ row.email }}</a><span v-if="row.phone"> · {{ row.phone }}</span></p>
              <p v-if="row.tin" class="text-xs text-admin-subtle">TIN {{ row.tin }}</p>
              <p v-if="row.message" class="mt-1 text-xs text-admin-muted">“{{ row.message }}”</p>
            </div>
            <div class="lg:col-span-2">
              <p class="font-semibold text-admin-fg">{{ row.packageName }}</p>
              <p class="text-sm text-admin-muted">{{ money(row.amount) }} {{ row.currency }}</p>
              <p v-if="row.boothPreference" class="text-xs text-admin-subtle">{{ $t('admin.reservations.booth') }}: {{ row.boothPreference }}</p>
            </div>
            <div class="lg:col-span-3 space-y-2">
              <div class="flex items-center gap-2">
                <select :value="row.status" class="rounded-lg border border-admin-line/20 px-2 py-1.5 text-xs text-admin-fg" :data-testid="`status-${row.reference}`" @change="setRowStatus(row, $event.target.value)">
                  <option v-for="s in STATUSES" :key="s" :value="s">{{ $t(`admin.reservations.status.${s}`) }}</option>
                </select>
                <span class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="statusCls(row.status)">{{ $t(`admin.reservations.status.${row.status}`) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <label class="text-xs text-admin-subtle">{{ $t('admin.reservations.paid') }}</label>
                <input :value="row.amountPaid" type="number" min="0" step="1000" class="w-32 rounded-lg border border-admin-line/20 px-2 py-1 text-xs text-admin-fg" :data-testid="`paid-${row.reference}`" @change="setPaid(row, $event.target.value)" />
                <span class="text-xs text-admin-subtle">/ {{ money(row.amount) }}</span>
              </div>
              <p class="text-[11px] text-admin-subtle">
                <span v-if="row.agreementSentAt">{{ $t('admin.reservations.agreementSentAt', { d: formatDate(row.agreementSentAt) }) }}</span>
                <span v-if="row.reminderCount"> · {{ $t('admin.reservations.reminders', { n: row.reminderCount }) }}</span>
              </p>
            </div>
            <div class="lg:col-span-2 space-y-2">
              <input :value="row.assignedTo || ''" type="text" :placeholder="$t('admin.reservations.owner')" class="w-full rounded-lg border border-admin-line/20 px-2 py-1 text-xs text-admin-fg" @change="save(row, { assignedTo: $event.target.value })" />
              <textarea :value="row.adminNotes || ''" rows="2" :placeholder="$t('admin.reservations.notes')" class="w-full rounded-lg border border-admin-line/20 px-2 py-1 text-xs text-admin-fg" @change="save(row, { adminNotes: $event.target.value })"></textarea>
            </div>
            <div class="flex flex-wrap items-start gap-2 text-xs lg:col-span-2 lg:flex-col">
              <button type="button" class="font-semibold text-admin-nav hover:underline" :disabled="busyId === row.id" @click="sendAgreement(row)">{{ $t('admin.reservations.sendAgreement') }}</button>
              <button type="button" class="font-semibold text-admin-muted hover:underline" :disabled="busyId === row.id || row.status === 'PAID' || row.status === 'CANCELLED'" @click="remind(row)">{{ $t('admin.reservations.remind') }}</button>
            </div>
          </div>
        </div>
        <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-admin-line/10 px-4 py-3 text-xs text-admin-subtle">
          <button type="button" :disabled="page === 0" class="font-semibold text-admin-nav disabled:opacity-40" @click="load(page - 1)">‹</button>
          <span>{{ page + 1 }} / {{ totalPages }}</span>
          <button type="button" :disabled="page >= totalPages - 1" class="font-semibold text-admin-nav disabled:opacity-40" @click="load(page + 1)">›</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import { reservationApi, RESERVATION_STATUSES } from '@/features/reservation/api/reservation.api'

const { t, locale } = useI18n()
const STATUSES = RESERVATION_STATUSES

const pipeline = ref(null)
const rows = ref([])
const total = ref(0)
const page = ref(0)
const totalPages = ref(0)
const loading = ref(true)
const error = ref('')
const notice = ref('')
const q = ref('')
const statusFilter = ref('')
const busyId = ref('')

const reserveLink = computed(() => (typeof window !== 'undefined' ? `${window.location.origin}/reserve` : '/reserve'))

function fail(e) {
  error.value = e?.response?.data?.message || e?.message || t('admin.reservations.loadError')
}
async function loadPipeline() {
  try {
    pipeline.value = await reservationApi.pipeline()
  } catch (e) {
    fail(e)
  }
}
async function load(p = 0) {
  loading.value = true
  error.value = ''
  try {
    const data = await reservationApi.list({ q: q.value, status: statusFilter.value, page: p, size: 50 })
    rows.value = data?.content || []
    total.value = data?.totalElements || 0
    totalPages.value = data?.totalPages || 0
    page.value = p
  } catch (e) {
    fail(e)
  } finally {
    loading.value = false
  }
}
function reload() {
  load(0)
}
function setStatus(s) {
  statusFilter.value = statusFilter.value === s ? '' : s
  load(0)
}
async function save(row, body) {
  busyId.value = row.id
  error.value = ''
  try {
    const updated = await reservationApi.update(row.id, body)
    Object.assign(row, updated)
    loadPipeline()
  } catch (e) {
    fail(e)
  } finally {
    busyId.value = ''
  }
}
function setRowStatus(row, status) {
  save(row, { status })
}
function setPaid(row, value) {
  const n = Number(value)
  if (Number.isNaN(n) || n < 0) return
  save(row, { amountPaid: n })
}
async function sendAgreement(row) {
  busyId.value = row.id
  try {
    await reservationApi.sendAgreement(row.id)
    notice.value = t('admin.reservations.agreementSent', { email: row.email })
    setTimeout(() => Promise.all([load(page.value), loadPipeline()]), 1500)
  } catch (e) {
    fail(e)
  } finally {
    busyId.value = ''
  }
}
async function remind(row) {
  busyId.value = row.id
  try {
    const updated = await reservationApi.remind(row.id)
    Object.assign(row, updated)
    notice.value = t('admin.reservations.reminded', { email: row.email })
  } catch (e) {
    fail(e)
  } finally {
    busyId.value = ''
  }
}
function money(v) {
  const n = Number(v)
  return Number.isNaN(n) ? '—' : n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}
function statusCls(s) {
  if (s === 'PAID') return 'bg-emerald-100 text-emerald-800'
  if (s === 'DEPOSIT_PAID' || s === 'SIGNED') return 'bg-blue-100 text-blue-800'
  if (s === 'CANCELLED') return 'bg-admin-sunken/60 text-admin-subtle'
  if (s === 'AGREEMENT_SENT') return 'bg-violet-100 text-violet-800'
  return 'bg-gold-400 text-primary-950'
}
function formatDate(v) {
  if (!v) return ''
  try {
    return new Date(v).toLocaleDateString(locale.value === 'am' ? 'am-ET' : 'en-GB', { dateStyle: 'medium' })
  } catch {
    return String(v)
  }
}
onMounted(() => Promise.all([load(0), loadPipeline()]))
</script>
