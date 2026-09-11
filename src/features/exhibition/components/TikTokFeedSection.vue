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
      <div v-else>
        <div class="grid justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <iframe
            v-for="id in visibleIds"
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

        <!-- Only a page of players exists at a time: each is a third-party iframe pulling a
             video, and eight of them at once would be a lot to ask of a phone on mobile data.
             The controls are how the rest are reached. -->
        <div v-if="pageCount > 1" class="mt-8 flex flex-col items-center gap-4">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-200 bg-white text-primary-700 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="page === 0"
              :aria-label="t('exhibition.tiktok.previous')"
              @click="go(page - 1)"
            >
              <span class="material-icons !text-[22px] leading-none" aria-hidden="true">chevron_left</span>
            </button>

            <p class="min-w-[7rem] text-center text-sm font-medium text-gray-700" aria-live="polite">
              {{ t('exhibition.tiktok.position', { range: rangeLabel, total: allIds.length }) }}
            </p>

            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-200 bg-white text-primary-700 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="page >= pageCount - 1"
              :aria-label="t('exhibition.tiktok.next')"
              @click="go(page + 1)"
            >
              <span class="material-icons !text-[22px] leading-none" aria-hidden="true">chevron_right</span>
            </button>
          </div>

          <!-- Jumping straight to a video, rather than only stepping one at a time. -->
          <div class="flex flex-wrap items-center justify-center gap-2">
            <button
              v-for="(id, i) in allIds"
              :key="id"
              type="button"
              class="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
              :class="visibleIds.includes(id)
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 ring-1 ring-violet-200 hover:bg-primary-50'"
              :aria-current="visibleIds.includes(id) ? 'true' : undefined"
              @click="go(Math.floor(i / pageSize))"
            >
              {{ postedOn(id) }}
            </button>
          </div>
        </div>
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { analyticsAllowed, onConsentChange } from '@/utils/cookieConsent'
import {
  TIKTOK_HANDLE,
  TIKTOK_PROFILE_URL,
  embedUrl,
  latestVideoIds,
  formatPostedOn
} from '@/features/exhibition/tiktokVideos'

/** Three across on a wide screen; one on a phone, where each player is most of a screenful. */
const WIDE = '(min-width: 640px)'

const { t, locale } = useI18n()

/** Dates follow the chosen language, so they re-read when it changes. */
const postedOn = (id) => formatPostedOn(id, locale.value)

const shown = ref(false)
const allIds = ref([])
const pageSize = ref(1)
const page = ref(0)
const root = ref(null)
let observer
let stopListening
let wide

const pageCount = computed(() => Math.max(1, Math.ceil(allIds.value.length / pageSize.value)))

const visibleIds = computed(() =>
  allIds.value.slice(page.value * pageSize.value, page.value * pageSize.value + pageSize.value)
)

/** "1" on a phone, "1–3" where three are side by side. */
const rangeLabel = computed(() => {
  const first = page.value * pageSize.value + 1
  const last = Math.min(first + pageSize.value - 1, allIds.value.length)
  return first === last ? `${first}` : `${first}\u2013${last}`
})

function go(next) {
  page.value = Math.min(Math.max(next, 0), pageCount.value - 1)
}

/**
 * How many players fit is a property of the screen, not of the moment the section opened:
 * turning a phone sideways should re-lay them out rather than leave one in a three-wide grid.
 */
function applyWidth() {
  const firstVisible = page.value * pageSize.value
  pageSize.value = wide?.matches ? 3 : 1
  // Keep whatever was on screen on screen, rather than jumping back to the newest post.
  go(Math.floor(firstVisible / pageSize.value))
}

/**
 * Hand the section over to TikTok.
 *
 * Deliberately the only path that reaches tiktok.com — nothing above fetches, preconnects or
 * prefetches — so "no third party before you choose" is a property of the code rather than an
 * intention.
 */
function show() {
  if (shown.value) return
  allIds.value = latestVideoIds(Infinity)
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

  // How many fit is a property of the screen, not of the moment the section opened: turning a
  // phone sideways should re-lay the players out rather than leave one in a three-wide grid.
  wide = window.matchMedia(WIDE)
  applyWidth()
  wide.addEventListener('change', applyWidth)

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
  wide?.removeEventListener('change', applyWidth)
})
</script>
