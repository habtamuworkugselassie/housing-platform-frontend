<template>
  <section v-if="visible" id="live" class="scroll-mt-20 bg-violet-50 py-12 lg:py-16">
    <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div class="mb-5 flex flex-wrap items-center gap-3">
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" aria-hidden="true" />
          {{ $t('exhibition.liveStream.badge') }}
        </span>
        <h2 class="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{{ title }}</h2>
      </div>

      <div class="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm">
        <div class="relative w-full" style="aspect-ratio: 16 / 9">
          <iframe
            v-if="embedUrl"
            :src="embedUrl"
            :title="title"
            class="absolute inset-0 h-full w-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          />
          <video
            v-else-if="hlsUrl"
            :src="hlsUrl"
            class="absolute inset-0 h-full w-full bg-black"
            controls
            autoplay
            muted
            playsinline
          />
          <div v-else class="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-gray-300">
            {{ $t('exhibition.liveStream.notConfigured') }}
          </div>
        </div>
      </div>

      <div v-if="watchLinks.length" class="mt-4 flex flex-wrap items-center gap-2">
        <span class="text-sm text-gray-500">{{ $t('exhibition.liveStream.watchOn') }}</span>
        <a
          v-for="link in watchLinks"
          :key="link.key"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="link.label"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary-400 hover:text-primary-600"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path :d="link.path" />
          </svg>
          {{ link.label }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplaySettings } from '@/shared/composables/useDisplaySettings'
import { toEmbedUrl, normalizeExternalUrl } from '@/shared/utils/urls'
import { SOCIAL_ICONS } from '@/shared/components/socialIcons'

/**
 * "Live now" broadcast zone for the exhibition landing. Shown only while an
 * admin has enabled it in Display Settings. Renders an external embed
 * (YouTube / Facebook Live) or, when the source is HLS, a native <video> for
 * the self-hosted stream (Phase 3 will add hls.js for non-Safari browsers).
 * Below the player, "watch on" buttons link to the configured social channels.
 */
const { settings } = useDisplaySettings()
const { t } = useI18n()

const visible = computed(() => settings.exhibitionLiveVisible === true)
const title = computed(() => (settings.liveTitle || '').trim() || t('exhibition.liveStream.defaultTitle'))
const embedUrl = computed(() =>
  settings.liveSourceType !== 'HLS' ? toEmbedUrl(settings.liveEmbedUrl) : ''
)
const hlsUrl = computed(() =>
  settings.liveSourceType === 'HLS' ? normalizeExternalUrl(settings.liveHlsUrl) : ''
)

const watchLinks = computed(() => {
  const entries = [
    ['youtube', settings.liveYoutubeUrl],
    ['tiktok', settings.liveTiktokUrl],
    ['facebook', settings.liveFacebookUrl]
  ]
  return entries
    .map(([key, url]) => ({ key, href: normalizeExternalUrl(url), ...SOCIAL_ICONS[key] }))
    .filter((l) => l.href)
})
</script>
