<template>
  <section class="space-y-2" data-testid="property-documents">
    <h3 class="text-sm font-semibold text-gray-900">{{ $t('documents.buyer.title') }}</h3>
    <p class="text-xs text-gray-500">{{ documents.length ? $t('documents.buyer.help') : $t('documents.buyer.none') }}</p>
    <ul v-if="documents.length" class="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
      <li v-for="d in documents" :key="d.id" class="flex items-center gap-3 p-3 text-sm">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700" aria-hidden="true">✓</span>
        <span class="min-w-0 flex-1">
          <span class="block font-medium text-gray-900">{{ $t(`documents.types.${d.documentType}`) }}<span v-if="d.documentNumber" class="font-normal text-gray-600"> · {{ d.documentNumber }}</span></span>
          <span class="block truncate text-xs text-gray-500">{{ [d.issuingAuthority, d.issuedOn].filter(Boolean).join(' · ') || d.fileName }}</span>
        </span>
        <button type="button" class="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:border-primary-300" :data-testid="`open-doc-${d.id}`" @click="open(d)">{{ $t('documents.view') }}</button>
      </li>
    </ul>
    <p v-if="error" class="text-xs text-red-600" role="alert">{{ $t('documents.errors.openFailed') }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { openProtectedFile } from '@/shared/api/protectedFile'
import type { PropertyDocument } from '@/features/property/api/documents.api'

/** Verified official documents of a property, for the buyer; files open in a new tab. */
const props = defineProps<{ documents: PropertyDocument[]; filePath: (documentId: string) => string }>()
const error = ref(false)

async function open(d: PropertyDocument) {
  error.value = false
  try {
    await openProtectedFile(props.filePath(d.id))
  } catch {
    error.value = true
  }
}
</script>
