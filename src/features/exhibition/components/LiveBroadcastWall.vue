<template>
  <section v-if="visible && broadcasts.length" id="live-wall" class="scroll-mt-20 bg-violet-50 py-12 lg:py-16">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">{{ $t('exhibition.liveWall.eyebrow') }}</p>
          <h2 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{{ $t('exhibition.liveWall.title') }}</h2>
        </div>
        <RouterLink to="/go-live" class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
          <span class="material-icons !text-[18px]" aria-hidden="true">videocam</span>
          {{ $t('exhibition.liveWall.goLive') }}
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="b in broadcasts"
          :key="b.id"
          type="button"
          class="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          @click="watch(b)"
        >
          <div class="relative flex aspect-video w-full items-center justify-center bg-gray-900">
            <span class="material-icons !text-5xl text-white/70 transition group-hover:text-white" aria-hidden="true">play_circle</span>
            <span class="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              <span class="h-1 w-1 rounded-full bg-white motion-safe:animate-pulse" /> {{ $t('exhibition.liveStream.badge') }}
            </span>
          </div>
          <div class="p-3">
            <p class="line-clamp-1 text-sm font-semibold text-gray-900">{{ b.title }}</p>
            <p class="mt-0.5 text-xs text-gray-500">{{ b.broadcasterName }}{{ b.companyName ? `, ${b.companyName}` : '' }}</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Viewer modal -->
    <Teleport to="body">
      <div v-if="active" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" @click.self="closeViewer">
        <div class="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black">
          <button type="button" class="absolute right-2 top-2 z-10 rounded-lg bg-white/90 p-2 text-gray-900 hover:bg-white" :aria-label="$t('common.close')" @click="closeViewer">
            <span class="material-icons !text-[20px]">close</span>
          </button>
          <div class="aspect-video w-full">
            <video ref="viewerVideo" class="h-full w-full bg-black" controls autoplay playsinline />
          </div>
          <p v-if="viewerError" class="p-3 text-sm text-red-300">{{ viewerError }}</p>
          <div class="flex items-center gap-2 p-3">
            <span class="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              <span class="h-1 w-1 rounded-full bg-white motion-safe:animate-pulse" /> {{ $t('exhibition.liveStream.badge') }}
            </span>
            <span class="text-sm font-medium text-white">{{ active.title }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { Room, RoomEvent } from 'livekit-client'
import Hls from 'hls.js'
import { useDisplaySettings } from '@/shared/composables/useDisplaySettings'
import { exhibitionApi } from '@/features/exhibition/api/exhibition.api'
import { mediaUrl } from '@/shared/api/client'

const { settings } = useDisplaySettings()
const visible = computed(() => settings.exhibitionLiveVisible === true)

const broadcasts = ref([])
const active = ref(null)
const viewerVideo = ref(null)
const viewerError = ref('')
let refreshTimer = null
let room = null
let hls = null

async function refresh() {
  try {
    broadcasts.value = await exhibitionApi.listLiveBroadcasts()
  } catch {
    /* leave as-is */
  }
}

async function watch(b) {
  active.value = b
  viewerError.value = ''
  await nextTick()
  try {
    // Prefer HLS (scales, plays anywhere) when egress has published one.
    if (b.hlsUrl) {
      const src = mediaUrl(b.hlsUrl)
      if (viewerVideo.value.canPlayType('application/vnd.apple.mpegurl')) {
        viewerVideo.value.src = src
      } else if (Hls.isSupported()) {
        hls = new Hls()
        hls.loadSource(src)
        hls.attachMedia(viewerVideo.value)
      }
      return
    }
    // Otherwise subscribe over WebRTC.
    const { url, token } = await exhibitionApi.getViewerToken(b.id)
    room = new Room()
    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === 'video' && viewerVideo.value) track.attach(viewerVideo.value)
    })
    await room.connect(url, token)
  } catch (e) {
    viewerError.value = e?.response?.data?.message || e?.message || 'Could not open the live stream.'
  }
}

async function closeViewer() {
  if (hls) {
    hls.destroy()
    hls = null
  }
  if (room) {
    try {
      await room.disconnect()
    } catch {
      /* ignore */
    }
    room = null
  }
  active.value = null
}

onMounted(() => {
  if (!visible.value) return
  refresh()
  refreshTimer = setInterval(refresh, 15000)
})
onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  closeViewer()
})
</script>
