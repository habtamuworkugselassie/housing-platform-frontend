<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-admin-fg">{{ $t('admin.enquiries.title') }}</h1>
          <p class="mt-2 text-sm text-admin-subtle">{{ $t('admin.enquiries.subtitle') }}</p>
        </div>
        <div class="flex flex-wrap gap-2" role="tablist">
          <button
            v-for="f in filters"
            :key="f.value"
            type="button"
            role="tab"
            :aria-selected="statusFilter === f.value"
            :class="[
              'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
              statusFilter === f.value
                ? 'bg-admin-nav text-white'
                : 'bg-admin-sunken/60 text-admin-muted hover:bg-admin-sunken'
            ]"
            @click="setFilter(f.value)"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <p v-if="!loading && error" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ error }}</p>
      <AdminDataTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :empty-text="$t('admin.enquiries.empty')"
        :row-test-id="(r) => `enquiry-${r.id}`"
        :page="page"
        :total-pages="totalPages"
        min-width="64rem"
        @page="goTo"
      >
        <template #cell-createdAt="{ row }">{{ formatDate(row.createdAt) }}</template>
        <template #cell-name="{ row }">
          <div class="text-admin-fg font-medium">{{ row.name }}</div>
          <a :href="`mailto:${row.email}`" class="block text-xs text-admin-subtle hover:underline break-all">{{ row.email }}</a>
          <a v-if="row.phoneNumber" :href="`tel:${row.phoneNumber}`" class="block text-xs text-admin-subtle hover:underline">{{ row.phoneNumber }}</a>
        </template>
        <template #cell-subject="{ row }">
          <span class="inline-block rounded-full bg-admin-sunken/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-admin-muted">
          {{ row.subjectType === 'PROPERTY' ? $t('admin.enquiries.subjectProperty') : $t('admin.enquiries.subjectOrganization') }}
          </span>
          <span v-if="row.locale === 'am'" class="ms-1 inline-block rounded-full bg-gold-400/30 px-2 py-0.5 text-[11px] font-semibold text-admin-fg" :title="$t('admin.enquiries.amharicVisitor')">አማ</span>
          <div class="mt-1">
          <router-link
          v-if="row.subjectType === 'PROPERTY' && row.propertyId"
          :to="`/properties/${row.propertyId}`"
          class="text-admin-fg font-medium hover:underline"
          >
          {{ row.subjectTitle || row.propertyId }}
          </router-link>
          <router-link
          v-else-if="row.organizationId"
          :to="`/organizations/${row.organizationId}`"
          class="text-admin-fg font-medium hover:underline"
          >
          {{ row.subjectTitle || row.organizationName }}
          </router-link>
          <span v-else class="text-admin-fg font-medium">{{ row.subjectTitle || '—' }}</span>
          </div>
          <div v-if="row.subjectType === 'PROPERTY' && row.organizationName" class="text-xs text-admin-subtle">
          {{ row.organizationName }}
          </div>
        </template>
        <template #cell-message="{ row }">
          <p class="whitespace-pre-line break-words">{{ row.message }}</p>
        </template>
        <template #cell-status="{ row }">
          <span :class="['inline-block rounded-full px-2 py-0.5 text-xs font-semibold', statusCls(row.status)]">
          {{ statusLabel(row.status) }}
          </span>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex flex-wrap justify-end gap-2">
          <button
          v-if="row.status === 'NEW'"
          type="button"
          class="rounded-lg bg-admin-nav px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
          :disabled="busyId === row.id"
          @click="setStatus(row, 'CONTACTED')"
          >
          {{ $t('admin.enquiries.markContacted') }}
          </button>
          <button
          v-if="row.status !== 'CLOSED'"
          type="button"
          class="rounded-lg border border-admin-line/20 px-3 py-1.5 text-xs font-semibold text-admin-muted hover:bg-admin-sunken/60 disabled:opacity-50"
          :disabled="busyId === row.id"
          @click="setStatus(row, 'CLOSED')"
          >
          {{ $t('admin.enquiries.close') }}
          </button>
          <button
          v-else
          type="button"
          class="rounded-lg border border-admin-line/20 px-3 py-1.5 text-xs font-semibold text-admin-muted hover:bg-admin-sunken/60 disabled:opacity-50"
          :disabled="busyId === row.id"
          @click="setStatus(row, 'NEW')"
          >
          {{ $t('admin.enquiries.reopen') }}
          </button>
          </div>
        </template>
      </AdminDataTable>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import AdminDataTable from '../components/AdminDataTable.vue'
import { enquiryApi } from '@/features/enquiry/api/enquiry.api'

const { t, locale } = useI18n()
const columns = computed(() => [
  { key: 'createdAt', label: t('admin.enquiries.colDate'), nowrap: true },
  { key: 'name', label: t('admin.enquiries.colFrom') },
  { key: 'subject', label: t('admin.enquiries.colAbout') },
  { key: 'message', label: t('admin.enquiries.colMessage') },
  { key: 'status', label: t('admin.enquiries.colStatus') },
  { key: 'actions', label: t('admin.enquiries.colActions'), align: 'right' }
])

const loading = ref(true)
const error = ref('')
const rows = ref([])
const page = ref(0)
const totalPages = ref(0)
const statusFilter = ref('')
const busyId = ref('')

const filters = computed(() => [
  { value: '', label: t('admin.enquiries.filterAll') },
  { value: 'NEW', label: t('admin.enquiries.statusNew') },
  { value: 'CONTACTED', label: t('admin.enquiries.statusContacted') },
  { value: 'CLOSED', label: t('admin.enquiries.statusClosed') }
])

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await enquiryApi.adminList({ status: statusFilter.value, page: page.value, size: 25 })
    rows.value = data?.content || []
    totalPages.value = data?.totalPages || 0
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || t('admin.enquiries.loadError')
  } finally {
    loading.value = false
  }
}

function setFilter(value) {
  statusFilter.value = value
  page.value = 0
  load()
}

function goTo(p) {
  page.value = p
  load()
}

async function setStatus(row, status) {
  busyId.value = row.id
  try {
    const updated = await enquiryApi.adminUpdateStatus(row.id, status)
    row.status = updated?.status || status
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || t('admin.enquiries.loadError')
  } finally {
    busyId.value = ''
  }
}

function statusLabel(status) {
  if (status === 'CONTACTED') return t('admin.enquiries.statusContacted')
  if (status === 'CLOSED') return t('admin.enquiries.statusClosed')
  return t('admin.enquiries.statusNew')
}

function statusCls(status) {
  if (status === 'CONTACTED') return 'bg-blue-100 text-blue-800'
  if (status === 'CLOSED') return 'bg-admin-sunken/60 text-admin-subtle'
  return 'bg-gold-400 text-primary-950'
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(locale.value || undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

onMounted(load)
</script>
