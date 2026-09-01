<template>
  <AdminLayout>
    <div class="max-w-2xl space-y-8">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-admin-fg">{{ $t('admin.displaySettings.title') }}</h1>
        <p class="mt-2 text-sm text-admin-subtle">{{ $t('admin.displaySettings.subtitle') }}</p>
      </div>

      <div
        v-if="error"
        class="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-admin-danger"
      >
        {{ error }}
      </div>

      <form class="space-y-6 rounded-xl border border-admin-line/10 bg-admin-surface p-6" @submit.prevent="save">
        <div>
          <label class="block text-sm font-medium text-admin-muted" for="sponsor-carousel">
            {{ $t('admin.displaySettings.sponsorCarousel') }}
          </label>
          <p class="mt-1 text-xs text-admin-faint">{{ $t('admin.displaySettings.sponsorCarouselHint') }}</p>
          <input
            id="sponsor-carousel"
            v-model.number="form.sponsorCarouselSec"
            type="number"
            min="3"
            max="300"
            step="1"
            required
            class="mt-2 w-full max-w-xs rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-admin-fg placeholder-admin-subtle focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <span class="ml-2 text-sm text-admin-subtle">{{ $t('admin.displaySettings.seconds') }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-admin-muted" for="sidebar-media">
            {{ $t('admin.displaySettings.sidebarMedia') }}
          </label>
          <p class="mt-1 text-xs text-admin-faint">{{ $t('admin.displaySettings.sidebarMediaHint') }}</p>
          <input
            id="sidebar-media"
            v-model.number="form.sidebarMediaSec"
            type="number"
            min="3"
            max="300"
            step="1"
            required
            class="mt-2 w-full max-w-xs rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-admin-fg placeholder-admin-subtle focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <span class="ml-2 text-sm text-admin-subtle">{{ $t('admin.displaySettings.seconds') }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-admin-muted" for="sidebar-layout">
            {{ $t('admin.displaySettings.sidebarLayout') }}
          </label>
          <p class="mt-1 text-xs text-admin-faint">{{ $t('admin.displaySettings.sidebarLayoutHint') }}</p>
          <input
            id="sidebar-layout"
            v-model.number="form.sidebarLayoutSec"
            type="number"
            min="5"
            max="600"
            step="1"
            required
            class="mt-2 w-full max-w-xs rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-admin-fg placeholder-admin-subtle focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <span class="ml-2 text-sm text-admin-subtle">{{ $t('admin.displaySettings.seconds') }}</span>
        </div>

        <div class="space-y-4 rounded-lg border border-admin-line/10 bg-admin-field/5 px-4 py-4">
          <div class="flex cursor-pointer items-start gap-3">
            <input
              id="exhibition-sponsorship-packages"
              v-model="form.exhibitionSponsorshipPackagesVisible"
              type="checkbox"
              class="mt-1 h-4 w-4 shrink-0 rounded border-admin-line/30 bg-admin-surface text-admin-fg focus:ring-primary-400"
            />
            <label for="exhibition-sponsorship-packages" class="min-w-0 cursor-pointer">
              <span class="block text-sm font-medium text-admin-muted">
                {{ $t('admin.displaySettings.exhibitionSponsorshipPackages') }}
              </span>
              <span class="mt-1 block text-xs text-admin-faint">
                {{ $t('admin.displaySettings.exhibitionSponsorshipPackagesHint') }}
              </span>
            </label>
          </div>
          <div class="flex cursor-pointer items-start gap-3 sm:pl-7">
            <input
              id="exhibition-sponsorship-package-prices"
              v-model="form.exhibitionSponsorshipPackagePricesVisible"
              type="checkbox"
              class="mt-1 h-4 w-4 shrink-0 rounded border-admin-line/30 bg-admin-surface text-admin-fg focus:ring-primary-400"
            />
            <label for="exhibition-sponsorship-package-prices" class="min-w-0 cursor-pointer">
              <span class="block text-sm font-medium text-admin-muted">
                {{ $t('admin.displaySettings.exhibitionSponsorshipPackagePrices') }}
              </span>
              <span class="mt-1 block text-xs text-admin-faint">
                {{ $t('admin.displaySettings.exhibitionSponsorshipPackagePricesHint') }}
              </span>
            </label>
          </div>
        </div>

        <!-- Live broadcast -->
        <div class="space-y-4 rounded-lg border border-admin-line/10 bg-admin-field/5 px-4 py-4">
          <div class="flex cursor-pointer items-start gap-3">
            <input
              id="exhibition-live-visible"
              v-model="form.exhibitionLiveVisible"
              type="checkbox"
              class="mt-1 h-4 w-4 shrink-0 rounded border-admin-line/30 bg-admin-surface text-admin-fg focus:ring-primary-400"
            />
            <label for="exhibition-live-visible" class="min-w-0 cursor-pointer">
              <span class="block text-sm font-medium text-admin-muted">
                {{ $t('admin.displaySettings.exhibitionLive') }}
              </span>
              <span class="mt-1 block text-xs text-admin-faint">
                {{ $t('admin.displaySettings.exhibitionLiveHint') }}
              </span>
            </label>
          </div>

          <label class="flex cursor-pointer items-start gap-3">
            <input
              id="exhibition-auto-simulcast"
              v-model="form.exhibitionLiveAutoSimulcast"
              type="checkbox"
              class="mt-1 h-4 w-4 shrink-0 rounded border-admin-line/30 bg-admin-surface text-admin-fg focus:ring-primary-400"
            />
            <span class="min-w-0">
              <span class="block text-sm font-medium text-admin-muted">
                {{ $t('admin.displaySettings.autoSimulcast') }}
              </span>
              <span class="mt-1 block text-xs text-admin-faint">
                {{ $t('admin.displaySettings.autoSimulcastHint') }}
              </span>
            </span>
          </label>

          <div v-if="form.exhibitionLiveVisible" class="space-y-4 sm:pl-7">
            <div>
              <label class="block text-sm font-medium text-admin-muted" for="live-title">
                {{ $t('admin.displaySettings.liveTitle') }}
              </label>
              <input
                id="live-title"
                v-model="form.liveTitle"
                type="text"
                :placeholder="$t('admin.displaySettings.liveTitlePlaceholder')"
                class="mt-2 w-full rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-admin-fg placeholder-admin-subtle focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-admin-muted" for="live-source">
                {{ $t('admin.displaySettings.liveSource') }}
              </label>
              <select
                id="live-source"
                v-model="form.liveSourceType"
                class="mt-2 w-full max-w-xs rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-admin-fg focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="EXTERNAL_EMBED">{{ $t('admin.displaySettings.liveSourceExternal') }}</option>
                <option value="HLS">{{ $t('admin.displaySettings.liveSourceHls') }}</option>
              </select>
            </div>
            <div v-if="form.liveSourceType !== 'HLS'">
              <label class="block text-sm font-medium text-admin-muted" for="live-embed">
                {{ $t('admin.displaySettings.liveEmbedUrl') }}
              </label>
              <p class="mt-1 text-xs text-admin-faint">{{ $t('admin.displaySettings.liveEmbedUrlHint') }}</p>
              <input
                id="live-embed"
                v-model="form.liveEmbedUrl"
                type="url"
                placeholder="https://www.youtube.com/watch?v=…"
                class="mt-2 w-full rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-admin-fg placeholder-admin-subtle focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div v-else>
              <label class="block text-sm font-medium text-admin-muted" for="live-hls">
                {{ $t('admin.displaySettings.liveHlsUrl') }}
              </label>
              <p class="mt-1 text-xs text-admin-faint">{{ $t('admin.displaySettings.liveHlsUrlHint') }}</p>
              <input
                id="live-hls"
                v-model="form.liveHlsUrl"
                type="url"
                placeholder="https://…/stream.m3u8"
                class="mt-2 w-full rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-admin-fg placeholder-admin-subtle focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div class="grid gap-4 sm:grid-cols-3">
              <div>
                <label class="block text-sm font-medium text-admin-muted" for="live-youtube">YouTube</label>
                <input id="live-youtube" v-model="form.liveYoutubeUrl" type="url" placeholder="https://youtube.com/@…" class="mt-2 w-full rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-admin-fg placeholder-admin-subtle focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-admin-muted" for="live-tiktok">TikTok</label>
                <input id="live-tiktok" v-model="form.liveTiktokUrl" type="url" placeholder="https://tiktok.com/@…" class="mt-2 w-full rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-admin-fg placeholder-admin-subtle focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-admin-muted" for="live-facebook">Facebook</label>
                <input id="live-facebook" v-model="form.liveFacebookUrl" type="url" placeholder="https://facebook.com/…" class="mt-2 w-full rounded-lg border border-admin-line/20 bg-admin-field/5 px-3 py-2 text-admin-fg placeholder-admin-subtle focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
            </div>
          </div>
        </div>

        <!-- Visitor video feedback -->
        <div class="space-y-4 rounded-lg border border-admin-line/10 bg-admin-field/5 px-4 py-4">
          <div class="flex cursor-pointer items-start gap-3">
            <input
              id="exhibition-feedback-visible"
              v-model="form.exhibitionFeedbackVisible"
              type="checkbox"
              class="mt-1 h-4 w-4 shrink-0 rounded border-admin-line/30 bg-admin-surface text-admin-fg focus:ring-primary-400"
            />
            <label for="exhibition-feedback-visible" class="min-w-0 cursor-pointer">
              <span class="block text-sm font-medium text-admin-muted">
                {{ $t('admin.displaySettings.exhibitionFeedback') }}
              </span>
              <span class="mt-1 block text-xs text-admin-faint">
                {{ $t('admin.displaySettings.exhibitionFeedbackHint') }}
              </span>
            </label>
          </div>
          <div v-if="form.exhibitionFeedbackVisible" class="flex cursor-pointer items-start gap-3 sm:pl-7">
            <input
              id="exhibition-feedback-autopublish"
              v-model="form.exhibitionFeedbackAutoPublish"
              type="checkbox"
              class="mt-1 h-4 w-4 shrink-0 rounded border-admin-line/30 bg-admin-surface text-admin-fg focus:ring-primary-400"
            />
            <label for="exhibition-feedback-autopublish" class="min-w-0 cursor-pointer">
              <span class="block text-sm font-medium text-admin-muted">
                {{ $t('admin.displaySettings.exhibitionFeedbackAutoPublish') }}
              </span>
              <span class="mt-1 block text-xs text-admin-faint">
                {{ $t('admin.displaySettings.exhibitionFeedbackAutoPublishHint') }}
              </span>
            </label>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            :disabled="saving || loading"
            class="rounded-lg bg-admin-accent px-5 py-2.5 text-sm font-semibold text-admin-accent-fg transition-colors hover:bg-admin-accent-hover disabled:opacity-50 disabled:bg-admin-field/50"
          >
            {{ saving ? $t('admin.displaySettings.saving') : $t('admin.displaySettings.save') }}
          </button>
          <span v-if="saved" class="text-sm text-admin-ok">{{ $t('admin.displaySettings.saved') }}</span>
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
import { coerceDisplayBool } from '@/shared/utils/displaySettingsBooleans'

