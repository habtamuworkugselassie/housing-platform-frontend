<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-admin-fg">{{ $t('documents.admin.title') }}</h1>
        <p class="mt-2 text-sm text-admin-subtle">{{ $t('documents.admin.subtitle') }}</p>
      </div>

      <div class="flex flex-wrap gap-2" role="tablist">
        <button
          v-for="s in FILTERS"
          :key="s ?? 'ALL'"
          type="button"
          role="tab"
          :aria-selected="status === s"
          class="rounded-full px-3 py-1 text-xs font-semibold"
          :class="status === s ? 'bg-admin-accent text-admin-accent-fg' : 'border border-admin-line/20 bg-admin-surface text-admin-muted hover:text-admin-fg'"
          :data-testid="`filter-${s ?? 'ALL'}`"
          @click="setStatus(s)"
        >
          {{ s ? $t(`documents.status.${s}`) : $t('documents.admin.all') }}
        </button>
      </div>

      <p v-if="error" class="text-sm text-red-500" role="alert">{{ error }}</p>
      <p v-if="!loading && !docs.length" class="text-sm text-admin-subtle" data-testid="empty">{{ $t('documents.admin.empty') }}</p>

      <ul class="space-y-3">
        <li v-for="d in docs" :key="d.id" class="rounded-xl border border-admin-line/20 bg-admin-surface p-4" :data-testid="`admin-doc-${d.id}`">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-semibold text-admin-fg">{{ $t(`documents.types.${d.documentType}`) }}<span v-if="d.documentNumber" class="font-normal"> · {{ d.documentNumber }}</span></p>
              <p class="text-sm text-admin-muted">{{ d.propertyTitle }}</p>
              <p class="text-xs text-admin-subtle">{{ [d.issuingAuthority, d.issuedOn, d.fileName].filter(Boolean).join(' · ') }}</p>
              <p v-if="d.sha256" class="mt-1 break-all font-mono text-[10px] text-admin-subtle">SHA-256 {{ d.sha256 }}</p>
              <p v-if="d.reviewNote" class="mt-1 text-xs text-admin-muted">{{ $t('documents.admin.note') }}: {{ d.reviewNote }}</p>
            </div>
            <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="STATUS_CLASS[d.status]">{{ $t(`documents.status.${d.status}`) }}</span>
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" class="rounded-lg border border-admin-line/30 px-3 py-1.5 text-xs font-semibold text-admin-fg" @click="open(d)">{{ $t('documents.view') }}</button>
            <input v-model="notes[d.id]" type="text" maxlength="2000" :placeholder="$t('documents.admin.notePlaceholder')" class="min-w-[12rem] flex-1 rounded-lg border border-admin-line/30 bg-transparent px-3 py-1.5 text-xs text-admin-fg" />
            <button v-if="d.status !== 'VERIFIED'" type="button" class="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60" :disabled="busy === d.id" :data-testid="`verify-${d.id}`" @click="verify(d)">{{ $t('documents.admin.verify') }}</button>
            <button v-if="d.status !== 'REJECTED'" type="button" class="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60" :disabled="busy === d.id" :data-testid="`reject-${d.id}`" @click="reject(d)">{{ $t('documents.admin.reject') }}</button>
          </div>
        </li>
      </ul>

      <div v-if="totalPages > 1" class="flex items-center gap-3 text-sm text-admin-muted">
        <button type="button" :disabled="page === 0" @click="go(page - 1)">‹</button>
        <span>{{ page + 1 }} / {{ totalPages }}</span>
        <button type="button" :disabled="page + 1 >= totalPages" @click="go(page + 1)">›</button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import { openProtectedFile } from '@/shared/api/protectedFile'
import { documentsApi, type PropertyDocument, type PropertyDocumentStatus } from '@/features/property/api/documents.api'

/** Admins check sellers' title deeds and lease contracts before they appear in agreements. */
const { t } = useI18n()
const FILTERS: (PropertyDocumentStatus | null)[] = ['PENDING', 'VERIFIED', 'REJECTED', null]
const STATUS_CLASS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  VERIFIED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700'
}

const status = ref<PropertyDocumentStatus | null>('PENDING')
const docs = ref<PropertyDocument[]>([])
const page = ref(0)
const totalPages = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)
const busy = ref<string | null>(null)
const notes = reactive<Record<string, string>>({})

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await documentsApi.adminList(status.value, page.value)
    docs.value = res.content
    totalPages.value = res.totalPages
  } catch (err: any) {
    error.value = err?.response?.data?.message || t('documents.errors.loadFailed')
  } finally {
    loading.value = false
  }
}

function setStatus(s: PropertyDocumentStatus | null) {
  status.value = s
  page.value = 0
  load()
}
function go(p: number) {
  page.value = p
  load()
}

async function review(d: PropertyDocument, action: 'verify' | 'reject') {
  busy.value = d.id
  error.value = null
  try {
    const updated = action === 'verify' ? await documentsApi.verify(d.id, notes[d.id]) : await documentsApi.reject(d.id, notes[d.id] ?? '')
    // Leave the filtered list once the status no longer matches it.
    docs.value = status.value && updated.status !== status.value ? docs.value.filter((x) => x.id !== d.id) : docs.value.map((x) => (x.id === d.id ? updated : x))
  } catch (err: any) {
    error.value = err?.response?.data?.message || t('documents.errors.reviewFailed')
  } finally {
    busy.value = null
  }
}
const verify = (d: PropertyDocument) => review(d, 'verify')
const reject = (d: PropertyDocument) => review(d, 'reject')

async function open(d: PropertyDocument) {
  try {
    await openProtectedFile(documentsApi.adminFilePath(d.id))
  } catch {
    error.value = t('documents.errors.openFailed')
  }
}

onMounted(load)
</script>
