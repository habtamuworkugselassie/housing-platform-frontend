<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-black lg:flex-row">
    <!-- Video + overlays -->
    <div class="relative flex min-h-0 flex-1 items-center justify-center bg-black">
      <video ref="videoEl" class="h-full max-h-full w-full bg-black object-contain" autoplay playsinline />

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
        <button
          type="button"
          class="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur transition hover:bg-black/75"
          @click="share"
        >
          <span class="material-icons !text-[14px]">{{ shared ? 'check' : 'share' }}</span>
          {{ shared ? $t('live.share.copied') : $t('live.share.button') }}
        </button>
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

      <LiveReactions :reactions="reactions" @react="sendReaction" />
    </div>

    <!-- Chat -->
    <div class="flex h-56 shrink-0 flex-col border-t border-white/10 lg:h-auto lg:w-80 lg:border-l lg:border-t-0">
      <LiveChatPanel :messages="messages" @send="sendChat" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useLiveRoom } from '@/features/exhibition/composables/useLiveRoom'
import { exhibitionApi } from '@/features/exhibition/api/exhibition.api'
import { useAuthStore } from '@/features/auth'
import LiveChatPanel from './LiveChatPanel.vue'
import LiveReactions from './LiveReactions.vue'

const props = defineProps({
  broadcast: { type: Object, required: true },
})

const authStore = useAuthStore()
const { connected, viewerCount, messages, reactions, error, connect, disconnect, sendChat, sendReaction } =
  useLiveRoom()

const videoEl = ref(null)
const shared = ref(false)

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
        if (videoEl.value) track.attach(videoEl.value)
      },
    })
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Could not open the live stream.'
  }
})

onBeforeUnmount(() => {
  if (connected.value) disconnect()
})
</script>
