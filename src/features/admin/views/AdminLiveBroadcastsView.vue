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
        <button type="button" class="ml-auto rounded-lg border border-admin-line/20 px-3 py-1.5 text-sm text-admin-subtle hover:text-admin-fg" @click="openTargets">
          {{ $t('admin.simulcast.destinations') }}
        </button>
        <button type="button" class="rounded-lg border border-admin-line/20 px-3 py-1.5 text-sm text-admin-subtle hover:text-admin-fg" @click="load">
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
                  <button v-if="item.status !== 'ENDED' && item.status !== 'REJECTED'" type="button" :disabled="busyId === item.id" class="rounded-lg border border-admin-line/30 px-3 py-1.5 text-xs font-medium text-admin-muted hover:text-admin-fg disabled:opacity-50" @click="camera(item)">
                    {{ $t('admin.liveBroadcasts.proCamera') }}
                  </button>
                  <button v-if="item.status === 'REQUESTED' || item.status === 'REJECTED'" type="button" :disabled="busyId === item.id" class="rounded-lg bg-admin-accent px-3 py-1.5 text-xs font-semibold text-admin-accent-fg hover:bg-admin-accent-hover disabled:opacity-50" @click="act('approveLiveBroadcast', item)">
                    {{ $t('admin.liveBroadcasts.approve') }}
                  </button>
                  <button v-if="item.status === 'REQUESTED' || item.status === 'APPROVED'" type="button" :disabled="busyId === item.id" class="rounded-lg border border-admin-line/30 px-3 py-1.5 text-xs font-medium text-admin-muted hover:text-admin-fg disabled:opacity-50" @click="act('rejectLiveBroadcast', item)">
                    {{ $t('admin.liveBroadcasts.reject') }}
                  </button>
                  <button v-if="item.status === 'LIVE' && !item.simulcasting" type="button" :disabled="busyId === item.id" class="rounded-lg border border-admin-line/30 px-3 py-1.5 text-xs font-medium text-admin-muted hover:text-admin-fg disabled:opacity-50" @click="openSimulcast(item)">
                    {{ $t('admin.simulcast.action') }}
                  </button>
                  <button v-if="item.status === 'LIVE' && item.simulcasting" type="button" :disabled="busyId === item.id" class="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-admin-danger hover:bg-red-500/10 disabled:opacity-50" @click="stopCast(item)">
                    <span class="h-1.5 w-1.5 rounded-full bg-red-400 motion-safe:animate-pulse" /> {{ $t('admin.simulcast.stop') }}
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

    <!-- Pro-camera connection details (OBS / hardware encoder) -->
    <div v-if="ingress" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" @click.self="ingress = null">
      <div class="w-full max-w-lg rounded-2xl border border-admin-line/10 bg-admin-surface p-6">
        <h3 class="text-lg font-semibold text-admin-fg">{{ $t('admin.liveBroadcasts.cameraTitle') }}</h3>
        <p class="mt-1 text-sm text-admin-subtle">{{ $t('admin.liveBroadcasts.cameraHelp') }}</p>
        <div class="mt-4 space-y-3">
          <div>
            <label class="block text-xs font-medium text-admin-faint">{{ ingress.inputType === 'WHIP' ? $t('admin.liveBroadcasts.whipUrl') : $t('admin.liveBroadcasts.rtmpServer') }}</label>
            <input readonly :value="ingress.url" class="mt-1 w-full rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-sm text-admin-fg" @focus="selectAll" />
          </div>
          <div v-if="ingress.streamKey">
            <label class="block text-xs font-medium text-admin-faint">{{ $t('admin.liveBroadcasts.streamKey') }}</label>
            <input readonly :value="ingress.streamKey" class="mt-1 w-full rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-sm text-admin-fg" @focus="selectAll" />
          </div>
        </div>
        <div class="mt-5 flex justify-end">
          <button type="button" class="rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-admin-accent-fg hover:bg-admin-accent-hover" @click="ingress = null">{{ $t('common.close') }}</button>
        </div>
      </div>
    </div>

    <!-- Pick destinations for a live broadcast -->
    <div v-if="simulcastFor" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" @click.self="simulcastFor = null">
      <div class="w-full max-w-lg rounded-2xl border border-admin-line/10 bg-admin-surface p-6">
        <h3 class="text-lg font-semibold text-admin-fg">{{ $t('admin.simulcast.pickTitle') }}</h3>
        <p class="mt-1 text-sm text-admin-subtle">{{ $t('admin.simulcast.pickHelp') }}</p>
        <div class="mt-4 space-y-2">
          <p v-if="!enabledTargets.length" class="rounded-lg border border-admin-line/10 bg-admin-field/5 px-3 py-4 text-center text-sm text-admin-subtle">
            {{ $t('admin.simulcast.noneYet') }}
          </p>
          <label v-for="tg in enabledTargets" :key="tg.id" class="flex items-center gap-3 rounded-lg border border-admin-line/15 px-3 py-2">
            <input type="checkbox" :value="tg.id" v-model="selectedTargetIds" class="h-4 w-4 accent-primary-500" />
            <span class="flex-1">
              <span class="text-sm font-medium text-admin-fg">{{ tg.label }}</span>
              <span class="ml-2 rounded-full bg-admin-line/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-admin-subtle">{{ tg.platform }}</span>
            </span>
            <span v-if="!tg.hasKey" class="text-[11px] text-admin-danger">{{ $t('admin.simulcast.noKey') }}</span>
          </label>
        </div>
        <p v-if="modalError" class="mt-3 text-sm text-admin-danger">{{ modalError }}</p>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" class="rounded-lg border border-admin-line/20 px-4 py-2 text-sm text-admin-subtle hover:text-admin-fg" @click="simulcastFor = null">{{ $t('common.cancel') }}</button>
          <button type="button" :disabled="castBusy || !selectedTargetIds.length" class="rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-admin-accent-fg hover:bg-admin-accent-hover disabled:opacity-50" @click="startCast">
            {{ castBusy ? $t('admin.simulcast.starting') : $t('admin.simulcast.goLiveOnSocial') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Manage destinations -->
    <div v-if="showTargets" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" @click.self="showTargets = false">
      <div class="w-full max-w-xl rounded-2xl border border-admin-line/10 bg-admin-surface p-6">
        <h3 class="text-lg font-semibold text-admin-fg">{{ $t('admin.simulcast.manageTitle') }}</h3>
        <p class="mt-1 text-sm text-admin-subtle">{{ $t('admin.simulcast.manageHelp') }}</p>

        <div class="mt-4 max-h-52 space-y-2 overflow-y-auto">
          <div v-for="tg in targets" :key="tg.id" class="flex items-center gap-3 rounded-lg border border-admin-line/15 px-3 py-2">
            <span class="flex-1">
              <span class="text-sm font-medium text-admin-fg">{{ tg.label }}</span>
              <span class="ml-2 rounded-full bg-admin-line/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-admin-subtle">{{ tg.platform }}</span>
              <span v-if="!tg.enabled" class="ml-2 text-[11px] text-admin-faint">{{ $t('admin.simulcast.disabled') }}</span>
              <span class="block truncate text-xs text-admin-faint">{{ tg.rtmpUrl }}</span>
            </span>
            <button type="button" class="text-xs text-admin-subtle hover:text-admin-fg" @click="editTarget(tg)">{{ $t('common.edit') }}</button>
            <button type="button" class="text-xs text-admin-danger hover:underline" @click="removeTarget(tg)">{{ $t('common.delete') }}</button>
          </div>
        </div>

        <form class="mt-4 space-y-3 border-t border-admin-line/10 pt-4" @submit.prevent="saveTarget">
          <p class="text-xs font-semibold uppercase tracking-wide text-admin-faint">{{ editingId ? $t('admin.simulcast.editDest') : $t('admin.simulcast.addDest') }}</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select v-model="form.platform" class="rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-sm text-admin-fg">
              <option value="YOUTUBE">YouTube</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="TIKTOK">TikTok</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="CUSTOM">{{ $t('admin.simulcast.custom') }}</option>
            </select>
            <input v-model="form.label" :placeholder="$t('admin.simulcast.labelPh')" class="rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-sm text-admin-fg" />
          </div>
          <input v-model="form.rtmpUrl" placeholder="rtmp://a.rtmp.youtube.com/live2" class="w-full rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-sm text-admin-fg" />
          <input v-model="form.streamKey" :placeholder="editingId ? $t('admin.simulcast.keyKeep') : $t('admin.simulcast.keyPh')" class="w-full rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-sm text-admin-fg" />
          <label class="flex items-center gap-2 text-sm text-admin-muted">
            <input type="checkbox" v-model="form.enabled" class="h-4 w-4 accent-primary-500" /> {{ $t('admin.simulcast.enabled') }}
          </label>
          <p v-if="targetError" class="text-sm text-admin-danger">{{ targetError }}</p>
          <div class="flex justify-between">
            <button v-if="editingId" type="button" class="text-sm text-admin-subtle hover:text-admin-fg" @click="resetForm">{{ $t('common.cancel') }}</button>
            <span v-else />
            <button type="submit" :disabled="targetBusy" class="rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-admin-accent-fg hover:bg-admin-accent-hover disabled:opacity-50">
              {{ editingId ? $t('common.save') : $t('admin.simulcast.addDest') }}
            </button>
          </div>
        </form>

        <div class="mt-5 flex justify-end">
          <button type="button" class="rounded-lg border border-admin-line/20 px-4 py-2 text-sm text-admin-subtle hover:text-admin-fg" @click="showTargets = false">{{ $t('common.close') }}</button>
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

const { t } = useI18n()
const items = ref([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('')
const busyId = ref('')
const ingress = ref(null)

// Simulcast
const targets = ref([])
const showTargets = ref(false)
const simulcastFor = ref(null)
const selectedTargetIds = ref([])
const castBusy = ref(false)
const modalError = ref('')
const targetBusy = ref(false)
const targetError = ref('')
const editingId = ref('')
const form = ref({ platform: 'YOUTUBE', label: '', rtmpUrl: '', streamKey: '', enabled: true })
const enabledTargets = computed(() => targets.value.filter((tg) => tg.enabled))

function selectAll(e) {
  e.target.select()
}

async function loadTargets() {
  try {
    targets.value = await adminApi.listSimulcastTargets()
  } catch {
    targets.value = []
  }
}

function openTargets() {
  resetForm()
  showTargets.value = true
  loadTargets()
}

function openSimulcast(item) {
  modalError.value = ''
  selectedTargetIds.value = []
  simulcastFor.value = item
  loadTargets().then(() => {
    selectedTargetIds.value = enabledTargets.value.filter((tg) => tg.hasKey).map((tg) => tg.id)
  })
}

async function startCast() {
  if (!simulcastFor.value) return
  castBusy.value = true
  modalError.value = ''
  try {
    await adminApi.startSimulcast(simulcastFor.value.id, selectedTargetIds.value)
    simulcastFor.value = null
    await load()
  } catch (e) {
    modalError.value = e?.response?.data?.message || e?.message || t('admin.simulcast.startError')
  } finally {
    castBusy.value = false
  }
}

async function stopCast(item) {
  busyId.value = item.id
  try {
    await adminApi.stopSimulcast(item.id)
    await load()
  } finally {
    busyId.value = ''
  }
}

function resetForm() {
  editingId.value = ''
  form.value = { platform: 'YOUTUBE', label: '', rtmpUrl: '', streamKey: '', enabled: true }
  targetError.value = ''
}

function editTarget(tg) {
  editingId.value = tg.id
  form.value = { platform: tg.platform, label: tg.label, rtmpUrl: tg.rtmpUrl, streamKey: '', enabled: tg.enabled }
}

async function saveTarget() {
  targetBusy.value = true
  targetError.value = ''
  try {
    const payload = { ...form.value }
    if (editingId.value) await adminApi.updateSimulcastTarget(editingId.value, payload)
    else await adminApi.createSimulcastTarget(payload)
    resetForm()
    await loadTargets()
  } catch (e) {
    targetError.value = e?.response?.data?.message || e?.message || t('admin.simulcast.saveError')
  } finally {
    targetBusy.value = false
  }
}

async function removeTarget(tg) {
  if (!window.confirm(t('admin.simulcast.confirmDelete'))) return
  await adminApi.deleteSimulcastTarget(tg.id)
  await loadTargets()
}

async function camera(item) {
  busyId.value = item.id
  try {
    ingress.value = await adminApi.createLiveIngress(item.id, 'RTMP')
    await load()
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || t('admin.liveBroadcasts.loadError')
  } finally {
    busyId.value = ''
  }
}

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
