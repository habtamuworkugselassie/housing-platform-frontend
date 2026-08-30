<template>
  <AdminLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-admin-fg">{{ $t('admin.liveBroadcasts.title') }}</h1>
        <p class="mt-2 text-sm text-admin-subtle">{{ $t('admin.liveBroadcasts.subtitle') }}</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="opt in statusFilters"
          :key="opt.value"
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
          :class="statusFilter === opt.value ? 'border-primary-400 bg-primary-500/15 text-admin-fg' : 'border-admin-line/20 text-admin-subtle hover:text-admin-fg'"
          @click="setFilter(opt.value)"
        >
          {{ opt.label }}
        </button>
        <button type="button" class="ml-auto rounded-lg border border-admin-line/20 px-3 py-1.5 text-sm text-admin-subtle hover:text-admin-fg" @click="load">
          {{ $t('common.refresh') }}
        </button>
      </div>

      <div v-if="error" class="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-admin-danger">{{ error }}</div>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="h-10 w-10 animate-spin rounded-full border-b-2 border-admin-line/40" />
      </div>

      <div v-else-if="!items.length" class="rounded-xl border border-admin-line/10 bg-admin-surface p-10 text-center text-admin-subtle">
        {{ $t('admin.liveBroadcasts.empty') }}
      </div>

      <div v-else class="overflow-x-auto rounded-xl border border-admin-line/10 bg-admin-surface">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b border-admin-line/10 text-left text-xs uppercase tracking-wide text-admin-faint">
              <th class="px-4 py-3">{{ $t('admin.liveBroadcasts.stream') }}</th>
              <th class="px-4 py-3">{{ $t('admin.liveBroadcasts.broadcaster') }}</th>
              <th class="px-4 py-3">{{ $t('admin.liveBroadcasts.status') }}</th>
              <th class="px-4 py-3 text-right">{{ $t('admin.liveBroadcasts.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id" class="border-b border-admin-line/5">
              <td class="px-4 py-3">
                <p class="font-medium text-admin-fg">{{ item.title }}</p>
                <p class="text-xs text-admin-faint">{{ item.room }}</p>
              </td>
              <td class="px-4 py-3">
                <p class="text-admin-muted">{{ item.broadcasterName }}<span v-if="item.companyName">, {{ item.companyName }}</span></p>
                <p class="text-xs text-admin-faint">{{ item.broadcasterRole }}<span v-if="item.broadcasterEmail"> · {{ item.broadcasterEmail }}</span></p>
              </td>
              <td class="px-4 py-3">
                <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide" :class="statusBadgeClass(item.status)">{{ item.status }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap justify-end gap-2">
                  <button v-if="item.status === 'REQUESTED' || item.status === 'REJECTED'" type="button" :disabled="busyId === item.id" class="rounded-lg bg-admin-accent px-3 py-1.5 text-xs font-semibold text-admin-accent-fg hover:bg-admin-accent-hover disabled:opacity-50" @click="act('approveLiveBroadcast', item)">
                    {{ $t('admin.liveBroadcasts.approve') }}
                  </button>
                  <button v-if="item.status === 'REQUESTED' || item.status === 'APPROVED'" type="button" :disabled="busyId === item.id" class="rounded-lg border border-admin-line/30 px-3 py-1.5 text-xs font-medium text-admin-muted hover:text-admin-fg disabled:opacity-50" @click="act('rejectLiveBroadcast', item)">
                    {{ $t('admin.liveBroadcasts.reject') }}
                  </button>
                  <button v-if="item.status === 'LIVE'" type="button" :disabled="busyId === item.id" class="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-admin-danger hover:bg-red-500/10 disabled:opacity-50" @click="cut(item)">
                    {{ $t('admin.liveBroadcasts.cut') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import { adminApi } from '../api/admin.api'

const { t } = useI18n()
const items = ref([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('')
const busyId = ref('')

const statusFilters = computed(() => [
  { value: '', label: t('admin.liveBroadcasts.filterAll') },
  { value: 'REQUESTED', label: t('admin.liveBroadcasts.filterRequested') },
  { value: 'LIVE', label: t('admin.liveBroadcasts.filterLive') },
  { value: 'ENDED', label: t('admin.liveBroadcasts.filterEnded') }
])

function statusBadgeClass(status) {
  if (status === 'LIVE') return 'bg-red-500/20 text-red-300'
  if (status === 'APPROVED') return 'bg-green-500/20 text-green-300'
  if (status === 'ENDED' || status === 'REJECTED') return 'bg-admin-line/20 text-admin-subtle'
  return 'bg-amber-500/20 text-amber-300'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await adminApi.listLiveBroadcasts(statusFilter.value, 0, 50)
    items.value = data?.content ?? (Array.isArray(data) ? data : [])
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || t('admin.liveBroadcasts.loadError')
    items.value = []
  } finally {
    loading.value = false
  }
}

function setFilter(value) {
  statusFilter.value = value
  load()
}

async function act(method, item) {
  busyId.value = item.id
  try {
    await adminApi[method](item.id)
    await load()
  } finally {
    busyId.value = ''
  }
}

async function cut(item) {
  if (!window.confirm(t('admin.liveBroadcasts.confirmCut'))) return
  await act('endLiveBroadcast', item)
}

onMounted(load)
</script>
