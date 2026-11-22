<template>
  <AdminLayout>
    <div class="space-y-6">
      <ExpoWorkspaceBar current="/admin/visitors" />
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-admin-fg">{{ $t('admin.visitors.title') }}</h1>
          <p class="mt-2 max-w-3xl text-sm text-admin-subtle">{{ $t('admin.visitors.subtitle') }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="rounded-lg bg-admin-nav px-3 py-2 text-xs font-semibold text-white hover:opacity-90" data-testid="scanner-toggle" @click="toggleScanner">
            {{ scannerOpen ? $t('admin.visitors.closeScanner') : $t('admin.visitors.openScanner') }}
          </button>
          <button type="button" class="rounded-lg border border-admin-line/20 px-3 py-2 text-xs font-semibold text-admin-muted hover:bg-admin-sunken/60" :disabled="exporting" @click="exportCsv">
            {{ exporting ? $t('admin.visitors.exporting') : $t('admin.visitors.exportCsv') }}
          </button>
          <a :href="registerLink" target="_blank" rel="noopener" class="rounded-lg border border-admin-line/20 px-3 py-2 text-xs font-semibold text-admin-muted hover:bg-admin-sunken/60">{{ $t('admin.visitors.openForm') }}</a>
        </div>
      </div>

      <!-- Stats -->
      <div v-if="stats" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="visitor-stats">
        <div class="rounded-lg border border-admin-line/10 bg-admin-surface p-4">
          <p class="text-xs uppercase tracking-wide text-admin-subtle">{{ $t('admin.visitors.registered') }}</p>
          <p class="mt-1 text-2xl font-bold text-admin-fg">{{ stats.total }}</p>
          <p class="mt-1 text-xs text-admin-subtle">{{ $t('admin.visitors.todayAndWeek', { today: stats.today, week: stats.last7Days }) }}</p>
        </div>
        <div class="rounded-lg border border-admin-line/10 bg-admin-surface p-4">
          <p class="text-xs uppercase tracking-wide text-admin-subtle">{{ $t('admin.visitors.checkedIn') }}</p>
          <p class="mt-1 text-2xl font-bold text-admin-fg">{{ stats.checkedIn }}</p>
          <p class="mt-1 text-xs text-admin-subtle">{{ $t('admin.visitors.checkedInToday', { n: stats.checkedInToday }) }}</p>
        </div>
        <div class="rounded-lg border border-admin-line/10 bg-admin-surface p-4 lg:col-span-2">
          <p class="text-xs uppercase tracking-wide text-admin-subtle">{{ $t('admin.visitors.last7Days') }}</p>
          <div class="mt-2 flex h-14 items-end gap-1" aria-hidden="true">
            <div v-for="d in stats.byDay" :key="d.day" class="flex-1 rounded-t bg-admin-nav/70" :style="{ height: barHeight(d.count) }" :title="`${d.day}: ${d.count}`"></div>
          </div>
          <p class="mt-1 text-xs text-admin-subtle">{{ topTypes }}</p>
        </div>
      </div>

      <!-- Scanner -->
      <div v-if="scannerOpen" class="rounded-lg border border-admin-line/10 bg-admin-surface p-4" data-testid="scanner-panel">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <div id="visitor-scanner" class="overflow-hidden rounded-lg bg-black/80" style="min-height: 240px"></div>
            <p v-if="scannerError" class="mt-2 text-xs text-admin-danger">{{ scannerError }}</p>
            <p v-else class="mt-2 text-xs text-admin-subtle">{{ $t('admin.visitors.scannerHint') }}</p>
          </div>
          <div>
            <form class="flex gap-2" @submit.prevent="checkIn(manualCode)">
              <input v-model.trim="manualCode" type="text" :placeholder="$t('admin.visitors.codePlaceholder')" class="flex-1 rounded-lg border border-admin-line/20 px-3 py-2 text-sm uppercase text-admin-fg" data-testid="manual-code" autocapitalize="characters" />
              <button type="submit" class="rounded-lg bg-gold-400 px-3 py-2 text-xs font-semibold text-primary-950 hover:bg-gold-500" :disabled="checking" data-testid="manual-check-in">{{ $t('admin.visitors.checkInBtn') }}</button>
            </form>
            <div v-if="lastCheckIn" class="mt-4 rounded-lg p-4" :class="lastCheckIn.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'" role="status" data-testid="check-in-result">
              <p class="text-lg font-bold">{{ lastCheckIn.title }}</p>
              <p class="text-sm">{{ lastCheckIn.detail }}</p>
            </div>
            <ul v-if="recent.length" class="mt-4 divide-y divide-admin-line/10 text-sm">
              <li v-for="r in recent" :key="r.id + r.checkedInAt" class="flex justify-between py-1.5">
                <span class="font-medium text-admin-fg">{{ r.fullName }}</span>
                <span class="text-xs text-admin-subtle">{{ r.code }} · {{ formatTime(r.checkedInAt) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p v-if="error" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ error }}</p>
      <p v-if="notice" class="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ notice }}</p>

      <AdminFilterBar v-model="filterValues" :fields="filterFields" :count="total" @apply="reload" />

      <AdminDataTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :empty-text="$t('admin.visitors.empty')"
        :row-test-id="(r) => `visitor-${r.code}`"
        :page="page"
        :total-pages="totalPages"
        :total="total"
        min-width="60rem"
        @page="goTo"
      >
        <template #cell-code="{ row }"><span class="font-mono font-semibold text-admin-fg">{{ row.code }}</span></template>
        <template #cell-fullName="{ row }">
          <div class="font-medium text-admin-fg">{{ row.fullName }}</div>
          <a :href="`mailto:${row.email}`" class="block text-xs text-admin-subtle hover:underline break-all">{{ row.email }}</a>
          <span v-if="row.phone" class="block text-xs text-admin-subtle">{{ row.phone }}</span>
          <span v-if="row.organization" class="block text-xs text-admin-muted">{{ row.organization }}</span>
        </template>
        <template #cell-visitorType="{ row }">{{ $t(`visitor.types.${row.visitorType}`) }}<span v-if="row.interests" class="block text-xs text-admin-subtle">{{ row.interests }}</span></template>
        <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt) }}<span class="block text-xs text-admin-subtle">{{ row.badgeSentAt ? $t('admin.visitors.badgeSent') : $t('admin.visitors.badgeNotSent') }}</span></template>
        <template #cell-status="{ row }">
          <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="statusCls(row.status)">{{ $t(`admin.visitors.status${row.status}`) }}</span>
          <span v-if="row.checkedInAt" class="block text-xs text-admin-subtle">{{ formatDate(row.checkedInAt) }}</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex flex-wrap justify-end gap-x-2 gap-y-1 text-xs">
            <button v-if="row.status === 'REGISTERED'" type="button" class="font-semibold text-admin-nav hover:underline" :disabled="busyId === row.id" @click="checkIn(row.code)">{{ $t('admin.visitors.checkInBtn') }}</button>
            <button v-else-if="row.status === 'CHECKED_IN'" type="button" class="font-semibold text-admin-muted hover:underline" :disabled="busyId === row.id" @click="setStatus(row, 'REGISTERED')">{{ $t('admin.visitors.undo') }}</button>
            <button v-else type="button" class="font-semibold text-admin-muted hover:underline" :disabled="busyId === row.id" @click="setStatus(row, 'REGISTERED')">{{ $t('admin.visitors.restore') }}</button>
            <button type="button" class="text-admin-muted hover:underline" :disabled="busyId === row.id" @click="resend(row)">{{ $t('admin.visitors.resend') }}</button>
            <button v-if="row.status !== 'CANCELLED'" type="button" class="text-admin-danger hover:underline" :disabled="busyId === row.id" @click="setStatus(row, 'CANCELLED')">{{ $t('admin.visitors.cancel') }}</button>
          </div>
        </template>
      </AdminDataTable>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import AdminFilterBar from '../components/AdminFilterBar.vue'
