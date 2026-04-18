<template>
  <div
    v-if="hasContent"
    class="rounded-xl border border-white/10 bg-zinc-950/60 p-4 shadow-inner"
  >
    <h3 class="mb-3 text-sm font-semibold text-white">
      {{ $t('organization.documentReviewSummaryTitle') }}
    </h3>
    <ul class="space-y-4">
      <li v-for="row in rows" :key="row.key">
        <p class="text-xs font-medium text-gray-400">{{ row.title }}</p>
        <div class="mt-1 flex flex-wrap items-center gap-2">
          <span
            v-if="row.status"
            :class="['inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', statusBadgeClass(row.status)]"
          >
            {{ statusLabel(row.status) }}
          </span>
        </div>
        <p v-if="row.comment" class="mt-2 text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
          {{ row.comment }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  /** Organization (or bank) object from API — may include *ReviewStatus / *ReviewComment fields for members. */
  org: { type: Object, default: null }
})

const { t } = useI18n()

const rows = computed(() => {
  const o = props.org
  if (!o) return []
  return [
    {
      key: 'br',
      title: t('admin.docBusinessRegistration'),
      status: o.businessRegistrationReviewStatus,
      comment: o.businessRegistrationReviewComment
    },
    {
      key: 'lic',
      title: t('admin.docLicense'),
      status: o.licenseReviewStatus,
      comment: o.licenseReviewComment
    },
    {
      key: 'vat',
      title: t('admin.docVatRegistration'),
      status: o.vatRegistrationReviewStatus,
      comment: o.vatRegistrationReviewComment
    },
    {
      key: 'tin',
      title: t('admin.docTinRegistration'),
      status: o.tinRegistrationReviewStatus,
      comment: o.tinRegistrationReviewComment
    }
  ].filter((r) => r.status || (r.comment && String(r.comment).trim()))
})

const hasContent = computed(() => rows.value.length > 0)

function statusLabel(status) {
  const map = {
    PENDING: 'admin.documentReviewStatusPending',
    APPROVED: 'admin.documentReviewStatusApproved',
    REJECTED: 'admin.documentReviewStatusRejected',
    NEEDS_REVISION: 'admin.documentReviewStatusNeedsRevision'
  }
  return t(map[status] || status || '')
}

function statusBadgeClass(status) {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-500/30 text-green-200'
    case 'REJECTED':
      return 'bg-red-500/30 text-red-200'
    case 'NEEDS_REVISION':
      return 'bg-amber-500/30 text-amber-100'
    case 'PENDING':
    default:
      return 'bg-yellow-500/30 text-yellow-200'
  }
}
</script>
