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
  exhibitionSponsorshipPackagePricesVisible: true
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
    )
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
