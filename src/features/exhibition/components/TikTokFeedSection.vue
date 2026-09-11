<template>
  <section id="tiktok" class="py-16 lg:py-24 bg-violet-50 scroll-mt-24">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 mb-2 text-center">
        {{ t('exhibition.tiktok.eyebrow') }}
      </p>
      <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3 text-center">
        {{ t('exhibition.tiktok.title') }}
      </h2>
      <p class="text-gray-600 text-center mb-8">{{ t('exhibition.tiktok.subtitle') }}</p>

      <!-- The facade. Nothing has been fetched from TikTok at this point: the visitor sees a
           local placeholder, and the embed is only reached once they have accepted cookies or
           pressed the button below. The site's cookie policy says no third party is contacted
           before you choose, and an embed that loaded on arrival would make that untrue. -->
      <div
        v-if="state === 'idle'"
        class="rounded-2xl border border-violet-200 bg-white px-6 py-10 text-center shadow-sm"
      >
        <span class="material-icons !text-[40px] leading-none text-primary-600" aria-hidden="true">
          play_circle
        </span>
        <p class="mt-3 text-base font-semibold text-gray-900">{{ TIKTOK_HANDLE }}</p>
        <p class="mx-auto mt-2 max-w-sm text-sm text-gray-600">
          {{ t('exhibition.tiktok.privacyNote') }}
        </p>
        <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            @click="load"
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

      <p v-else-if="state === 'loading'" class="py-10 text-center text-sm text-gray-600">
        {{ t('exhibition.tiktok.loading') }}
      </p>

      <p v-else-if="state === 'failed'" class="py-10 text-center text-sm text-gray-600">
        {{ t('exhibition.tiktok.unavailable') }}
      </p>

      <!-- TikTok's script replaces the blockquote inside here with its own iframe, so this
           element is filled imperatively and never re-rendered: handing the same node to both
           Vue and a third-party script is how embeds end up blank after a locale switch. -->
      <div v-show="state === 'loaded'" ref="mount" class="flex justify-center" />

      <p v-if="state !== 'idle'" class="mt-4 text-center text-sm">
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

/**
 * The account, and the markup TikTok's own oEmbed endpoint returns for it.
 *
 * `data-embed-type="creator"` is the profile embed rather than the single-video one: it shows
 * the account's latest posts and follows along as more are published, so nobody has to come
 * back and paste a video id every time something is posted.
 */
const TIKTOK_HANDLE = '@ethiobuildconnect'
const TIKTOK_PROFILE_URL = 'https://www.tiktok.com/@ethiobuildconnect'
const TIKTOK_EMBED_SRC = 'https://www.tiktok.com/embed.js'

const { t } = useI18n()

/** How long to wait for TikTok before giving up on it. */
const LOAD_TIMEOUT_MS = 8000

const state = ref('idle')
const mount = ref(null)
let observer
let stopListening
let timeout

/** First outcome wins, so a late `onload` cannot revive a section that already gave up. */
function settle(outcome) {
  if (state.value !== 'loading') return
  window.clearTimeout(timeout)
  state.value = outcome
}

/**
 * Hand the section over to TikTok.
 *
 * Deliberately the only path that touches tiktok.com — nothing above fetches, preconnects or
 * prefetches — so "no third party before you choose" is a property of the code rather than an
 * intention.
 */
function load() {
  if (state.value !== 'idle' || !mount.value) return
  state.value = 'loading'

  const blockquote = document.createElement('blockquote')
  blockquote.className = 'tiktok-embed'
  blockquote.setAttribute('cite', TIKTOK_PROFILE_URL)
  blockquote.setAttribute('data-unique-id', TIKTOK_HANDLE.slice(1))
  blockquote.setAttribute('data-embed-type', 'creator')
  blockquote.style.maxWidth = '780px'
  blockquote.style.minWidth = '288px'
  const link = document.createElement('a')
  link.href = `${TIKTOK_PROFILE_URL}?refer=creator_embed`
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  link.textContent = TIKTOK_HANDLE
  blockquote.appendChild(link)
  mount.value.appendChild(blockquote)

  const script = document.createElement('script')
  script.src = TIKTOK_EMBED_SRC
  script.async = true
  script.onload = () => {
    settle('loaded')
  }
  script.onerror = () => {
    settle('failed')
  }
  document.body.appendChild(script)

  // `onerror` is not enough on its own. Where TikTok is blocked rather than refused — a
  // corporate network, a country that filters it, a captive portal — the request hangs open
  // and neither handler ever runs, which left the section saying "loading videos" for as long
  // as the page stayed up. After this it says so plainly and offers the profile link instead.
  timeout = window.setTimeout(() => settle('failed'), LOAD_TIMEOUT_MS)
}

onMounted(() => {
  // Even for a visitor who has accepted, the script is not fetched until the section is near
  // the viewport: it is well down the page, and it should not compete with the hero.
  const startWhenVisible = () => {
    if (!mount.value || observer) return
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect()
          observer = undefined
          load()
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(mount.value.parentElement ?? mount.value)
  }

  if (analyticsAllowed()) startWhenVisible()

  // Accepting later should not require a reload to see the videos.
  stopListening = onConsentChange(() => {
    if (analyticsAllowed()) startWhenVisible()
  })
})

onUnmounted(() => {
  observer?.disconnect()
  stopListening?.()
  window.clearTimeout(timeout)
})
</script>
