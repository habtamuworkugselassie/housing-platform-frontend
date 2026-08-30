<template>
  <div class="min-h-screen bg-violet-50 py-10">
    <div class="mx-auto max-w-2xl px-4 sm:px-6">
      <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{{ $t('exhibition.goLive.title') }}</h1>
      <p class="mt-2 text-gray-600">{{ $t('exhibition.goLive.subtitle') }}</p>

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
              <option value="EXHIBITOR">{{ $t('exhibition.videoFeedback.roleExhibitor') }}</option>
              <option value="ORGANIZER">{{ $t('exhibition.goLive.roleOrganizer') }}</option>
            </select>
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
        <button type="submit" :disabled="busy" class="w-full rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:bg-primary-300">
          {{ busy ? $t('exhibition.goLive.requesting') : $t('exhibition.goLive.requestCta') }}
        </button>
      </form>

      <!-- Step 2: waiting for organizer approval -->
      <div v-else-if="phase === 'waiting'" class="mt-6 rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-primary-500" />
        <p class="font-semibold text-gray-900">{{ $t('exhibition.goLive.waitingTitle') }}</p>
        <p class="mt-1 text-sm text-gray-600">{{ $t('exhibition.goLive.waitingBody') }}</p>
        <button type="button" class="mt-5 text-sm font-medium text-gray-500 hover:text-primary-600" @click="cancel">{{ $t('common.cancel') }}</button>
      </div>

      <!-- Step 3: live -->
      <div v-else class="mt-6 space-y-3">
        <div class="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm">
          <div class="relative aspect-video w-full">
            <video ref="videoEl" class="absolute inset-0 h-full w-full object-cover" autoplay muted playsinline />
            <span v-if="phase === 'live'" class="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <span class="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" /> {{ $t('exhibition.liveStream.badge') }}
            </span>
          </div>
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <div class="flex items-center gap-3">
          <button type="button" class="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50" @click="stop">
            {{ $t('exhibition.goLive.stop') }}
          </button>
          <span class="text-sm text-gray-500">{{ phase === 'connecting' ? $t('exhibition.goLive.connecting') : $t('exhibition.goLive.youAreLive') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { Room, createLocalTracks } from 'livekit-client'
import { exhibitionApi } from '@/features/exhibition/api/exhibition.api'

const { t } = useI18n()

const phase = ref('form') // form | waiting | connecting | live
const busy = ref(false)
const error = ref('')
const videoEl = ref(null)

const form = reactive({ name: '', email: '', role: 'VISITOR', company: '', title: '' })

let broadcastId = ''
let pollTimer = null
let room = null
let localTracks = []

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
    poll()
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || t('exhibition.goLive.requestError')
  } finally {
    busy.value = false
  }
}

// Poll until an organizer approves, then connect and publish.
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
    localTracks = await createLocalTracks({ audio: true, video: { facingMode: 'user' } })
    room = new Room()
    await room.connect(url, token)
    for (const track of localTracks) {
      await room.localParticipant.publishTrack(track)
      if (track.kind === 'video' && videoEl.value) track.attach(videoEl.value)
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
  for (const t of localTracks) {
    try {
      t.stop()
    } catch {
      /* ignore */
    }
  }
  localTracks = []
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
  phase.value = 'form'
}

async function cancel() {
  await teardown()
  phase.value = 'form'
}

onBeforeUnmount(teardown)
</script>
