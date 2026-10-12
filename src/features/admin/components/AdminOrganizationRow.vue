<template>
  <li class="group p-4 sm:p-5 transition-colors hover:bg-admin-raised/40" :data-testid="`org-row-${org.id}`">
    <div class="flex gap-4">
      <!-- Logo, or initials when there is none -->
      <button
        type="button"
        class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-admin-line/10 bg-admin-raised text-sm font-bold text-admin-muted sm:h-14 sm:w-14"
        :aria-label="$t('admin.orgList.viewDetails', { name: shown.name })"
        @click="$emit('view', org)"
      >
        <img v-if="logo && !logoFailed" :src="logo" alt="" class="h-full w-full object-cover" loading="lazy" @error="logoFailed = true" />
        <span v-else>{{ initials(shown.name) }}</span>
      </button>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" class="truncate text-left text-base font-semibold text-admin-fg hover:underline" @click="$emit('view', org)">
                {{ shown.name || $t('admin.orgList.unnamed') }}
              </button>
              <VerifiedBadge :level="getVerificationLevel(org)" size="sm" />
              <span v-if="org.isSponsored" class="rounded-full bg-admin-warn/15 px-2 py-0.5 text-[11px] font-semibold text-admin-warn">{{ $t('admin.orgList.sponsored') }}</span>
            </div>
            <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-admin-subtle">
              <span class="rounded-md bg-admin-raised px-2 py-0.5 font-medium text-admin-muted">{{ typeLabel }}</span>
              <span v-if="shown.fromExhibition" class="rounded-md bg-admin-info/15 px-2 py-0.5 font-medium text-admin-info">{{ $t('admin.orgList.fromExhibition') }}</span>
              <span v-if="location">{{ location }}</span>
              <span v-if="location" aria-hidden="true">·</span>
              <span :title="createdTitle">{{ $t('admin.orgList.joined', { date: createdLabel }) }}</span>
            </div>
          </div>
          <span class="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset" :class="status.badge" data-testid="org-status">
            {{ $t(status.key) }}
          </span>
        </div>

        <!-- Contact and verification at a glance -->
        <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
          <a v-if="org.email" :href="`mailto:${org.email}`" class="inline-flex min-w-0 items-center gap-1.5 text-admin-muted hover:text-admin-fg">
            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <span class="truncate">{{ org.email }}</span>
          </a>
          <a v-for="p in phones" :key="p" :href="`tel:${p.replace(/\s/g, '')}`" class="inline-flex items-center gap-1.5 text-admin-muted hover:text-admin-fg">
            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.49a1 1 0 01-.5 1.21l-2.26 1.13a11.04 11.04 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.49 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" /></svg>
            {{ p }}
          </a>
          <span class="inline-flex items-center gap-1.5 text-xs" :class="docs.toReview ? 'text-admin-warn' : docs.needsFix ? 'text-admin-danger' : 'text-admin-subtle'" data-testid="org-docs">
            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.59a1 1 0 01.7.29l5.42 5.42a1 1 0 01.29.7V19a2 2 0 01-2 2z" /></svg>
            {{ docsLabel }}
          </span>
        </div>

        <!-- Actions -->
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <button v-if="pending || org.status === 'REJECTED'" type="button" :class="[BTN, 'bg-green-600 text-white hover:bg-green-700']" data-testid="org-approve" @click="$emit('approve', org)">{{ $t('admin.orgList.approve') }}</button>
          <button v-if="pending" type="button" :class="[BTN, 'border border-admin-danger/40 text-admin-danger hover:bg-admin-danger/10']" data-testid="org-reject" @click="$emit('reject', org)">{{ $t('admin.orgList.reject') }}</button>
          <button v-if="org.status === 'APPROVED'" type="button" :class="[BTN, 'border border-admin-line/20 text-admin-muted hover:bg-admin-raised']" data-testid="org-suspend" @click="$emit('suspend', org)">{{ $t('admin.orgList.suspend') }}</button>
          <button v-if="org.status === 'SUSPENDED'" type="button" :class="[BTN, 'border border-admin-ok/40 text-admin-ok hover:bg-admin-ok/10']" data-testid="org-reactivate" @click="$emit('reactivate', org)">{{ $t('admin.reactivate') }}</button>
          <button type="button" :class="[BTN, 'border border-admin-line/20 text-admin-fg hover:bg-admin-raised']" data-testid="org-edit" @click="$emit('edit', org)">{{ $t('admin.orgList.edit') }}</button>
          <button type="button" :class="[BTN, 'bg-admin-accent text-admin-accent-fg hover:bg-admin-accent-hover sm:ml-auto']" data-testid="org-view" @click="$emit('view', org)">{{ $t('admin.orgList.view') }}</button>
        </div>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { mediaUrl } from '@/shared/api/client'
import { VerifiedBadge } from '@/shared/components'
import { formatOrganizationPhones, getVerificationLevel } from '@/shared/utils'
import { displayName, documentSummary, initials, isPending, locationOf, statusMeta } from '../utils/organizationList'

const BTN = 'inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors'

const props = defineProps<{ org: any; typeLabel: string }>()
defineEmits<{
  (e: 'approve' | 'reject' | 'suspend' | 'reactivate' | 'edit' | 'view', org: any): void
}>()

const { t } = useI18n()
const logoFailed = ref(false)

const shown = computed(() => displayName(props.org))
const logo = computed(() => (props.org.logoUrl ? mediaUrl(props.org.logoUrl) : ''))
const location = computed(() => locationOf(props.org))
const status = computed(() => statusMeta(props.org.status))
const pending = computed(() => isPending(props.org.status))
const phones = computed<string[]>(() => formatOrganizationPhones(props.org) ?? [])
const docs = computed(() => documentSummary(props.org))
const docsLabel = computed(() => {
  const s = docs.value
  if (!s.uploaded) return t('admin.orgList.docs.none')
  if (s.needsFix) return t('admin.orgList.docs.needsFix', { count: s.needsFix })
  if (s.toReview) return t('admin.orgList.docs.toReview', { count: s.toReview })
  return t('admin.orgList.docs.approved', { approved: s.approved, uploaded: s.uploaded })
})
const created = computed(() => (props.org.createdAt ? new Date(props.org.createdAt) : null))
const createdLabel = computed(() =>
  created.value ? created.value.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
)
const createdTitle = computed(() => (created.value ? created.value.toLocaleString() : ''))
</script>
