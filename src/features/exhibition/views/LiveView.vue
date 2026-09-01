<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <!-- Header -->
    <header class="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/90 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button
          v-if="active"
          type="button"
          class="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
          @click="closeActive"
        >
          <span class="material-icons !text-[18px]">arrow_back</span>
          {{ $t('live.page.back') }}
        </button>
        <RouterLink
          v-else
          to="/"
          class="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white"
        >
          <img src="/images/branding/ethio-build-connect-wordmark.png" alt="" class="h-7 w-auto object-contain" />
        </RouterLink>

        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
            <span class="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" />
            {{ $t('live.page.eyebrow') }}
          </span>
          <RouterLink
            to="/go-live"
            class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-500"
          >
            <span class="material-icons !text-[16px]">videocam</span>
            {{ $t('live.page.goLive') }}
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Active stream -->
    <div v-if="active" class="mx-auto max-w-6xl px-0 sm:px-6">
      <div class="h-[calc(100vh-56px)] sm:h-[calc(100vh-96px)] sm:mt-4 sm:overflow-hidden sm:rounded-2xl">
        <LivePlayer :key="active.id" :broadcast="active" />
      </div>
    </div>

    <!-- Grid of live streams -->
    <main v-else class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('live.page.title') }}</h1>
      <p class="mt-1 text-sm text-white/60">{{ $t('live.page.subtitle') }}</p>

      <div v-if="loading" class="mt-8 text-center text-sm text-white/50">{{ $t('common.loading') }}</div>

      <div v-else-if="!broadcasts.length" class="mt-16 flex flex-col items-center text-center">
        <span class="material-icons !text-5xl text-white/25">live_tv</span>
        <p class="mt-3 text-lg font-semibold">{{ $t('live.page.emptyTitle') }}</p>
        <p class="mt-1 max-w-md text-sm text-white/55">{{ $t('live.page.emptyBody') }}</p>
        <RouterLink
          to="/go-live"
          class="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500"
        >
          <span class="material-icons !text-[18px]">videocam</span>
          {{ $t('live.page.goLive') }}
        </RouterLink>
      </div>

      <div v-else class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="b in broadcasts"
          :key="b.id"
          type="button"
          class="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900 text-left transition hover:-translate-y-0.5 hover:border-primary-500/60 hover:shadow-lg hover:shadow-primary-900/30"
          @click="open(b)"
        >
          <div class="relative flex aspect-video w-full items-center justify-center bg-zinc-800">
            <span class="material-icons !text-5xl text-white/40 transition group-hover:text-white">play_circle</span>
            <span class="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
              <span class="h-1 w-1 rounded-full bg-white motion-safe:animate-pulse" /> {{ $t('exhibition.liveStream.badge') }}
            </span>
          </div>
          <div class="p-3">
            <p class="line-clamp-1 text-sm font-semibold">{{ b.title }}</p>
            <p class="mt-0.5 line-clamp-1 text-xs text-white/55">
              {{ b.broadcasterName }}{{ b.companyName ? `, ${b.companyName}` : '' }}
            </p>
          </div>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { exhibitionApi } from '@/features/exhibition/api/exhibition.api'
import LivePlayer from '@/features/exhibition/components/LivePlayer.vue'

const route = useRoute()
const router = useRouter()

const broadcasts = ref([])
const active = ref(null)
const loading = ref(true)
let timer = null

async function refresh() {
  try {
    broadcasts.value = await exhibitionApi.listLiveBroadcasts()
  } catch {
    /* keep last known list */
  } finally {
    loading.value = false
  }
}

function open(b) {
  active.value = b
  router.replace({ query: { b: b.id } })
}

function closeActive() {
  active.value = null
  router.replace({ query: {} })
}

onMounted(async () => {
  await refresh()
  // Deep link: /live?b=<id> opens straight into a stream.
  const id = route.query.b
  if (id) {
    const found = broadcasts.value.find((x) => x.id === id)
    if (found) {
      active.value = found
    } else {
      try {
        const b = await exhibitionApi.getBroadcast(String(id))
        if (b && b.status === 'LIVE') active.value = b
      } catch {
        /* not live / not found — fall back to the grid */
      }
    }
  }
  timer = window.setInterval(refresh, 15000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