import AdminDataTable from '../components/AdminDataTable.vue'
import ExpoWorkspaceBar from '../components/ExpoWorkspaceBar.vue'
import { visitorApi, VISITOR_TYPES } from '@/features/visitor/api/visitor.api'

const { t, locale } = useI18n()
const columns = computed(() => [
  { key: 'code', label: t('admin.visitors.colCode'), nowrap: true },
  { key: 'fullName', label: t('admin.visitors.colVisitor') },
  { key: 'visitorType', label: t('admin.visitors.colType') },
  { key: 'createdAt', label: t('admin.visitors.colRegistered'), nowrap: true },
  { key: 'status', label: t('admin.visitors.colStatus') },
  { key: 'actions', label: t('admin.visitors.colActions'), align: 'right' }
])

const stats = ref(null)
const rows = ref([])
const total = ref(0)
const page = ref(0)
const totalPages = ref(0)
const loading = ref(true)
const error = ref('')
const notice = ref('')
const q = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const filterFields = computed(() => [
  { key: 'q', type: 'search', placeholder: t('admin.visitors.search') },
  { key: 'status', type: 'select', label: t('admin.filters.status'), allLabel: t('admin.visitors.allStatuses'), options: ['REGISTERED', 'CHECKED_IN', 'CANCELLED'].map((s) => ({ value: s, label: t(`admin.visitors.status${s}`) })) },
  { key: 'type', type: 'select', label: t('admin.filters.type'), allLabel: t('admin.visitors.allTypes'), options: VISITOR_TYPES.map((v) => ({ value: v, label: t(`visitor.types.${v}`) })) }
])
const filterValues = computed({
  get: () => ({ q: q.value, status: statusFilter.value, type: typeFilter.value }),
  set: (v) => {
    q.value = v.q || ''
    statusFilter.value = v.status || ''
    typeFilter.value = v.type || ''
  }
})
const busyId = ref('')
const exporting = ref(false)

