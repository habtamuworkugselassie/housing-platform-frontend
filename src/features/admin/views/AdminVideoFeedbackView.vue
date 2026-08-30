<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-admin-fg">{{ $t('admin.videoFeedback.title') }}</h1>
        <p class="mt-2 text-sm text-admin-subtle">{{ $t('admin.videoFeedback.subtitle') }}</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="opt in statusFilters"
          :key="opt.value"
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
          :class="statusFilter === opt.value
            ? 'border-primary-400 bg-primary-500/15 text-admin-fg'
            : 'border-admin-line/20 text-admin-subtle hover:text-admin-fg'"
          @click="setFilter(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>

      <div v-if="error" class="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-admin-danger">
        {{ error }}
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="h-10 w-10 animate-spin rounded-full border-b-2 border-admin-line/40" />
      </div>

      <div v-else-if="!items.length" class="rounded-xl border border-admin-line/10 bg-admin-surface p-10 text-center text-admin-subtle">
        {{ $t('admin.videoFeedback.empty') }}
      </div>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex flex-col overflow-hidden rounded-xl border border-admin-line/10 bg-admin-surface"
        >
          <div class="aspect-video w-full bg-black">
            <video :src="mediaUrl(item.videoUrl)" class="h-full w-full" controls preload="metadata" playsinline />
          </div>
          <div class="flex flex-1 flex-col gap-2 p-4">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-semibold text-admin-fg truncate">{{ item.submitterName }}</span>
              <span
                class="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                :class="statusBadgeClass(item.status)"
              >
                {{ item.status }}
              </span>
            </div>
            <p class="text-xs text-admin-subtle truncate">{{ item.submitterEmail }}</p>
            <p class="flex flex-wrap items-center gap-1.5 text-xs text-admin-faint">
              <span
                class="rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide"
                :class="item.submitterRole === 'EXHIBITOR' ? 'bg-primary-500/20 text-primary-300' : 'bg-admin-line/20 text-admin-subtle'"
              >
                {{ item.submitterRole === 'EXHIBITOR' ? $t('admin.videoFeedback.roleExhibitor') : $t('admin.videoFeedback.roleVisitor') }}
              </span>
              <span v-if="item.companyName" class="truncate">{{ item.companyName }}</span>
            </p>
            <p v-if="item.caption" class="text-sm text-admin-muted line-clamp-3">{{ item.caption }}</p>
            <p class="text-xs text-admin-faint">{{ formatDate(item.createdAt) }}</p>
            <div class="mt-auto flex flex-wrap gap-2 pt-2">
              <button
                v-if="item.status !== 'APPROVED'"
                type="button"
                :disabled="busyId === item.id"
                class="rounded-lg bg-admin-accent px-3 py-1.5 text-xs font-semibold text-admin-accent-fg hover:bg-admin-accent-hover disabled:opacity-50"
                @click="approve(item)"
              >
                {{ $t('admin.videoFeedback.approve') }}
              </button>
              <button
                v-if="item.status !== 'REJECTED'"
                type="button"
                :disabled="busyId === item.id"
                class="rounded-lg border border-admin-line/30 px-3 py-1.5 text-xs font-medium text-admin-muted hover:text-admin-fg disabled:opacity-50"
                @click="reject(item)"
              >
                {{ $t('admin.videoFeedback.reject') }}
              </button>
              <button
                type="button"
                :disabled="busyId === item.id"
                class="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-admin-danger hover:bg-red-500/10 disabled:opacity-50"
                @click="remove(item)"
              >
                {{ $t('admin.videoFeedback.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import { adminApi } from '../api/admin.api'
import { mediaUrl } from '@/shared/api/client'

const { t } = useI18n()
const items = ref([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('PENDING')
const busyId = ref('')

const statusFilters = computed(() => [
  { value: 'PENDING', label: t('admin.videoFeedback.filterPending') },
  { value: 'APPROVED', label: t('admin.videoFeedback.filterApproved') },
  { value: 'REJECTED', label: t('admin.videoFeedback.filterRejected') },
  { value: '', label: t('admin.videoFeedback.filterAll') }
])

function statusBadgeClass(status) {
  if (status === 'APPROVED') return 'bg-green-500/20 text-green-300'
  if (status === 'REJECTED') return 'bg-red-500/20 text-red-300'
  return 'bg-amber-500/20 text-amber-300'
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await adminApi.listVideoFeedback(statusFilter.value, 0, 60)
    items.value = data?.content ?? (Array.isArray(data) ? data : [])
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || t('admin.videoFeedback.loadError')
    items.value = []
  } finally {
    loading.value = false
  }
}

function setFilter(value) {
  statusFilter.value = value
  load()
}

async function approve(item) {
  busyId.value = item.id
  try {
    await adminApi.approveVideoFeedback(item.id)
    await load()
  } finally {
    busyId.value = ''
  }
}

async function reject(item) {
  busyId.value = item.id
  try {
    await adminApi.rejectVideoFeedback(item.id)
    await load()
  } finally {
    busyId.value = ''
  }
}

async function remove(item) {
  if (!window.confirm(t('admin.videoFeedback.confirmDelete'))) return
  busyId.value = item.id
  try {
    await adminApi.deleteVideoFeedback(item.id)
    await load()
  } finally {
    busyId.value = ''
  }
}

onMounted(load)
</script>
