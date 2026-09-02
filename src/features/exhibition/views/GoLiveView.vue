<template>
  <div class="min-h-screen bg-violet-50 py-10">
    <div class="mx-auto max-w-2xl px-4 sm:px-6">
      <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{{ $t('exhibition.goLive.title') }}</h1>
      <p class="mt-2 text-gray-600">{{ $t('exhibition.goLive.subtitle') }}</p>

      <!-- Camera preview + device selection (available before and during go-live) -->
      <div v-if="cameraVisible" class="mt-6 space-y-3">
        <div class="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm">
          <div class="relative aspect-video w-full">
            <video ref="videoEl" class="absolute inset-0 h-full w-full object-cover" autoplay muted playsinline />
            <div v-if="phase === 'live'" class="absolute left-3 top-3 flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <span class="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" /> {{ $t('exhibition.liveStream.badge') }}
              </span>
              <span class="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-xs font-medium text-white backdrop-blur">
                <span class="material-icons !text-[14px]">visibility</span>
                {{ viewerCount }}
              </span>
            </div>
            <span v-else class="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">{{ $t('exhibition.goLive.preview') }}</span>
            <LiveReactions v-if="phase === 'live'" :reactions="reactions" @react="sendReaction" />
          </div>
        </div>

        <!-- Live chat (broadcaster side) -->
        <div v-if="phase === 'live'" class="h-72 overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <LiveChatPanel :messages="messages" @send="sendChat" />
        </div>

        <!-- Pick any connected camera / mic (webcam, USB, capture card) -->
        <p v-if="phase === 'live'" class="text-xs font-medium text-gray-500">{{ $t('exhibition.goLive.switchHint') }}</p>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700" for="gl-camera">{{ $t('exhibition.goLive.camera') }}</label>
            <select id="gl-camera" v-model="selectedCamera" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option v-for="(c, i) in cameras" :key="c.deviceId || i" :value="c.deviceId">{{ c.label || `${$t('exhibition.goLive.camera')} ${i + 1}` }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700" for="gl-mic">{{ $t('exhibition.goLive.microphone') }}</label>
            <select id="gl-mic" v-model="selectedMic" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option v-for="(m, i) in mics" :key="m.deviceId || i" :value="m.deviceId">{{ m.label || `${$t('exhibition.goLive.microphone')} ${i + 1}` }}</option>
            </select>
          </div>
        </div>

        <!-- Multi-camera loop: auto-rotate between selected cameras on a timer -->
        <div v-if="cameras.length > 1" class="rounded-lg border border-gray-200 bg-white p-3">
          <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input v-model="loopEnabled" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-400" />
            {{ $t('exhibition.goLive.loopToggle') }}
          </label>
          <div v-if="loopEnabled" class="mt-3 space-y-3">
            <p class="text-xs text-gray-500">{{ $t('exhibition.goLive.loopHelp') }}</p>
            <div class="flex flex-wrap gap-2">
              <label v-for="(c, i) in cameras" :key="c.deviceId || i" class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700">
                <input v-model="loopDeviceIds" type="checkbox" :value="c.deviceId" class="h-3.5 w-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-400" />
                {{ c.label || `${$t('exhibition.goLive.camera')} ${i + 1}` }}
              </label>
            </div>
            <div class="flex items-center gap-2">
              <label class="text-xs font-medium text-gray-600" for="gl-loop-int">{{ $t('exhibition.goLive.loopEvery') }}</label>
              <input id="gl-loop-int" v-model.number="loopIntervalSec" type="number" min="5" max="600" class="w-20 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400" />
              <span class="text-xs text-gray-500">{{ $t('exhibition.goLive.seconds') }}</span>
              <span v-if="looping" class="ml-auto text-xs font-medium text-primary-600">{{ $t('exhibition.goLive.looping') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 1: request -->
      <form v-if="phase === 'form'" class="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-6" @submit.prevent="request">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700" for="gl-name">{{ $t('exhibition.videoFeedback.name') }}</label>
            <input id="gl-name" v-model.trim="form.name" type="text" required class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700" for="gl-email">{{ $t('exhibition.videoFeedback.email') }}</label>
            <input id="gl-email" v-model.trim="form.email" type="email" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700" for="gl-role">{{ $t('exhibition.videoFeedback.role') }}</label>
            <select id="gl-role" v-model="form.role" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400">
              <option value="VISITOR">{{ $t('exhibition.videoFeedback.roleVisitor') }}</option>
              <option v-if="isAuthenticated" value="EXHIBITOR">{{ $t('exhibition.videoFeedback.roleExhibitor') }}</option>
              <option v-if="isAdmin" value="ORGANIZER">{{ $t('exhibition.goLive.roleOrganizer') }}</option>
            </select>
            <p v-if="!isAuthenticated" class="mt-1 text-xs text-gray-500">
              {{ $t('exhibition.goLive.signInHint') }}
              <router-link to="/login" class="font-medium text-primary-600 hover:underline">{{ $t('nav.login') }}</router-link>
            </p>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700" for="gl-company">{{ $t('exhibition.videoFeedback.company') }}</label>
            <input id="gl-company" v-model.trim="form.company" type="text" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700" for="gl-title">{{ $t('exhibition.goLive.streamTitle') }}</label>
          <input id="gl-title" v-model.trim="form.title" type="text" required :placeholder="$t('exhibition.goLive.streamTitlePlaceholder')" class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400" />
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <div class="flex flex-col gap-3 sm:flex-row-reverse">
          <button type="submit" :disabled="busy" class="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:bg-primary-300 sm:flex-1">
            {{ busy ? $t('exhibition.goLive.requesting') : $t('exhibition.goLive.requestCta') }}
          </button>
          <button v-if="!previewOn" type="button" class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-primary-400 hover:bg-primary-50" @click="startPreview">
            <span class="material-icons !text-[18px]" aria-hidden="true">videocam</span>
            {{ $t('exhibition.goLive.previewCta') }}
          </button>
        </div>
      </form>

      <!-- Waiting for approval -->
      <div v-else-if="phase === 'waiting'" class="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
        <div class="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-primary-500" />
        <span class="text-sm text-gray-600">{{ $t('exhibition.goLive.waitingBody') }}</span>
        <button type="button" class="ml-auto text-sm font-medium text-gray-500 hover:text-primary-600" @click="cancel">{{ $t('common.cancel') }}</button>
      </div>

      <!-- Live / connecting controls -->
      <div v-else class="mt-3 flex items-center gap-3">
        <button type="button" class="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50" @click="stop">
          {{ $t('exhibition.goLive.stop') }}
        </button>
        <!-- Broadcaster mic mute: silences the published audio track for all viewers. -->
        <button
          v-if="phase === 'live'"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition"
          :class="micMuted ? 'border-red-500/40 bg-red-50 text-red-600' : 'border-gray-300 text-gray-700 hover:border-primary-400 hover:bg-primary-50'"
          :aria-pressed="micMuted"
          @click="toggleMic"
        >
          <span class="material-icons !text-[18px]" aria-hidden="true">{{ micMuted ? 'mic_off' : 'mic' }}</span>
          {{ micMuted ? $t('exhibition.goLive.unmute') : $t('exhibition.goLive.mute') }}
        </button>
        <span class="text-sm text-gray-500">{{ phase === 'connecting' ? $t('exhibition.goLive.connecting') : $t('exhibition.goLive.youAreLive') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { Room, createLocalTracks, createLocalVideoTrack } from 'livekit-client'
import { exhibitionApi } from '@/features/exhibition/api/exhibition.api'
import { useAuthStore } from '@/features/auth'
import { useLiveRoom } from '@/features/exhibition/composables/useLiveRoom'
import LiveChatPanel from '@/features/exhibition/components/LiveChatPanel.vue'
import LiveReactions from '@/features/exhibition/components/LiveReactions.vue'

const { t } = useI18n()
const authStore = useAuthStore()

// Chat / reactions / viewer count over the broadcaster's own publishing room.
const {
  viewerCount,
  messages,
  reactions,
  attach: attachChat,
  disconnect: resetChat,
  sendChat,
  sendReaction,
} = useLiveRoom()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)

const phase = ref('form') // form | waiting | connecting | live
const busy = ref(false)
const error = ref('')
const videoEl = ref(null)

const form = reactive({ name: '', email: '', role: 'VISITOR', company: '', title: '' })

// Prefill from the signed-in account (exhibitors/organizers must be logged in).
if (authStore.isAuthenticated && authStore.user) {
  const u = authStore.user
  form.name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email || ''
  form.email = u.email || ''
}

const cameras = ref([])
const mics = ref([])
const selectedCamera = ref('')
const selectedMic = ref('')
const previewOn = ref(false)
const micMuted = ref(false)

// Multi-camera auto-rotation ("loop": N seconds on camera 1, then camera 2, …)
const loopEnabled = ref(false)
const loopDeviceIds = ref([])
const loopIntervalSec = ref(60)
const looping = ref(false)
let loopTimer = null

const cameraVisible = computed(() => previewOn.value || phase.value !== 'form')

let broadcastId = ''
let pollTimer = null
let room = null
let previewTrack = null // LocalVideoTrack shown before going live
let localVideo = null
let localAudio = null

async function startPreview() {
  previewOn.value = true
  await setupPreview()
}

async function request() {
  error.value = ''
  busy.value = true
  try {
    const b = await exhibitionApi.requestGoLive({
      name: form.name,
      email: form.email || undefined,
      role: form.role,
      company: form.company || undefined,
      title: form.title
    })
    broadcastId = b.id
    phase.value = 'waiting'
    if (!previewTrack) setupPreview() // ensure a preview if they didn't start one
    // Organizer (admin) streams come back already approved — go live immediately;
    // everyone else waits for an organizer to approve.
    if (b.status === 'APPROVED' || b.status === 'LIVE') {
      goLive()
    } else {
      poll()
    }
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || t('exhibition.goLive.requestError')
  } finally {
    busy.value = false
  }
}

// Start a camera preview and enumerate all connected input devices.
async function setupPreview() {
  if (previewTrack || localVideo) return
  try {
    previewTrack = await createLocalVideoTrack(
      selectedCamera.value ? { deviceId: selectedCamera.value } : {}
    )
    if (videoEl.value) previewTrack.attach(videoEl.value)
    const settings = previewTrack.mediaStreamTrack.getSettings?.() || {}
    if (settings.deviceId) selectedCamera.value = settings.deviceId
    await refreshDevices()
  } catch (e) {
    error.value = e?.message || t('exhibition.goLive.cameraError')
  }
}

async function refreshDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    cameras.value = devices.filter((d) => d.kind === 'videoinput')
    mics.value = devices.filter((d) => d.kind === 'audioinput')
    if (!selectedMic.value && mics.value[0]) selectedMic.value = mics.value[0].deviceId
    // Default the loop set to every available camera.
    if (!loopDeviceIds.value.length) {
      loopDeviceIds.value = cameras.value.map((c) => c.deviceId).filter(Boolean)
    }
  } catch {
    /* ignore */
  }
}

function startLoop() {
  stopLoop()
  const ids = loopDeviceIds.value
  if (ids.length < 2) return // nothing to rotate through
  looping.value = true
  let index = Math.max(0, ids.indexOf(selectedCamera.value))
  const seconds = Math.min(600, Math.max(5, Number(loopIntervalSec.value) || 60))
  loopTimer = setInterval(() => {
    index = (index + 1) % ids.length
    selectedCamera.value = ids[index] // triggers the camera-switch watcher (preview or live)
  }, seconds * 1000)
}

function stopLoop() {
  if (loopTimer) {
    clearInterval(loopTimer)
    loopTimer = null
  }
  looping.value = false
}

watch(loopEnabled, (on) => (on ? startLoop() : stopLoop()))
watch([loopIntervalSec, loopDeviceIds], () => {
  if (loopEnabled.value) startLoop() // re-arm with the new interval / device set
})

// Switch camera live (or in preview) when the provider picks another device.
watch(selectedCamera, async (id, prev) => {
  if (!id || id === prev) return
  try {
    if (phase.value === 'live' && localVideo) {
      await localVideo.restartTrack({ deviceId: id })
    } else if (previewTrack) {
      await previewTrack.restartTrack({ deviceId: id })
    }
  } catch (e) {
    error.value = e?.message || t('exhibition.goLive.cameraError')
  }
})

watch(selectedMic, async (id, prev) => {
  if (!id || id === prev) return
  if (phase.value === 'live' && localAudio) {
    try {
      await localAudio.restartTrack({ deviceId: id })
    } catch {
      /* ignore */
    }
  }
})

// Toggle the broadcaster's published microphone. LiveKit mute() stops sending
// audio to the SFU (viewers hear silence) without dropping the track/renegotiating.
async function toggleMic() {
  if (!localAudio) return
  try {
    if (micMuted.value) {
      await localAudio.unmute()
      micMuted.value = false
    } else {
      await localAudio.mute()
      micMuted.value = true
    }
  } catch {
    /* ignore transient mute errors */
  }
}

function poll() {
  pollTimer = setInterval(async () => {
    try {
      const b = await exhibitionApi.getBroadcast(broadcastId)
      if (b.status === 'APPROVED' || b.status === 'LIVE') {
        clearInterval(pollTimer)
        pollTimer = null
        await goLive()
      } else if (b.status === 'REJECTED' || b.status === 'ENDED') {
        clearInterval(pollTimer)
        pollTimer = null
        error.value = t('exhibition.goLive.rejected')
        await teardown()
        phase.value = 'form'
      }
    } catch {
      /* keep polling */
    }
  }, 4000)
}

async function goLive() {
  phase.value = 'connecting'
  error.value = ''
  try {
    const { url, token } = await exhibitionApi.getPublishToken(broadcastId)
    if (previewTrack) {
      previewTrack.detach()
      previewTrack.stop()
      previewTrack = null
    }
    const tracks = await createLocalTracks({
      audio: selectedMic.value ? { deviceId: selectedMic.value } : true,
      video: selectedCamera.value ? { deviceId: selectedCamera.value } : true
    })
    room = new Room()
    await room.connect(url, token)
    for (const track of tracks) {
      await room.localParticipant.publishTrack(track)
      if (track.kind === 'video') {
        localVideo = track
        if (videoEl.value) track.attach(videoEl.value)
      } else {
        localAudio = track
      }
    }
    phase.value = 'live'
    attachChat(room) // wire chat / reactions / viewer count onto the live room
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || t('exhibition.goLive.connectError')
    await teardown()
    phase.value = 'form'
  }
}

async function teardown() {
  stopLoop()
  resetChat() // clear chat/reactions/viewer-count state
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  for (const track of [previewTrack, localVideo, localAudio]) {
    try {
      track?.detach?.()
      track?.stop?.()
    } catch {
      /* ignore */
    }
  }
  previewTrack = null
  localVideo = null
  localAudio = null
  if (room) {
    try {
      await room.disconnect()
    } catch {
      /* ignore */
    }
    room = null
  }
}

async function stop() {
  // Tell the backend to end the broadcast first (stops recording/simulcast egress and
  // closes the room server-side), then tear down the local publisher.
  await endBroadcastOnServer()
  await teardown()
  previewOn.value = false
  loopEnabled.value = false
  micMuted.value = false
  cameras.value = []
  mics.value = []
  phase.value = 'form'
}

// End the broadcast on the server (idempotent; only when we actually started one).
async function endBroadcastOnServer() {
  if (!broadcastId || (phase.value !== 'live' && phase.value !== 'connecting')) return
  try {
    await exhibitionApi.endBroadcast(broadcastId)
  } catch {
    /* best-effort; the room also auto-closes when the last publisher leaves */
  }
}

// Fired when the tab is closed/hidden while live — sendBeacon reliably reaches the
// server during unload so the recording is finalized and the room doesn't linger.
function handleUnload() {
  if (broadcastId && (phase.value === 'live' || phase.value === 'connecting')) {
    exhibitionApi.endBroadcastBeacon(broadcastId)
  }
}

async function cancel() {
  await endBroadcastOnServer()
  await teardown()
  previewOn.value = false
  loopEnabled.value = false
  micMuted.value = false
  cameras.value = []
  mics.value = []
  phase.value = 'form'
}

// Reliable end-on-close: pagehide covers tab close, navigation and mobile background.
window.addEventListener('pagehide', handleUnload)
window.addEventListener('beforeunload', handleUnload)

onBeforeUnmount(async () => {
  window.removeEventListener('pagehide', handleUnload)
  window.removeEventListener('beforeunload', handleUnload)
  // Leaving the route (SPA navigation) also ends the broadcast + recording.
  await endBroadcastOnServer()
  await teardown()
})
</script>
