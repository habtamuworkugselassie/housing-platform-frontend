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

      <div class="bg-admin-surface border border-admin-line/10 rounded-lg overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-admin-line/15" />
        </div>

        <div v-else-if="error" class="px-6 py-8 text-center text-admin-danger text-sm">{{ error }}</div>

        <div v-else-if="!rows.length" class="px-6 py-12 text-center text-admin-subtle text-sm">
          {{ $t('admin.enquiries.empty') }}
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[64rem] divide-y divide-admin-line/10 rtable">
            <thead class="bg-admin-raised">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-admin-subtle uppercase tracking-wider">{{ $t('admin.enquiries.colDate') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-admin-subtle uppercase tracking-wider">{{ $t('admin.enquiries.colFrom') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-admin-subtle uppercase tracking-wider">{{ $t('admin.enquiries.colAbout') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-admin-subtle uppercase tracking-wider">{{ $t('admin.enquiries.colMessage') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-admin-subtle uppercase tracking-wider">{{ $t('admin.enquiries.colStatus') }}</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-admin-subtle uppercase tracking-wider">{{ $t('admin.enquiries.colActions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-admin-line/10">
              <tr v-for="row in rows" :key="row.id" class="hover:bg-admin-nav/5 transition-colors align-top" :data-testid="`enquiry-${row.id}`">
                <td class="px-4 py-3 text-sm text-admin-muted whitespace-nowrap">{{ formatDate(row.createdAt) }}</td>
                <td class="px-4 py-3 text-sm">
                  <div class="text-admin-fg font-medium">{{ row.name }}</div>
                  <a :href="`mailto:${row.email}`" class="block text-xs text-admin-subtle hover:underline break-all">{{ row.email }}</a>
                  <a v-if="row.phoneNumber" :href="`tel:${row.phoneNumber}`" class="block text-xs text-admin-subtle hover:underline">{{ row.phoneNumber }}</a>
                </td>
                <td class="px-4 py-3 text-sm">
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
                </td>
                <td class="px-4 py-3 text-sm text-admin-muted max-w-md">
                  <p class="whitespace-pre-line break-words">{{ row.message }}</p>
                </td>
                <td class="px-4 py-3 text-sm">
                  <span :class="['inline-block rounded-full px-2 py-0.5 text-xs font-semibold', statusCls(row.status)]">
                    {{ statusLabel(row.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-right whitespace-nowrap">
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
                    class="ml-2 rounded-lg border border-admin-line/20 px-3 py-1.5 text-xs font-semibold text-admin-muted hover:bg-admin-sunken/60 disabled:opacity-50"
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!loading && !error && totalPages > 1" class="flex items-center justify-between border-t border-admin-line/10 px-4 py-3 text-sm text-admin-subtle">
          <span>{{ $t('admin.enquiries.pageOf', { page: page + 1, total: totalPages }) }}</span>
          <div class="flex gap-2">
            <button type="button" class="rounded-lg border border-admin-line/20 px-3 py-1 disabled:opacity-40" :disabled="page === 0" @click="goTo(page - 1)">‹</button>
            <button type="button" class="rounded-lg border border-admin-line/20 px-3 py-1 disabled:opacity-40" :disabled="page + 1 >= totalPages" @click="goTo(page + 1)">›</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import { enquiryApi } from '@/features/enquiry/api/enquiry.api'

const { t, locale } = useI18n()

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