const { t } = useI18n()
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const error = ref('')

const form = reactive({
  sponsorCarouselSec: 10,
  sidebarMediaSec: 12,
  sidebarLayoutSec: 35,
  exhibitionSponsorshipPackagesVisible: true,
  exhibitionSponsorshipPackagePricesVisible: true,
  exhibitionLiveVisible: false,
  liveSourceType: 'EXTERNAL_EMBED',
  liveEmbedUrl: '',
  liveHlsUrl: '',
  liveTitle: '',
  liveYoutubeUrl: '',
  liveTiktokUrl: '',
  liveFacebookUrl: '',
  exhibitionFeedbackVisible: false,
  exhibitionFeedbackAutoPublish: false,
  exhibitionLiveAutoSimulcast: false
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
    form.exhibitionSponsorshipPackagesVisible = coerceDisplayBool(
      d.exhibitionSponsorshipPackagesVisible,
      true
    )
    form.exhibitionSponsorshipPackagePricesVisible = coerceDisplayBool(
      d.exhibitionSponsorshipPackagePricesVisible,
      true
    )
    form.exhibitionLiveVisible = coerceDisplayBool(d.exhibitionLiveVisible, false)
    form.liveSourceType = d.liveSourceType === 'HLS' ? 'HLS' : 'EXTERNAL_EMBED'
    form.liveEmbedUrl = d.liveEmbedUrl || ''
    form.liveHlsUrl = d.liveHlsUrl || ''
    form.liveTitle = d.liveTitle || ''
    form.liveYoutubeUrl = d.liveYoutubeUrl || ''
    form.liveTiktokUrl = d.liveTiktokUrl || ''
    form.liveFacebookUrl = d.liveFacebookUrl || ''
    form.exhibitionFeedbackVisible = coerceDisplayBool(d.exhibitionFeedbackVisible, false)
    form.exhibitionFeedbackAutoPublish = coerceDisplayBool(d.exhibitionFeedbackAutoPublish, false)
    form.exhibitionLiveAutoSimulcast = coerceDisplayBool(d.exhibitionLiveAutoSimulcast, false)
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
  const intendedPackagesVisible = Boolean(form.exhibitionSponsorshipPackagesVisible)
  const intendedPricesVisible = Boolean(form.exhibitionSponsorshipPackagePricesVisible)
  const body = {
    sponsorCarouselAutoplayMs: Math.round(clamp(form.sponsorCarouselSec, 3, 300) * 1000),
    sidebarMediaRotationMs: Math.round(clamp(form.sidebarMediaSec, 3, 300) * 1000),
    sidebarLayoutRotationMs: Math.round(clamp(form.sidebarLayoutSec, 5, 600) * 1000),
    exhibitionSponsorshipPackagesVisible: Boolean(form.exhibitionSponsorshipPackagesVisible),
    exhibitionSponsorshipPackagePricesVisible: Boolean(
      form.exhibitionSponsorshipPackagePricesVisible
    ),
    exhibitionLiveVisible: Boolean(form.exhibitionLiveVisible),
    liveSourceType: form.liveSourceType === 'HLS' ? 'HLS' : 'EXTERNAL_EMBED',
    liveEmbedUrl: (form.liveEmbedUrl || '').trim(),
    liveHlsUrl: (form.liveHlsUrl || '').trim(),
    liveTitle: (form.liveTitle || '').trim(),
    liveYoutubeUrl: (form.liveYoutubeUrl || '').trim(),
    liveTiktokUrl: (form.liveTiktokUrl || '').trim(),
    liveFacebookUrl: (form.liveFacebookUrl || '').trim(),
    exhibitionFeedbackVisible: Boolean(form.exhibitionFeedbackVisible),
    exhibitionFeedbackAutoPublish: Boolean(form.exhibitionFeedbackAutoPublish),
    exhibitionLiveAutoSimulcast: Boolean(form.exhibitionLiveAutoSimulcast)
  }
  try {
    const updated = await adminApi.updateDisplaySettings(body)
    mergeDisplaySettings(updated)
    form.sponsorCarouselSec = updated.sponsorCarouselAutoplayMs / 1000
    form.sidebarMediaSec = updated.sidebarMediaRotationMs / 1000
    form.sidebarLayoutSec = updated.sidebarLayoutRotationMs / 1000
    form.exhibitionSponsorshipPackagesVisible = coerceDisplayBool(
      updated.exhibitionSponsorshipPackagesVisible,
      intendedPackagesVisible
    )
    form.exhibitionSponsorshipPackagePricesVisible = coerceDisplayBool(
      updated.exhibitionSponsorshipPackagePricesVisible,
      intendedPricesVisible
    )
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
