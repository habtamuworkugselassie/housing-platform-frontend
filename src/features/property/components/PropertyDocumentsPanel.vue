<template>
  <section class="space-y-3" data-testid="property-documents-panel">
    <div>
      <h4 class="text-sm font-medium text-gray-700">{{ $t('documents.panel.title') }}</h4>
      <p class="text-xs text-gray-500">{{ $t('documents.panel.help') }}</p>
    </div>

    <p v-if="loadError" class="text-xs text-red-600" role="alert">{{ loadError }}</p>

    <ul v-if="documents.length" class="divide-y divide-white/10 rounded-lg border border-white/20">
      <li v-for="d in documents" :key="d.id" class="flex flex-wrap items-center gap-2 p-3 text-sm" :data-testid="`doc-${d.id}`">
        <span class="material-icons text-gray-400" style="font-size: 20px;" aria-hidden="true">description</span>
        <span class="min-w-0 flex-1">
          <span class="block font-medium">{{ $t(`documents.types.${d.documentType}`) }}<span v-if="d.documentNumber"> · {{ d.documentNumber }}</span></span>
          <span class="block truncate text-xs text-gray-500">{{ d.fileName }}</span>
          <span v-if="d.status === 'REJECTED' && d.reviewNote" class="block text-xs text-red-500">{{ $t('documents.panel.rejectedBecause', { reason: d.reviewNote }) }}</span>
        </span>
        <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="STATUS_CLASS[d.status]">{{ $t(`documents.status.${d.status}`) }}</span>
        <button type="button" class="text-xs font-semibold text-primary-500 hover:underline" @click="open(d)">{{ $t('documents.view') }}</button>
        <button v-if="d.status !== 'VERIFIED'" type="button" class="text-xs font-semibold text-red-500 hover:underline" :disabled="busy" @click="remove(d)">{{ $t('common.delete') }}</button>
      </li>
    </ul>
    <p v-else-if="!loading" class="text-xs text-gray-500">{{ $t('documents.panel.none') }}</p>

    <!-- Upload: a plain block, not a <form>, because it sits inside the listing edit form. -->
    <div class="space-y-2 rounded-lg border-2 border-dashed border-white/20 p-3">
      <div class="grid gap-2 sm:grid-cols-2">
        <label class="text-xs text-gray-600">
          {{ $t('documents.panel.type') }}
          <select v-model="form.documentType" class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 px-2 py-1.5 text-sm" data-testid="doc-type">
            <option v-for="t in PROPERTY_DOCUMENT_TYPES" :key="t" :value="t">{{ $t(`documents.types.${t}`) }}</option>
          </select>
        </label>
        <label class="text-xs text-gray-600">
          {{ $t('documents.panel.number') }}
          <input v-model="form.documentNumber" type="text" maxlength="100" class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 px-2 py-1.5 text-sm" />
        </label>
        <label class="text-xs text-gray-600">
          {{ $t('documents.panel.authority') }}
          <input v-model="form.issuingAuthority" type="text" maxlength="255" class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 px-2 py-1.5 text-sm" />
        </label>
        <label class="text-xs text-gray-600">
          {{ $t('documents.panel.issuedOn') }}
          <input v-model="form.issuedOn" type="date" class="mt-1 block w-full rounded-md border border-white/20 bg-white/5 px-2 py-1.5 text-sm" />
        </label>
      </div>
      <input ref="fileInput" type="file" accept="application/pdf,image/jpeg,image/png" class="block w-full text-xs" data-testid="doc-file" @change="onFile" />
      <div class="flex items-center gap-3">
        <button type="button" class="mdc-button mdc-button--outlined" :disabled="!file || busy" data-testid="doc-upload" @click="upload">
          <span class="material-icons mr-1" style="font-size: 18px;">upload_file</span>{{ busy ? $t('documents.panel.uploading') : $t('documents.panel.upload') }}
        </button>
        <span class="text-[11px] text-gray-500">{{ $t('documents.panel.formats') }}</span>
      </div>
      <p v-if="error" class="text-xs text-red-600" role="alert">{{ error }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { openProtectedFile } from '@/shared/api/protectedFile'
import { documentsApi, PROPERTY_DOCUMENT_TYPES, type PropertyDocument, type PropertyDocumentType } from '../api/documents.api'

/** The seller's official documents for one listing: upload for admin review, see the outcome. */
const props = defineProps<{ propertyId: string }>()
const { t } = useI18n()

const STATUS_CLASS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  VERIFIED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700'
}
const MAX_BYTES = 15 * 1024 * 1024

const documents = ref<PropertyDocument[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)
const busy = ref(false)
const error = ref<string | null>(null)
const file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const form = reactive({ documentType: 'TITLE_DEED' as PropertyDocumentType, documentNumber: '', issuingAuthority: '', issuedOn: '' })

async function load() {
  loading.value = true
  loadError.value = null
  try {
    documents.value = await documentsApi.list(props.propertyId)
  } catch (err: any) {
    loadError.value = err?.response?.data?.message || t('documents.errors.loadFailed')
  } finally {
    loading.value = false
  }
}

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] ?? null
  error.value = null
  if (f && f.size > MAX_BYTES) {
    error.value = t('documents.errors.tooLarge')
    file.value = null
    return
  }
  file.value = f
}

async function upload() {
  if (!file.value) return
  busy.value = true
  error.value = null
  try {
    const doc = await documentsApi.upload(props.propertyId, file.value, { ...form })
    documents.value = [...documents.value, doc]
    file.value = null
    if (fileInput.value) fileInput.value.value = ''
    Object.assign(form, { documentNumber: '', issuingAuthority: '', issuedOn: '' })
  } catch (err: any) {
    error.value = err?.response?.data?.message || t('documents.errors.uploadFailed')
  } finally {
    busy.value = false
  }
}

async function remove(d: PropertyDocument) {
  busy.value = true
  error.value = null
  try {
    await documentsApi.remove(props.propertyId, d.id)
    documents.value = documents.value.filter((x) => x.id !== d.id)
  } catch (err: any) {
    error.value = err?.response?.data?.message || t('documents.errors.deleteFailed')
  } finally {
    busy.value = false
  }
}

async function open(d: PropertyDocument) {
  try {
    await openProtectedFile(documentsApi.managerFilePath(props.propertyId, d.id))
  } catch {
    error.value = t('documents.errors.openFailed')
  }
}

onMounted(load)
watch(() => props.propertyId, load)
</script>
