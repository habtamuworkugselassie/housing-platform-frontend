<template>
  <div class="space-y-4">
    <template v-if="!reviewOnly">
      <p class="text-sm font-medium text-white">{{ title }}</p>
      <div v-if="numberValue" class="text-sm text-gray-300">
        <span class="text-gray-500">{{ numberLabel }}:</span>
        {{ numberValue }}
      </div>
      <p v-else class="text-sm text-gray-500">{{ numberLabel }}: —</p>
      <p class="text-sm">
        <a
          v-if="isDocumentUrl(documentUrl)"
          :href="mediaUrl(documentUrl)"
          target="_blank"
          rel="noopener"
          class="text-yellow-400 hover:underline"
        >
          {{ $t('admin.viewDocument') }}
        </a>
        <span v-else class="text-gray-400">{{ documentUrl || $t('admin.docNotUploaded') }}</span>
      </p>
    </template>
    <p v-else class="text-sm font-medium text-gray-300">{{ $t('admin.documentReviewHeading') }}</p>
    <div :class="reviewOnly ? 'space-y-3' : 'border-t border-white/10 pt-4 space-y-3'">
      <label class="block text-xs font-medium text-gray-400">{{ $t('admin.documentReviewStatus') }}</label>
      <select
        :value="status ?? ''"
        class="mt-1 block w-full max-w-md border border-white/20 bg-white/5 text-white rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
        @change="
          $emit(
            'update:status',
            $event.target.value === '' ? null : $event.target.value
          )
        "
      >
        <option value="">{{ $t('admin.documentReviewUnset') }}</option>
        <option value="PENDING">{{ $t('admin.documentReviewStatusPending') }}</option>
        <option value="APPROVED">{{ $t('admin.documentReviewStatusApproved') }}</option>
        <option value="REJECTED">{{ $t('admin.documentReviewStatusRejected') }}</option>
        <option value="NEEDS_REVISION">{{ $t('admin.documentReviewStatusNeedsRevision') }}</option>
      </select>
      <label class="block text-xs font-medium text-gray-400">{{ $t('admin.documentReviewComment') }}</label>
      <textarea
        :value="comment"
        rows="3"
        class="mt-1 block w-full border border-white/20 bg-white/5 text-white placeholder-gray-400 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
        :placeholder="$t('admin.documentReviewCommentPlaceholder')"
        @input="$emit('update:comment', ($event.target).value)"
      />
      <button
        type="button"
        class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50"
        :disabled="saving"
        @click="$emit('save')"
      >
        {{ saving ? $t('admin.saving') : $t('admin.documentReviewSave') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { mediaUrl } from '@/shared/api/client'

defineProps({
  title: { type: String, default: '' },
  numberLabel: { type: String, default: '' },
  numberValue: { type: String, default: '' },
  documentUrl: { type: String, default: '' },
  status: { type: String, default: null },
  comment: { type: String, default: '' },
  saving: { type: Boolean, default: false },
  /** When true, only admin review controls (for edit form where fields are above). */
  reviewOnly: { type: Boolean, default: false }
})

defineEmits(['update:status', 'update:comment', 'save'])

function isDocumentUrl(value) {
  if (value == null || typeof value !== 'string') return false
  const v = value.trim()
  return v.startsWith('/api/') || v.startsWith('http://') || v.startsWith('https://')
}
</script>
