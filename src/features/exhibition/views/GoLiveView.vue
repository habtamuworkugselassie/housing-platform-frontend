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
            <span v-if="phase === 'live'" class="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <span class="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" /> {{ $t('exhibition.liveStream.badge') }}
            </span>
            <span v-else class="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">{{ $t('exhibition.goLive.preview') }}</span>
          </div>
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
              <template v-if="isAuthenticated">
                <option value="EXHIBITOR">{{ $t('exhibition.videoFeedback.roleExhibitor') }}</option>
                <option value="ORGANIZER">{{ $t('exhibition.goLive.roleOrganizer') }}</option>
              </template>
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

const { t } = useI18n()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

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
    poll()
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
  } catch {
    /* ignore */
  }
}

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
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || t('exhibition.goLive.connectError')
    await teardown()
    phase.value = 'form'
  }
}

async function teardown() {
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
  await teardown()
  previewOn.value = false
  cameras.value = []
  mics.value = []
  phase.value = 'form'
}

async function cancel() {
  await teardown()
  previewOn.value = false
  cameras.value = []
  mics.value = []
  phase.value = 'form'
}

onBeforeUnmount(teardown)
</script>
