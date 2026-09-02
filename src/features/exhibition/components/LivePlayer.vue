<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-black lg:flex-row">
    <!-- Video + overlays -->
    <div class="relative flex min-h-0 flex-1 items-center justify-center bg-black">
      <video ref="videoEl" class="h-full max-h-full w-full bg-black object-contain" autoplay playsinline :muted="muted" />

      <!-- Top bar: live badge + viewer count, share -->
      <div class="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            <span class="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" />
            {{ $t('exhibition.liveStream.badge') }}
          </span>
          <span class="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
            <span class="material-icons !text-[14px]">visibility</span>
            {{ viewerCount }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <!-- Viewer audio mute: local-only (mutes the <video> element), does not affect the stream. -->
          <button
            type="button"
            class="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur transition hover:bg-black/75"
            :aria-pressed="muted"
            :aria-label="muted ? $t('live.player.unmute') : $t('live.player.mute')"
            @click="toggleMute"
          >
            <span class="material-icons !text-[14px]">{{ muted ? 'volume_off' : 'volume_up' }}</span>
            {{ muted ? $t('live.player.unmute') : $t('live.player.mute') }}
          </button>
          <button
            type="button"
            class="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur transition hover:bg-black/75"
            @click="share"
          >
            <span class="material-icons !text-[14px]">{{ shared ? 'check' : 'share' }}</span>
            {{ shared ? $t('live.share.copied') : $t('live.share.button') }}
          </button>
        </div>
      </div>

      <!-- Title -->
      <div class="pointer-events-none absolute inset-x-0 bottom-16 px-3">
        <p class="line-clamp-1 text-sm font-semibold text-white drop-shadow">{{ broadcast.title }}</p>
        <p class="line-clamp-1 text-xs text-white/70 drop-shadow">
          {{ broadcast.broadcasterName }}{{ broadcast.companyName ? `, ${broadcast.companyName}` : '' }}
        </p>
      </div>

      <p
        v-if="error"
        class="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-lg bg-red-600/90 p-3 text-center text-sm text-white"
      >{{ error }}</p>

      <!-- Co-host tiles: extra remote publishers + this viewer's own camera when co-hosting. -->
      <div
        v-if="cohostTiles.length"
        class="pointer-events-none absolute bottom-24 right-3 flex max-w-[45%] flex-wrap justify-end gap-2"
      >
        <div
          v-for="tile in cohostTiles"
          :key="tile.id"
          class="pointer-events-auto h-24 w-40 overflow-hidden rounded-lg border border-white/20 bg-black shadow-lg"
        >
          <LiveVideoTile :track="tile.track" :label="tile.label" :muted="tile.local" />
        </div>
      </div>

      <!-- Join / leave co-host control -->
      <div class="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <button
          v-if="cohostState === 'idle'"
          type="button"
          class="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500"
          @click="askToCohost"
        >
          <span class="material-icons !text-[16px]">videocam</span>
          {{ $t('live.cohost.ask') }}
        </button>
        <div
          v-else-if="cohostState === 'requesting' || cohostState === 'pending'"
          class="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur"
        >
          <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {{ $t('live.cohost.waiting') }}
          <button type="button" class="ml-1 text-white/70 hover:text-white" @click="leaveCohost">
            {{ $t('common.cancel') }}
          </button>
        </div>
        <button
          v-else-if="cohostState === 'live'"
          type="button"
          class="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700"
          @click="leaveCohost"
        >
          <span class="material-icons !text-[16px]">call_end</span>
          {{ $t('live.cohost.leave') }}
        </button>
      </div>

      <LiveReactions :reactions="reactions" @react="sendReaction" />
    </div>

    <!-- Chat -->
    <div class="flex h-56 shrink-0 flex-col border-t border-white/10 lg:h-auto lg:w-80 lg:border-l lg:border-t-0">
      <LiveChatPanel :messages="messages" @send="sendChat" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { createLocalTracks } from 'livekit-client'
import { useLiveRoom } from '@/features/exhibition/composables/useLiveRoom'
import { exhibitionApi } from '@/features/exhibition/api/exhibition.api'
import { useAuthStore } from '@/features/auth'
import LiveChatPanel from './LiveChatPanel.vue'
import LiveReactions from './LiveReactions.vue'
import LiveVideoTile from './LiveVideoTile.vue'

const props = defineProps({
  broadcast: { type: Object, required: true },
})

const authStore = useAuthStore()
const {
  connected,
  viewerCount,
  messages,
  reactions,
  remoteVideos,
  error,
  connect,
  disconnect,
  publishTracks,
  setAudioMuted,
  sendChat,
  sendReaction,
} = useLiveRoom()

const videoEl = ref(null)
const shared = ref(false)
// Local playback mute of the room audio (does not touch the published stream).
const muted = ref(false)
let primaryAttached = false

// Co-host state: a viewer can ask to publish into the room; once approved they join
// as a publisher and their own tiles appear alongside the broadcaster.
const cohostState = ref('idle') // idle | requesting | pending | live | error
const localTiles = ref([]) // { id, track } for this co-host's own camera
let cohostRequestId = ''
let cohostPollTimer = null
let cohostTracks = []

function toggleMute() {
  muted.value = !muted.value
  setAudioMuted(muted.value)
  const el = videoEl.value
  if (el) el.muted = muted.value
}

// Tiles shown as thumbnails: every remote publisher after the primary (broadcaster,
// shown big) plus this viewer's own camera while co-hosting.
const cohostTiles = computed(() => [
  ...remoteVideos.value.slice(1).map((t) => ({ id: t.id, track: t.track, label: t.name, local: false })),
  ...localTiles.value.map((t) => ({ id: t.id, track: t.track, label: '', local: true })),
])

function viewerName() {
  const u = authStore.user
  if (u && (u.firstName || u.lastName)) {
    return [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
  }
  try {
    let g = localStorage.getItem('live_guest_name')
    if (!g) {
      g = `Guest ${Math.floor(1000 + Math.random() * 9000)}`
      localStorage.setItem('live_guest_name', g)
    }
    return g
  } catch {
    return `Guest ${Math.floor(1000 + Math.random() * 9000)}`
  }
}

async function share() {
  const url = `${window.location.origin}/live?b=${props.broadcast.id}`
  const title = props.broadcast.title || 'Live on Ethio Build Connect'
  try {
    if (navigator.share) {
      await navigator.share({ title, url })
      return
    }
    await navigator.clipboard.writeText(url)
    shared.value = true
    window.setTimeout(() => (shared.value = false), 2000)
  } catch {
    /* user dismissed the share sheet — ignore */
  }
}

onMounted(async () => {
  try {
    const { url, token } = await exhibitionApi.getViewerToken(props.broadcast.id, viewerName())
    await connect(url, token, {
      onVideoTrack: (track) => {
        const el = videoEl.value
        // Attach only the first (broadcaster) track to the big element; any further
        // publishers (co-hosts) render as tiles from `remoteVideos`.
        if (!el || primaryAttached) return
        primaryAttached = true
        track.attach(el)
        el.play?.().catch(() => {
          // Autoplay with sound blocked: fall back to muted so the picture still plays.
          muted.value = true
          setAudioMuted(true)
          el.muted = true
          el.play?.().catch(() => {})
        })
      },
    })
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Could not open the live stream.'
  }
})

// --- Co-hosting ---------------------------------------------------------------

// Ask the broadcaster to let this viewer publish. On approval we grab the camera/mic
// and publish into the same room; the viewer keeps watching throughout.
async function askToCohost() {
  if (cohostState.value === 'requesting' || cohostState.value === 'pending' || cohostState.value === 'live') return
  cohostState.value = 'requesting'
  try {
    const req = await exhibitionApi.requestCohost(props.broadcast.id, viewerName())
    cohostRequestId = req.id
    cohostState.value = 'pending'
    pollCohostApproval()
  } catch (e) {
    cohostState.value = 'error'
    error.value = e?.response?.data?.message || e?.message || 'Could not send your request to join.'
  }
}

function pollCohostApproval() {
  cohostPollTimer = window.setInterval(async () => {
    if (!cohostRequestId) return
    try {
      // The token endpoint 400s until approved; a 200 means we're in.
      const grant = await exhibitionApi.getCohostToken(props.broadcast.id, cohostRequestId)
      window.clearInterval(cohostPollTimer)
      cohostPollTimer = null
      await goOnAirAsCohost(grant.url, grant.token)
    } catch {
      /* still pending / denied — keep polling until the viewer cancels */
    }
  }, 3000)
}

async function goOnAirAsCohost(url, token) {
  try {
    cohostTracks = await createLocalTracks({ audio: true, video: true })
    localTiles.value = cohostTracks
      .filter((t) => t.kind === 'video')
      .map((t) => ({ id: t.sid || 'local-cam', track: t }))
    // The viewer connection is subscribe-only, so reconnect with the co-host token
    // (which grants publish + subscribe), then publish our camera/mic. We keep
    // subscribing to everyone else, so the viewer still sees the broadcaster.
    await disconnect()
    primaryAttached = false
    await connect(url, token, {
      onVideoTrack: (track) => {
        const el = videoEl.value
        if (!el || primaryAttached) return
        primaryAttached = true
        track.attach(el)
        el.play?.().catch(() => {})
      },
    })
    await publishTracks(cohostTracks)
    cohostState.value = 'live'
  } catch (e) {
    cohostState.value = 'error'
    error.value = e?.message || 'Could not start your camera to join.'
  }
}

function leaveCohost() {
  if (cohostPollTimer) {
    window.clearInterval(cohostPollTimer)
    cohostPollTimer = null
  }
  for (const t of cohostTracks) {
    try {
      t.stop?.()
    } catch {
      /* ignore */
    }
  }
  cohostTracks = []
  localTiles.value = []
  cohostRequestId = ''
  cohostState.value = 'idle'
}

onBeforeUnmount(() => {
  leaveCohost()
  if (connected.value) disconnect()
})
</script>