const scannerOpen = ref(false)
const scannerError = ref('')
const manualCode = ref('')
const checking = ref(false)
const lastCheckIn = ref(null)
const recent = ref([])
let scanner = null
let lastScanned = ''
let lastScannedAt = 0

const registerLink = computed(() => (typeof window !== 'undefined' ? `${window.location.origin}/register-visitor` : '/register-visitor'))
const topTypes = computed(() => {
  if (!stats.value) return ''
  return Object.entries(stats.value.byType || {})
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, n]) => `${t(`visitor.types.${k}`)} ${n}`)
    .join(' · ')
})

function fail(e) {
  error.value = e?.response?.data?.message || e?.message || t('admin.visitors.loadError')
}

async function loadStats() {
  try {
    stats.value = await visitorApi.adminStats()
  } catch (e) {
    fail(e)
  }
}

async function load(p = 0) {
  loading.value = true
  error.value = ''
  try {
    const data = await visitorApi.adminList({ q: q.value, status: statusFilter.value, type: typeFilter.value, page: p, size: 50 })
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
function goTo(p) {
  load(p)
}

function barHeight(count) {
  const max = Math.max(1, ...(stats.value?.byDay || []).map((d) => d.count))
  return `${Math.max(6, Math.round((count / max) * 100))}%`
}

async function checkIn(code) {
  const c = String(code || '').trim()
  if (!c) return
  checking.value = true
  try {
    const row = await visitorApi.checkIn(c)
    lastCheckIn.value = { ok: true, title: row.fullName, detail: `${row.code} · ${t(`visitor.types.${row.visitorType}`)}${row.organization ? ' · ' + row.organization : ''}` }
    recent.value = [row, ...recent.value].slice(0, 8)
    manualCode.value = ''
    await Promise.all([load(page.value), loadStats()])
  } catch (e) {
    lastCheckIn.value = { ok: false, title: t('admin.visitors.notCheckedIn'), detail: e?.response?.data?.message || e?.message || '' }
  } finally {
    checking.value = false
  }
}

async function setStatus(row, status) {
  busyId.value = row.id
  try {
    const updated = await visitorApi.setStatus(row.id, status)
    Object.assign(row, updated)
    loadStats()
  } catch (e) {
    fail(e)
  } finally {
    busyId.value = ''
  }
}

async function resend(row) {
  busyId.value = row.id
  try {
    await visitorApi.resend(row.id)
    notice.value = t('admin.visitors.resent', { email: row.email })
  } catch (e) {
    fail(e)
  } finally {
    busyId.value = ''
  }
}

async function exportCsv() {
  exporting.value = true
  try {
    const blob = await visitorApi.exportCsv()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'expo-visitors.csv'
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    fail(e)
  } finally {
    exporting.value = false
  }
}

async function toggleScanner() {
  scannerOpen.value = !scannerOpen.value
  if (!scannerOpen.value) return stopScanner()
  await nextTick()
  startScanner()
}

async function startScanner() {
  scannerError.value = ''
  try {
    const { Html5Qrcode } = await import('html5-qrcode')
    scanner = new Html5Qrcode('visitor-scanner')
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 8, qrbox: { width: 220, height: 220 } },
      (text) => {
        const now = Date.now()
        if (text === lastScanned && now - lastScannedAt < 4000) return
        lastScanned = text
        lastScannedAt = now
        checkIn(text)
      },
      () => {}
    )
  } catch (e) {
    scannerError.value = t('admin.visitors.scannerError')
  }
}

async function stopScanner() {
  try {
    if (scanner) await scanner.stop()
  } catch {
    /* already stopped */
  }
  scanner = null
}

function statusCls(status) {
  if (status === 'CHECKED_IN') return 'bg-emerald-100 text-emerald-800'
  if (status === 'CANCELLED') return 'bg-admin-sunken/60 text-admin-subtle'
  return 'bg-gold-400 text-primary-950'
}

function formatDate(v) {
  if (!v) return ''
  try {
    return new Date(v).toLocaleString(locale.value === 'am' ? 'am-ET' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return String(v)
  }
}
function formatTime(v) {
  if (!v) return ''
  try {
    return new Date(v).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

onMounted(() => {
  Promise.all([load(0), loadStats()])
})
onBeforeUnmount(stopScanner)
</script>
