<template>
  <AdminLayout>
    <div class="max-w-2xl space-y-8">
      <div>
        <h1 class="text-3xl font-bold text-white">{{ $t('admin.displaySettings.title') }}</h1>
        <p class="mt-2 text-sm text-gray-400">{{ $t('admin.displaySettings.subtitle') }}</p>
      </div>

      <div
        v-if="error"
        class="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
      >
        {{ error }}
      </div>

      <form class="space-y-6 rounded-xl border border-white/10 bg-zinc-900 p-6" @submit.prevent="save">
        <div>
          <label class="block text-sm font-medium text-gray-300" for="sponsor-carousel">
            {{ $t('admin.displaySettings.sponsorCarousel') }}
          </label>
          <p class="mt-1 text-xs text-gray-500">{{ $t('admin.displaySettings.sponsorCarouselHint') }}</p>
          <input
            id="sponsor-carousel"
            v-model.number="form.sponsorCarouselSec"
            type="number"
            min="3"
            max="300"
            step="1"
            required
            class="mt-2 w-full max-w-xs rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <span class="ml-2 text-sm text-gray-400">{{ $t('admin.displaySettings.seconds') }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300" for="sidebar-media">
            {{ $t('admin.displaySettings.sidebarMedia') }}
          </label>
          <p class="mt-1 text-xs text-gray-500">{{ $t('admin.displaySettings.sidebarMediaHint') }}</p>
          <input
            id="sidebar-media"
            v-model.number="form.sidebarMediaSec"
            type="number"
            min="3"
            max="300"
            step="1"
            required
            class="mt-2 w-full max-w-xs rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <span class="ml-2 text-sm text-gray-400">{{ $t('admin.displaySettings.seconds') }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300" for="sidebar-layout">
            {{ $t('admin.displaySettings.sidebarLayout') }}
          </label>
          <p class="mt-1 text-xs text-gray-500">{{ $t('admin.displaySettings.sidebarLayoutHint') }}</p>
          <input
            id="sidebar-layout"
            v-model.number="form.sidebarLayoutSec"
            type="number"
            min="5"
            max="600"
            step="1"
            required
            class="mt-2 w-full max-w-xs rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <span class="ml-2 text-sm text-gray-400">{{ $t('admin.displaySettings.seconds') }}</span>
        </div>

        <div class="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            :disabled="saving || loading"
            class="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-400 disabled:opacity-50 disabled:bg-white/50"
          >
            {{ saving ? $t('admin.displaySettings.saving') : $t('admin.displaySettings.save') }}
          </button>
          <span v-if="saved" class="text-sm text-green-400">{{ $t('admin.displaySettings.saved') }}</span>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '../components/AdminLayout.vue'
import { adminApi } from '../api/admin.api'
import { mergeDisplaySettings } from '@/shared/composables/useDisplaySettings'

const { t } = useI18n()
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const error = ref('')

const form = reactive({
  sponsorCarouselSec: 10,
  sidebarMediaSec: 12,
  sidebarLayoutSec: 35
})

function clamp(n, min, max) {
  const x = Number(n)
  if (Number.isNaN(x)) return min
  return Math.min(max, Math.max(min, x))
}

onMounted(async () => {
  error.value = ''
  try {
    const d = await adminApi.getDisplaySettings()
    form.sponsorCarouselSec = d.sponsorCarouselAutoplayMs / 1000
    form.sidebarMediaSec = d.sidebarMediaRotationMs / 1000
    form.sidebarLayoutSec = d.sidebarLayoutRotationMs / 1000
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || t('admin.displaySettings.loadError')
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  saved.value = false
  error.value = ''
  const body = {
    sponsorCarouselAutoplayMs: Math.round(clamp(form.sponsorCarouselSec, 3, 300) * 1000),
    sidebarMediaRotationMs: Math.round(clamp(form.sidebarMediaSec, 3, 300) * 1000),
    sidebarLayoutRotationMs: Math.round(clamp(form.sidebarLayoutSec, 5, 600) * 1000)
  }
  try {
    const updated = await adminApi.updateDisplaySettings(body)
    mergeDisplaySettings(updated)
    form.sponsorCarouselSec = updated.sponsorCarouselAutoplayMs / 1000
    form.sidebarMediaSec = updated.sidebarMediaRotationMs / 1000
    form.sidebarLayoutSec = updated.sidebarLayoutRotationMs / 1000
    saved.value = true
    setTimeout(() => {
      saved.value = false
    }, 4000)
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || t('admin.displaySettings.saveError')
  } finally {
    saving.value = false
  }
}
</script>
