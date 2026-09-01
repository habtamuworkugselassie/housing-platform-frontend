<template>
  <section v-if="visible && broadcasts.length" id="live-wall" class="scroll-mt-20 bg-violet-50 py-12 lg:py-16">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">{{ $t('exhibition.liveWall.eyebrow') }}</p>
          <h2 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{{ $t('exhibition.liveWall.title') }}</h2>
        </div>
        <div class="flex items-center gap-2">
          <RouterLink to="/live" class="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50">
            <span class="material-icons !text-[18px]" aria-hidden="true">live_tv</span>
            {{ $t('live.page.watchAll') }}
          </RouterLink>
          <RouterLink to="/go-live" class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
            <span class="material-icons !text-[18px]" aria-hidden="true">videocam</span>
            {{ $t('exhibition.liveWall.goLive') }}
          </RouterLink>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="b in broadcasts"
          :key="b.id"
          :to="`/live?b=${b.id}`"
          class="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
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
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { useDisplaySettings } from '@/shared/composables/useDisplaySettings'
import { exhibitionApi } from '@/features/exhibition/api/exhibition.api'

const { settings } = useDisplaySettings()
const visible = computed(() => settings.exhibitionLiveVisible === true)

const broadcasts = ref([])
let refreshTimer = null

async function refresh() {
  try {
    broadcasts.value = await exhibitionApi.listLiveBroadcasts()
  } catch {
    /* leave as-is */
  }
}

onMounted(() => {
  refresh()
  refreshTimer = setInterval(refresh, 15000)
})
onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
