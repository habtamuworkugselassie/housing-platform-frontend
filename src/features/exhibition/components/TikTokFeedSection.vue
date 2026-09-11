<template>
  <section id="tiktok" class="py-16 lg:py-24 bg-violet-50 scroll-mt-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 mb-2 text-center">
        {{ t('exhibition.tiktok.eyebrow') }}
      </p>
      <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3 text-center">
        {{ t('exhibition.tiktok.title') }}
      </h2>
      <p class="text-gray-600 text-center mb-8">{{ t('exhibition.tiktok.subtitle') }}</p>

      <!-- The facade. Nothing has been fetched from TikTok at this point: the visitor sees a
           local placeholder, and a player is only created once they have accepted cookies or
           pressed the button below. The cookie policy says no third party is contacted before
           you choose, and a player that loaded on arrival would make that untrue. -->
      <div
        v-if="!shown"
        class="mx-auto max-w-xl rounded-2xl border border-violet-200 bg-white px-6 py-10 text-center shadow-sm"
      >
        <span class="material-icons !text-[40px] leading-none text-primary-600" aria-hidden="true">
          play_circle
        </span>
        <p class="mt-3 text-base font-semibold text-gray-900">@{{ TIKTOK_HANDLE }}</p>
        <p class="mx-auto mt-2 max-w-sm text-sm text-gray-600">
          {{ t('exhibition.tiktok.privacyNote') }}
        </p>
        <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            @click="show"
          >
            <span class="material-icons !text-[18px] leading-none" aria-hidden="true">smart_display</span>
            {{ t('exhibition.tiktok.loadButton') }}
          </button>
          <a
            :href="TIKTOK_PROFILE_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-700 underline-offset-4 hover:underline"
          >
            {{ t('exhibition.tiktok.openProfile') }}
            <span class="material-icons !text-[16px] leading-none" aria-hidden="true">open_in_new</span>
          </a>
        </div>
      </div>

      <!-- One player per post, each playing in the page. These are TikTok's own video embed,
           reached directly rather than through its embed.js: that script only styles a
           placeholder before pulling its real library off a US CDN, and when that second
           request does not arrive the section is left showing a bordered handle and no video,
           which is what happened on the live site. An iframe needs one request, to
           www.tiktok.com, and either renders or does not. -->
      <div v-else class="grid justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <iframe
          v-for="id in videos"
          :key="id"
          :src="embedUrl(id)"
          :title="t('exhibition.tiktok.playerTitle', { handle: `@${TIKTOK_HANDLE}` })"
          class="w-full rounded-xl bg-white shadow-sm"
          style="max-width: 340px; height: 750px; border: 0"
          loading="lazy"
          allow="encrypted-media; fullscreen; picture-in-picture"
          referrerpolicy="strict-origin-when-cross-origin"
        />
      </div>

      <p v-if="shown" class="mt-8 text-center text-sm">
        <a
          :href="TIKTOK_PROFILE_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold text-primary-700 underline-offset-4 hover:underline"
        >
          {{ t('exhibition.tiktok.openProfile') }}
        </a>
      </p>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { analyticsAllowed, onConsentChange } from '@/utils/cookieConsent'
import {
  TIKTOK_HANDLE,
  TIKTOK_PROFILE_URL,
  embedUrl,
  latestVideoIds
} from '@/features/exhibition/tiktokVideos'

/** Three across on a wide screen; one on a phone, where each player is most of a screenful. */
const WIDE = '(min-width: 640px)'

const { t } = useI18n()

const shown = ref(false)
const videos = ref([])
const root = ref(null)
let observer
let stopListening

/**
 * Hand the section over to TikTok.
 *
 * Deliberately the only path that reaches tiktok.com — nothing above fetches, preconnects or
 * prefetches — so "no third party before you choose" is a property of the code rather than an
 * intention.
 */
function show() {
  if (shown.value) return
  const wide = typeof window !== 'undefined' && window.matchMedia(WIDE).matches
  videos.value = latestVideoIds(wide ? 3 : 1)
  shown.value = true
}

onMounted(() => {
  // Even for a visitor who has accepted, nothing loads until the section is near the viewport:
  // it is well down the page and has no business competing with the hero.
  const showWhenVisible = () => {
    if (shown.value || observer || !root.value) return
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect()
          observer = undefined
          show()
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(root.value)
  }

  root.value = document.getElementById('tiktok')
  if (analyticsAllowed()) showWhenVisible()

  // Accepting later should not require a reload to see the videos.
  stopListening = onConsentChange(() => {
    if (analyticsAllowed()) showWhenVisible()
  })
})

onUnmounted(() => {
  observer?.disconnect()
  stopListening?.()
})
</script>
